"""In-memory person session state for detection logging (cross-camera PQR + global track ID)."""

from __future__ import annotations

import logging
from dataclasses import dataclass, field
from typing import TYPE_CHECKING, Any

from django.conf import settings
from django.utils import timezone

from .models import TrackEventType

if TYPE_CHECKING:
    from .models import Camera

logger = logging.getLogger(__name__)

_PERSON_CLASSES = frozenset({"person", "face"})


def _log_mode() -> str:
    return str(getattr(settings, "DETECTION_LOG_MODE", "track")).strip().lower()


def _miss_threshold() -> int:
    try:
        return max(1, int(getattr(settings, "DETECTION_TRACK_MISS_POLLS", 3)))
    except (TypeError, ValueError):
        return 3


def _person_auto_create() -> bool:
    return bool(getattr(settings, "PERSON_QR_AUTO_CREATE", True))


@dataclass
class ActivePersonSession:
    camera_id: int
    person_id: int
    person_qr: str
    class_name: str
    label: str
    global_track_id: int
    byte_track_id: int | None = None
    sighting_id: int | None = None
    miss_polls: int = 0
    last_det: dict[str, Any] = field(default_factory=dict)


# Keyed by (camera_id, person_id) — one session per person per camera.
_active: dict[tuple[int, int], ActivePersonSession] = {}


def _session_key(camera_id: int, person_id: int) -> tuple[int, int]:
    return (int(camera_id), int(person_id))


def is_person_detection(class_name: str) -> bool:
    return (class_name or "").strip().lower() in _PERSON_CLASSES


def _embedding_from_det(det: dict[str, Any]) -> list[float]:
    raw = det.get("face_embedding")
    if not isinstance(raw, list):
        return []
    out: list[float] = []
    for item in raw:
        try:
            out.append(float(item))
        except (TypeError, ValueError):
            return []
    return out if len(out) >= 8 else []


def _byte_track_id(det: dict[str, Any]) -> int | None:
    track_id_raw = det.get("track_id")
    try:
        return int(track_id_raw) if track_id_raw is not None else None
    except (TypeError, ValueError):
        return None


def _enrich_person_det(
    det: dict[str, Any],
    *,
    person,
    track_event: str,
    global_track_id: int,
) -> dict[str, Any]:
    return {
        **det,
        "track_event": track_event,
        "person_qr": person.qr_code_number,
        "person_identity_id": person.pk,
        "global_track_id": global_track_id,
        "local_track_id": global_track_id,
    }


def prepare_detection_events(
    camera: Camera,
    detections: list[dict[str, Any]],
) -> list[dict[str, Any]]:
    """
    Turn raw ML detections into log candidates.

    Person detections resolve to a global PersonIdentity (face Re-ID across cameras).
    Track start/end is per person per camera; global track ID = PersonIdentity PK.
    """
    from .person_tracking_service import (
        close_sighting,
        global_track_id_for,
        open_sighting,
        resolve_or_create_person_for_detection,
        resolve_person_identity,
    )

    mode = _log_mode()
    miss_limit = _miss_threshold()
    auto_anon = _person_auto_create()
    now = timezone.now()

    to_log: list[dict[str, Any]] = []
    seen_person_ids: set[int] = set()
    batch_embeddings: list[tuple[list[float], Any]] = []

    for det in detections or []:
        class_name = str(det.get("class_name") or det.get("label") or "").strip()
        label = str(det.get("label") or class_name or "").strip()
        is_alert = bool(det.get("alert"))

        if is_alert or not is_person_detection(class_name):
            to_log.append({**det, "track_event": TrackEventType.FRAME})
            continue

        embedding = _embedding_from_det(det)
        byte_track_id = _byte_track_id(det)

        person = resolve_person_identity(label, class_name)
        if person is None and auto_anon:
            from .person_tracking_service import _cosine_similarity, _reid_threshold

            matched_batch = None
            if embedding:
                threshold = _reid_threshold()
                for stored_emb, batch_person in batch_embeddings:
                    if _cosine_similarity(embedding, stored_emb) > threshold:
                        matched_batch = batch_person
                        break
            if matched_batch is not None:
                person = matched_batch
            else:
                person = resolve_or_create_person_for_detection(
                    camera,
                    label,
                    class_name,
                    allow_anonymous=True,
                    face_embedding=embedding,
                )
                if person is not None and embedding:
                    batch_embeddings.append((embedding, person))

        if person is None:
            to_log.append({**det, "track_event": TrackEventType.FRAME})
            continue

        global_id = global_track_id_for(person)
        if global_id is None:
            to_log.append({**det, "track_event": TrackEventType.FRAME})
            continue

        seen_person_ids.add(person.pk)
        key = _session_key(camera.pk, person.pk)
        state = _active.get(key)

        if mode != "track":
            to_log.append(
                _enrich_person_det(
                    det,
                    person=person,
                    track_event=TrackEventType.FRAME,
                    global_track_id=global_id,
                )
            )
            continue

        if state is None:
            sighting = open_sighting(
                person,
                camera,
                local_track_id=global_id,
                label=label,
                started_at=now,
            )
            state = ActivePersonSession(
                camera_id=camera.pk,
                person_id=person.pk,
                person_qr=person.qr_code_number,
                class_name=class_name,
                label=label,
                global_track_id=global_id,
                byte_track_id=byte_track_id,
                sighting_id=sighting.pk,
                miss_polls=0,
                last_det=dict(det),
            )
            _active[key] = state
            to_log.append(
                _enrich_person_det(
                    det,
                    person=person,
                    track_event=TrackEventType.STARTED,
                    global_track_id=global_id,
                )
            )
            continue

        state.miss_polls = 0
        state.last_det = dict(det)
        state.label = label
        state.class_name = class_name
        if byte_track_id is not None:
            state.byte_track_id = byte_track_id

    ended_keys: list[tuple[int, int]] = []
    if mode == "track":
        for key, state in list(_active.items()):
            if state.camera_id != camera.pk:
                continue
            if state.person_id in seen_person_ids:
                continue
            state.miss_polls += 1
            if state.miss_polls < miss_limit:
                continue
            ended_keys.append(key)

    for key in ended_keys:
        state = _active.pop(key, None)
        if state is None:
            continue
        if state.sighting_id:
            from .models import PersonSighting

            try:
                sighting = PersonSighting.objects.get(pk=state.sighting_id)
                close_sighting(sighting, ended_at=now)
            except PersonSighting.DoesNotExist:
                pass
        det = state.last_det or {
            "class_name": state.class_name,
            "label": state.label,
            "confidence": 0.0,
            "bbox": [],
            "track_id": state.byte_track_id,
        }
        to_log.append(
            {
                **det,
                "track_event": TrackEventType.ENDED,
                "person_qr": state.person_qr,
                "person_identity_id": state.person_id,
                "global_track_id": state.global_track_id,
                "local_track_id": state.global_track_id,
            }
        )

    return to_log
