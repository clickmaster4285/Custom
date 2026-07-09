from django.contrib import admin

from .models import Camera, DetectionEvent, Nvr, PersonIdentity, PersonSighting, Site


@admin.register(Site)
class SiteAdmin(admin.ModelAdmin):
    list_display = ["code", "name", "is_active", "created_at"]
    list_filter = ["is_active"]
    search_fields = ["code", "name"]


@admin.register(Nvr)
class NvrAdmin(admin.ModelAdmin):
    list_display = ["name", "site", "ip_address", "port", "brand", "is_active"]
    list_filter = ["brand", "is_active", "site"]
    search_fields = ["name", "ip_address", "site__code"]


@admin.register(Camera)
class CameraAdmin(admin.ModelAdmin):
    list_display = ["code", "name", "nvr", "channel", "location", "purpose", "status", "is_active"]
    list_filter = ["location", "purpose", "status", "is_active", "nvr__site"]
    search_fields = ["code", "name", "zone", "nvr__name"]
    raw_id_fields = ["nvr"]


@admin.register(DetectionEvent)
class DetectionEventAdmin(admin.ModelAdmin):
    list_display = ["camera", "label", "person_qr", "local_track_id", "track_event", "confidence", "is_alert", "created_at"]
    list_filter = ["is_alert", "track_event", "camera__location"]
    search_fields = ["label", "person_qr", "employee_name"]


@admin.register(PersonIdentity)
class PersonIdentityAdmin(admin.ModelAdmin):
    list_display = ["qr_code_number", "person_type", "display_name", "last_seen_at"]
    list_filter = ["person_type"]
    search_fields = ["qr_code_number", "display_name"]


@admin.register(PersonSighting)
class PersonSightingAdmin(admin.ModelAdmin):
    list_display = ["person", "camera", "local_track_id", "started_at", "ended_at"]
    list_filter = ["camera__nvr__site"]
    search_fields = ["person__qr_code_number", "camera__code"]
