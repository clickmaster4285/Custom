"""Create detention child tables when missing (repairs faked 0002 on existing DBs)."""

from django.db import migrations


def _existing_tables(schema_editor) -> set[str]:
    return set(schema_editor.connection.introspection.table_names())


def ensure_detention_child_tables(apps, schema_editor):
    """Create 0002 child tables only if they are absent."""
    existing = _existing_tables(schema_editor)
    models_in_order = [
        apps.get_model("detentions", "DepositAccountEntry"),
        apps.get_model("detentions", "DetentionMemoAttachment"),
        apps.get_model("detentions", "DetentionMemoGoodsLine"),
        apps.get_model("detentions", "DetentionMemoGoodsImage"),
    ]
    for model in models_in_order:
        table = model._meta.db_table
        if table in existing:
            continue
        schema_editor.create_model(model)
        existing.add(table)


def noop_reverse(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ("detentions", "0002_alter_detentionmemo_options_depositaccountentry_and_more"),
    ]

    operations = [
        migrations.RunPython(ensure_detention_child_tables, noop_reverse),
    ]
