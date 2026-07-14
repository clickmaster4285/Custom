from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    CameraPreviewMjpegView,
    CameraStreamListView,
    CameraViewSet,
    NvrViewSet,
    PersonIdentityListView,
    PersonJourneyView,
    SiteViewSet,
)

router = DefaultRouter()
router.register(r"sites", SiteViewSet, basename="site")
router.register(r"nvrs", NvrViewSet, basename="nvr")
router.register(r"cameras", CameraViewSet, basename="camera")

urlpatterns = [
    path("cameras/streams/", CameraStreamListView.as_view(), name="camera-stream-list"),
    path("cameras/preview/mjpeg/", CameraPreviewMjpegView.as_view(), name="camera-preview-mjpeg"),
    path("cameras/persons/", PersonIdentityListView.as_view(), name="person-identity-list"),
    path("cameras/persons/<str:qr_code>/journey/", PersonJourneyView.as_view(), name="person-journey"),
    path("person-journey/ingest/", PersonJourneyView.as_view(), name="person-journey-ingest"),
    path("person-journey/", PersonJourneyView.as_view(), name="person-journey-root"),
    path("", include(router.urls)),
]
