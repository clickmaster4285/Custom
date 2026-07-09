"""WMS flow API views: seize, release, QR resolve, overview."""

from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from detentions.models import DepositAccountEntry, DetentionMemo

from .models import ReleaseRecord, SeizureRecord, WmsLifecycleEvent
from .serializers import (
    ReleaseRecordSerializer,
    SeizureRecordSerializer,
    WarehouseStockItemSerializer,
    WmsLifecycleEventSerializer,
)
from .wms_flow_service import (
    get_wms_overview,
    promote_memo_to_seizure,
    release_inventory,
    resolve_qr_code,
)


class PromoteSeizureAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        memo_id = (request.data.get("detention_memo_id") or request.data.get("memo_id") or "").strip()
        deposit_id = (request.data.get("deposit_account_id") or request.data.get("deposit_id") or "").strip() or None
        if not memo_id:
            return Response({"detail": "detention_memo_id is required."}, status=status.HTTP_400_BAD_REQUEST)
        try:
            result = promote_memo_to_seizure(
                memo_id,
                deposit_id=deposit_id,
                source=request.data.get("source") or SeizureRecord.SOURCE_DETENTION,
                performed_by=getattr(request.user, "username", "") or "",
                remarks=str(request.data.get("remarks") or ""),
            )
        except DetentionMemo.DoesNotExist:
            return Response({"detail": "Detention memo not found."}, status=status.HTTP_404_NOT_FOUND)
        except Exception as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        seizure = result["seizure"]
        return Response(
            {
                "seizure": SeizureRecordSerializer(seizure).data,
                "stockItems": WarehouseStockItemSerializer(result["stock_items"], many=True).data,
            },
            status=status.HTTP_201_CREATED,
        )


class ReleaseInventoryAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        data = request.data
        warehouse = str(data.get("warehouse") or "").strip()
        if not warehouse:
            return Response({"detail": "warehouse is required."}, status=status.HTTP_400_BAD_REQUEST)

        released_items = data.get("released_items") or data.get("releasedItems") or []
        has_item_lines = isinstance(released_items, list) and len(released_items) > 0

        qr_code = str(data.get("qr_code") or data.get("qrCodeNumber") or data.get("qrCode") or "").strip()
        if not qr_code and not has_item_lines:
            return Response({"detail": "qr_code or released_items is required."}, status=status.HTTP_400_BAD_REQUEST)

        deposit_id = (data.get("deposit_account_id") or data.get("deposit_id") or "").strip() or None
        memo_id = (data.get("detention_memo_id") or data.get("memo_id") or "").strip() or None

        quantity = data.get("quantity_released") or data.get("quantityReleased") or data.get("quantity") or ""
        if not quantity and not has_item_lines:
            return Response({"detail": "quantity_released or released_items is required."}, status=status.HTTP_400_BAD_REQUEST)
        released_on_behalf_of = str(
            data.get("released_on_behalf_of") or data.get("releasedOnBehalfOf") or ""
        ).strip()
        deputy_name = str(data.get("deputy_name") or data.get("deputyName") or "").strip()
        collector_name = str(data.get("collector_name") or data.get("collectorName") or "").strip()
        release_description = str(
            data.get("release_description") or data.get("releaseDescription") or data.get("description") or ""
        ).strip()

        if not released_on_behalf_of:
            return Response({"detail": "released_on_behalf_of is required."}, status=status.HTTP_400_BAD_REQUEST)
        if not deputy_name:
            return Response({"detail": "deputy_name is required."}, status=status.HTTP_400_BAD_REQUEST)
        if not collector_name:
            return Response({"detail": "collector_name is required."}, status=status.HTTP_400_BAD_REQUEST)
        if not release_description:
            return Response({"detail": "release_description is required."}, status=status.HTTP_400_BAD_REQUEST)

        quantity_value = str(quantity) if quantity else "0"

        try:
            result = release_inventory(
                deposit_id=deposit_id,
                memo_id=memo_id,
                qr_code=qr_code,
                warehouse=warehouse,
                fir_number=str(data.get("fir_number") or data.get("firNo") or ""),
                stack_count=str(data.get("stack_count") or data.get("stackCount") or ""),
                treasury_challan_no=str(data.get("treasury_challan_no") or data.get("treasuryChallanNo") or ""),
                customs_station=str(data.get("customs_station") or data.get("customsStation") or ""),
                amount=str(data.get("amount") or ""),
                bank_treasury_name=str(data.get("bank_treasury_name") or data.get("bankTreasuryName") or ""),
                quantity_released=quantity_value,
                unit=str(data.get("unit") or "PCS"),
                released_on_behalf_of=released_on_behalf_of,
                deputy_name=deputy_name,
                collector_name=collector_name,
                release_description=release_description,
                remarks=str(data.get("remarks") or ""),
                settle_memo=bool(data.get("settle_memo", data.get("settleMemo", True))),
                released_items=released_items if isinstance(released_items, list) else [],
                performed_by=getattr(request.user, "username", "") or "",
            )
        except (DepositAccountEntry.DoesNotExist, DetentionMemo.DoesNotExist):
            return Response({"detail": "Deposit or memo not found."}, status=status.HTTP_404_NOT_FOUND)
        except Exception as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        return Response(
            {
                "release": ReleaseRecordSerializer(result["release"]).data,
                "stockItems": WarehouseStockItemSerializer(result["stock_items"], many=True).data,
            },
            status=status.HTTP_201_CREATED,
        )


class QrResolveAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, code: str):
        result = resolve_qr_code(code)
        if not result:
            return Response({"detail": "QR code not found."}, status=status.HTTP_404_NOT_FOUND)
        return Response(result)


class WmsOverviewAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        memo_id = (request.query_params.get("detention_memo_id") or request.query_params.get("memo_id") or "").strip()
        case_no = (request.query_params.get("case_no") or request.query_params.get("caseNo") or "").strip()
        if not memo_id and not case_no:
            return Response({"detail": "detention_memo_id or case_no is required."}, status=status.HTTP_400_BAD_REQUEST)
        return Response(get_wms_overview(memo_id=memo_id or None, case_no=case_no or None))


class SeizureRecordListAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        qs = SeizureRecord.objects.all().order_by("-seized_at")
        memo_id = (request.query_params.get("detention_memo_id") or "").strip()
        case_no = (request.query_params.get("case_no") or "").strip()
        if memo_id:
            qs = qs.filter(detention_memo_id=memo_id)
        if case_no:
            qs = qs.filter(case_no__icontains=case_no)
        return Response(SeizureRecordSerializer(qs[:200], many=True).data)


class ReleaseRecordListAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        qs = ReleaseRecord.objects.all().order_by("-released_at")
        memo_id = (request.query_params.get("detention_memo_id") or "").strip()
        if memo_id:
            qs = qs.filter(detention_memo_id=memo_id)
        return Response(ReleaseRecordSerializer(qs[:200], many=True).data)


class WmsLifecycleListAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        qs = WmsLifecycleEvent.objects.all().order_by("-created_at")
        memo_id = (request.query_params.get("detention_memo_id") or "").strip()
        qr = (request.query_params.get("qr_code") or "").strip()
        if memo_id:
            qs = qs.filter(detention_memo_id=memo_id)
        if qr:
            qs = qs.filter(qr_code__iexact=qr)
        return Response(WmsLifecycleEventSerializer(qs[:200], many=True).data)
