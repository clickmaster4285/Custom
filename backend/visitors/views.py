from django.utils import timezone
from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response

from .models import Visitor, ZoneAccessLog, SecurityAlert
from .serializers import (
    VisitorSerializer,
    FaceCaptureSerializer,
    ZoneScanSerializer,
    ZoneAccessLogSerializer,
    SecurityAlertSerializer,
)


def get_visitor_queryset(registration_source=None):
    qs = Visitor.objects.all().order_by("-created_at")
    if registration_source in ("walk-in", "pre-registration"):
        qs = qs.filter(registration_source=registration_source)
    return qs


# ---------- Visitor CRUD ----------


class VisitorListAPIView(generics.ListAPIView):
    """List visitors. GET /api/visitors/list/?registration_source=walk-in|pre-registration"""
    serializer_class = VisitorSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        source = self.request.query_params.get("registration_source", "").strip().lower()
        return get_visitor_queryset(registration_source=source or None)


class VisitorCreateAPIView(generics.CreateAPIView):
    """Create visitor (Walk-in or Pre-registration). POST /api/visitors/create/"""
    queryset = Visitor.objects.all()
    serializer_class = VisitorSerializer
    permission_classes = [permissions.AllowAny]


class VisitorReadAPIView(generics.RetrieveAPIView):
    """Read: get a single visitor by id. GET /api/visitors/<id>/read/"""
    queryset = Visitor.objects.all()
    serializer_class = VisitorSerializer
    permission_classes = [permissions.AllowAny]


class VisitorUpdateAPIView(generics.UpdateAPIView):
    """Update: update a visitor. PUT or PATCH /api/visitors/<id>/update/"""
    queryset = Visitor.objects.all()
    serializer_class = VisitorSerializer
    permission_classes = [permissions.AllowAny]


class VisitorDeleteAPIView(generics.DestroyAPIView):
    """Delete: remove a visitor. DELETE /api/visitors/<id>/delete/"""
    queryset = Visitor.objects.all()
    serializer_class = VisitorSerializer
    permission_classes = [permissions.AllowAny]


# ---------- Flow: Face Capture (Arc Face) ----------


class VisitorFaceCaptureAPIView(APIView):
    """
    Update visitor with face capture data and set flow_stage to face_captured.
    POST /api/visitors/<id>/face-capture/
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request, pk):
        try:
            visitor = Visitor.objects.get(pk=pk)
        except Visitor.DoesNotExist:
            return Response(
                {"detail": "Visitor not found."},
                status=status.HTTP_404_NOT_FOUND,
            )
        ser = FaceCaptureSerializer(data=request.data, partial=True)
        if not ser.is_valid():
            return Response(ser.errors, status=status.HTTP_400_BAD_REQUEST)
        for key, value in ser.validated_data.items():
            setattr(visitor, key, value or "")
        visitor.flow_stage = "face_captured"
        visitor.save(update_fields=list(ser.validated_data.keys()) + ["flow_stage", "updated_at"])
        return Response(VisitorSerializer(visitor).data)


# ---------- Flow: Zone Access Check (QR Scan) ----------


class ZoneScanAPIView(APIView):
    """
    When a QR is scanned at a zone/gate: validate access, log the scan,
    optionally create a security alert. POST /api/zone-access/scan/
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        ser = ZoneScanSerializer(data=request.data)
        if not ser.is_valid():
            return Response(ser.errors, status=status.HTTP_400_BAD_REQUEST)
        qr_code_id = ser.validated_data["qr_code_id"].strip()
        zone = ser.validated_data["zone"].strip()
        gate = ser.validated_data.get("gate") or ""
        scan_type = ser.validated_data.get("scan_type") or "entry"
        scanner_id = ser.validated_data.get("scanner_id") or ""

        try:
            visitor = Visitor.objects.get(qr_code_id=qr_code_id)
        except Visitor.DoesNotExist:
            SecurityAlert.objects.create(
                visitor=None,
                alert_type="invalid_qr",
                severity="high",
                message=f"Scan with unknown QR code: {qr_code_id} at zone={zone} gate={gate}",
                zone=zone,
                gate=gate,
            )
            return Response(
                {
                    "allowed": False,
                    "message": "Invalid or unknown QR code.",
                    "alert_created": True,
                },
                status=status.HTTP_200_OK,
            )

        now = timezone.now()
        allowed = True
        msg = "Access granted."

        # Check expiry status
        if visitor.expiry_status == "expired" or visitor.expiry_status == "revoked":
            allowed = False
            msg = f"QR code is {visitor.expiry_status}."
            SecurityAlert.objects.create(
                visitor=visitor,
                alert_type="expired_qr",
                severity="high",
                message=msg,
                zone=zone,
                gate=gate,
            )

        # Check zone: visitor.access_zone must allow this zone (single choice: zone-a, zone-b, zone-c, or all)
        if allowed and visitor.access_zone and visitor.access_zone != "all":
            if zone != visitor.access_zone:
                allowed = False
                msg = f"Visitor not allowed in zone: {zone}."
                SecurityAlert.objects.create(
                    visitor=visitor,
                    alert_type="mismatch_zone",
                    severity="medium",
                    message=msg,
                    zone=zone,
                    gate=gate,
                )

        # Log the scan
        ZoneAccessLog.objects.create(
            visitor=visitor,
            zone=zone,
            gate=gate,
            scan_type=scan_type,
            allowed=allowed,
            message=msg,
            scanner_id=scanner_id,
        )

        if allowed:
            visitor.scan_count = (visitor.scan_count or 0) + 1
            if visitor.flow_stage in ("registered", "face_captured", "qr_printed"):
                visitor.flow_stage = "zone_checked_in"
            elif scan_type == "exit":
                visitor.flow_stage = "exited"
            visitor.save(update_fields=["scan_count", "flow_stage", "updated_at"])

        return Response(
            {
                "allowed": allowed,
                "message": msg,
                "visitor_id": visitor.id,
                "visitor_name": visitor.full_name,
                "flow_stage": visitor.flow_stage,
            },
            status=status.HTTP_200_OK,
        )


# ---------- Security: Alerts & Dashboard ----------


class SecurityAlertListAPIView(generics.ListAPIView):
    """List recent security alerts. GET /api/security/alerts/"""
    permission_classes = [permissions.AllowAny]
    serializer_class = SecurityAlertSerializer

    def get_queryset(self):
        qs = SecurityAlert.objects.all().select_related("visitor")
        # Optional query params: ?acknowledged=false, ?severity=high
        acknowledged = self.request.query_params.get("acknowledged")
        if acknowledged is not None:
            if acknowledged.lower() in ("false", "0", "no"):
                qs = qs.filter(acknowledged=False)
            elif acknowledged.lower() in ("true", "1", "yes"):
                qs = qs.filter(acknowledged=True)
        severity = self.request.query_params.get("severity")
        if severity:
            qs = qs.filter(severity=severity)
        return qs[:100]  # limit to last 100


class SecurityDashboardAPIView(APIView):
    """
    Dashboard stats for security: today's visitors, in building, alerts count.
    GET /api/security/dashboard/
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        today = timezone.now().date()
        visitors_today = Visitor.objects.filter(created_at__date=today).count()
        in_building = Visitor.objects.filter(
            flow_stage="zone_checked_in",
        ).count()
        alerts_unack = SecurityAlert.objects.filter(acknowledged=False).count()
        alerts_today = SecurityAlert.objects.filter(created_at__date=today).count()
        recent_alerts = SecurityAlert.objects.filter(acknowledged=False)[:10]
        return Response(
            {
                "visitors_today": visitors_today,
                "in_building": in_building,
                "alerts_unacknowledged": alerts_unack,
                "alerts_today": alerts_today,
                "recent_alerts": SecurityAlertSerializer(recent_alerts, many=True).data,
            },
            status=status.HTTP_200_OK,
        )
