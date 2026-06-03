import uuid
from django.db import models
from django.utils import timezone


class Warehouse(models.Model):
    """Master warehouse record."""
    STATUS_CHOICES = [
        ("ACTIVE", "Active"),
        ("MAINTENANCE", "Maintenance"),
        ("INACTIVE", "Inactive"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    location_code = models.CharField(
        max_length=50,
        help_text="e.g., PESHAWAR, DI_KHAN (should match User.location)"
    )
    code = models.CharField(
        max_length=50,
        unique=True,
        help_text="e.g., WH-DIK-RETTA"
    )
    name = models.CharField(max_length=255, help_text="e.g., New Warehouse, Retta Kulachi")
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="ACTIVE"
    )
    description = models.TextField(blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["location_code", "code"]
        verbose_name_plural = "Warehouses"

    def __str__(self):
        return f"{self.code} - {self.name}"


class SiteZone(models.Model):
    """Master zone record (one of the 7 canonical zones per warehouse)."""
    CATEGORY_CHOICES = [
        ("receiving", "Receiving"),
        ("detained", "Detained Articles"),
        ("seizure", "Seizure"),
        ("examination", "Examination"),
        ("stock", "General Stock"),
        ("disposal", "Disposal"),
        ("release", "Release"),
    ]
    SECURITY_LEVEL_CHOICES = [
        ("standard", "Standard"),
        ("restricted", "Restricted"),
        ("high", "High"),
    ]

    VMS_ZONE_TYPE_CHOICES = [
        ("Public", "Public"),
        ("Restricted", "Restricted"),
        ("High Security", "High Security"),
        ("Admin", "Admin"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    warehouse = models.ForeignKey(
        Warehouse,
        on_delete=models.CASCADE,
        related_name="zones"
    )
    code = models.CharField(
        max_length=20,
        help_text="e.g., Z-IN, Z-DA (one of the 7 canonical codes)"
    )
    name = models.CharField(max_length=255, help_text="e.g., Receiving Area")
    category = models.CharField(
        max_length=50,
        choices=CATEGORY_CHOICES,
        default="stock"
    )
    security_level = models.CharField(
        max_length=50,
        choices=SECURITY_LEVEL_CHOICES,
        default="standard"
    )
    sort_order = models.PositiveIntegerField(
        default=0,
        help_text="Display order (1-7)"
    )
    is_active = models.BooleanField(default=True)
    description = models.TextField(
        blank=True,
        default="",
        help_text="Optional SOP text"
    )
    purpose = models.CharField(
        max_length=255,
        blank=True,
        default="",
        help_text="Visitor/operational purpose of the zone"
    )
    requires_escort = models.BooleanField(default=False)
    access_hours_start = models.CharField(max_length=5, default="06:00")
    access_hours_end = models.CharField(max_length=5, default="22:00")
    weekend_access = models.BooleanField(default=False)
    max_occupancy = models.PositiveIntegerField(default=0)
    allowed_visitor_categories = models.JSONField(default=list, blank=True)
    gate_ids = models.JSONField(default=list, blank=True)
    camera_ids = models.JSONField(default=list, blank=True)
    vms_zone_type = models.CharField(
        max_length=50,
        choices=VMS_ZONE_TYPE_CHOICES,
        default="Public",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["warehouse", "sort_order"]
        unique_together = [["warehouse", "code"]]
        verbose_name = "Site Zone"
        verbose_name_plural = "Site Zones"

    def __str__(self):
        return f"{self.warehouse.code} - {self.code} ({self.name})"
