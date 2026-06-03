from rest_framework import serializers
from .models import Warehouse, SiteZone


class WarehouseSerializer(serializers.ModelSerializer):
    zone_count = serializers.SerializerMethodField()

    class Meta:
        model = Warehouse
        fields = ["id", "code", "name", "location_code", "status", "description", "zone_count", "created_at", "updated_at"]
        read_only_fields = ["id", "created_at", "updated_at"]

    def get_zone_count(self, obj):
        """Count active zones for this warehouse."""
        return obj.zones.filter(is_active=True).count()


class SiteZoneSerializer(serializers.ModelSerializer):
    warehouse_code = serializers.CharField(source="warehouse.code", read_only=True)
    warehouse_name = serializers.CharField(source="warehouse.name", read_only=True)
    warehouse_location = serializers.CharField(source="warehouse.location_code", read_only=True)

    class Meta:
        model = SiteZone
        fields = [
            "id",
            "warehouse",
            "warehouse_code",
            "warehouse_name",
            "warehouse_location",
            "code",
            "name",
            "purpose",
            "category",
            "security_level",
            "sort_order",
            "is_active",
            "description",
            "requires_escort",
            "access_hours_start",
            "access_hours_end",
            "weekend_access",
            "max_occupancy",
            "allowed_visitor_categories",
            "gate_ids",
            "camera_ids",
            "vms_zone_type",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def update(self, instance, validated_data):
        """Allow updating WMS & VMS editable fields only."""
        allowed_fields = [
            "name",
            "purpose",
            "description",
            "is_active",
            "requires_escort",
            "access_hours_start",
            "access_hours_end",
            "weekend_access",
            "max_occupancy",
            "allowed_visitor_categories",
            "gate_ids",
            "camera_ids",
            "vms_zone_type",
        ]
        for field in allowed_fields:
            if field in validated_data:
                setattr(instance, field, validated_data[field])
        instance.save()
        return instance
