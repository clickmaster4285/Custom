"use client"

import { useEffect, useMemo, useState } from "react"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import QRCode from "qrcode"

interface WalkInAutoQrFormData {
  cnicPassport: string
  department: string
  departmentForSlot: string
  preferredDate: string
  preferredTimeSlot: string
  slotDuration: string
  qrCodeId: string
  visitorRefNumber: string
  visitDate: string
  timeValidityStart: string
  timeValidityEnd: string
  accessZone: string
  entryGate: string
  expiryStatus: string
  scanCount: string
  generatedOn: string
  generatedBy: string
}

interface WalkInStep7AutoQrCodeProps {
  formData: WalkInAutoQrFormData
  updateFormData: (data: Partial<WalkInAutoQrFormData>) => void
}

function normalizeCnic(value: string): string {
  return value.replace(/\D/g, "")
}

function resolveZone(department: string): string {
  const key = department.toLowerCase()
  if (key.includes("hr")) return "zone-a"
  if (key.includes("finance")) return "zone-b"
  if (key.includes("ops") || key.includes("operation")) return "zone-c"
  if (key.includes("it") || key.includes("engineering")) return "zone-d"
  return "zone-a"
}

function resolveGate(zone: string): string {
  const map: Record<string, string> = {
    "zone-a": "main-gate",
    "zone-b": "gate-1",
    "zone-c": "gate-2",
    "zone-d": "gate-3",
  }
  return map[zone] ?? "main-gate"
}

function addMinutes(time: string, minutes: number): string {
  const [hourRaw, minuteRaw] = time.split(":")
  const hour = Number(hourRaw)
  const minute = Number(minuteRaw)
  if (!Number.isFinite(hour) || !Number.isFinite(minute)) return ""
  const total = hour * 60 + minute + minutes
  const wrapped = ((total % (24 * 60)) + 24 * 60) % (24 * 60)
  const h = String(Math.floor(wrapped / 60)).padStart(2, "0")
  const m = String(wrapped % 60).padStart(2, "0")
  return `${h}:${m}`
}

export function WalkInStep7AutoQrCode({ formData, updateFormData }: WalkInStep7AutoQrCodeProps) {
  const [qrImageUrl, setQrImageUrl] = useState("")

  const safeCnic = normalizeCnic(formData.cnicPassport || "0000000000000")
  const effectiveDepartment = formData.departmentForSlot || formData.department || ""
  const defaultZone = resolveZone(effectiveDepartment)
  const zone = formData.accessZone || defaultZone
  const gate = formData.entryGate || resolveGate(zone)
  const generatedDate = formData.generatedOn || new Date().toISOString().slice(0, 10)
  const visitDate = formData.preferredDate || formData.visitDate || generatedDate
  const startTime = formData.preferredTimeSlot || formData.timeValidityStart || "09:00"
  const durationMinutes = Number(formData.slotDuration || "30")
  const endTime = addMinutes(startTime, Number.isFinite(durationMinutes) ? durationMinutes : 30)

  const autoQrValues = useMemo(() => {
    const uniqueSuffix = Date.now().toString().slice(-6)
    const cnicSuffix = safeCnic.slice(-6).padStart(6, "0")
    const qrCodeId = formData.qrCodeId || `WALKIN-${cnicSuffix}-${uniqueSuffix}`
    const visitorRefNumber = formData.visitorRefNumber || `REF-${safeCnic.slice(-8).padStart(8, "0")}`
    return {
      qrCodeId,
      visitorRefNumber,
      visitDate,
      timeValidityStart: startTime,
      timeValidityEnd: endTime,
      accessZone: zone,
      entryGate: gate,
      expiryStatus: "active",
      scanCount: "0",
      generatedOn: generatedDate,
      generatedBy: "system",
    }
  }, [
    endTime,
    formData.qrCodeId,
    formData.visitorRefNumber,
    gate,
    generatedDate,
    safeCnic,
    startTime,
    visitDate,
    zone,
  ])

  useEffect(() => {
    const needsUpdate = Object.entries(autoQrValues).some(([k, v]) => {
      const current = formData[k as keyof WalkInAutoQrFormData]
      return current !== v
    })
    if (needsUpdate) {
      updateFormData(autoQrValues)
    }
  }, [autoQrValues, formData, updateFormData])

  const qrPayload = useMemo(
    () =>
      JSON.stringify({
        type: "walk-in",
        cnic: safeCnic,
        zone: autoQrValues.accessZone,
        gate: autoQrValues.entryGate,
        visit_date: autoQrValues.visitDate,
        valid_from: autoQrValues.timeValidityStart,
        valid_to: autoQrValues.timeValidityEnd,
        allowed: true,
        qr_id: autoQrValues.qrCodeId,
      }),
    [autoQrValues, safeCnic]
  )

  useEffect(() => {
    let mounted = true
    QRCode.toDataURL(qrPayload, {
      errorCorrectionLevel: "M",
      margin: 1,
      width: 280,
    })
      .then((url) => {
        if (mounted) setQrImageUrl(url)
      })
      .catch(() => {
        if (mounted) setQrImageUrl("")
      })
    return () => {
      mounted = false
    }
  }, [qrPayload])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Auto QR Code Generation</h2>
        <p className="text-sm text-muted-foreground">
          QR code is auto-generated from CNIC and assigned zone. No manual QR metadata is required.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">CNIC Used</Label>
            <p className="rounded-md border border-border bg-muted/20 px-3 py-2 text-sm font-medium">
              {safeCnic}
            </p>
          </div>
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">Access Zone</Label>
            <Select value={autoQrValues.accessZone} onValueChange={(value) => updateFormData({ accessZone: value })}>
              <SelectTrigger className="h-11 bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="zone-a">Zone A</SelectItem>
                <SelectItem value="zone-b">Zone B</SelectItem>
                <SelectItem value="zone-c">Zone C</SelectItem>
                <SelectItem value="zone-d">Zone D</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2 text-sm">
            <p>
              <span className="text-muted-foreground">QR ID:</span> {autoQrValues.qrCodeId}
            </p>
            <p>
              <span className="text-muted-foreground">Gate:</span> {autoQrValues.entryGate}
            </p>
            <p>
              <span className="text-muted-foreground">Validity:</span>{" "}
              {autoQrValues.timeValidityStart} - {autoQrValues.timeValidityEnd}
            </p>
          </div>
        </div>

        <div className="rounded-lg border border-border p-4 flex flex-col items-center gap-3 bg-background">
          {qrImageUrl ? (
            <img src={qrImageUrl} alt="Walk-in visitor QR code" className="h-56 w-56 rounded border border-border" />
          ) : (
            <div className="h-56 w-56 rounded border border-dashed border-border grid place-items-center text-sm text-muted-foreground">
              Generating QR...
            </div>
          )}
          <p className="text-xs text-muted-foreground text-center">
            On scan, barrier gate can validate CNIC + allowed zone and open only for permitted access.
          </p>
        </div>
      </div>
    </div>
  )
}
