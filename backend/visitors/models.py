from django.db import models


class Visitor(models.Model):
    VISITOR_TYPE_CHOICES = [
        ('general', 'General'),
        ('employee', 'Employee'),
        ('vip', 'VIP'),
        ('contractor', 'Contractor'),
    ]

    GENDER_CHOICES = [
        ("male", "male"),
        ("female", "female"),
        ("other", "other"),
    ]

    NATIONALITY_CHOICES = [
        ("pakistan", "pakistan"),
        ("usa", "usa"),
        ("uk", "uk"),
        ("uae", "uae"),
        ("other", "other"),
    ]

    VISIT_PURPOSE_CHOICES = [
        ("meeting", "meeting"),
        ("interview", "interview"),
        ("delivery", "delivery"),
        ("maintenance", "maintenance"),
        ("consultation", "consultation"),
        ("other", "other"),
    ]

    DEPARTMENT_CHOICES = [
        ("hr", "hr"),
        ("it", "it"),
        ("finance", "finance"),
        ("operations", "operations"),
        ("marketing", "marketing"),
        ("admin", "admin"),
    ]

    HOST_DESIGNATION_CHOICES = [
        ("manager", "manager"),
        ("director", "director"),
        ("executive", "executive"),
        ("officer", "officer"),
    ]

    TIME_SLOT_CHOICES = [
        ("09:00-10:00", "09:00-10:00"),
        ("10:00-11:00", "10:00-11:00"),
        ("11:00-12:00", "11:00-12:00"),
        ("12:00-13:00", "12:00-13:00"),
        ("14:00-15:00", "14:00-15:00"),
        ("15:00-16:00", "15:00-16:00"),
        ("16:00-17:00", "16:00-17:00"),
    ]

    EXPECTED_DURATION_CHOICES = [
        ("30min", "30min"),
        ("1hr", "1hr"),
        ("2hr", "2hr"),
        ("halfday", "halfday"),
        ("fullday", "fullday"),
    ]

    PREFERRED_VIEW_VISIT_CHOICES = [
        ("in-host", "in-host"),
        ("logins", "logins"),
        ("high-security", "high-security"),
    ]

    DOCUMENT_TYPE_CHOICES = [
        ("cnic", "cnic"),
        ("passport", "passport"),
        ("driving-license", "driving-license"),
    ]

    ISSUING_AUTHORITY_CHOICES = [
        ("nadra", "nadra"),
        ("passport-office", "passport-office"),
        ("excise", "excise"),
    ]

    SUPPORT_DOC_TYPE_CHOICES = [
        ("application", "application"),
        ("noc", "noc"),
        ("invitation", "invitation"),
    ]

    UPLOAD_PROCEDURE_CHOICES = [
        ("manual", "manual"),
        ("scan", "scan"),
    ]

    ACCESS_ZONE_CHOICES = [
        ("zone-a", "zone-a"),
        ("zone-b", "zone-b"),
        ("zone-c", "zone-c"),
        ("all", "all"),
    ]

    ENTRY_GATE_CHOICES = [
        ("main-gate", "main-gate"),
        ("gate-1", "gate-1"),
        ("gate-2", "gate-2"),
        ("vip-gate", "vip-gate"),
    ]

    EXPIRY_STATUS_CHOICES = [
        ("active", "active"),
        ("expired", "expired"),
        ("revoked", "revoked"),
    ]

    GENERATED_BY_CHOICES = [
        ("system", "system"),
        ("admin", "admin"),
        ("operator", "operator"),
    ]

    # Flow stage: tracks visitor through the end-to-end pipeline
    FLOW_STAGE_CHOICES = [
        ("arrived", "Arrived"),           # Visitor at premises
        ("registered", "Registered"),     # Help desk completed registration
        ("face_captured", "Face Captured"),  # Arc Face capture done
        ("qr_printed", "QR Printed"),     # QR generated and printed
        ("zone_checked_in", "Zone Checked In"),  # First zone scan (entry)
        ("exited", "Exited"),             # Exit scan or visit ended
    ]

    # Step 1: Personal Info
    visitor_type = models.CharField(max_length=20, choices=VISITOR_TYPE_CHOICES)
    full_name = models.CharField(max_length=200)
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES, blank=True)
    cnic_number = models.CharField(max_length=20, blank=True)
    passport_number = models.CharField(max_length=30, blank=True)
    nationality = models.CharField(max_length=20, choices=NATIONALITY_CHOICES)
    date_of_birth = models.DateField(blank=True, null=True)
    mobile_number = models.CharField(max_length=30)
    email_address = models.EmailField(blank=True)
    residential_address = models.TextField(blank=True)

    # Step 2: Visit Details
    visit_purpose = models.CharField(max_length=20, choices=VISIT_PURPOSE_CHOICES)
    visit_description = models.CharField(max_length=255, blank=True)
    department_to_visit = models.CharField(max_length=20, choices=DEPARTMENT_CHOICES)
    host_officer_name = models.CharField(max_length=150, blank=True)
    host_officer_designation = models.CharField(
        max_length=20, choices=HOST_DESIGNATION_CHOICES, blank=True
    )
    preferred_visit_date = models.DateField(blank=True, null=True)
    preferred_time_slot = models.CharField(
        max_length=20, choices=TIME_SLOT_CHOICES, blank=True
    )
    expected_duration = models.CharField(
        max_length=20, choices=EXPECTED_DURATION_CHOICES, blank=True
    )
    preferred_view_visit = models.CharField(
        max_length=20, choices=PREFERRED_VIEW_VISIT_CHOICES, blank=True
    )

    # Step 3: Document Upload
    document_type = models.CharField(
        max_length=30, choices=DOCUMENT_TYPE_CHOICES, blank=True
    )
    document_no = models.CharField(max_length=100, blank=True)
    issuing_authority = models.CharField(
        max_length=30, choices=ISSUING_AUTHORITY_CHOICES, blank=True
    )
    expiry_date = models.DateField(blank=True, null=True)
    front_image = models.TextField(blank=True)
    back_image = models.TextField(blank=True)
    support_doc_type = models.CharField(
        max_length=30, choices=SUPPORT_DOC_TYPE_CHOICES, blank=True
    )
    application_letter = models.TextField(blank=True)
    letter_ref_no = models.CharField(max_length=100, blank=True)
    additional_document = models.TextField(blank=True)
    upload_procedure = models.CharField(
        max_length=20, choices=UPLOAD_PROCEDURE_CHOICES, blank=True
    )

    # Step 3b: Organization & Information
    organization_name = models.CharField(max_length=200, blank=True)
    organization_type = models.CharField(max_length=100, blank=True)
    ntn_registration_no = models.CharField(max_length=100, blank=True)
    designation = models.CharField(max_length=100, blank=True)
    office_address = models.TextField(blank=True)

    # Step 4a: Photo Capture
    capture_date = models.CharField(max_length=50, blank=True)
    capture_time = models.CharField(max_length=50, blank=True)
    captured_by = models.CharField(max_length=150, blank=True)
    camera_location = models.CharField(max_length=150, blank=True)
    photo_quality_score = models.CharField(max_length=50, blank=True)
    face_match_status = models.CharField(max_length=50, blank=True)
    captured_photo = models.TextField(blank=True)

    # Step 4: Consent
    disclaimer_accepted = models.BooleanField(default=False)
    terms_accepted = models.BooleanField(default=False)
    previous_visit_reference = models.CharField(max_length=100, blank=True)

    # Walk-in / security fields
    registration_type = models.CharField(max_length=50, blank=True)
    cnic_passport = models.CharField(max_length=30, blank=True)
    visit_purpose_description = models.TextField(blank=True)
    visit_type = models.CharField(max_length=50, blank=True)
    reference_number = models.CharField(max_length=100, blank=True)
    preferred_date = models.CharField(max_length=50, blank=True)
    preferred_time_slot_walkin = models.CharField(max_length=50, blank=True)
    department_for_slot = models.CharField(max_length=50, blank=True)
    slot_duration = models.CharField(max_length=50, blank=True)
    host_id = models.CharField(max_length=100, blank=True)
    host_full_name = models.CharField(max_length=150, blank=True)
    host_designation = models.CharField(max_length=100, blank=True)
    host_department = models.CharField(max_length=100, blank=True)
    watchlist_check_status = models.CharField(max_length=50, blank=True)
    approver_required = models.CharField(max_length=50, blank=True)
    temporary_access_granted = models.CharField(max_length=50, blank=True)
    guard_remarks = models.TextField(blank=True)

    # Step 5: QR Code Metadata
    qr_code_id = models.CharField(max_length=100, blank=True)
    visitor_ref_number = models.CharField(max_length=100, blank=True)
    visit_date = models.DateField(blank=True, null=True)
    time_validity_start = models.CharField(max_length=20, blank=True)
    time_validity_end = models.CharField(max_length=20, blank=True)
    access_zone = models.CharField(
        max_length=20, choices=ACCESS_ZONE_CHOICES, blank=True
    )
    entry_gate = models.CharField(
        max_length=20, choices=ENTRY_GATE_CHOICES, blank=True
    )
    expiry_status = models.CharField(
        max_length=20, choices=EXPIRY_STATUS_CHOICES, blank=True
    )
    scan_count = models.PositiveIntegerField(default=0)
    generated_on = models.DateField(blank=True, null=True)
    generated_by = models.CharField(
        max_length=20, choices=GENERATED_BY_CHOICES, blank=True
    )

    # Pipeline: current stage in the end-to-end flow
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
        super().save(*args, **kwargs)
        if is_new and not self.qr_code_id:
            self.qr_code_id = f"QR-{self.pk}"
            Visitor.objects.filter(pk=self.pk).update(qr_code_id=self.qr_code_id)
        if is_new and self.flow_stage == "arrived":
            Visitor.objects.filter(pk=self.pk).update(flow_stage="registered")

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
