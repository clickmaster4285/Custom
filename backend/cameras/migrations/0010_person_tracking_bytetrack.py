# Generated manually for person tracking + ByteTrack log fields

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("users", "0020_attendance_video"),
        ("visitors", "0006_alter_visitor_access_zone"),
        ("cameras", "0009_detectionevent_personal_number"),
    ]

    operations = [
        migrations.CreateModel(
            name="PersonIdentity",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("qr_code_number", models.CharField(db_index=True, max_length=32, unique=True)),
                (
                    "person_type",
                    models.CharField(
                        choices=[("staff", "Staff"), ("visitor", "Visitor"), ("anonymous", "Anonymous")],
                        db_index=True,
                        default="anonymous",
                        max_length=16,
                    ),
                ),
                ("display_name", models.CharField(blank=True, default="", max_length=200)),
                ("face_embedding", models.JSONField(blank=True, default=list)),
                ("first_seen_at", models.DateTimeField(auto_now_add=True)),
                ("last_seen_at", models.DateTimeField(auto_now=True)),
                (
                    "staff",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="person_identities",
                        to="users.staff",
                    ),
                ),
                (
                    "visitor",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="person_identities",
                        to="visitors.visitor",
                    ),
                ),
            ],
            options={
                "ordering": ["-last_seen_at"],
            },
        ),
        migrations.AddField(
            model_name="detectionevent",
            name="local_track_id",
            field=models.PositiveIntegerField(
                blank=True,
                db_index=True,
                help_text="ByteTrack ID on this camera stream.",
                null=True,
            ),
        ),
        migrations.AddField(
            model_name="detectionevent",
            name="person_qr",
            field=models.CharField(
                blank=True,
                db_index=True,
                default="",
                help_text="Unique person QR code (PQR-STF/VIS/UNK-…).",
                max_length=32,
            ),
        ),
        migrations.AddField(
            model_name="detectionevent",
            name="track_event",
            field=models.CharField(
                blank=True,
                choices=[
                    ("started", "Started"),
                    ("updated", "Updated"),
                    ("ended", "Ended"),
                    ("frame", "Frame"),
                ],
                default="",
                max_length=16,
            ),
        ),
        migrations.AddField(
            model_name="detectionevent",
            name="person_identity",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name="detection_events",
                to="cameras.personidentity",
            ),
        ),
        migrations.CreateModel(
            name="PersonSighting",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("local_track_id", models.PositiveIntegerField(blank=True, db_index=True, null=True)),
                ("started_at", models.DateTimeField()),
                ("ended_at", models.DateTimeField(blank=True, null=True)),
                ("last_label", models.CharField(blank=True, default="", max_length=120)),
                ("site_code", models.CharField(blank=True, default="", max_length=64)),
                ("zone", models.CharField(blank=True, default="", max_length=64)),
                (
                    "camera",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="person_sightings",
                        to="cameras.camera",
                    ),
                ),
                (
                    "person",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="sightings",
                        to="cameras.personidentity",
                    ),
                ),
            ],
            options={
                "ordering": ["-started_at"],
            },
        ),
    ]
