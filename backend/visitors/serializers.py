"""
Visitor serializer: all fields from frontend (Walk-in + Pre-registration).
Accepts same keys and types the frontend sends.
"""
from rest_framework import serializers
from .models import Visitor, ZoneAccessLog, SecurityAlert


class VisitorSerializer(serializers.ModelSerializer):
    # Normalize empty strings to None for date fields so validation accepts them
    DATE_FIELDS = ("date_of_birth", "visit_date", "preferred_visit_date", "expiry_date")

    def to_internal_value(self, data):
        if isinstance(data, dict):
            data = dict(data)
            for key in self.DATE_FIELDS:
                if key in data and data[key] == "":
                    data[key] = None
            if data.get("full_name", "").strip() == "":
                data["full_name"] = "Unknown Visitor"
        return super().to_internal_value(data)

    class Meta:
        model = Visitor
        fields = [
            "id",
            "created_at",
            "updated_at",
            # Step 1: Personal
            "visitor_type",
            "full_name",
            "gender",
            "cnic_number",
            "passport_number",
            "nationality",
            "date_of_birth",
            "mobile_number",
            "email_address",
            "residential_address",
            # Organization
            "organization_name",
            "organization_type",
            "ntn_registration_no",
            "designation",
            "office_address",
            # Vehicle
            "vehicle_type",
            "vehicle_registration_no",
            "vehicle_color",
            "vehicle_company",
            "vehicle_image",
            "vehicle_images",
            # Photos
            "visitor_photos",
            "photo_capture",
            "captured_photo",
            "capture_date",
            "capture_time",
            "captured_by",
            "camera_location",
            "photo_quality_score",
            "face_match_status",
            # Minors
            "visitor_minors",
            # Visit
            "visit_purpose",
            "visit_purpose_description",
            "visit_type",
            "department_to_visit",
            "location",
            "visit_date",
            "preferred_visit_date",
            "preferred_date",
            "preferred_time_slot",
            "preferred_time_slot_walkin",
            "department_for_slot",
            "slot_duration",
            "priority_level",
            "expected_duration",
            "preferred_view_visit",
            # Host
            "host_name",
            "host_officer_name",
            "host_id",
            "host_full_name",
            "host_officer_designation",
            "host_designation",
            "host_department",
            "host_email",
            "host_contact_number",
            # Documents
            "document_type",
            "document_no",
            "issuing_authority",
            "expiry_date",
            "front_image",
            "back_image",
            "support_doc_type",
            "application_letter",
            "letter_ref_no",
            "additional_document",
            "authorization_letter",
            "noc_document",
            "upload_procedure",
            # QR & access
            "qr_code_id",
            "visitor_ref_number",
            "reference_number",
            "time_validity_start",
            "time_validity_end",
            "access_zone",
            "entry_gate",
            "security_level",
            "max_visit_duration",
            "allowed_departments",
            "allowed_zones",
            "additional_remarks",
            "escort_mandatory",
            "expiry_status",
            "scan_count",
            "generated_on",
            "generated_by",
            # Registration
            "registration_type",
            "registration_source",
            "registration_status",
            "draft_form_data",
            # Security / screening
            "cnic_passport",
            "watchlist_check_status",
            "approver_required",
            "temporary_access_granted",
            "guard_remarks",
            # Consent / legacy
            "disclaimer_accepted",
            "terms_accepted",
            "previous_visit_reference",
            "flow_stage",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]
        extra_kwargs = {
            "visitor_type": {"required": False, "default": "individual"},
            "full_name": {"required": False, "allow_blank": True, "default": "Unknown Visitor"},
            "email_address": {"required": False, "allow_blank": True},
            "nationality": {"allow_blank": True},
            "visit_purpose": {"allow_blank": True},
            "department_to_visit": {"allow_blank": True},
            "mobile_number": {"allow_blank": True},
            "date_of_birth": {"required": False, "allow_null": True},
            "visit_date": {"required": False, "allow_null": True},
            "preferred_visit_date": {"required": False, "allow_null": True},
            "expiry_date": {"required": False, "allow_null": True},
        }


class FaceCaptureSerializer(serializers.Serializer):
    capture_date = serializers.CharField(required=False, allow_blank=True)
    capture_time = serializers.CharField(required=False, allow_blank=True)
    captured_by = serializers.CharField(required=False, allow_blank=True)
    camera_location = serializers.CharField(required=False, allow_blank=True)
    photo_quality_score = serializers.CharField(required=False, allow_blank=True)
    face_match_status = serializers.CharField(required=False, allow_blank=True)
    captured_photo = serializers.CharField(required=False, allow_blank=True)


class ZoneScanSerializer(serializers.Serializer):
    qr_code_id = serializers.CharField(required=True)
    zone = serializers.CharField(required=True)
    gate = serializers.CharField(required=False, default="")
    scan_type = serializers.ChoiceField(
        choices=[("entry", "Entry"), ("exit", "Exit")],
        default="entry",
    )
    scanner_id = serializers.CharField(required=False, default="")


class ZoneAccessLogSerializer(serializers.ModelSerializer):
    visitor_name = serializers.CharField(source="visitor.full_name", read_only=True)

    class Meta:
        model = ZoneAccessLog
        fields = [
            "id",
            "visitor",
            "visitor_name",
            "zone",
            "gate",
            "scan_type",
            "allowed",
            "message",
            "scanned_at",
            "scanner_id",
        ]
        read_only_fields = ["id", "scanned_at"]


class SecurityAlertSerializer(serializers.ModelSerializer):
    visitor_name = serializers.SerializerMethodField()

    def get_visitor_name(self, obj):
        return obj.visitor.full_name if obj.visitor else None

    class Meta:
        model = SecurityAlert
        fields = [
            "id",
            "visitor",
            "visitor_name",
            "alert_type",
            "severity",
            "message",
            "zone",
            "gate",
            "created_at",
            "acknowledged",
            "acknowledged_at",
            "acknowledged_by",
        ]
        read_only_fields = ["id", "created_at"]
