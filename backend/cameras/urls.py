from django.urls import path

from .views import CameraMjpegStreamView, CameraStreamListView

urlpatterns = [
    path("cameras/streams/", CameraStreamListView.as_view(), name="camera-stream-list"),
    path(
        "cameras/streams/<int:camera_id>/mjpeg/",
        CameraMjpegStreamView.as_view(),
        name="camera-mjpeg-stream",
    ),
]
