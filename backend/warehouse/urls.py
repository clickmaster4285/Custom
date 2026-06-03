from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import WarehouseViewSet, SiteZoneViewSet

router = DefaultRouter()
router.register(r"warehouses", WarehouseViewSet, basename="warehouse")
router.register(r"zones", SiteZoneViewSet, basename="site-zone")

urlpatterns = [
    path("", include(router.urls)),
]
