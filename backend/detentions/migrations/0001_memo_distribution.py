import detentions.models
import uuid
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name="DetentionMemo",
            fields=[
                (
                    "id",
                    models.UUIDField(
                        default=uuid.uuid4,
                        editable=False,
                        primary_key=True,
                        serialize=False,
                    ),
                ),
                ("case_no", models.CharField(blank=True, db_index=True, max_length=120)),
                ("reference_number", models.CharField(blank=True, max_length=200)),
                ("fir_number", models.CharField(blank=True, max_length=120)),
                ("date_time_occurrence", models.CharField(blank=True, max_length=80)),
                ("place_of_occurrence", models.CharField(blank=True, max_length=300)),
                ("date_time_detention", models.CharField(blank=True, max_length=80)),
                ("place_of_detention", models.CharField(blank=True, max_length=300)),
                ("detention_type", models.CharField(blank=True, max_length=80)),
                ("directorate", models.CharField(blank=True, max_length=200)),
                ("reason_for_detention", models.CharField(blank=True, max_length=200)),
                ("location_of_detention", models.CharField(blank=True, max_length=300)),
                ("gd_number", models.CharField(blank=True, max_length=120)),
                ("gd_number_2", models.CharField(blank=True, max_length=120)),
                ("where_deposited", models.CharField(blank=True, max_length=400)),
                ("search_chassis_number", models.CharField(blank=True, max_length=120)),
                ("receipt_officer", models.CharField(blank=True, max_length=200)),
                ("settlement_status", models.CharField(blank=True, max_length=80)),
                ("verification_status", models.CharField(blank=True, max_length=80)),
                (
                    "disposition_status",
                    models.CharField(
                        blank=True,
                        default="",
                        help_text="e.g. In Warehouse, Destructed, Released",
                        max_length=80,
                    ),
                ),
                ("brief_facts", models.TextField(blank=True)),
                ("forwarding_officer_remarks", models.TextField(blank=True)),
                ("purpose_of_detention", models.TextField(blank=True)),
                ("owner_name", models.CharField(blank=True, max_length=200)),
                ("owner_cnic", models.CharField(blank=True, max_length=30)),
                ("owner_contact", models.CharField(blank=True, max_length=50)),
                ("owner_picture", models.TextField(blank=True)),
                (
                    "owner_photo_upload",
                    models.FileField(
                        blank=True,
                        null=True,
                        upload_to=detentions.models.detention_owner_photo_path,
                    ),
                ),
                ("driver_name", models.CharField(blank=True, max_length=200)),
                ("driver_cnic", models.CharField(blank=True, max_length=30)),
                ("driver_contact", models.CharField(blank=True, max_length=50)),
                ("driver_picture", models.TextField(blank=True)),
                (
                    "driver_photo_upload",
                    models.FileField(
                        blank=True,
                        null=True,
                        upload_to=detentions.models.detention_driver_photo_path,
                    ),
                ),
                ("seizing_officer_notes", models.TextField(blank=True)),
                ("examining_officer_notes", models.TextField(blank=True)),
                ("detention_notes", models.TextField(blank=True)),
                ("memo_qr_code_number", models.CharField(blank=True, max_length=160)),
                ("memo_qr_code_payload", models.TextField(blank=True)),
                ("created_by", models.CharField(blank=True, max_length=150)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
            ],
            options={
                "ordering": ["-created_at"],
            },
        ),
    ]
