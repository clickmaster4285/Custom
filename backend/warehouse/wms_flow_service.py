"""WMS lifecycle: seize, release, QR resolve, and overview."""

from __future__ import annotations

from decimal import Decimal, InvalidOperation
from typing import Any
from uuid import UUID

from django.db import transaction
from django.db.models import Q, Sum
from django.utils import timezone

from detentions.models import DepositAccountEntry, DetentionMemo, DetentionMemoGoodsLine

from .distribution_service import collect_session_recording_entries
from .models import (
    MemoDistribution,
    ReleaseRecord,
    SeizureRecord,
    WarehouseStockItem,
    WmsLifecycleEvent,
)


def _parse_qty(value: str | Decimal | float | int | None) -> Decimal:
    if value is None:
        return Decimal("0")
    if isinstance(value, Decimal):
        return value
    text = str(value).strip().replace(",", "")
    if not text:
        return Decimal("0")
    try:
        return Decimal(text)
    except InvalidOperation:
        return Decimal("0")


def _log_event(
    event_type: str,
    *,
    detention_memo_id: str | UUID | None = None,
    deposit_account_id: str | UUID | None = None,
    seizure_record_id: str | UUID | None = None,
    release_record_id: str | UUID | None = None,
    distribution_id: str | UUID | None = None,
    stock_item_id: str | UUID | None = None,
    goods_line_id: str | UUID | None = None,
    qr_code: str = "",
    case_no: str = "",
    description: str = "",
    quantity: Decimal | None = None,
    unit: str = "",
    metadata: dict | None = None,
    performed_by: str = "",
) -> WmsLifecycleEvent:
    return WmsLifecycleEvent.objects.create(
        event_type=event_type,
        detention_memo_id=detention_memo_id or None,
        deposit_account_id=deposit_account_id or None,
        seizure_record_id=seizure_record_id or None,
        release_record_id=release_record_id or None,
        distribution_id=distribution_id or None,
        stock_item_id=stock_item_id or None,
        goods_line_id=goods_line_id or None,
        qr_code=(qr_code or "").strip(),
        case_no=(case_no or "").strip(),
        description=description,
        quantity=quantity,
        unit=unit,
        metadata=metadata or {},
        performed_by=performed_by,
    )


def _upsert_stock_from_goods_line(
    memo: DetentionMemo,
    gl: DetentionMemoGoodsLine,
    *,
    status: str = "In Custody",
) -> WarehouseStockItem:
    client_id = f"stock-{memo.case_no or memo.pk}-{gl.client_line_id or gl.pk}"
    qty = _parse_qty(gl.quantity)
    defaults = {
        "detention_memo_id": memo.pk,
        "goods_line_id": gl.pk,
        "case_ref": memo.case_no or "",
        "qr_code": (gl.qr_code_number or "").strip(),
        "description": gl.description or "",
        "pct_code": gl.pct_code or "",
        "quantity": qty,
        "unit": gl.unit or "PCS",
        "godown_warehouse": memo.where_deposited or memo.place_of_detention or "",
        "status": status,
    }
    stock, _ = WarehouseStockItem.objects.update_or_create(
        client_row_id=client_id,
        defaults=defaults,
    )
    return stock


@transaction.atomic
def promote_memo_to_seizure(
    memo_id: str,
    *,
    deposit_id: str | None = None,
    source: str = SeizureRecord.SOURCE_DETENTION,
    performed_by: str = "",
    remarks: str = "",
) -> dict[str, Any]:
    memo = DetentionMemo.objects.prefetch_related("goods_lines").get(pk=memo_id)
    deposit = None
    if deposit_id:
        deposit = DepositAccountEntry.objects.filter(pk=deposit_id).first()

    existing = SeizureRecord.objects.filter(detention_memo_id=memo.pk).first()
    if existing:
        seizure = existing
    else:
        seizure = SeizureRecord.objects.create(
            detention_memo_id=memo.pk,
            deposit_account_id=deposit.pk if deposit else None,
            case_no=memo.case_no or "",
            fir_number=memo.fir_number or "",
            place_of_detention=memo.place_of_detention or "",
            source=source,
            seized_by=performed_by,
            remarks=remarks,
        )

    memo.settlement_status = memo.settlement_status or "Forwarded to seizure"
    memo.disposition_status = "In Warehouse"
    memo.save(update_fields=["settlement_status", "disposition_status", "updated_at"])

    stock_items: list[WarehouseStockItem] = []
    for gl in memo.goods_lines.all():
        stock = _upsert_stock_from_goods_line(memo, gl, status="In Custody")
        stock_items.append(stock)
        _log_event(
            WmsLifecycleEvent.EVENT_SEIZED,
            detention_memo_id=memo.pk,
            deposit_account_id=deposit.pk if deposit else None,
            seizure_record_id=seizure.pk,
            stock_item_id=stock.pk,
            goods_line_id=gl.pk,
            qr_code=gl.qr_code_number or "",
            case_no=memo.case_no or "",
            description=gl.description or "",
            quantity=_parse_qty(gl.quantity),
            unit=gl.unit or "PCS",
            performed_by=performed_by,
            metadata={"source": source},
        )

    if not memo.goods_lines.exists():
        _log_event(
            WmsLifecycleEvent.EVENT_SEIZED,
            detention_memo_id=memo.pk,
            deposit_account_id=deposit.pk if deposit else None,
            seizure_record_id=seizure.pk,
            case_no=memo.case_no or "",
            description="Memo seized (no goods lines)",
            performed_by=performed_by,
            metadata={"source": source},
        )

    return {
        "seizure": seizure,
        "memo": memo,
        "stock_items": stock_items,
    }


def _normalize_released_items(raw_items: list[dict] | None) -> list[dict[str, Any]]:
    normalized: list[dict[str, Any]] = []
    for raw in raw_items or []:
        if not isinstance(raw, dict):
            continue
        qty = _parse_qty(
            raw.get("quantity")
            or raw.get("quantityReleased")
            or raw.get("quantity_released")
            or 0
        )
        if qty <= 0:
            continue
        normalized.append(
            {
                "stock_item_id": str(raw.get("stock_item_id") or raw.get("stockItemId") or "").strip() or None,
                "qr_code": str(
                    raw.get("qr_code") or raw.get("qrCode") or raw.get("qrCodeNumber") or ""
                ).strip(),
                "quantity": qty,
                "unit": str(raw.get("unit") or "PCS").strip() or "PCS",
                "description": str(raw.get("description") or "").strip(),
            }
        )
    return normalized


def _memo_has_remaining_custody(memo_id_val) -> bool:
    remaining = WarehouseStockItem.objects.filter(
        detention_memo_id=memo_id_val,
        status__iexact="In Custody",
    ).aggregate(total=Sum("quantity"))["total"] or Decimal("0")
    return remaining > 0


@transaction.atomic
def release_inventory(
    *,
    deposit_id: str | None = None,
    memo_id: str | None = None,
    qr_code: str,
    warehouse: str,
    fir_number: str = "",
    stack_count: str = "",
    treasury_challan_no: str = "",
    customs_station: str = "",
    amount: str = "",
    bank_treasury_name: str = "",
    quantity_released: str | Decimal = "",
    unit: str = "PCS",
    released_on_behalf_of: str = "",
    deputy_name: str = "",
    collector_name: str = "",
    release_description: str = "",
    remarks: str = "",
    settle_memo: bool = True,
    released_items: list[dict] | None = None,
    performed_by: str = "",
) -> dict[str, Any]:
    if not released_on_behalf_of.strip():
        raise ValueError("released_on_behalf_of is required.")
    if not deputy_name.strip():
        raise ValueError("deputy_name is required.")
    if not collector_name.strip():
        raise ValueError("collector_name is required.")
    if not release_description.strip():
        raise ValueError("release_description is required.")

    items_to_release = _normalize_released_items(released_items)
    use_multi = len(items_to_release) > 0

    if use_multi:
        qty = sum((item["quantity"] for item in items_to_release), Decimal("0"))
        qr_codes = [item["qr_code"] for item in items_to_release if item["qr_code"]]
        qr_code_val = (qr_code.strip() or ", ".join(qr_codes))[:160]
        unit_val = "MIXED"
        stored_items = [
            {
                "stockItemId": item["stock_item_id"],
                "qrCode": item["qr_code"],
                "quantity": str(item["quantity"]),
                "unit": item["unit"],
                "description": item["description"],
            }
            for item in items_to_release
        ]
    else:
        qty = _parse_qty(quantity_released)
        if qty <= 0:
            raise ValueError("quantity_released must be greater than zero.")
        qr_code_val = qr_code.strip()
        unit_val = (unit or "PCS").strip() or "PCS"
        stored_items = released_items or []

    deposit = None
    memo = None
    if deposit_id:
        deposit = DepositAccountEntry.objects.get(pk=deposit_id)
        if deposit.detention_memo_id:
            memo = DetentionMemo.objects.filter(pk=deposit.detention_memo_id).first()
    elif memo_id:
        memo = DetentionMemo.objects.get(pk=memo_id)

    case_no = (memo.case_no if memo else "") or (deposit.case_seizure_ref if deposit else "")
    memo_id_val = memo.pk if memo else (deposit.detention_memo_id if deposit else None)

    release = ReleaseRecord.objects.create(
        detention_memo_id=memo_id_val,
        deposit_account_id=deposit.pk if deposit else None,
        case_no=case_no,
        qr_code=qr_code_val,
        warehouse=warehouse.strip(),
        fir_number=fir_number,
        stack_count=stack_count,
        treasury_challan_no=treasury_challan_no,
        customs_station=customs_station,
        amount=amount,
        bank_treasury_name=bank_treasury_name,
        quantity_released=qty,
        unit=unit_val,
        released_on_behalf_of=released_on_behalf_of.strip(),
        deputy_name=deputy_name.strip(),
        collector_name=collector_name.strip(),
        release_description=release_description.strip(),
        released_items=stored_items,
        released_by=performed_by,
        settle_memo=settle_memo,
        remarks=remarks,
    )

    release_summary = (
        f"Released {qty} {unit_val} on behalf of {released_on_behalf_of.strip()}; "
        f"Deputy: {deputy_name.strip()}; Collector: {collector_name.strip()}; "
        f"{release_description.strip()}"
    )

    if deposit:
        deposit.status = "Released"
        parts = [
            deposit.remarks or "",
            remarks,
            release_summary,
            f"Released {release.released_at:%Y-%m-%d %H:%M} — QR {qr_code_val}",
        ]
        deposit.remarks = "\n".join(p for p in parts if p.strip())
        deposit.save(update_fields=["status", "remarks", "updated_at"])

    released_stock: list[WarehouseStockItem] = []
    release_meta = {
        "releasedOnBehalfOf": released_on_behalf_of.strip(),
        "deputyName": deputy_name.strip(),
        "collectorName": collector_name.strip(),
        "releaseDescription": release_description.strip(),
        "warehouse": warehouse.strip(),
    }

    if use_multi:
        for item in items_to_release:
            stock: WarehouseStockItem | None = None
            if item["stock_item_id"]:
                stock = WarehouseStockItem.objects.filter(
                    pk=item["stock_item_id"],
                    status__iexact="In Custody",
                ).first()
            if not stock and item["qr_code"]:
                stock_qs = WarehouseStockItem.objects.filter(
                    status__iexact="In Custody",
                    qr_code__iexact=item["qr_code"],
                )
                if memo_id_val:
                    stock_qs = stock_qs.filter(detention_memo_id=memo_id_val)
                stock = stock_qs.first()
            if not stock:
                label = item["qr_code"] or item["stock_item_id"] or "item"
                raise ValueError(f"No in-custody stock found for {label}.")

            release_qty = item["quantity"]
            item_unit = item["unit"] or stock.unit or "PCS"
            if release_qty > stock.quantity:
                raise ValueError(
                    f"Release quantity ({release_qty}) exceeds available ({stock.quantity}) for {stock.qr_code}."
                )

            if release_qty >= stock.quantity:
                stock.status = "Released"
                stock.quantity = Decimal("0")
                stock.save(update_fields=["status", "quantity", "updated_at"])
            else:
                stock.quantity = stock.quantity - release_qty
                stock.save(update_fields=["quantity", "updated_at"])

            released_stock.append(stock)
            _log_event(
                WmsLifecycleEvent.EVENT_RELEASED,
                detention_memo_id=memo_id_val,
                deposit_account_id=deposit.pk if deposit else None,
                release_record_id=release.pk,
                stock_item_id=stock.pk,
                goods_line_id=stock.goods_line_id,
                qr_code=stock.qr_code,
                case_no=case_no,
                description=item["description"] or release_description.strip() or stock.description,
                quantity=release_qty,
                unit=item_unit,
                metadata={**release_meta, "lineItem": True},
                performed_by=performed_by,
            )
    else:
        qr_lower = qr_code_val.lower()
        stock_qs = WarehouseStockItem.objects.filter(status__iexact="In Custody")
        if memo_id_val:
            stock_qs = stock_qs.filter(detention_memo_id=memo_id_val)
        if qr_lower:
            stock_qs = stock_qs.filter(qr_code__iexact=qr_code_val)
        elif case_no:
            stock_qs = stock_qs.filter(case_ref__iexact=case_no)

        matched_stock = list(stock_qs)
        if matched_stock:
            available = sum((s.quantity for s in matched_stock), Decimal("0"))
            if qty > available:
                raise ValueError(
                    f"Release quantity ({qty}) exceeds available in-custody stock ({available})."
                )

        remaining_to_release = qty
        for stock in matched_stock:
            if remaining_to_release <= 0:
                break
            release_qty = min(remaining_to_release, stock.quantity)
            remaining_to_release -= release_qty

            if release_qty >= stock.quantity:
                stock.status = "Released"
                stock.quantity = Decimal("0")
                stock.save(update_fields=["status", "quantity", "updated_at"])
            else:
                stock.quantity = stock.quantity - release_qty
                stock.save(update_fields=["quantity", "updated_at"])

            released_stock.append(stock)
            _log_event(
                WmsLifecycleEvent.EVENT_RELEASED,
                detention_memo_id=memo_id_val,
                deposit_account_id=deposit.pk if deposit else None,
                release_record_id=release.pk,
                stock_item_id=stock.pk,
                goods_line_id=stock.goods_line_id,
                qr_code=stock.qr_code,
                case_no=case_no,
                description=release_description.strip() or stock.description,
                quantity=release_qty,
                unit=unit_val,
                metadata=release_meta,
                performed_by=performed_by,
            )

    if memo and settle_memo and memo_id_val and not _memo_has_remaining_custody(memo_id_val):
        memo.settlement_status = "Fully Settled"
        memo.disposition_status = "Released"
        memo.save(update_fields=["settlement_status", "disposition_status", "updated_at"])

    if not released_stock:
        _log_event(
            WmsLifecycleEvent.EVENT_RELEASED,
            detention_memo_id=memo_id_val,
            deposit_account_id=deposit.pk if deposit else None,
            release_record_id=release.pk,
            qr_code=qr_code_val,
            case_no=case_no,
            description=release_description.strip() or "Release recorded (no matching stock rows)",
            quantity=qty,
            unit=unit_val,
            metadata=release_meta,
            performed_by=performed_by,
        )

    return {"release": release, "memo": memo, "deposit": deposit, "stock_items": released_stock}


def resolve_qr_code(code: str) -> dict[str, Any] | None:
    raw = (code or "").strip()
    if not raw:
        return None

    if "goodsQr=" in raw:
        from urllib.parse import parse_qs, urlparse

        try:
            qs = parse_qs(urlparse(raw).query)
            goods_vals = qs.get("goodsQr") or []
            if goods_vals:
                raw = goods_vals[0]
        except Exception:
            pass

    result: dict[str, Any] = {"qr_code": raw, "type": "unknown"}

    gl = DetentionMemoGoodsLine.objects.filter(qr_code_number__iexact=raw).select_related("memo").first()
    if gl:
        memo = gl.memo
        stock = WarehouseStockItem.objects.filter(
            Q(goods_line_id=gl.pk) | Q(qr_code__iexact=raw)
        ).first()
        result.update(
            {
                "type": "goods_line",
                "memo": _memo_summary(memo),
                "goods_line": _goods_line_summary(gl),
                "stock": _stock_summary(stock) if stock else None,
            }
        )
        return result

    memo = DetentionMemo.objects.filter(
        Q(memo_qr_code_number__iexact=raw) | Q(case_no__iexact=raw)
    ).first()
    if memo:
        result.update({"type": "memo", "memo": _memo_summary(memo)})
        return result

    stock = WarehouseStockItem.objects.filter(qr_code__iexact=raw).first()
    if stock:
        memo = None
        if stock.detention_memo_id:
            memo = DetentionMemo.objects.filter(pk=stock.detention_memo_id).first()
        result.update(
            {
                "type": "stock",
                "stock": _stock_summary(stock),
                "memo": _memo_summary(memo) if memo else None,
            }
        )
        return result

    deposit = DepositAccountEntry.objects.filter(case_seizure_ref__iexact=raw).first()
    if deposit:
        result.update({"type": "deposit", "deposit": _deposit_summary(deposit)})
        return result

    return None


def _memo_summary(memo: DetentionMemo | None) -> dict | None:
    if not memo:
        return None
    return {
        "id": str(memo.pk),
        "caseNo": memo.case_no,
        "firNumber": memo.fir_number,
        "settlementStatus": memo.settlement_status,
        "dispositionStatus": memo.disposition_status,
        "placeOfDetention": memo.place_of_detention,
    }


def _goods_line_summary(gl: DetentionMemoGoodsLine) -> dict:
    return {
        "id": str(gl.pk),
        "clientLineId": gl.client_line_id,
        "qrCodeNumber": gl.qr_code_number,
        "description": gl.description,
        "quantity": str(gl.quantity),
        "unit": gl.unit,
        "condition": gl.condition,
    }


def _stock_summary(stock: WarehouseStockItem) -> dict:
    return {
        "id": str(stock.pk),
        "qrCode": stock.qr_code,
        "caseRef": stock.case_ref,
        "description": stock.description,
        "quantity": str(stock.quantity),
        "unit": stock.unit,
        "status": stock.status,
        "godownWarehouse": stock.godown_warehouse,
    }


def _deposit_summary(deposit: DepositAccountEntry) -> dict:
    return {
        "id": str(deposit.pk),
        "caseSeizureRef": deposit.case_seizure_ref,
        "status": deposit.status,
        "depositType": deposit.deposit_type,
        "detentionMemoId": str(deposit.detention_memo_id) if deposit.detention_memo_id else None,
    }


def get_wms_overview(memo_id: str | None = None, case_no: str | None = None) -> dict[str, Any]:
    memo = None
    if memo_id:
        memo = DetentionMemo.objects.prefetch_related("goods_lines").filter(pk=memo_id).first()
    elif case_no:
        memo = DetentionMemo.objects.prefetch_related("goods_lines").filter(case_no__iexact=case_no.strip()).first()

    if not memo:
        return {"found": False}

    memo_uuid = memo.pk
    goods_lines = list(memo.goods_lines.all())
    total_goods_qty = sum(_parse_qty(g.quantity) for g in goods_lines)

    deposits = list(DepositAccountEntry.objects.filter(detention_memo_id=memo_uuid))
    seizures = list(SeizureRecord.objects.filter(detention_memo_id=memo_uuid))
    releases = list(ReleaseRecord.objects.filter(detention_memo_id=memo_uuid))
    stock_items = list(WarehouseStockItem.objects.filter(detention_memo_id=memo_uuid))
    distributions = list(
        MemoDistribution.objects.filter(detention_memo_id=memo_uuid, status=MemoDistribution.STATUS_COMPLETED)
    )
    events = list(WmsLifecycleEvent.objects.filter(detention_memo_id=memo_uuid)[:100])

    in_custody = sum(1 for s in stock_items if (s.status or "").lower() in ("in custody", "seized", "detained"))
    released_count = sum(1 for s in stock_items if (s.status or "").lower() == "released")
    destructed_count = sum(1 for s in stock_items if (s.status or "").lower() in ("destructed", "disposed"))
    released_qty = sum(_parse_qty(s.quantity) for s in stock_items if (s.status or "").lower() == "released")
    in_inventory_qty = sum(
        _parse_qty(s.quantity) for s in stock_items if (s.status or "").lower() in ("in custody", "seized", "detained")
    )
    destructed_qty = sum(
        _parse_qty(s.quantity) for s in stock_items if (s.status or "").lower() in ("destructed", "disposed")
    )

    destruction_details = []
    for d in distributions:
        videos = collect_session_recording_entries(d, repair=False)
        destruction_details.append(
            {
                "id": str(d.pk),
                "caseNo": d.detention_case_no,
                "outcome": d.outcome,
                "status": d.status,
                "performedBy": d.performed_by,
                "locationCode": d.location_code,
                "smokeFireDetected": d.smoke_fire_detected,
                "completedAt": d.completed_at.isoformat() if d.completed_at else None,
                "selectedItems": d.selected_items or [],
                "inventoryDeductions": d.inventory_deductions or [],
                "videos": videos,
                "videoUrl": d.video.url if d.video else None,
            }
        )

    return {
        "found": True,
        "memo": _memo_summary(memo),
        "goodsLines": [_goods_line_summary(g) for g in goods_lines],
        "summary": {
            "totalGoodsLines": len(goods_lines),
            "totalGoodsQuantity": str(total_goods_qty),
            "deposited": len(deposits) > 0,
            "depositCount": len(deposits),
            "seized": len(seizures) > 0,
            "seizureCount": len(seizures),
            "released": len(releases) > 0,
            "releaseCount": len(releases),
            "inInventoryCount": in_custody,
            "inInventoryQuantity": str(in_inventory_qty),
            "releasedQuantity": str(released_qty),
            "destructedCount": destructed_count,
            "destructedQuantity": str(destructed_qty),
            "destructionSessionCount": len(distributions),
        },
        "deposits": [_deposit_summary(d) for d in deposits],
        "seizures": [
            {
                "id": str(s.pk),
                "caseNo": s.case_no,
                "seizedAt": s.seized_at.isoformat(),
                "seizedBy": s.seized_by,
                "source": s.source,
            }
            for s in seizures
        ],
        "releases": [
            {
                "id": str(r.pk),
                "qrCode": r.qr_code,
                "warehouse": r.warehouse,
                "quantityReleased": str(r.quantity_released),
                "unit": r.unit,
                "releasedOnBehalfOf": r.released_on_behalf_of,
                "deputyName": r.deputy_name,
                "collectorName": r.collector_name,
                "releaseDescription": r.release_description,
                "releasedAt": r.released_at.isoformat(),
                "releasedBy": r.released_by,
            }
            for r in releases
        ],
        "stockItems": [_stock_summary(s) for s in stock_items],
        "destructions": destruction_details,
        "timeline": [
            {
                "id": str(e.pk),
                "eventType": e.event_type,
                "qrCode": e.qr_code,
                "caseNo": e.case_no,
                "description": e.description,
                "quantity": str(e.quantity) if e.quantity is not None else None,
                "unit": e.unit,
                "performedBy": e.performed_by,
                "createdAt": e.created_at.isoformat(),
                "metadata": e.metadata,
            }
            for e in events
        ],
    }


def log_memo_created(memo: DetentionMemo, performed_by: str = "") -> None:
    for gl in memo.goods_lines.all():
        _log_event(
            WmsLifecycleEvent.EVENT_MEMO_CREATED,
            detention_memo_id=memo.pk,
            goods_line_id=gl.pk,
            qr_code=gl.qr_code_number or "",
            case_no=memo.case_no or "",
            description=gl.description or "",
            quantity=_parse_qty(gl.quantity),
            unit=gl.unit or "PCS",
            performed_by=performed_by or memo.created_by,
        )
    if not memo.goods_lines.exists():
        _log_event(
            WmsLifecycleEvent.EVENT_MEMO_CREATED,
            detention_memo_id=memo.pk,
            case_no=memo.case_no or "",
            description="Detention memo created",
            performed_by=performed_by or memo.created_by,
        )


def log_deposited(deposit: DepositAccountEntry, performed_by: str = "") -> None:
    _log_event(
        WmsLifecycleEvent.EVENT_DEPOSITED,
        detention_memo_id=deposit.detention_memo_id,
        deposit_account_id=deposit.pk,
        case_no=deposit.case_seizure_ref or "",
        description=f"Deposit entry ({deposit.deposit_type})",
        performed_by=performed_by,
        metadata={"treasuryChallanNo": deposit.treasury_challan_no, "status": deposit.status},
    )


def log_destruction_complete(
    session,
    memo: DetentionMemo,
    selected_items: list[dict],
    performed_by: str = "",
) -> None:
    for item in selected_items:
        _log_event(
            WmsLifecycleEvent.EVENT_DESTRUCTED,
            detention_memo_id=memo.pk,
            distribution_id=session.pk,
            goods_line_id=item.get("goods_line_id"),
            qr_code=str(item.get("qr_code") or ""),
            case_no=memo.case_no or session.detention_case_no or "",
            description=str(item.get("description") or "Goods destructed"),
            quantity=_parse_qty(item.get("quantity")),
            unit=str(item.get("unit") or "PCS"),
            performed_by=performed_by or session.performed_by,
            metadata={
                "outcome": session.outcome,
                "locationCode": session.location_code,
                "completedAt": session.completed_at.isoformat() if session.completed_at else None,
                "videoCount": len(session.camera_videos or []),
            },
        )
