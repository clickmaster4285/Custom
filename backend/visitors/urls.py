from django.urls import path
from .views import (
    VisitorListAPIView,
    VisitorCreateAPIView,
    VisitorReadAPIView,
    VisitorUpdateAPIView,
    VisitorDeleteAPIView,
    VisitorFaceCaptureAPIView,
    ZoneScanAPIView,
    SecurityAlertListAPIView,
    SecurityDashboardAPIView,
)

urlpatterns = [
    # Visitor CRUD
    path("visitors/list/", VisitorListAPIView.as_view(), name="visitor-list"),
    path("visitors/create/", VisitorCreateAPIView.as_view(), name="visitor-create"),
    path("visitors/<int:pk>/read/", VisitorReadAPIView.as_view(), name="visitor-read"),
    path("visitors/<int:pk>/update/", VisitorUpdateAPIView.as_view(), name="visitor-update"),
    path("visitors/<int:pk>/delete/", VisitorDeleteAPIView.as_view(), name="visitor-delete"),
    # Flow: Face Capture (Arc Face)
    path("visitors/<int:pk>/face-capture/", VisitorFaceCaptureAPIView.as_view(), name="visitor-face-capture"),
    # Flow: Zone Access Check (QR scan at gate)
    path("zone-access/scan/", ZoneScanAPIView.as_view(), name="zone-scan"),
    # Security: Alerts & Dashboard
    path("security/alerts/", SecurityAlertListAPIView.as_view(), name="security-alerts"),
    path("security/dashboard/", SecurityDashboardAPIView.as_view(), name="security-dashboard"),
]
