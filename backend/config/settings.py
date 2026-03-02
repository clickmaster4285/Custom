from pathlib import Path
import os
from dotenv import load_dotenv

# -----------------------------
# Base Directory
# -----------------------------
BASE_DIR = Path(__file__).resolve().parent.parent

# -----------------------------
# Load Environment Variables
# -----------------------------
load_dotenv(os.path.join(BASE_DIR, ".env"))

def _env_list(key: str, default: str = "") -> list[str]:
    """Read comma-separated list from .env."""
    value = os.getenv(key, default).strip()
    return [v.strip() for v in value.split(",") if v.strip()]

# -----------------------------
# Security Settings
# -----------------------------
_SECRET_KEY = os.getenv("SECRET_KEY")
if not _SECRET_KEY and os.getenv("DEBUG", "False").lower() in ("true", "1", "yes"):
    # Allow a dev-only default only when DEBUG is explicitly enabled
    _SECRET_KEY = "dev-secret-key-do-not-use-in-production"
if not _SECRET_KEY:
    raise RuntimeError(
        "SECRET_KEY environment variable is required. "
        "Set it in .env or export SECRET_KEY=your-secret-key (never use the dev default in production)."
    )
SECRET_KEY = _SECRET_KEY
DEBUG = os.getenv("DEBUG", "False") == "True"
ALLOWED_HOSTS = _env_list("ALLOWED_HOSTS")

# -----------------------------
# Installed Apps
# -----------------------------
INSTALLED_APPS = [
    # Django Default Apps
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",

    # Third-party
    "corsheaders",
    "rest_framework",
    "rest_framework.authtoken",

    # Local apps
    "users",
    "visitors",
    'logs',
]

# -----------------------------
# Middleware
# -----------------------------
MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",  # Must be first
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
    #for Logs
    'logs.middleware.ActivityLogMiddleware',
]

# -----------------------------
# CORS Settings (Allow All)
# -----------------------------
CORS_ALLOW_ALL_ORIGINS = os.getenv("CORS_ALLOW_ALL_ORIGINS", "True") == "True"
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_HEADERS = [
    "accept",
    "accept-encoding",
    "authorization",
    "content-type",
    "origin",
    "user-agent",
    "x-requested-with",
]
CORS_EXPOSE_HEADERS = ["Content-Type", "Authorization"]

# -----------------------------
# URL & Templates
# -----------------------------
ROOT_URLCONF = "config.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "config.wsgi.application"

# -----------------------------
# Database
# -----------------------------
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": os.getenv("DB_NAME"),
        "USER": os.getenv("DB_USER"),
        "PASSWORD": os.getenv("DB_PASSWORD"),
        "HOST": os.getenv("DB_HOST", "localhost"),
        "PORT": os.getenv("DB_PORT", "5432"),
    }
}

# -----------------------------
# REST Framework
# -----------------------------
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework.authentication.TokenAuthentication",
        "rest_framework.authentication.SessionAuthentication",
    ],
}

# -----------------------------
# Auth
# -----------------------------
AUTH_USER_MODEL = "users.User"

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

# -----------------------------
# Internationalization
# -----------------------------
LANGUAGE_CODE = "en-us"
TIME_ZONE = 'Asia/Karachi'
USE_I18N = True
USE_TZ = True

# -----------------------------
# Static & Media
# -----------------------------
STATIC_URL = "/static/"
MEDIA_URL = "/media/"
MEDIA_ROOT = os.path.join(BASE_DIR, "media")

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"
