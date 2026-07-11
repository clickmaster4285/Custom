from __future__ import annotations

from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from detentions.models import DetentionMemo

from .models import DetentionAssessment, NoteSheet, RecoveryMemo, SeizureReport
from .serializers import (
    AssessmentWriteSerializer,
    LinkDetentionSerializer,
    NoteSheetApprovalSerializer,
    NoteSheetWriteSerializer,
    RecoveryApprovalSerializer,
    RecoveryMemoWriteSerializer,
    SeizureReportWriteSerializer,
    apply_assessment,
    apply_note_sheet,
    apply_recovery,
    apply_seizure_report,
    assessment_to_dict,
    body_from_request,
    build_recovery_assessment_sheet,
    maybe_create_deposit_for_recovery,
    note_sheet_to_dict,
    recovery_memo_to_dict,
    save_note_sheet_goods_images,
    save_note_sheet_uploads,
    seizure_report_to_dict,
)


def _username(request) -> str:
    user = getattr(request, "user", None)
    if user and getattr(user, "is_authenticated", False):
        return user.get_username() or ""
    return ""


class NoteSheetListAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        status_filter = (request.query_params.get("status") or "").strip()
        qs = NoteSheet.objects.prefetch_related("items__images", "attachments").all()
        if status_filter:
            qs = qs.filter(status=status_filter)
        available = request.query_params.get("available") == "1"
        if available:
            qs = qs.filter(status=NoteSheet.STATUS_APPROVED, detention_memo__isnull=True)
        return Response([note_sheet_to_dict(o, request) for o in qs])


class NoteSheetCreateAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        body = body_from_request(request)
        ser = NoteSheetWriteSerializer(data=body)
        ser.is_valid(raise_exception=True)
        obj = NoteSheet()
        apply_note_sheet(obj, ser.validated_data, username=_username(request))
        save_note_sheet_uploads(request, obj)
        save_note_sheet_goods_images(request, obj, ser.validated_data.get("items"))
        obj = NoteSheet.objects.prefetch_related("items__images", "attachments").get(pk=obj.pk)
        return Response(note_sheet_to_dict(obj, request), status=status.HTTP_201_CREATED)


class NoteSheetReadAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        obj = get_object_or_404(
            NoteSheet.objects.prefetch_related("items__images", "attachments"),
            pk=pk,
        )
        if obj.status == NoteSheet.STATUS_SUBMITTED and not obj.viewed_at:
            obj.viewed_at = timezone.now()
            obj.save(update_fields=["viewed_at", "updated_at"])
        return Response(note_sheet_to_dict(obj, request))


class NoteSheetUpdateAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def put(self, request, pk):
        obj = get_object_or_404(NoteSheet, pk=pk)
        body = body_from_request(request)
        ser = NoteSheetWriteSerializer(data=body, partial=True)
        ser.is_valid(raise_exception=True)
        apply_note_sheet(obj, ser.validated_data, username=_username(request))
        save_note_sheet_uploads(request, obj)
        save_note_sheet_goods_images(request, obj, ser.validated_data.get("items"))
        obj = NoteSheet.objects.prefetch_related("items__images", "attachments").get(pk=obj.pk)
        return Response(note_sheet_to_dict(obj, request))


class NoteSheetDeleteAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, pk):
        obj = get_object_or_404(NoteSheet, pk=pk)
        if obj.detention_memo_id:
            return Response(
                {"detail": "Cannot delete note sheet linked to a detention memo."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        obj.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class NoteSheetApprovalAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        obj = get_object_or_404(
            NoteSheet.objects.prefetch_related("items__images", "attachments"),
            pk=pk,
        )
        ser = NoteSheetApprovalSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        action = ser.validated_data["action"]
        remarks = (
            ser.validated_data.get("approvalRemarks")
            or ser.validated_data.get("rejectionReason")
            or ""
        )

        if action == "submit":
            if obj.status not in (NoteSheet.STATUS_DRAFT, NoteSheet.STATUS_REJECTED):
                return Response(
                    {"detail": "Only draft/rejected sheets can be submitted."},
                    status=400,
                )
            obj.status = NoteSheet.STATUS_SUBMITTED
            obj.submitted_at = timezone.now()
            obj.rejection_reason = ""
            obj.approval_remarks = ""
            obj.viewed_at = None
            obj.save(
                update_fields=[
                    "status",
                    "submitted_at",
                    "rejection_reason",
                    "approval_remarks",
                    "viewed_at",
                    "updated_at",
                ]
            )
        elif action == "view":
            if obj.status == NoteSheet.STATUS_SUBMITTED and not obj.viewed_at:
                obj.viewed_at = timezone.now()
                obj.save(update_fields=["viewed_at", "updated_at"])
        elif action == "approve":
            if obj.status != NoteSheet.STATUS_SUBMITTED:
                return Response(
                    {"detail": "Only submitted sheets can be approved."},
                    status=400,
                )
            obj.status = NoteSheet.STATUS_APPROVED
            obj.approved_by = ser.validated_data.get("approvedBy") or _username(request)
            obj.approved_at = timezone.now()
            obj.approval_remarks = remarks
            obj.rejection_reason = ""
            obj.save(
                update_fields=[
                    "status",
                    "approved_by",
                    "approved_at",
                    "approval_remarks",
                    "rejection_reason",
                    "updated_at",
                ]
            )
        elif action == "reject":
            if obj.status != NoteSheet.STATUS_SUBMITTED:
                return Response(
                    {"detail": "Only submitted sheets can be rejected."},
                    status=400,
                )
            obj.status = NoteSheet.STATUS_REJECTED
            obj.approved_by = ser.validated_data.get("approvedBy") or _username(request)
            obj.approved_at = timezone.now()
            obj.rejection_reason = remarks
            obj.approval_remarks = remarks
            obj.save(
                update_fields=[
                    "status",
                    "approved_by",
                    "approved_at",
                    "rejection_reason",
                    "approval_remarks",
                    "updated_at",
                ]
            )
        return Response(note_sheet_to_dict(obj, request))


class NoteSheetLinkDetentionAPIView(APIView):
    """Link an approved note sheet to a newly created detention memo (one-time)."""

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        obj = get_object_or_404(
            NoteSheet.objects.prefetch_related("items__images", "attachments"),
            pk=pk,
        )
        if obj.status != NoteSheet.STATUS_APPROVED:
            return Response(
                {"detail": "Note sheet must be approved before creating a detention memo."},
                status=400,
            )
        if obj.detention_memo_id:
            return Response({"detail": "Note sheet already linked to a detention memo."}, status=400)
        ser = LinkDetentionSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        memo = get_object_or_404(DetentionMemo, pk=ser.validated_data["detentionMemoId"])
        if NoteSheet.objects.filter(detention_memo=memo).exists():
            return Response(
                {"detail": "Detention memo already linked to another note sheet."},
                status=400,
            )
        obj.detention_memo = memo
        obj.save(update_fields=["detention_memo", "updated_at"])
        return Response(note_sheet_to_dict(obj, request))


class AssessmentListAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        memo_id = (request.query_params.get("detentionMemoId") or "").strip()
        qs = DetentionAssessment.objects.select_related("detention_memo").all()
        if memo_id:
            qs = qs.filter(detention_memo_id=memo_id)
        return Response([assessment_to_dict(o) for o in qs])


class AssessmentCreateAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        ser = AssessmentWriteSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        data = ser.validated_data
        memo_id = data.get("detentionMemoId")
        if not memo_id:
            return Response({"detail": "detentionMemoId is required."}, status=400)
        memo = get_object_or_404(DetentionMemo, pk=memo_id)
        if DetentionAssessment.objects.filter(detention_memo=memo).exists():
            return Response({"detail": "Assessment already exists for this detention memo."}, status=400)
        obj = DetentionAssessment(detention_memo=memo)
        apply_assessment(obj, data)
        return Response(assessment_to_dict(obj), status=status.HTTP_201_CREATED)


class AssessmentReadAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        obj = get_object_or_404(DetentionAssessment.objects.select_related("detention_memo"), pk=pk)
        return Response(assessment_to_dict(obj))


class AssessmentUpdateAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def put(self, request, pk):
        obj = get_object_or_404(DetentionAssessment.objects.select_related("detention_memo"), pk=pk)
        ser = AssessmentWriteSerializer(data=request.data, partial=True)
        ser.is_valid(raise_exception=True)
        apply_assessment(obj, ser.validated_data)
        obj.refresh_from_db()
        return Response(assessment_to_dict(obj))


class AssessmentDeleteAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, pk):
        obj = get_object_or_404(DetentionAssessment, pk=pk)
        obj.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class RecoveryMemoListAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        memo_id = (request.query_params.get("detentionMemoId") or "").strip()
        qs = RecoveryMemo.objects.select_related("detention_memo", "assessment", "deposit_account").all()
        if memo_id:
            qs = qs.filter(detention_memo_id=memo_id)
        return Response([recovery_memo_to_dict(o) for o in qs])


class RecoveryMemoCreateAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        ser = RecoveryMemoWriteSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        data = ser.validated_data
        memo = get_object_or_404(DetentionMemo, pk=data["detentionMemoId"])
        obj = RecoveryMemo(detention_memo=memo)
        if data.get("assessmentId"):
            obj.assessment = get_object_or_404(DetentionAssessment, pk=data["assessmentId"])
        apply_recovery(obj, data)
        if data.get("createDeposit"):
            maybe_create_deposit_for_recovery(obj)
            obj.refresh_from_db()
        return Response(recovery_memo_to_dict(obj), status=status.HTTP_201_CREATED)


class RecoveryMemoReadAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        obj = get_object_or_404(
            RecoveryMemo.objects.select_related("detention_memo", "assessment", "deposit_account"),
            pk=pk,
        )
        return Response(recovery_memo_to_dict(obj))


class RecoveryMemoUpdateAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def put(self, request, pk):
        obj = get_object_or_404(
            RecoveryMemo.objects.select_related("detention_memo", "assessment", "deposit_account"),
            pk=pk,
        )
        payload = dict(request.data)
        payload.setdefault("detentionMemoId", str(obj.detention_memo_id))
        ser = RecoveryMemoWriteSerializer(data=payload)
        ser.is_valid(raise_exception=True)
        apply_recovery(obj, ser.validated_data)
        if ser.validated_data.get("createDeposit"):
            maybe_create_deposit_for_recovery(obj)
        obj.refresh_from_db()
        return Response(recovery_memo_to_dict(obj))


class RecoveryMemoDeleteAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, pk):
        obj = get_object_or_404(RecoveryMemo, pk=pk)
        obj.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class RecoveryMemoApprovalAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        obj = get_object_or_404(
            RecoveryMemo.objects.select_related("detention_memo", "assessment", "deposit_account"),
            pk=pk,
        )
        ser = RecoveryApprovalSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        action = ser.validated_data["action"]
        if action == "submit":
            if obj.approval_status not in (RecoveryMemo.STATUS_DRAFT, RecoveryMemo.STATUS_REJECTED):
                return Response({"detail": "Only draft/rejected recovery memos can be submitted."}, status=400)
            obj.approval_status = RecoveryMemo.STATUS_PENDING
            obj.rejection_reason = ""
            obj.save(update_fields=["approval_status", "rejection_reason", "updated_at"])
        elif action == "approve":
            if obj.approval_status != RecoveryMemo.STATUS_PENDING:
                return Response({"detail": "Only pending recovery memos can be approved."}, status=400)
            obj.approval_status = RecoveryMemo.STATUS_APPROVED
            obj.approved_by = ser.validated_data.get("approvedBy") or _username(request)
            obj.approved_at = timezone.now()
            obj.rejection_reason = ""
            obj.save(update_fields=["approval_status", "approved_by", "approved_at", "rejection_reason", "updated_at"])
        elif action == "reject":
            if obj.approval_status != RecoveryMemo.STATUS_PENDING:
                return Response({"detail": "Only pending recovery memos can be rejected."}, status=400)
            obj.approval_status = RecoveryMemo.STATUS_REJECTED
            obj.approved_by = ser.validated_data.get("approvedBy") or _username(request)
            obj.approved_at = timezone.now()
            obj.rejection_reason = ser.validated_data.get("rejectionReason") or ""
            obj.save(update_fields=["approval_status", "approved_by", "approved_at", "rejection_reason", "updated_at"])
        return Response(recovery_memo_to_dict(obj))


class SeizureReportListAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        qs = SeizureReport.objects.select_related("detention_memo", "assessment", "recovery_memo").all()
        return Response([seizure_report_to_dict(o) for o in qs])


class SeizureReportCreateAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        ser = SeizureReportWriteSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        data = ser.validated_data
        memo = get_object_or_404(DetentionMemo, pk=data["detentionMemoId"])
        assessment = None
        recovery = None
        if data.get("assessmentId"):
            assessment = get_object_or_404(DetentionAssessment, pk=data["assessmentId"])
        else:
            assessment = DetentionAssessment.objects.filter(detention_memo=memo).order_by("-created_at").first()
        if data.get("recoveryMemoId"):
            recovery = get_object_or_404(RecoveryMemo, pk=data["recoveryMemoId"])
        else:
            recovery = (
                RecoveryMemo.objects.filter(detention_memo=memo, approval_status=RecoveryMemo.STATUS_APPROVED)
                .order_by("-created_at")
                .first()
            )
        if data.get("status") == SeizureReport.STATUS_SUBMITTED:
            if not assessment or assessment.status != DetentionAssessment.STATUS_COMPLETED:
                return Response({"detail": "Completed assessment is required to submit."}, status=400)
            if not recovery or recovery.approval_status != RecoveryMemo.STATUS_APPROVED:
                return Response({"detail": "Approved recovery memo is required to submit."}, status=400)

        obj = SeizureReport(
            detention_memo=memo,
            assessment=assessment,
            recovery_memo=recovery,
        )
        notes = data.get("recoveryAssessmentNotes") or build_recovery_assessment_sheet(memo, assessment, recovery)
        data = {**data, "recoveryAssessmentNotes": notes}
        apply_seizure_report(obj, data)
        return Response(seizure_report_to_dict(obj), status=status.HTTP_201_CREATED)


class SeizureReportReadAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        obj = get_object_or_404(
            SeizureReport.objects.select_related("detention_memo", "assessment", "recovery_memo"),
            pk=pk,
        )
        return Response(seizure_report_to_dict(obj))


class SeizureReportUpdateAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def put(self, request, pk):
        obj = get_object_or_404(
            SeizureReport.objects.select_related("detention_memo", "assessment", "recovery_memo"),
            pk=pk,
        )
        payload = dict(request.data)
        payload.setdefault("detentionMemoId", str(obj.detention_memo_id))
        ser = SeizureReportWriteSerializer(data=payload)
        ser.is_valid(raise_exception=True)
        data = ser.validated_data
        if data.get("status") == SeizureReport.STATUS_SUBMITTED:
            assessment = obj.assessment
            recovery = obj.recovery_memo
            if data.get("assessmentId"):
                assessment = get_object_or_404(DetentionAssessment, pk=data["assessmentId"])
            if data.get("recoveryMemoId"):
                recovery = get_object_or_404(RecoveryMemo, pk=data["recoveryMemoId"])
            if not assessment or assessment.status != DetentionAssessment.STATUS_COMPLETED:
                return Response({"detail": "Completed assessment is required to submit."}, status=400)
            if not recovery or recovery.approval_status != RecoveryMemo.STATUS_APPROVED:
                return Response({"detail": "Approved recovery memo is required to submit."}, status=400)
        apply_seizure_report(obj, data)
        obj.refresh_from_db()
        return Response(seizure_report_to_dict(obj))


class SeizureReportDeleteAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, pk):
        obj = get_object_or_404(SeizureReport, pk=pk)
        obj.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class SeizureManagementOverviewAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response(
            {
                "noteSheets": NoteSheet.objects.count(),
                "noteSheetsPending": NoteSheet.objects.filter(status=NoteSheet.STATUS_SUBMITTED).count(),
                "noteSheetsApprovedAvailable": NoteSheet.objects.filter(
                    status=NoteSheet.STATUS_APPROVED, detention_memo__isnull=True
                ).count(),
                "assessments": DetentionAssessment.objects.count(),
                "assessmentsPending": DetentionAssessment.objects.filter(
                    status=DetentionAssessment.STATUS_IN_PROGRESS
                ).count(),
                "recoveryMemos": RecoveryMemo.objects.count(),
                "recoveryPendingApproval": RecoveryMemo.objects.filter(
                    approval_status=RecoveryMemo.STATUS_PENDING
                ).count(),
                "seizureReports": SeizureReport.objects.count(),
                "seizureReportsSubmitted": SeizureReport.objects.filter(
                    status=SeizureReport.STATUS_SUBMITTED
                ).count(),
            }
        )
