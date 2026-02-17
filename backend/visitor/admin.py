from django.contrib import admin
from .models import Visitor


@admin.register(Visitor)
class VisitorAdmin(admin.ModelAdmin):
    list_display = ("full_name", "visitor_type", "visit_purpose", "preferred_visit_date")
    search_fields = ("full_name", "cnic_number", "passport_number")
