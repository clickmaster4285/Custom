# Soften legacy RecoveryMemo columns so Django model inserts succeed.
# Live table still has reference_number / summary / items_description / created_by
# (NOT NULL, no default) and recovery_date as date — model uses CharField.

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("seizure_management", "0011_align_recovery_memo_schema"),
    ]

    operations = [
        migrations.RunSQL(
            sql="""
            ALTER TABLE seizure_management_recoverymemo
              ALTER COLUMN reference_number SET DEFAULT '';

            ALTER TABLE seizure_management_recoverymemo
              ALTER COLUMN summary SET DEFAULT '';

            ALTER TABLE seizure_management_recoverymemo
              ALTER COLUMN items_description SET DEFAULT '';

            ALTER TABLE seizure_management_recoverymemo
              ALTER COLUMN created_by SET DEFAULT '';

            ALTER TABLE seizure_management_recoverymemo
              ALTER COLUMN approved_by SET DEFAULT '';

            ALTER TABLE seizure_management_recoverymemo
              ALTER COLUMN rejection_reason SET DEFAULT '';

            UPDATE seizure_management_recoverymemo
            SET reference_number = COALESCE(reference_number, ''),
                summary = COALESCE(summary, ''),
                items_description = COALESCE(items_description, ''),
                created_by = COALESCE(created_by, ''),
                approved_by = COALESCE(approved_by, ''),
                rejection_reason = COALESCE(rejection_reason, '');

            -- Model stores recovery_date as varchar
            ALTER TABLE seizure_management_recoverymemo
              ALTER COLUMN recovery_date TYPE varchar(40)
              USING COALESCE(recovery_date::text, '');

            ALTER TABLE seizure_management_recoverymemo
              ALTER COLUMN recovery_date SET DEFAULT '';

            ALTER TABLE seizure_management_recoverymemo
              ALTER COLUMN recovery_date SET NOT NULL;
            """,
            reverse_sql=migrations.RunSQL.noop,
        ),
    ]
