# Generated manually

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("users", "0002_user_is_deleted_staff"),
    ]

    operations = [
        migrations.AlterField(
            model_name="staff",
            name="profile_image",
            field=models.ImageField(blank=True, null=True, upload_to="staff/"),
        ),
    ]
