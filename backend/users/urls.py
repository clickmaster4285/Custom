from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import StaffViewSet, AttendanceViewSet, LoginView

router = DefaultRouter()
router.register(r"staff", StaffViewSet, basename="staff")
router.register(r"attendance", AttendanceViewSet, basename="attendance")

urlpatterns = [
    path("auth/login/", LoginView.as_view(), name="login"),
    path("auth/login", LoginView.as_view(), name="login-no-slash"), 
    *router.urls,
]
