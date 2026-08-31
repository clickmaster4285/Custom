"""Serve current staff photos for leftover ML dataset/recognition media URLs."""

from __future__ import annotations

import mimetypes
import re

from django.core.files.storage import default_storage
from django.http import FileResponse, Http404

from .models import Staff
from .staff_photos import existing_staff_photo_paths

_DATASET_STAFF = re.compile(r"^dataset/staff_(\d+)/", re.I)
_RECOGNITION_PROFILE = re.compile(r"^recognition/profile/staff_(\d+)\.[a-z0-9]+$", re.I)


def _file_response(path: str) -> FileResponse | None:
    if not path or not default_storage.exists(path):
        return None
    content_type, _ = mimetypes.guess_type(path)
    return FileResponse(
        default_storage.open(path, "rb"),
        content_type=content_type or "image/jpeg",
    )


def staff_legacy_media(request, leftover: str):
    """
    Old face-training layouts used:
      /media/dataset/staff_<id>/face_NNN.jpg
      /media/recognition/profile/staff_<id>.jpg
    Those files are not stored here; serve the employee's current photo instead.
    """
    rel = str(leftover or "").replace("\\", "/").lstrip("/")
    existing = _file_response(rel)
    if existing is not None:
        return existing

    match = _DATASET_STAFF.match(rel) or _RECOGNITION_PROFILE.match(rel)
    if not match:
        raise Http404()

    staff = Staff.objects.filter(pk=int(match.group(1))).first()
    if staff is None:
        raise Http404()

    for path in existing_staff_photo_paths(staff):
        response = _file_response(path)
        if response is not None:
            return response

    raise Http404()
