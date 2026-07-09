"""Report detention/deposit DB tables required by the API."""

from django.core.management.base import BaseCommand
from django.db import connection

from detentions.models import (
    DepositAccountEntry,
    DetentionMemo,
    DetentionMemoAttachment,
    DetentionMemoGoodsImage,
    DetentionMemoGoodsLine,
)


class Command(BaseCommand):
    help = "Check detention memo / deposit account tables exist (diagnose API 500 errors)."

    def handle(self, *args, **options):
        models = [
            DetentionMemo,
            DepositAccountEntry,
            DetentionMemoAttachment,
            DetentionMemoGoodsLine,
            DetentionMemoGoodsImage,
        ]
        existing = set(connection.introspection.table_names())
        missing = []
        for model in models:
            table = model._meta.db_table
            if table in existing:
                self.stdout.write(self.style.SUCCESS(f"OK  {table}"))
            else:
                missing.append(table)
                self.stdout.write(self.style.ERROR(f"MISSING  {table}"))

        if missing:
            self.stdout.write(
                self.style.WARNING(
                    "\nRun: python manage.py migrate detentions\n"
                    "Then: python manage.py repair_detention_schema"
                )
            )
            return

        memo_count = DetentionMemo.objects.count()
        deposit_count = DepositAccountEntry.objects.count()
        try:
            DetentionMemo.objects.prefetch_related("goods_lines__images", "attachments").first()
            self.stdout.write(self.style.SUCCESS("OK  prefetch goods_lines + attachments"))
        except Exception as exc:
            self.stdout.write(self.style.ERROR(f"FAIL prefetch: {exc}"))
            return
        self.stdout.write(
            self.style.SUCCESS(
                f"\nAll detention tables present. Memos: {memo_count}, deposits: {deposit_count}"
            )
        )
