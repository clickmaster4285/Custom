from django.contrib import admin
from .models import Visitor, ZoneAccessLog, SecurityAlert


@admin.register(Visitor)
class VisitorAdmin(admin.ModelAdmin):
    list_display = ("full_name", "visitor_type", "visit_purpose", "flow_stage", "preferred_visit_date")
    list_filter = ("flow_stage", "visitor_type")
    search_fields = ("full_name", "cnic_number", "passport_number", "qr_code_id")


@admin.register(ZoneAccessLog)
class ZoneAccessLogAdmin(admin.ModelAdmin):
    list_display = ("visitor", "zone", "gate", "scan_type", "allowed", "scanned_at")
    list_filter = ("allowed", "scan_type", "zone")


@admin.register(SecurityAlert)
class SecurityAlertAdmin(admin.ModelAdmin):
    list_display = ("alert_type", "severity", "visitor", "acknowledged", "created_at")
    list_filter = ("acknowledged", "severity", "alert_type")
