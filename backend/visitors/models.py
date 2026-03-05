from django.db import models
from django.utils import timezone


class Visitor(models.Model):
    """Visitor Management: Walk-in + Pre-registration. All fields from frontend are stored."""

    VISITOR_TYPE_CHOICES = [
        ("general", "General"),
        ("employee", "Employee"),
        ("vip", "VIP"),
        ("contractor", "Contractor"),
        ("individual", "Individual"),
    ]

    GENDER_CHOICES = [
        ("male", "male"),
        ("female", "female"),
        ("other", "other"),
    ]

    EXPIRY_STATUS_CHOICES = [
        ("active", "active"),
        ("expired", "expired"),
        ("revoked", "revoked"),
    ]

    REGISTRATION_SOURCE_CHOICES = [
        ("walk-in", "Walk-in"),
        ("pre-registration", "Pre-registration"),
    ]

    REGISTRATION_STATUS_CHOICES = [
        ("draft", "Draft"),
        ("sent", "Sent"),
        ("approved", "Approved"),
    ]

    FLOW_STAGE_CHOICES = [
        ("arrived", "Arrived"),
        ("registered", "Registered"),
        ("face_captured", "Face Captured"),
        ("qr_printed", "QR Printed"),
        ("zone_checked_in", "Zone Checked In"),
        ("exited", "Exited"),
    ]

    # ----- Step 1: Personal / Visitor details (all from frontend) -----
    visitor_type = models.CharField(max_length=50, default="individual")
    full_name = models.CharField(max_length=200)
    gender = models.CharField(max_length=20, blank=True)
    cnic_number = models.CharField(max_length=30, blank=True)
    passport_number = models.CharField(max_length=50, blank=True)
    nationality = models.CharField(max_length=100, blank=True)
    date_of_birth = models.DateField(blank=True, null=True)
    mobile_number = models.CharField(max_length=50, blank=True)
    email_address = models.EmailField(blank=True)
    residential_address = models.TextField(blank=True)

    # ----- Organization -----
    organization_name = models.CharField(max_length=300, blank=True)
    organization_type = models.CharField(max_length=150, blank=True)
    ntn_registration_no = models.CharField(max_length=150, blank=True)
    designation = models.CharField(max_length=150, blank=True)
    office_address = models.TextField(blank=True)

    # ----- Vehicle (from frontend) -----
    vehicle_type = models.CharField(max_length=50, blank=True)
    vehicle_registration_no = models.CharField(max_length=100, blank=True)
    vehicle_color = models.CharField(max_length=50, blank=True)
    vehicle_company = models.CharField(max_length=150, blank=True)
    vehicle_image = models.TextField(blank=True)  # first image as base64 or URL
    vehicle_images = models.JSONField(default=list, blank=True)  # list of base64/URLs

    # ----- Visitor photos & capture -----
    visitor_photos = models.JSONField(default=list, blank=True)
    photo_capture = models.TextField(blank=True)
    capture_date = models.CharField(max_length=50, blank=True)
    capture_time = models.CharField(max_length=50, blank=True)
    captured_by = models.CharField(max_length=150, blank=True)
    camera_location = models.CharField(max_length=150, blank=True)
    photo_quality_score = models.CharField(max_length=50, blank=True)
    face_match_status = models.CharField(max_length=50, blank=True)
    captured_photo = models.TextField(blank=True)

    # ----- Minors (JSON array of objects) -----
    visitor_minors = models.JSONField(default=list, blank=True)

    # ----- Visit details -----
    visit_purpose = models.CharField(max_length=100, blank=True)
    visit_purpose_description = models.TextField(blank=True)
    visit_type = models.CharField(max_length=80, blank=True)
    department_to_visit = models.CharField(max_length=100, blank=True)
    location = models.CharField(max_length=200, blank=True)
    visit_date = models.DateField(blank=True, null=True)
    preferred_visit_date = models.DateField(blank=True, null=True)
    preferred_date = models.CharField(max_length=50, blank=True)
    preferred_time_slot = models.CharField(max_length=50, blank=True)
    preferred_time_slot_walkin = models.CharField(max_length=50, blank=True)
    department_for_slot = models.CharField(max_length=100, blank=True)
    slot_duration = models.CharField(max_length=50, blank=True)
    priority_level = models.CharField(max_length=50, blank=True)
    expected_duration = models.CharField(max_length=30, blank=True)
    preferred_view_visit = models.CharField(max_length=50, blank=True)

    # ----- Host -----
    host_name = models.CharField(max_length=200, blank=True)
    host_officer_name = models.CharField(max_length=200, blank=True)
    host_id = models.CharField(max_length=100, blank=True)
    host_full_name = models.CharField(max_length=200, blank=True)
    host_officer_designation = models.CharField(max_length=100, blank=True)
    host_designation = models.CharField(max_length=100, blank=True)
    host_department = models.CharField(max_length=150, blank=True)
    host_email = models.CharField(max_length=254, blank=True)
    host_contact_number = models.CharField(max_length=50, blank=True)

    # ----- Documents -----
    document_type = models.CharField(max_length=50, blank=True)
    document_no = models.CharField(max_length=150, blank=True)
    issuing_authority = models.CharField(max_length=80, blank=True)
    expiry_date = models.DateField(blank=True, null=True)
    front_image = models.TextField(blank=True)
    back_image = models.TextField(blank=True)
    support_doc_type = models.CharField(max_length=50, blank=True)
    application_letter = models.TextField(blank=True)
    letter_ref_no = models.CharField(max_length=150, blank=True)
    additional_document = models.TextField(blank=True)
    authorization_letter = models.TextField(blank=True)
    noc_document = models.TextField(blank=True)
    upload_procedure = models.CharField(max_length=30, blank=True)

    # ----- QR & access -----
    qr_code_id = models.CharField(max_length=120, blank=True)
    visitor_ref_number = models.CharField(max_length=120, blank=True)
    reference_number = models.CharField(max_length=120, blank=True)
    time_validity_start = models.CharField(max_length=30, blank=True)
    time_validity_end = models.CharField(max_length=30, blank=True)
    access_zone = models.CharField(max_length=50, blank=True)
    entry_gate = models.CharField(max_length=50, blank=True)
    security_level = models.CharField(max_length=50, blank=True)
    max_visit_duration = models.CharField(max_length=50, blank=True)
    allowed_departments = models.CharField(max_length=255, blank=True)
    allowed_zones = models.CharField(max_length=255, blank=True)
    additional_remarks = models.TextField(blank=True)
    escort_mandatory = models.CharField(max_length=20, blank=True)
    expiry_status = models.CharField(
        max_length=20, choices=EXPIRY_STATUS_CHOICES, default="active", blank=True
    )
    scan_count = models.PositiveIntegerField(default=0)
    generated_on = models.DateField(blank=True, null=True)
    generated_by = models.CharField(max_length=50, blank=True)

    # ----- Registration source & status (Walk-in vs Pre-registration) -----
    registration_type = models.CharField(max_length=50, blank=True)
    registration_source = models.CharField(
        max_length=30,
        choices=REGISTRATION_SOURCE_CHOICES,
        blank=True,
        db_index=True,
    )
    registration_status = models.CharField(
        max_length=20,
        choices=REGISTRATION_STATUS_CHOICES,
        default="approved",
        blank=True,
        db_index=True,
    )
    draft_form_data = models.JSONField(default=dict, blank=True)  # full form state for drafts

    # ----- Security / screening -----
    cnic_passport = models.CharField(max_length=30, blank=True)
    watchlist_check_status = models.CharField(max_length=80, blank=True)
    approver_required = models.CharField(max_length=50, blank=True)
    temporary_access_granted = models.CharField(max_length=50, blank=True)
    guard_remarks = models.TextField(blank=True)

    # ----- Consent / legacy -----
    disclaimer_accepted = models.BooleanField(default=False)
    terms_accepted = models.BooleanField(default=False)
    previous_visit_reference = models.CharField(max_length=150, blank=True)

    # ----- Pipeline -----
    flow_stage = models.CharField(
        max_length=30,
        choices=FLOW_STAGE_CHOICES,
        default="arrived",
        db_index=True,
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        is_new = self.pk is None
        if is_new and not (self.time_validity_start or self.time_validity_end):
            if not self.time_validity_start:
                self.time_validity_start = "00:00"
            if not self.time_validity_end:
                self.time_validity_end = "23:59"
        super().save(*args, **kwargs)
        if is_new and not self.qr_code_id:
            self.qr_code_id = f"QR-{self.pk}"
            update_fields = {"qr_code_id": self.qr_code_id}
            if not self.generated_on:
                self.generated_on = timezone.now().date()
                self.generated_by = "system"
                update_fields["generated_on"] = self.generated_on
                update_fields["generated_by"] = self.generated_by
            Visitor.objects.filter(pk=self.pk).update(**update_fields)
        if is_new and self.flow_stage == "arrived":
            Visitor.objects.filter(pk=self.pk).update(flow_stage="registered")
            self.flow_stage = "registered"

    def __str__(self):
        return f"{self.full_name} ({self.cnic_number or self.passport_number})"


class ZoneAccessLog(models.Model):
    """
    Logs every zone/gate scan (QR scan at zone). Used for zone access check
    and for security audit trail.
    """
    SCAN_TYPE_CHOICES = [
        ("entry", "Entry"),
        ("exit", "Exit"),
    ]

    visitor = models.ForeignKey(
        Visitor,
        on_delete=models.CASCADE,
        related_name="zone_access_logs",
    )
    zone = models.CharField(max_length=50)   
    gate = models.CharField(max_length=50, blank=True)  
    scan_type = models.CharField(
        max_length=10,
        choices=SCAN_TYPE_CHOICES,
        default="entry",
    )
    allowed = models.BooleanField(default=True) 
    message = models.CharField(max_length=255, blank=True)  
    scanned_at = models.DateTimeField(auto_now_add=True)
    # Optional: device or terminal that performed the scan
    scanner_id = models.CharField(max_length=100, blank=True)

    class Meta:
        ordering = ["-scanned_at"]

    def __str__(self):
        return f"{self.visitor.full_name} @ {self.zone} ({self.scan_type})"


class SecurityAlert(models.Model):
    """
    Real-time alerts for the security dashboard: unauthorized zone access,
    expired QR, watchlist hit, duplicate scan, etc.
    """
    SEVERITY_CHOICES = [
        ("low", "Low"),
        ("medium", "Medium"),
        ("high", "High"),
        ("critical", "Critical"),
    ]

    ALERT_TYPE_CHOICES = [
        ("unauthorized_zone", "Unauthorized Zone Access"),
        ("expired_qr", "Expired QR Code"),
        ("invalid_qr", "Invalid / Unknown QR"),
        ("watchlist_hit", "Watchlist Hit"),
        ("duplicate_entry", "Duplicate Entry"),
        ("mismatch_zone", "Zone Not Allowed"),
        ("face_mismatch", "Face Mismatch"),
        ("other", "Other"),
    ]

    visitor = models.ForeignKey(
        Visitor,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="security_alerts",
    )
    alert_type = models.CharField(max_length=50, choices=ALERT_TYPE_CHOICES)
    severity = models.CharField(max_length=20, choices=SEVERITY_CHOICES, default="medium")
    message = models.TextField()
    zone = models.CharField(max_length=50, blank=True)
    gate = models.CharField(max_length=50, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    acknowledged = models.BooleanField(default=False)
    acknowledged_at = models.DateTimeField(null=True, blank=True)
    acknowledged_by = models.CharField(max_length=100, blank=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.get_alert_type_display()} - {self.message[:50]}"
