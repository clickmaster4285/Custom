"""Add missing columns on detention tables (repairs partial / legacy schemas)."""

from django.db import migrations


def _table_columns(schema_editor, table: str) -> set[str]:
    connection = schema_editor.connection
    with connection.cursor() as cursor:
        try:
            description = connection.introspection.get_table_description(cursor, table)
        except Exception:
            return set()
    return {row.name for row in description}


def repair_missing_columns(apps, schema_editor):
    model_names = [
        "DetentionMemo",
        "DepositAccountEntry",
        "DetentionMemoAttachment",
        "DetentionMemoGoodsLine",
        "DetentionMemoGoodsImage",
    ]
    for name in model_names:
        model = apps.get_model("detentions", name)
        table = model._meta.db_table
        existing = _table_columns(schema_editor, table)
        if not existing:
            continue
        for field in model._meta.local_fields:
            if getattr(field, "many_to_many", False):
                continue
            column = field.column
            if column in existing:
                continue
            try:
                schema_editor.add_field(model, field)
                existing.add(column)
            except Exception:
                # Column may exist under a different state; skip to avoid blocking migrate.
                pass


def noop_reverse(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ("detentions", "0003_ensure_child_tables"),
    ]

    operations = [
        migrations.RunPython(repair_missing_columns, noop_reverse),
    ]
