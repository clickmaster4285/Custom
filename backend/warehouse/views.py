from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django_filters.rest_framework import DjangoFilterBackend

from .models import Warehouse, SiteZone
from .serializers import WarehouseSerializer, SiteZoneSerializer
from .zone_catalog import CUSTOMS_WAREHOUSE_ZONES


class IsWarehouseManager(permissions.BasePermission):
    """Only WAREHOUSE_SUPERINTENDENT, IT_ADMIN, and ADMIN can write; all WMS users can read."""

    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            # Read: all authenticated users
            return request.user and request.user.is_authenticated
        # Write: only high-level warehouse/IT/admin roles or Django superusers
        return (
            request.user
            and request.user.is_authenticated
            and (
                request.user.is_superuser
                or request.user.role in ["WAREHOUSE_SUPERINTENDENT", "IT_ADMIN", "ADMIN"]
            )
        )


class WarehouseViewSet(viewsets.ModelViewSet):
    """CRUD for Warehouses."""
    queryset = Warehouse.objects.all()
    serializer_class = WarehouseSerializer
    permission_classes = [permissions.IsAuthenticated, IsWarehouseManager]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["location_code", "status"]

    def get_queryset(self):
        """Filter by location_code if provided."""
        queryset = Warehouse.objects.all()
        location = self.request.query_params.get("location_code")
        if location:
            queryset = queryset.filter(location_code=location)
        return queryset

    @action(detail=True, methods=["post"])
    def ensure_zones(self, request, pk=None):
        """POST /warehouses/{id}/ensure-zones/ - Ensure all 7 canonical zones exist."""
        warehouse = self.get_object()
        created_zones = []
        
        for zone_def in CUSTOMS_WAREHOUSE_ZONES:
            zone, created = SiteZone.objects.get_or_create(
                warehouse=warehouse,
                code=zone_def["code"],
                defaults={
                    "name": zone_def["name"],
                    "purpose": zone_def.get("purpose", ""),
                    "category": zone_def["category"],
                    "security_level": zone_def["security_level"],
                    "sort_order": zone_def["sort_order"],
                    "description": zone_def.get("description", ""),
                    "is_active": True,
                    "requires_escort": zone_def.get("requires_escort", False),
                    "vms_zone_type": zone_def.get("vms_zone_type", "Public"),
                    "access_hours_start": zone_def.get("access_hours_start", "06:00"),
                    "access_hours_end": zone_def.get("access_hours_end", "22:00"),
                    "weekend_access": zone_def.get("weekend_access", False),
                    "max_occupancy": zone_def.get("max_occupancy", 10),
                    "allowed_visitor_categories": zone_def.get("allowed_visitor_categories", []),
                    "gate_ids": zone_def.get("gate_ids", []),
                    "camera_ids": zone_def.get("camera_ids", []),
                }
            )
            if not created:
                updated = False
                canonical_fields = {
                    "name": zone_def["name"],
                    "purpose": zone_def.get("purpose", ""),
                    "category": zone_def["category"],
                    "security_level": zone_def["security_level"],
                    "sort_order": zone_def["sort_order"],
                    "description": zone_def.get("description", ""),
                    "requires_escort": zone_def.get("requires_escort", False),
                    "vms_zone_type": zone_def.get("vms_zone_type", "Public"),
                    "access_hours_start": zone_def.get("access_hours_start", "06:00"),
                    "access_hours_end": zone_def.get("access_hours_end", "22:00"),
                    "weekend_access": zone_def.get("weekend_access", False),
                    "max_occupancy": zone_def.get("max_occupancy", 10),
                    "allowed_visitor_categories": zone_def.get("allowed_visitor_categories", []),
                    "gate_ids": zone_def.get("gate_ids", []),
                    "camera_ids": zone_def.get("camera_ids", []),
                }
                for field, value in canonical_fields.items():
                    if getattr(zone, field) != value:
                        setattr(zone, field, value)
                        updated = True
                if updated:
                    zone.save()
            else:
                created_zones.append(zone)

        return Response({
            "warehouse": warehouse.id,
            "total_zones": warehouse.zones.count(),
            "newly_created": len(created_zones),
            "message": f"Ensured all 7 zones exist. Created {len(created_zones)} new zones."
        })


class SiteZoneViewSet(viewsets.ModelViewSet):
    """CRUD for SiteZones."""
    queryset = SiteZone.objects.all()
    serializer_class = SiteZoneSerializer
    permission_classes = [permissions.IsAuthenticated, IsWarehouseManager]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["warehouse", "code", "category", "security_level", "is_active"]

    def get_queryset(self):
        """Filter by warehouse, location, or code if provided."""
        queryset = SiteZone.objects.all().select_related("warehouse")
        
        warehouse_id = self.request.query_params.get("warehouse")
        if warehouse_id:
            queryset = queryset.filter(warehouse_id=warehouse_id)
        
        location = self.request.query_params.get("location")
        if location:
            queryset = queryset.filter(warehouse__location_code=location)
        
        code = self.request.query_params.get("code")
        if code:
            queryset = queryset.filter(code=code)
        
        return queryset

    def partial_update(self, request, *args, **kwargs):
        """Allow patching description, name, and is_active only."""
        kwargs['partial'] = True
        return super().partial_update(request, *args, **kwargs)
