from django.db import migrations, models


class Migration(migrations.Migration):
    """DB already has logs_useractivitylog.source; sync Django state only."""

    dependencies = [
        ("logs", "0001_initial"),
    ]

    operations = [
        migrations.SeparateDatabaseAndState(
            state_operations=[
                migrations.AddField(
                    model_name="useractivitylog",
                    name="source",
                    field=models.CharField(blank=True, default="web", max_length=20),
                ),
            ],
            database_operations=[],
        ),
    ]
