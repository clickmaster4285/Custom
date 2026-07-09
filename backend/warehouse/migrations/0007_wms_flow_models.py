# Generated migration for WMS flow models

import uuid

import django.utils.timezone
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("warehouse", "0006_fire_smoke_detection_log"),
    ]

    operations = [
        migrations.AddField(
            model_name="warehousestockitem",
            name="goods_line_id",
            field=models.UUIDField(blank=True, db_index=True, null=True),
        ),
        migrations.CreateModel(
            name="SeizureRecord",
            fields=[
                ("id", models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ("detention_memo_id", models.UUIDField(db_index=True)),
                ("deposit_account_id", models.UUIDField(blank=True, db_index=True, null=True)),
                ("case_no", models.CharField(blank=True, db_index=True, max_length=120)),
                ("fir_number", models.CharField(blank=True, max_length=120)),
                ("place_of_detention", models.CharField(blank=True, max_length=300)),
                (
                    "source",
                    models.CharField(
                        choices=[
                            ("detention_memo", "Detention memo"),
                            ("deposit_forward", "Deposit forward"),
                            ("manual", "Manual"),
                        ],
                        default="detention_memo",
                        max_length=40,
                    ),
                ),
                ("seized_at", models.DateTimeField(default=django.utils.timezone.now)),
                ("seized_by", models.CharField(blank=True, max_length=150)),
                ("remarks", models.TextField(blank=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
            ],
            options={"ordering": ["-seized_at"]},
        ),
        migrations.CreateModel(
            name="ReleaseRecord",
            fields=[
                ("id", models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ("detention_memo_id", models.UUIDField(blank=True, db_index=True, null=True)),
                ("deposit_account_id", models.UUIDField(blank=True, db_index=True, null=True)),
                ("case_no", models.CharField(blank=True, db_index=True, max_length=120)),
                ("qr_code", models.CharField(blank=True, db_index=True, max_length=160)),
                ("warehouse", models.CharField(blank=True, max_length=200)),
                ("fir_number", models.CharField(blank=True, max_length=120)),
                ("stack_count", models.CharField(blank=True, max_length=40)),
                ("treasury_challan_no", models.CharField(blank=True, max_length=120)),
                ("customs_station", models.CharField(blank=True, max_length=200)),
                ("amount", models.CharField(blank=True, max_length=80)),
                ("bank_treasury_name", models.CharField(blank=True, max_length=200)),
                ("released_items", models.JSONField(blank=True, default=list)),
                ("released_at", models.DateTimeField(default=django.utils.timezone.now)),
                ("released_by", models.CharField(blank=True, max_length=150)),
                ("settle_memo", models.BooleanField(default=True)),
                ("remarks", models.TextField(blank=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
            ],
            options={"ordering": ["-released_at"]},
        ),
        migrations.CreateModel(
            name="WmsLifecycleEvent",
            fields=[
                ("id", models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                (
                    "event_type",
                    models.CharField(
                        choices=[
                            ("memo_created", "Memo created"),
                            ("deposited", "Deposited"),
                            ("seized", "Seized"),
                            ("released", "Released"),
                            ("destructed", "Destructed"),
                            ("stock_updated", "Stock updated"),
                        ],
                        db_index=True,
                        max_length=40,
                    ),
                ),
                ("detention_memo_id", models.UUIDField(blank=True, db_index=True, null=True)),
                ("deposit_account_id", models.UUIDField(blank=True, null=True)),
                ("seizure_record_id", models.UUIDField(blank=True, null=True)),
                ("release_record_id", models.UUIDField(blank=True, null=True)),
                ("distribution_id", models.UUIDField(blank=True, null=True)),
                ("stock_item_id", models.UUIDField(blank=True, null=True)),
                ("goods_line_id", models.UUIDField(blank=True, null=True)),
                ("qr_code", models.CharField(blank=True, db_index=True, max_length=160)),
                ("case_no", models.CharField(blank=True, db_index=True, max_length=120)),
                ("description", models.TextField(blank=True)),
                ("quantity", models.DecimalField(blank=True, decimal_places=3, max_digits=14, null=True)),
                ("unit", models.CharField(blank=True, max_length=40)),
                ("metadata", models.JSONField(blank=True, default=dict)),
                ("performed_by", models.CharField(blank=True, max_length=150)),
                ("created_at", models.DateTimeField(db_index=True, default=django.utils.timezone.now)),
            ],
            options={"ordering": ["-created_at"]},
        ),
    ]
