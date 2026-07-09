"""Create missing detention tables/columns (run on server if APIs return 500)."""

from django.core.management.base import BaseCommand
from django.core.management import call_command
from django.db import connection

from detentions.models import (
    DepositAccountEntry,
    DetentionMemo,
    DetentionMemoAttachment,
    DetentionMemoGoodsImage,
    DetentionMemoGoodsLine,
)


class Command(BaseCommand):
    help = "Apply detention migrations and verify list APIs can query the database."

    def handle(self, *args, **options):
        self.stdout.write("Running detentions migrations…")
        call_command("migrate", "detentions", verbosity=1)

        self.stdout.write("\nTable check:")
        call_command("check_detention_db", verbosity=1)

        self.stdout.write("\nQuery smoke test:")
        models = [
            ("DetentionMemo", DetentionMemo),
            ("DepositAccountEntry", DepositAccountEntry),
            ("DetentionMemoGoodsLine", DetentionMemoGoodsLine),
        ]
        ok = True
        for label, model in models:
            try:
                count = model.objects.count()
                self.stdout.write(self.style.SUCCESS(f"  OK  {label}.objects.count() = {count}"))
            except Exception as exc:
                ok = False
                self.stdout.write(self.style.ERROR(f"  FAIL  {label}: {exc}"))

        if ok:
            self.stdout.write(self.style.SUCCESS("\nDetention schema looks healthy. Restart tekeyeapi."))
        else:
            self.stdout.write(
                self.style.ERROR(
                    "\nSchema still broken. Run: sudo journalctl -u tekeyeapi -n 50\n"
                    "Or in psql: \\d detentions_depositaccountentry"
                )
            )
