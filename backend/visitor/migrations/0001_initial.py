from django.db import migrations, models


class Migration(migrations.Migration):
    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name="Visitor",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("visitor_type", models.CharField(choices=[("individual", "individual"), ("company", "company"), ("contractor", "contractor")], max_length=20)),
                ("full_name", models.CharField(max_length=200)),
                ("gender", models.CharField(blank=True, choices=[("male", "male"), ("female", "female"), ("other", "other")], max_length=10)),
                ("cnic_number", models.CharField(blank=True, max_length=20)),
                ("passport_number", models.CharField(blank=True, max_length=30)),
                ("nationality", models.CharField(choices=[("pakistan", "pakistan"), ("usa", "usa"), ("uk", "uk"), ("uae", "uae"), ("other", "other")], max_length=20)),
                ("date_of_birth", models.DateField(blank=True, null=True)),
                ("mobile_number", models.CharField(max_length=30)),
                ("email_address", models.EmailField(blank=True, max_length=254)),
                ("residential_address", models.TextField(blank=True)),
                ("visit_purpose", models.CharField(choices=[("meeting", "meeting"), ("interview", "interview"), ("delivery", "delivery"), ("maintenance", "maintenance"), ("consultation", "consultation"), ("other", "other")], max_length=20)),
                ("visit_description", models.CharField(blank=True, max_length=255)),
                ("department_to_visit", models.CharField(choices=[("hr", "hr"), ("it", "it"), ("finance", "finance"), ("operations", "operations"), ("marketing", "marketing"), ("admin", "admin")], max_length=20)),
                ("host_officer_name", models.CharField(blank=True, max_length=150)),
                ("host_officer_designation", models.CharField(blank=True, choices=[("manager", "manager"), ("director", "director"), ("executive", "executive"), ("officer", "officer")], max_length=20)),
                ("preferred_visit_date", models.DateField(blank=True, null=True)),
                ("preferred_time_slot", models.CharField(blank=True, choices=[("09:00-10:00", "09:00-10:00"), ("10:00-11:00", "10:00-11:00"), ("11:00-12:00", "11:00-12:00"), ("12:00-13:00", "12:00-13:00"), ("14:00-15:00", "14:00-15:00"), ("15:00-16:00", "15:00-16:00"), ("16:00-17:00", "16:00-17:00")], max_length=20)),
                ("expected_duration", models.CharField(blank=True, choices=[("30min", "30min"), ("1hr", "1hr"), ("2hr", "2hr"), ("halfday", "halfday"), ("fullday", "fullday")], max_length=20)),
                ("preferred_view_visit", models.CharField(blank=True, choices=[("in-host", "in-host"), ("logins", "logins"), ("high-security", "high-security")], max_length=20)),
                ("document_type", models.CharField(blank=True, choices=[("cnic", "cnic"), ("passport", "passport"), ("driving-license", "driving-license")], max_length=30)),
                ("document_no", models.CharField(blank=True, max_length=100)),
                ("issuing_authority", models.CharField(blank=True, choices=[("nadra", "nadra"), ("passport-office", "passport-office"), ("excise", "excise")], max_length=30)),
                ("expiry_date", models.DateField(blank=True, null=True)),
                ("front_image", models.CharField(blank=True, max_length=255)),
                ("back_image", models.CharField(blank=True, max_length=255)),
                ("support_doc_type", models.CharField(blank=True, choices=[("application", "application"), ("noc", "noc"), ("invitation", "invitation")], max_length=30)),
                ("application_letter", models.CharField(blank=True, max_length=255)),
                ("letter_ref_no", models.CharField(blank=True, max_length=100)),
                ("additional_document", models.CharField(blank=True, max_length=255)),
                ("upload_procedure", models.CharField(blank=True, choices=[("manual", "manual"), ("scan", "scan")], max_length=20)),
                ("disclaimer_accepted", models.BooleanField(default=False)),
                ("terms_accepted", models.BooleanField(default=False)),
                ("previous_visit_reference", models.CharField(blank=True, max_length=100)),
                ("qr_code_id", models.CharField(blank=True, max_length=100)),
                ("visitor_ref_number", models.CharField(blank=True, max_length=100)),
                ("visit_date", models.DateField(blank=True, null=True)),
                ("time_validity_start", models.CharField(blank=True, max_length=20)),
                ("time_validity_end", models.CharField(blank=True, max_length=20)),
                ("access_zone", models.CharField(blank=True, choices=[("zone-a", "zone-a"), ("zone-b", "zone-b"), ("zone-c", "zone-c"), ("all", "all")], max_length=20)),
                ("entry_gate", models.CharField(blank=True, choices=[("main-gate", "main-gate"), ("gate-1", "gate-1"), ("gate-2", "gate-2"), ("vip-gate", "vip-gate")], max_length=20)),
                ("expiry_status", models.CharField(blank=True, choices=[("active", "active"), ("expired", "expired"), ("revoked", "revoked")], max_length=20)),
                ("scan_count", models.PositiveIntegerField(default=0)),
                ("generated_on", models.DateField(blank=True, null=True)),
                ("generated_by", models.CharField(blank=True, choices=[("system", "system"), ("admin", "admin"), ("operator", "operator")], max_length=20)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
            ],
        ),
    ]
