from rest_framework import serializers
from .models import Visitor, ZoneAccessLog, SecurityAlert


class VisitorSerializer(serializers.ModelSerializer):
    """
    Schema aligned with the pre-registration payload from the frontend.
    All fields accept the same keys and types the frontend sends.
    """

    class Meta:
        model = Visitor
        fields = [
            # Identity (response)
            "id",
            "created_at",
            # Step 1: Personal Info
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
            # Step 2: Visit Details
            "visit_purpose",
            "visit_description",
            "department_to_visit",
            "host_officer_name",
            "host_officer_designation",
            "preferred_visit_date",
            "preferred_time_slot",
            "expected_duration",
            "preferred_view_visit",
            # Step 3: Document Upload
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
            "upload_procedure",
            # Step 3b: Organization
            "organization_name",
            "organization_type",
            "ntn_registration_no",
            "designation",
            "office_address",
            # Step 4a: Photo Capture
            "capture_date",
            "capture_time",
            "captured_by",
            "camera_location",
            "photo_quality_score",
            "face_match_status",
            "captured_photo",
            # Step 4: Consent
            "disclaimer_accepted",
            "terms_accepted",
            "previous_visit_reference",
            # Walk-in / security
            "registration_type",
            "cnic_passport",
            "visit_purpose_description",
            "visit_type",
            "reference_number",
            "preferred_date",
            "preferred_time_slot_walkin",
            "department_for_slot",
            "slot_duration",
            "host_id",
            "host_full_name",
            "host_designation",
            "host_department",
            "host_email",
            "host_contact_number",
            "watchlist_check_status",
            "approver_required",
            "temporary_access_granted",
            "guard_remarks",
            # Step 5: QR Code
            "qr_code_id",
            "visitor_ref_number",
            "visit_date",
            "time_validity_start",
            "time_validity_end",
            "access_zone",
            "entry_gate",
            "expiry_status",
            "scan_count",
            "generated_on",
            "generated_by",
            "flow_stage",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]
        extra_kwargs = {
            # Allow blank for all optional choice fields (walk-in sends many empty strings)
            "visitor_type": {"allow_blank": False},
            "gender": {"allow_blank": True},
            "nationality": {"allow_blank": False},
            "visit_purpose": {"allow_blank": False},
            "department_to_visit": {"allow_blank": False},
            "host_officer_designation": {"allow_blank": True},
            "preferred_time_slot": {"allow_blank": True},
            "expected_duration": {"allow_blank": True},
            "preferred_view_visit": {"allow_blank": True},
            "document_type": {"allow_blank": True},
            "issuing_authority": {"allow_blank": True},
            "support_doc_type": {"allow_blank": True},
            "upload_procedure": {"allow_blank": True},
            "access_zone": {"allow_blank": True},
            "entry_gate": {"allow_blank": True},
            "expiry_status": {"allow_blank": True},
            "generated_by": {"allow_blank": True},
        }


class FaceCaptureSerializer(serializers.Serializer):
    """Payload for face capture (Arc Face) step."""
    capture_date = serializers.CharField(required=False, allow_blank=True)
    capture_time = serializers.CharField(required=False, allow_blank=True)
    captured_by = serializers.CharField(required=False, allow_blank=True)
    camera_location = serializers.CharField(required=False, allow_blank=True)
    photo_quality_score = serializers.CharField(required=False, allow_blank=True)
    face_match_status = serializers.CharField(required=False, allow_blank=True)
    captured_photo = serializers.CharField(required=False, allow_blank=True)


class ZoneScanSerializer(serializers.Serializer):
    """Payload when a QR is scanned at a zone/gate."""
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
