"""Save and merge multiple staff photos on the Staff row (staff_photos JSON)."""

from __future__ import annotations

import json
import logging
import uuid
from pathlib import Path

from django.core.files.storage import default_storage

from .models import Staff

logger = logging.getLogger(__name__)

MAX_STAFF_PHOTOS = 5


def _normalize_path(path: str) -> str:
    p = str(path or "").strip().replace("\\", "/")
    while p.startswith("/"):
        p = p[1:]
    if "media/" in p:
        p = p.split("media/", 1)[-1]
    if p.startswith("media/"):
        p = p[len("media/") :]
    # Drop query string from cache-busted URLs
    p = p.split("?", 1)[0]
    return p


def _is_legacy_ml_path(path: str) -> bool:
    p = _normalize_path(path).lower()
    return p.startswith("dataset/") or p.startswith("recognition/")


def staff_photo_paths(staff: Staff) -> list[str]:
    raw = getattr(staff, "staff_photos", None)
    if isinstance(raw, list) and raw:
        paths = [_normalize_path(str(item)) for item in raw if str(item or "").strip()]
        paths = [p for p in paths if p and not _is_legacy_ml_path(p)]
        if paths:
            return paths[:MAX_STAFF_PHOTOS]
    if staff.profile_image:
        key = _normalize_path(str(staff.profile_image.name or ""))
        if key and not _is_legacy_ml_path(key):
            return [key]
    return []


def existing_staff_photo_paths(staff: Staff) -> list[str]:
    return [path for path in staff_photo_paths(staff) if default_storage.exists(path)]


def _unique_staff_path(original_name: str) -> str:
    ext = Path(original_name or "photo.jpg").suffix.lower()
    if ext not in {".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp"}:
        ext = ".jpg"
    return f"staff/{uuid.uuid4().hex}{ext}"


def _save_uploaded_file(uploaded_file) -> str:
    try:
        from detentions.image_utils import compress_image

        uploaded_file = compress_image(
            uploaded_file,
            max_width=1600,
            max_height=1600,
            quality=82,
        )
    except Exception as exc:
        logger.warning("Staff photo compression skipped: %s", exc)
    path = _unique_staff_path(getattr(uploaded_file, "name", "photo.jpg"))
    if hasattr(uploaded_file, "seek"):
        try:
            uploaded_file.seek(0)
        except Exception:
            pass
    saved = default_storage.save(path, uploaded_file)
    return _normalize_path(saved)


def _parse_keep_paths(request) -> list[str]:
    raw = request.data.get("staff_photos_keep")
    if raw is None or raw == "":
        return []
    if isinstance(raw, list):
        items = raw
    else:
        try:
            items = json.loads(str(raw))
        except (TypeError, ValueError, json.JSONDecodeError):
            return []
    if not isinstance(items, list):
        return []
    return [
        path
        for path in (_normalize_path(str(p)) for p in items if str(p or "").strip())
        if path and not _is_legacy_ml_path(path)
    ][:MAX_STAFF_PHOTOS]


def _delete_removed_photos(staff: Staff, new_paths: list[str]) -> None:
    previous = set(staff_photo_paths(staff))
    keep = set(new_paths)
    for path in previous - keep:
        try:
            if default_storage.exists(path):
                default_storage.delete(path)
        except OSError as exc:
            logger.warning("Could not delete old staff photo %s: %s", path, exc)


def apply_staff_photo_uploads(staff: Staff, request) -> bool:
    """
    Merge kept paths + newly uploaded staff_photos files onto staff.staff_photos.
    Sets profile_image to the first path. Returns True when photos changed.
    """
    keep_paths = _parse_keep_paths(request)
    uploads = request.FILES.getlist("staff_photo_files") or request.FILES.getlist("staff_photos")
    new_paths = [_save_uploaded_file(f) for f in uploads if f]

    if not keep_paths and not new_paths and not staff_photo_paths(staff):
        return False

    if keep_paths or new_paths:
        merged: list[str] = []
        seen: set[str] = set()
        for path in [*new_paths, *keep_paths]:
            norm = _normalize_path(path)
            if not norm or norm in seen or _is_legacy_ml_path(norm):
                continue
            seen.add(norm)
            merged.append(norm)
            if len(merged) >= MAX_STAFF_PHOTOS:
                break
        final_paths = merged
    else:
        final_paths = staff_photo_paths(staff)

    previous = staff_photo_paths(staff)
    changed = previous != final_paths

    if changed:
        _delete_removed_photos(staff, final_paths)

    # Write paths directly so ImageField does not copy/replace the file we just saved.
    Staff.objects.filter(pk=staff.pk).update(
        staff_photos=final_paths,
        profile_image=final_paths[0] if final_paths else None,
    )
    staff.refresh_from_db()
    return changed or bool(new_paths)
