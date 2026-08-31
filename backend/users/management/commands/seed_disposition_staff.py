"""Seed Peshawar enforcement disposition employees into the Staff table."""

from __future__ import annotations

import json
from pathlib import Path

from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from django.utils import timezone

from users.models import Staff

JSON_PATH = (
    Path(__file__).resolve().parents[2] / "data" / "peshawar-enforcement-disposition.json"
)


def placeholder_cnic(s_no: int) -> str:
    """Unique 15-char CNIC placeholder (Staff.cnic is required and unique)."""
    return f"DISP{s_no:011d}"


class Command(BaseCommand):
    help = (
        "Insert all employees from peshawar-enforcement-disposition.json into the "
        "Staff table. Existing disposition rows (matched by personal_number) are skipped."
    )

    def add_arguments(self, parser):
        parser.add_argument(
            "--json",
            dest="json_path",
            default=str(JSON_PATH),
            help="Path to the disposition JSON file.",
        )

    def handle(self, *args, **options):
        json_path = Path(options["json_path"])
        if not json_path.is_file():
            raise CommandError(f"Disposition JSON not found: {json_path}")

        payload = json.loads(json_path.read_text(encoding="utf-8"))
        employees = payload.get("employees") or []
        if not employees:
            raise CommandError("No employees found in the disposition JSON.")

        organization = payload.get("organization") or {}
        org_name = organization.get("name") or (
            "Collectorate of Customs (Enforcement), Peshawar"
        )
        department = organization.get("department") or "Enforcement"
        city = organization.get("city") or "Peshawar"
        title = payload.get("title") or ""
        joining_date = timezone.now().date()

        existing_keys = set(
            Staff.objects.filter(
                record_source=Staff.RECORD_SOURCE_DISPOSITION,
                personal_number__isnull=False,
            ).values_list("personal_number", flat=True)
        )
        existing_cnics = set(Staff.objects.values_list("cnic", flat=True))
        existing_employee_ids = set(
            Staff.objects.exclude(employee_id__isnull=True)
            .exclude(employee_id="")
            .values_list("employee_id", flat=True)
        )

        to_create: list[Staff] = []
        skipped = 0

        for emp in employees:
            s_no = emp.get("s_no")
            personal_number = str(s_no).strip() if s_no is not None else ""
            if not personal_number:
                skipped += 1
                continue
            if personal_number in existing_keys:
                skipped += 1
                continue

            employee_id = f"DISP-{int(s_no):04d}"
            if employee_id in existing_employee_ids:
                skipped += 1
                continue

            cnic = placeholder_cnic(int(s_no))
            if cnic in existing_cnics:
                skipped += 1
                continue

            to_create.append(
                Staff(
                    full_name=(emp.get("name") or "").strip()[:150],
                    father_name=(emp.get("father_name") or "").strip()[:150] or None,
                    designation=(emp.get("designation") or "").strip()[:100],
                    department=department[:100],
                    personal_number=personal_number[:50],
                    employee_id=employee_id,
                    bps=str(emp.get("bps") or "").strip()[:10] or None,
                    current_posting=org_name[:300],
                    collector_name=org_name[:200],
                    branch_location=org_name[:200],
                    city=city[:100],
                    country="Pakistan",
                    address=org_name,
                    employment_type="Permanent",
                    record_source=Staff.RECORD_SOURCE_DISPOSITION,
                    notes=title or None,
                    cnic=cnic,
                    joining_date=joining_date,
                )
            )
            existing_keys.add(personal_number)
            existing_cnics.add(cnic)
            existing_employee_ids.add(employee_id)

        with transaction.atomic():
            Staff.objects.bulk_create(to_create, batch_size=200)

        created = len(to_create)
        self.stdout.write(
            self.style.SUCCESS(
                f"Disposition staff seed complete: created={created}, "
                f"skipped={skipped}, total_in_file={len(employees)}"
            )
        )
