"""Person QR (PQR) identities and cross-camera sighting helpers."""

from __future__ import annotations

import logging
import uuid
from typing import TYPE_CHECKING, Any

from django.conf import settings
from django.db.models import Q
from django.utils import timezone

from .detection_utils import resolve_staff_identity
from .models import DetectionEvent, PersonIdentity, PersonSighting, PersonType, TrackEventType

if TYPE_CHECKING:
    from users.models import Staff

    from .models import Camera

logger = logging.getLogger(__name__)

_GENERIC_LABELS = frozenset({"", "unknown", "person", "face"})


def _reid_threshold() -> float:
    try:
        return float(getattr(settings, "PERSON_FACE_MATCH_THRESHOLD", 0.38))
    except (TypeError, ValueError):
        return 0.38


def _cosine_similarity(a: list[float], b: list[float]) -> float:
    if len(a) < 8 or len(b) < 8:
        return 0.0
    try:
        import numpy as np

        va = np.asarray(a, dtype=np.float32).reshape(-1)
        vb = np.asarray(b, dtype=np.float32).reshape(-1)
        n = min(len(va), len(vb))
        va = va[:n]
        vb = vb[:n]
        denom = float(np.linalg.norm(va) * np.linalg.norm(vb))
        if denom <= 1e-8:
            return 0.0
        return float(np.dot(va, vb) / denom)
    except Exception:
        return 0.0


def _normalize_embedding(raw: Any) -> list[float]:
    if not isinstance(raw, list) or len(raw) < 8:
        return []
    out: list[float] = []
    for item in raw:
        try:
            out.append(float(item))
        except (TypeError, ValueError):
            return []
    return out


def _is_recognized_label(label: str) -> bool:
    return (label or "").strip().lower() not in _GENERIC_LABELS


def generate_person_qr(person_type: str, entity_id: int | None = None) -> str:
    if person_type == PersonType.STAFF and entity_id is not None:
        return f"PQR-STF-{int(entity_id):05d}"
    if person_type == PersonType.VISITOR and entity_id is not None:
        return f"PQR-VIS-{int(entity_id):05d}"
    return f"PQR-UNK-{uuid.uuid4().hex[:6]}"


def _unique_qr(candidate: str) -> str:
    if not PersonIdentity.objects.filter(qr_code_number=candidate).exists():
        return candidate
    return generate_person_qr(PersonType.ANONYMOUS)


def get_or_create_staff_person(staff: Staff) -> PersonIdentity:
    existing = PersonIdentity.objects.filter(staff=staff).order_by("-last_seen_at").first()
    if existing:
        return existing
    qr = _unique_qr(generate_person_qr(PersonType.STAFF, staff.pk))
    return PersonIdentity.objects.create(
        qr_code_number=qr,
        person_type=PersonType.STAFF,
        staff=staff,
        display_name=(staff.full_name or "").strip()[:200],
    )


def get_or_create_visitor_person(visitor) -> PersonIdentity:
    existing = PersonIdentity.objects.filter(visitor=visitor).order_by("-last_seen_at").first()
    if existing:
        return existing
    qr = _unique_qr(generate_person_qr(PersonType.VISITOR, visitor.pk))
    return PersonIdentity.objects.create(
        qr_code_number=qr,
        person_type=PersonType.VISITOR,
        visitor=visitor,
        display_name=(visitor.full_name or "").strip()[:200],
    )


def _match_visitor_by_label(label: str):
    from visitors.models import Visitor

    lbl = (label or "").strip()
    if not lbl:
        return None
    return (
        Visitor.objects.filter(
            Q(full_name__iexact=lbl) | Q(qr_code_id__iexact=lbl)
        )
        .order_by("-updated_at")
        .first()
    )


def resolve_person_identity(label: str, class_name: str) -> PersonIdentity | None:
    """Map a detection label to a global PersonIdentity (staff, visitor, or anonymous)."""
    cls = (class_name or "").strip().lower()
    if cls not in ("person", "face"):
        return None

    employee_name, personal_number = resolve_staff_identity(label, class_name)
    if employee_name:
        from users.models import Staff

        staff = (
            Staff.objects.filter(
                Q(full_name__iexact=employee_name)
                | Q(personal_number__iexact=personal_number)
                | Q(face_identity_label__iexact=label)
            )
            .first()
        )
        if staff:
            person = get_or_create_staff_person(staff)
            person.display_name = employee_name[:200]
            person.last_seen_at = timezone.now()
            person.save(update_fields=["display_name", "last_seen_at"])
            return person

    if _is_recognized_label(label):
        visitor = _match_visitor_by_label(label)
        if visitor:
            person = get_or_create_visitor_person(visitor)
            person.last_seen_at = timezone.now()
            person.save(update_fields=["last_seen_at"])
            return person

    return None


def match_anonymous_by_embedding(embedding: list[float]) -> PersonIdentity | None:
    """Find an existing unknown person seen on any camera (face Re-ID)."""
    vector = _normalize_embedding(embedding)
    if not vector:
        return None

    threshold = _reid_threshold()
    best: PersonIdentity | None = None
    best_score = threshold

    qs = (
        PersonIdentity.objects.filter(person_type=PersonType.ANONYMOUS)
        .exclude(face_embedding=[])
        .order_by("-last_seen_at")[:500]
    )
    for person in qs:
        stored = _normalize_embedding(person.face_embedding)
        if not stored:
            continue
        score = _cosine_similarity(vector, stored)
        if score > best_score:
            best_score = score
            best = person

    return best


def _update_person_embedding(person: PersonIdentity, embedding: list[float]) -> None:
    vector = _normalize_embedding(embedding)
    if not vector:
        return
    stored = _normalize_embedding(person.face_embedding)
    if not stored:
        person.face_embedding = vector
        person.save(update_fields=["face_embedding"])
        return
    try:
        import numpy as np

        merged = (np.asarray(stored, dtype=np.float32) + np.asarray(vector, dtype=np.float32)) / 2.0
        person.face_embedding = [float(v) for v in merged.reshape(-1)]
        person.save(update_fields=["face_embedding"])
    except Exception:
        person.face_embedding = vector
        person.save(update_fields=["face_embedding"])


def create_anonymous_person(label: str = "", *, face_embedding: list[float] | None = None) -> PersonIdentity:
    display = (label or "").strip()
    if display.lower() in _GENERIC_LABELS:
        display = "Unknown person"
    qr = _unique_qr(generate_person_qr(PersonType.ANONYMOUS))
    vector = _normalize_embedding(face_embedding or [])
    return PersonIdentity.objects.create(
        qr_code_number=qr,
        person_type=PersonType.ANONYMOUS,
        display_name=display[:200],
        face_embedding=vector,
    )


def global_track_id_for(person: PersonIdentity | None) -> int | None:
    """Stable person track ID — same across all cameras (PersonIdentity PK)."""
    if person is None:
        return None
    return int(person.pk)


def resolve_or_create_person_for_detection(
    camera: Camera,
    label: str,
    class_name: str,
    *,
    allow_anonymous: bool = True,
    face_embedding: list[float] | None = None,
) -> PersonIdentity | None:
    known = resolve_person_identity(label, class_name)
    if known:
        _update_person_embedding(known, face_embedding or [])
        return known
    if not allow_anonymous:
        return None

    vector = _normalize_embedding(face_embedding or [])
    if vector:
        matched = match_anonymous_by_embedding(vector)
        if matched is not None:
            _update_person_embedding(matched, vector)
            matched.last_seen_at = timezone.now()
            matched.save(update_fields=["last_seen_at"])
            return matched

    return create_anonymous_person(label, face_embedding=vector)


def open_sighting(
    person: PersonIdentity,
    camera: Camera,
    *,
    local_track_id: int | None,
    label: str,
    started_at=None,
) -> PersonSighting:
    when = started_at or timezone.now()
    site_code = ""
    if camera.nvr_id:
        site_code = camera.nvr.site.code
    sighting = PersonSighting.objects.create(
        person=person,
        camera=camera,
        local_track_id=local_track_id,
        started_at=when,
        last_label=(label or "")[:120],
        site_code=site_code,
        zone=(camera.zone or "")[:64],
    )
    person.last_seen_at = when
    person.save(update_fields=["last_seen_at"])
    return sighting


def close_sighting(sighting: PersonSighting, *, ended_at=None) -> None:
    when = ended_at or timezone.now()
    if sighting.ended_at:
        return
    sighting.ended_at = when
    sighting.save(update_fields=["ended_at"])
    sighting.person.last_seen_at = when
    sighting.person.save(update_fields=["last_seen_at"])


def _event_clip_url(event: DetectionEvent | None) -> str:
    if event is None or not event.clip:
        return ""
    return event.clip.url


def _sighting_detection_query(person: PersonIdentity, sighting: PersonSighting):
    qs = DetectionEvent.objects.filter(camera_id=sighting.camera_id).filter(
        Q(person_qr__iexact=person.qr_code_number) | Q(person_identity_id=person.pk)
    )
    if sighting.local_track_id is not None:
        qs = qs.filter(local_track_id=sighting.local_track_id)
    qs = qs.filter(created_at__gte=sighting.started_at)
    if sighting.ended_at:
        qs = qs.filter(created_at__lte=sighting.ended_at)
    return qs


def _snapshot_for_sighting(person: PersonIdentity, sighting: PersonSighting) -> dict[str, Any]:
    qs = _sighting_detection_query(person, sighting).exclude(clip="").order_by("created_at")
    started = qs.filter(track_event=TrackEventType.STARTED).first()
    primary = started or qs.first()
    if primary is None:
        fallback = (
            DetectionEvent.objects.filter(camera_id=sighting.camera_id)
            .filter(Q(person_qr__iexact=person.qr_code_number) | Q(person_identity_id=person.pk))
            .exclude(clip="")
            .order_by("-created_at")
            .first()
        )
        primary = fallback

    snapshot_urls: list[str] = []
    seen: set[str] = set()
    for event in qs[:6]:
        url = _event_clip_url(event)
        if url and url not in seen:
            seen.add(url)
            snapshot_urls.append(url)

    return {
        "snapshot_url": _event_clip_url(primary),
        "clip_status": primary.clip_status if primary else "",
        "snapshot_urls": snapshot_urls,
    }


def _latest_person_snapshot(person: PersonIdentity) -> str:
    event = (
        DetectionEvent.objects.filter(
            Q(person_qr__iexact=person.qr_code_number) | Q(person_identity_id=person.pk)
        )
        .exclude(clip="")
        .order_by("-created_at")
        .first()
    )
    return _event_clip_url(event)


def person_journey(qr_code_number: str) -> dict[str, Any] | None:
    person = (
        PersonIdentity.objects.filter(qr_code_number__iexact=qr_code_number.strip())
        .select_related("staff", "visitor")
        .first()
    )
    if person is None:
        return None

    sightings = (
        PersonSighting.objects.filter(person=person)
        .select_related("camera", "camera__nvr", "camera__nvr__site")
        .order_by("started_at")
    )
    path = []
    for s in sightings:
        snaps = _snapshot_for_sighting(person, s)
        path.append(
            {
                "camera_id": s.camera_id,
                "camera_code": s.camera.code,
                "camera_name": s.camera.name,
                "site_code": s.site_code or (s.camera.nvr.site.code if s.camera.nvr_id else ""),
                "zone": s.zone,
                "local_track_id": s.local_track_id,
                "global_track_id": person.pk,
                "started_at": s.started_at.isoformat(),
                "ended_at": s.ended_at.isoformat() if s.ended_at else None,
                "label": s.last_label,
                "snapshot_url": snaps["snapshot_url"],
                "clip_status": snaps["clip_status"],
                "snapshot_urls": snaps["snapshot_urls"],
            }
        )

    return {
        "qr_code_number": person.qr_code_number,
        "person_type": person.person_type,
        "display_name": person.display_name,
        "staff_id": person.staff_id,
        "visitor_id": person.visitor_id,
        "first_seen_at": person.first_seen_at.isoformat(),
        "last_seen_at": person.last_seen_at.isoformat(),
        "sightings_count": len(path),
        "snapshot_url": _latest_person_snapshot(person),
        "global_track_id": person.pk,
        "path": path,
    }
