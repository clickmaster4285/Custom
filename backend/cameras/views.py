"""Dashboard camera streams — RTSP URLs from settings (.env), MJPEG proxy for browsers."""

from __future__ import annotations

from django.conf import settings
from django.http import StreamingHttpResponse
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .stream_utils import (
    camera_label_from_url,
    ffmpeg_available,
    generate_mjpeg_frames,
)


def _rtsp_urls() -> list[str]:
    return list(getattr(settings, "RTSP_CAMERA_URLS", []) or [])


def _request_has_valid_auth(request) -> bool:
    if getattr(request.user, "is_authenticated", False) and request.user.is_authenticated:
        return True
    key = request.query_params.get("token") or request.GET.get("token")
    if not key:
        return False
    return Token.objects.filter(key=key).exists()


class CameraStreamListView(APIView):
    """Public metadata for dashboard grid (no RTSP credentials in response)."""

    def get(self, request):
        if not _request_has_valid_auth(request):
            return Response({"detail": "Authentication required."}, status=status.HTTP_401_UNAUTHORIZED)

        cameras = []
        for index, _url in enumerate(_rtsp_urls()):
            cameras.append(
                {
                    "id": index,
                    "label": camera_label_from_url(_url, index),
                    "stream_path": f"/api/cameras/streams/{index}/mjpeg/",
                }
            )
        return Response(
            {
                "cameras": cameras,
                "ffmpeg_available": ffmpeg_available(),
            }
        )


class CameraMjpegStreamView(APIView):
    """Proxy RTSP as multipart MJPEG for use in <img src=\"...\">."""

    permission_classes = [AllowAny]

    def get(self, request, camera_id: int):
        if not _request_has_valid_auth(request):
            return Response({"detail": "Authentication required."}, status=status.HTTP_401_UNAUTHORIZED)

        urls = _rtsp_urls()
        if camera_id < 0 or camera_id >= len(urls):
            return Response({"detail": "Camera not found."}, status=status.HTTP_404_NOT_FOUND)

        if not ffmpeg_available():
            return Response(
                {
                    "detail": (
                        "ffmpeg is not installed on the API server. "
                        "Install ffmpeg or set FFMPEG_PATH in backend/.env."
                    )
                },
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        rtsp_url = urls[camera_id]
        response = StreamingHttpResponse(
            generate_mjpeg_frames(rtsp_url),
            content_type="multipart/x-mixed-replace; boundary=frame",
        )
        response["Cache-Control"] = "no-cache, no-store, must-revalidate"
        response["Pragma"] = "no-cache"
        response["X-Accel-Buffering"] = "no"
        return response
