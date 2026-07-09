from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .distribution_views import (
    DestructionAlertAcknowledgeAPIView,
    DestructionAlertListAPIView,
    FireSmokeLogListAPIView,
    MemoDistributionCompleteAPIView,
    MemoDistributionDetailAPIView,
    MemoDistributionDetectionAPIView,
    MemoDistributionListAPIView,
    MemoDistributionStartAPIView,
    SyncWarehouseStockAPIView,
    WarehouseStockListAPIView,
)
from .views import SiteZoneViewSet, WarehouseViewSet
from .wms_flow_views import (
    PromoteSeizureAPIView,
    QrResolveAPIView,
    ReleaseInventoryAPIView,
    ReleaseRecordListAPIView,
    SeizureRecordListAPIView,
    WmsLifecycleListAPIView,
    WmsOverviewAPIView,
)

router = DefaultRouter()
router.register(r"warehouses", WarehouseViewSet, basename="warehouse")
router.register(r"zones", SiteZoneViewSet, basename="site-zone")

urlpatterns = [
    path("warehouse/stock/sync/", SyncWarehouseStockAPIView.as_view(), name="warehouse-stock-sync"),
    path("warehouse/stock/", WarehouseStockListAPIView.as_view(), name="warehouse-stock-list"),
    path("warehouse/distribution/", MemoDistributionListAPIView.as_view(), name="memo-distribution-list"),
    path(
        "warehouse/distribution/start/",
        MemoDistributionStartAPIView.as_view(),
        name="memo-distribution-start",
    ),
    path(
        "warehouse/distribution/<uuid:session_id>/",
        MemoDistributionDetailAPIView.as_view(),
        name="memo-distribution-detail",
    ),
    path(
        "warehouse/distribution/<uuid:session_id>/complete/",
        MemoDistributionCompleteAPIView.as_view(),
        name="memo-distribution-complete",
    ),
    path(
        "warehouse/distribution/<uuid:session_id>/detection/",
        MemoDistributionDetectionAPIView.as_view(),
        name="memo-distribution-detection",
    ),
    path("warehouse/destruction-alerts/", DestructionAlertListAPIView.as_view(), name="destruction-alerts"),
    path("warehouse/fire-smoke-logs/", FireSmokeLogListAPIView.as_view(), name="fire-smoke-logs"),
    path(
        "warehouse/destruction-alerts/<uuid:alert_id>/acknowledge/",
        DestructionAlertAcknowledgeAPIView.as_view(),
        name="destruction-alert-acknowledge",
    ),
    path("warehouse/seizure/promote/", PromoteSeizureAPIView.as_view(), name="wms-seizure-promote"),
    path("warehouse/release/", ReleaseInventoryAPIView.as_view(), name="wms-release"),
    path("warehouse/qr/<str:code>/resolve/", QrResolveAPIView.as_view(), name="wms-qr-resolve"),
    path("warehouse/overview/", WmsOverviewAPIView.as_view(), name="wms-overview"),
    path("warehouse/seizures/", SeizureRecordListAPIView.as_view(), name="wms-seizures-list"),
    path("warehouse/releases/", ReleaseRecordListAPIView.as_view(), name="wms-releases-list"),
    path("warehouse/lifecycle/", WmsLifecycleListAPIView.as_view(), name="wms-lifecycle-list"),
    path("", include(router.urls)),
]
