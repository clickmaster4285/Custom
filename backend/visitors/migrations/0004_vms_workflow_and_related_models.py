# Generated manually — VMS workflow fields and related models

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ("visitors", "0003_alter_visitor_expiry_status_and_more"),
    ]

    operations = [
        migrations.AddField(
            model_name="visitor",
            name="registration_source",
            field=models.CharField(blank=True, default="", max_length=30),
        ),
        migrations.AddField(
            model_name="visitor",
            name="registration_status",
            field=models.CharField(blank=True, default="approved", max_length=20),
        ),
        migrations.AddField(
            model_name="visitor",
            name="approval_status",
            field=models.CharField(blank=True, default="pending", max_length=20),
        ),
        migrations.AddField(
            model_name="visitor",
            name="approved_by",
            field=models.CharField(blank=True, default="", max_length=150),
        ),
        migrations.AddField(
            model_name="visitor",
            name="denied_by",
            field=models.CharField(blank=True, default="", max_length=150),
        ),
        migrations.AddField(
            model_name="visitor",
            name="rejection_reason",
            field=models.TextField(blank=True, default=""),
        ),
        migrations.AddField(
            model_name="visitor",
            name="location",
            field=models.CharField(blank=True, default="", max_length=30),
        ),
        migrations.AddField(
            model_name="visitor",
            name="registered_by_user_id",
            field=models.IntegerField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="visitor",
            name="registered_by_username",
            field=models.CharField(blank=True, default="", max_length=150),
        ),
        migrations.AddField(
            model_name="visitor",
            name="profile_image",
            field=models.TextField(blank=True, default=""),
        ),
        migrations.AddField(
            model_name="visitor",
            name="guard_entry_time",
            field=models.CharField(blank=True, default="", max_length=50),
        ),
        migrations.AddField(
            model_name="visitor",
            name="guard_name",
            field=models.CharField(blank=True, default="", max_length=150),
        ),
        migrations.AddField(
            model_name="visitor",
            name="host_notified_at",
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="visitor",
            name="extra_data",
            field=models.JSONField(blank=True, default=dict),
        ),
        migrations.CreateModel(
            name="Vehicle",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("plate_number", models.CharField(max_length=50)),
                ("vehicle_type", models.CharField(blank=True, default="", max_length=50)),
                ("contractor_company", models.CharField(blank=True, default="", max_length=200)),
                ("driver_name", models.CharField(blank=True, default="", max_length=150)),
                ("remarks", models.TextField(blank=True, default="")),
                ("extra_data", models.JSONField(blank=True, default=dict)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                (
                    "visitor",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="vehicles",
                        to="visitors.visitor",
                    ),
                ),
            ],
            options={"ordering": ["-created_at"]},
        ),
        migrations.CreateModel(
            name="VisitorNotification",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("notification_type", models.CharField(default="host_notify", max_length=50)),
                ("recipient", models.CharField(max_length=254)),
                ("message", models.TextField(blank=True, default="")),
                ("success", models.BooleanField(default=True)),
                ("sent_at", models.DateTimeField(auto_now_add=True)),
                (
                    "visitor",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="notifications",
                        to="visitors.visitor",
                    ),
                ),
            ],
            options={"ordering": ["-sent_at"]},
        ),
        migrations.CreateModel(
            name="VmsListRecord",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("module", models.CharField(db_index=True, max_length=80)),
                ("record_id", models.CharField(max_length=80)),
                ("data", models.JSONField(default=dict)),
                ("location", models.CharField(blank=True, default="", max_length=30)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
            ],
            options={
                "ordering": ["-updated_at"],
                "unique_together": {("module", "record_id")},
            },
        ),
    ]
