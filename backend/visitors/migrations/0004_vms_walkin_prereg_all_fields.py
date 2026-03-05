# Visitor Management: all frontend fields for Walk-in + Pre-registration
# Idempotent: adds only columns that don't exist (for DBs that already have some).

from django.db import migrations, models


def add_missing_columns(apps, schema_editor):
    """Add columns only if they don't exist (PostgreSQL)."""
    if schema_editor.connection.vendor != "postgresql":
        return
    table = "visitors_visitor"
    # (column_name, sql_type, default_sql)
    columns = [
        ("vehicle_type", "varchar(50)", "DEFAULT ''"),
        ("vehicle_registration_no", "varchar(100)", "DEFAULT ''"),
        ("vehicle_color", "varchar(50)", "DEFAULT ''"),
        ("vehicle_company", "varchar(150)", "DEFAULT ''"),
        ("vehicle_image", "text", "DEFAULT ''"),
        ("vehicle_images", "jsonb", "DEFAULT '[]'::jsonb"),
        ("visitor_photos", "jsonb", "DEFAULT '[]'::jsonb"),
        ("photo_capture", "text", "DEFAULT ''"),
        ("visitor_minors", "jsonb", "DEFAULT '[]'::jsonb"),
        ("host_name", "varchar(200)", "DEFAULT ''"),
        ("preferred_time_slot", "varchar(50)", "DEFAULT ''"),
        ("priority_level", "varchar(50)", "DEFAULT ''"),
        ("location", "varchar(200)", "DEFAULT ''"),
        ("authorization_letter", "text", "DEFAULT ''"),
        ("noc_document", "text", "DEFAULT ''"),
        ("security_level", "varchar(50)", "DEFAULT ''"),
        ("max_visit_duration", "varchar(50)", "DEFAULT ''"),
        ("allowed_departments", "varchar(255)", "DEFAULT ''"),
        ("allowed_zones", "varchar(255)", "DEFAULT ''"),
        ("additional_remarks", "text", "DEFAULT ''"),
        ("escort_mandatory", "varchar(20)", "DEFAULT ''"),
        ("registration_source", "varchar(30)", "DEFAULT ''"),
        ("registration_status", "varchar(20)", "DEFAULT 'approved'"),
        ("draft_form_data", "jsonb", "DEFAULT '{}'::jsonb"),
    ]
    with schema_editor.connection.cursor() as cursor:
        for name, sql_type, default_sql in columns:
            cursor.execute(
                f'ALTER TABLE {table} ADD COLUMN IF NOT EXISTS "{name}" {sql_type} {default_sql}'
            )
        # Index for filtering
        cursor.execute(
            """CREATE INDEX IF NOT EXISTS visitors_visitor_registration_source_idx
               ON visitors_visitor (registration_source)"""
        )
        cursor.execute(
            """CREATE INDEX IF NOT EXISTS visitors_visitor_registration_status_idx
               ON visitors_visitor (registration_status)"""
        )


def noop_reverse(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ("visitors", "0003_alter_visitor_expiry_status_and_more"),
    ]

    operations = [
        migrations.RunPython(add_missing_columns, noop_reverse),
        # Update Django state so it matches the model (no DB ops for these)
        migrations.SeparateDatabaseAndState(
            state_operations=[
                migrations.AddField(
                    model_name="visitor",
                    name="vehicle_type",
                    field=models.CharField(blank=True, max_length=50, default=""),
                ),
                migrations.AddField(
                    model_name="visitor",
                    name="vehicle_registration_no",
                    field=models.CharField(blank=True, max_length=100, default=""),
                ),
                migrations.AddField(
                    model_name="visitor",
                    name="vehicle_color",
                    field=models.CharField(blank=True, max_length=50, default=""),
                ),
                migrations.AddField(
                    model_name="visitor",
                    name="vehicle_company",
                    field=models.CharField(blank=True, max_length=150, default=""),
                ),
                migrations.AddField(
                    model_name="visitor",
                    name="vehicle_image",
                    field=models.TextField(blank=True, default=""),
                ),
                migrations.AddField(
                    model_name="visitor",
                    name="vehicle_images",
                    field=models.JSONField(blank=True, default=list),
                ),
                migrations.AddField(
                    model_name="visitor",
                    name="visitor_photos",
                    field=models.JSONField(blank=True, default=list),
                ),
                migrations.AddField(
                    model_name="visitor",
                    name="photo_capture",
                    field=models.TextField(blank=True, default=""),
                ),
                migrations.AddField(
                    model_name="visitor",
                    name="visitor_minors",
                    field=models.JSONField(blank=True, default=list),
                ),
                migrations.AddField(
                    model_name="visitor",
                    name="host_name",
                    field=models.CharField(blank=True, max_length=200, default=""),
                ),
                migrations.AddField(
                    model_name="visitor",
                    name="preferred_time_slot",
                    field=models.CharField(blank=True, max_length=50, default=""),
                ),
                migrations.AddField(
                    model_name="visitor",
                    name="priority_level",
                    field=models.CharField(blank=True, max_length=50, default=""),
                ),
                migrations.AddField(
                    model_name="visitor",
                    name="location",
                    field=models.CharField(blank=True, max_length=200, default=""),
                ),
                migrations.AddField(
                    model_name="visitor",
                    name="authorization_letter",
                    field=models.TextField(blank=True, default=""),
                ),
                migrations.AddField(
                    model_name="visitor",
                    name="noc_document",
                    field=models.TextField(blank=True, default=""),
                ),
                migrations.AddField(
                    model_name="visitor",
                    name="security_level",
                    field=models.CharField(blank=True, max_length=50, default=""),
                ),
                migrations.AddField(
                    model_name="visitor",
                    name="max_visit_duration",
                    field=models.CharField(blank=True, max_length=50, default=""),
                ),
                migrations.AddField(
                    model_name="visitor",
                    name="allowed_departments",
                    field=models.CharField(blank=True, max_length=255, default=""),
                ),
                migrations.AddField(
                    model_name="visitor",
                    name="allowed_zones",
                    field=models.CharField(blank=True, max_length=255, default=""),
                ),
                migrations.AddField(
                    model_name="visitor",
                    name="additional_remarks",
                    field=models.TextField(blank=True, default=""),
                ),
                migrations.AddField(
                    model_name="visitor",
                    name="escort_mandatory",
                    field=models.CharField(blank=True, max_length=20, default=""),
                ),
                migrations.AddField(
                    model_name="visitor",
                    name="registration_source",
                    field=models.CharField(blank=True, db_index=True, max_length=30, default=""),
                ),
                migrations.AddField(
                    model_name="visitor",
                    name="registration_status",
                    field=models.CharField(blank=True, db_index=True, default="approved", max_length=20),
                ),
                migrations.AddField(
                    model_name="visitor",
                    name="draft_form_data",
                    field=models.JSONField(blank=True, default=dict),
                ),
                migrations.AlterField(
                    model_name="visitor",
                    name="visitor_type",
                    field=models.CharField(default="individual", max_length=50),
                ),
                migrations.AlterField(
                    model_name="visitor",
                    name="nationality",
                    field=models.CharField(blank=True, max_length=100),
                ),
                migrations.AlterField(
                    model_name="visitor",
                    name="visit_purpose",
                    field=models.CharField(blank=True, max_length=100),
                ),
                migrations.AlterField(
                    model_name="visitor",
                    name="department_to_visit",
                    field=models.CharField(blank=True, max_length=100),
                ),
                migrations.AlterField(
                    model_name="visitor",
                    name="host_officer_designation",
                    field=models.CharField(blank=True, max_length=100),
                ),
                migrations.AlterField(
                    model_name="visitor",
                    name="mobile_number",
                    field=models.CharField(blank=True, max_length=50),
                ),
                migrations.AlterField(
                    model_name="visitor",
                    name="host_officer_name",
                    field=models.CharField(blank=True, max_length=200),
                ),
                migrations.AlterField(
                    model_name="visitor",
                    name="host_full_name",
                    field=models.CharField(blank=True, max_length=200),
                ),
                migrations.AlterField(
                    model_name="visitor",
                    name="access_zone",
                    field=models.CharField(blank=True, max_length=50),
                ),
                migrations.AlterField(
                    model_name="visitor",
                    name="entry_gate",
                    field=models.CharField(blank=True, max_length=50),
                ),
                migrations.AlterField(
                    model_name="visitor",
                    name="generated_by",
                    field=models.CharField(blank=True, max_length=50),
                ),
            ],
            database_operations=[],
        ),
    ]
