from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("warehouse", "0007_wms_flow_models"),
    ]

    operations = [
        migrations.AddField(
            model_name="releaserecord",
            name="collector_name",
            field=models.CharField(blank=True, max_length=200),
        ),
        migrations.AddField(
            model_name="releaserecord",
            name="deputy_name",
            field=models.CharField(blank=True, max_length=200),
        ),
        migrations.AddField(
            model_name="releaserecord",
            name="quantity_released",
            field=models.DecimalField(decimal_places=3, default=0, max_digits=14),
        ),
        migrations.AddField(
            model_name="releaserecord",
            name="release_description",
            field=models.TextField(blank=True),
        ),
        migrations.AddField(
            model_name="releaserecord",
            name="released_on_behalf_of",
            field=models.CharField(blank=True, max_length=300),
        ),
        migrations.AddField(
            model_name="releaserecord",
            name="unit",
            field=models.CharField(blank=True, default="PCS", max_length=40),
        ),
    ]
