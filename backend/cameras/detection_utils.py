"""Persist ML detection readings with light deduplication."""

from __future__ import annotations

import logging
import os
from datetime import timedelta
from typing import Any

from django.conf import settings
from django.db.models import Q
from django.utils import timezone

from .clip_capture import schedule_attendance_snapshot, schedule_detection_clip
from .models import Camera, CameraPurpose, ClipStatus, DetectionEvent, TrackEventType
from .track_state import prepare_detection_events

logger = logging.getLogger(__name__)

DEFAULT_MIN_CONFIDENCE = 0.25
_GENERIC_EMPLOYEE_LABELS = frozenset({"unknown", "person", "face", ""})
_ANPR_CLASS_NAMES = frozenset(
    {
        "car",
        "truck",
        "bus",
        "motorcycle",
        "bicycle",
        "vehicle",
        "license plate",
        "number plate",
    }
)

# Mirror ml_services/inference_engine.py EXCLUDED_CLASS_IDS
_EXCLUDED_CLASS_IDS = frozenset({
    4, 6, 9, 10, 11, 12, 20, 21, 22, 23, 29, 30, 37, 38, 53, 54, 55,
})
_EXCLUDED_CLASS_NAMES = frozenset({
    "airplane", "train", "traffic light", "fire hydrant", "stop sign", "parking meter",
    "elephant", "bear", "zebra", "giraffe", "frisbee", "skis", "surfboard",
    "tennis racket", "pizza", "donut", "cake",
})


def is_excluded_detection(det: dict[str, Any]) -> bool:
    if det.get("alert"):
        return False
    try:
        cls_id = int(det.get("class_id", -1))
    except (TypeError, ValueError):
        cls_id = -1
    if cls_id in _EXCLUDED_CLASS_IDS:
        return True
    name = str(det.get("class_name") or det.get("label") or "").strip().lower().replace("_", " ")
    return name in _EXCLUDED_CLASS_NAMES


def _coco_max_class_id() -> int:
    try:
        return int(os.getenv("ML_COCO_MAX_CLASS_ID", "79"))
    except (TypeError, ValueError):
        return 79


def is_coco_detection(det: dict[str, Any]) -> bool:
    """True for generic COCO model hits (e.g. chair, person) — not custom specialist classes."""
    tag = str(det.get("model_tag") or "").strip().lower()
    if tag in ("custom", "smoke"):
        return False
    if tag == "coco":
        return True
    try:
        cls_id = int(det.get("class_id", -1))
    except (TypeError, ValueError):
        cls_id = -1
    return 0 <= cls_id <= _coco_max_class_id()


def filter_detections_for_camera(camera: Camera, detections: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Keep detections for this camera's AI purpose (all COCO/custom classes except excluded)."""
    purpose = camera.purpose
    kept: list[dict[str, Any]] = []

    for det in detections or []:
        if is_excluded_detection(det):
            continue
        if det.get("alert"):
            kept.append(det)
            continue

        cls = str(det.get("class_name") or det.get("label") or "").strip().lower()

        if purpose in (CameraPurpose.FACE_RECOGNITION, CameraPurpose.ATTENDANCE):
            if cls in ("person", "face"):
                kept.append(det)
            continue

        if purpose == CameraPurpose.ANPR:
            if cls in _ANPR_CLASS_NAMES:
                kept.append(det)
            continue

        kept.append(det)

    return kept


def resolve_employee_name(label: str, class_name: str) -> str:
    """Map ML face-recognition label to employee_name for person/face detections."""
    employee_name, _ = resolve_staff_identity(label, class_name)
    return employee_name


def resolve_staff_identity(label: str, class_name: str) -> tuple[str, str]:
    """Return (employee_name, personal_number) for recognized person/face detections."""
    lbl = (label or "").strip()
    cls = (class_name or "").strip().lower()
    if cls not in ("person", "face") or lbl.lower() in _GENERIC_EMPLOYEE_LABELS:
        return "", ""

    from users.models import Staff

    staff = (
        Staff.objects.filter(
            Q(face_identity_label__iexact=lbl)
            | Q(user__username__iexact=lbl)
            | Q(full_name__iexact=lbl)
        )
        .select_related("user")
        .first()
    )

    if staff is None:
        return lbl[:150], ""

    employee_name = (staff.full_name or lbl).strip()[:150]
    personal_number = (staff.personal_number or "").strip()[:50]
    return employee_name, personal_number


def _dedup_seconds() -> int:
    raw = getattr(settings, "DETECTION_DEDUP_SECONDS", 5)
    try:
        return max(0, int(raw))
    except (TypeError, ValueError):
        return 5


def _track_dedup_seconds() -> int:
    raw = getattr(settings, "DETECTION_TRACK_DEDUP_SECONDS", 300)
    try:
        return max(0, int(raw))
    except (TypeError, ValueError):
        return 300


def _should_skip_frame_dedup(
    camera: Camera,
    *,
    label: str,
    class_name: str,
    local_track_id: int | None,
    person_identity_id: int | None = None,
    since,
) -> bool:
    if since is None:
        return False
    qs = DetectionEvent.objects.filter(camera=camera, created_at__gte=since)
    if person_identity_id is not None:
        if qs.filter(person_identity_id=person_identity_id).exists():
            return True
    if local_track_id is not None:
        if qs.filter(local_track_id=local_track_id).exists():
            return True
    return qs.filter(label=label, class_name=class_name).exists()


def save_detection_batch(
    camera: Camera,
    detections: list[dict[str, Any]],
    *,
    min_confidence: float = DEFAULT_MIN_CONFIDENCE,
    dedup_seconds: int | None = None,
) -> int:
    """Save detections from a live ML poll. Returns number of new rows created."""
    detections = filter_detections_for_camera(camera, detections)
    if not detections:
        return 0

    log_candidates = prepare_detection_events(camera, detections)

    dedup_window = _dedup_seconds() if dedup_seconds is None else max(0, dedup_seconds)
    track_dedup_window = _track_dedup_seconds()
    since_frame = timezone.now() - timedelta(seconds=max(1, dedup_window)) if dedup_window > 0 else None
    since_track = (
        timezone.now() - timedelta(seconds=max(1, track_dedup_window))
        if track_dedup_window > 0
        else None
    )
    saved = 0

    for det in log_candidates:
        label = str(det.get("label") or det.get("class_name") or "").strip()
        class_name = str(det.get("class_name") or label or "object").strip()
        if not label:
            continue
        try:
            confidence = float(det.get("confidence", 0))
        except (TypeError, ValueError):
            continue
        if confidence < min_confidence and not det.get("alert"):
            continue

        track_event = str(det.get("track_event") or TrackEventType.FRAME).strip()
        try:
            local_track_id = int(det["track_id"]) if det.get("track_id") is not None else None
        except (TypeError, ValueError):
            local_track_id = None
        if local_track_id is None:
            local_track_id = det.get("local_track_id")
            try:
                local_track_id = int(local_track_id) if local_track_id is not None else None
            except (TypeError, ValueError):
                local_track_id = None

        person_qr = str(det.get("person_qr") or "").strip()[:32]
        person_identity_id = det.get("person_identity_id")
        try:
            person_identity_id = int(person_identity_id) if person_identity_id is not None else None
        except (TypeError, ValueError):
            person_identity_id = None

        global_track_id = det.get("global_track_id")
        try:
            global_track_id = int(global_track_id) if global_track_id is not None else None
        except (TypeError, ValueError):
            global_track_id = None

        if person_identity_id and global_track_id is None:
            global_track_id = person_identity_id
        if person_identity_id and local_track_id is None:
            local_track_id = global_track_id or person_identity_id

        clip_enabled = bool(getattr(settings, "DETECTION_CLIP_ENABLED", True))
        employee_name, personal_number = resolve_staff_identity(label, class_name)

        from users.attendance_service import try_mark_attendance_from_detection

        if track_event in (TrackEventType.STARTED, TrackEventType.FRAME):
            try:
                action, attendance_record = try_mark_attendance_from_detection(
                    camera, label, class_name, confidence
                )
                if action in ("check_in", "check_out") and attendance_record is not None:
                    logger.info(
                        "Attendance %s via camera %s for %s",
                        action,
                        camera.code,
                        employee_name or label,
                    )
                    schedule_attendance_snapshot(
                        camera.pk,
                        attendance_record.pk,
                        label=label,
                        employee_name=employee_name,
                        class_name=class_name,
                        bbox=det.get("bbox") or [],
                        confidence=confidence,
                        action=action,
                        infer_frame_w=int(det.get("frame_width") or 0),
                        infer_frame_h=int(det.get("frame_height") or 0),
                    )
            except Exception:
                logger.exception("Attendance mark failed for camera %s", camera.pk)

        if track_event in (TrackEventType.STARTED, TrackEventType.ENDED):
            if since_track is not None:
                dedup_qs = DetectionEvent.objects.filter(
                    camera=camera,
                    track_event=track_event,
                    created_at__gte=since_track,
                )
                if person_identity_id:
                    if dedup_qs.filter(person_identity_id=person_identity_id).exists():
                        continue
                elif local_track_id is not None:
                    if dedup_qs.filter(local_track_id=local_track_id).exists():
                        continue
        elif _should_skip_frame_dedup(
            camera,
            label=label,
            class_name=class_name,
            local_track_id=local_track_id,
            person_identity_id=person_identity_id,
            since=since_frame,
        ):
            continue

        event = DetectionEvent.objects.create(
            camera=camera,
            class_name=class_name[:80],
            label=label[:120],
            employee_name=employee_name,
            personal_number=personal_number,
            local_track_id=local_track_id,
            person_qr=person_qr,
            track_event=track_event[:16],
            person_identity_id=person_identity_id if person_identity_id else None,
            confidence=confidence,
            bbox=det.get("bbox") or [],
            is_alert=bool(det.get("alert")),
            clip_status=ClipStatus.PENDING if clip_enabled else ClipStatus.SKIPPED,
        )
        if track_event in (TrackEventType.STARTED, TrackEventType.FRAME):
            schedule_detection_clip(camera.pk, event.pk)
        saved += 1

    return saved
