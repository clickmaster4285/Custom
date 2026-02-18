import os

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

# Import Django and setup
import django
from django.core.wsgi import get_wsgi_application
from django.core.management import call_command

django.setup()

# --- Auto migrations (development only) ---
try:
    # Create migrations for any changes (non-interactive)
    call_command("makemigrations", interactive=False)
    # Apply migrations to the database (non-interactive)
    call_command("migrate", interactive=False)
except Exception as e:
    # Print errors but continue (so server can still start)
    print("⚠️ Auto migration error:", e)

# WSGI application
application = get_wsgi_application()
