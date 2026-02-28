"use client"

import { useMemo, useEffect, useState } from "react"
import QRCode from "qrcode"
import { Label } from "@/components/ui/label"
import { QrCode } from "lucide-react"

export interface WalkInStep4QRCodeFormData {
  qrCodeId: string
  accessZone: string
  entryGate: string
  timeValidityStart: string
  timeValidityEnd: string
  visitorRefNumber: string
  visitDate: string
  cnicNumber?: string
  securityLevel: string
  maxVisitDuration: string
  allowedDepartments: string
  additionalRemarks: string
  escortMandatory: string
}

interface WalkInStep4QRCodeGenerationProps {
  formData: WalkInStep4QRCodeFormData & { cnicNumber?: string; fullName?: string; visitPurpose?: string; department?: string }
  updateFormData: (data: Partial<WalkInStep4QRCodeFormData>) => void
  onCancel?: () => void
  onReset?: () => void
  onPrevious?: () => void
  onPrint?: () => void
  onFinish?: () => void
}

export function WalkInStep4QRCodeGeneration({
  formData,
  updateFormData: _updateFormData,
  onCancel,
  onReset,
  onPrevious,
  onPrint,
  onFinish,
}: WalkInStep4QRCodeGenerationProps) {
  const qrPayload = useMemo(() => {
    const payload = {
      fullName: (formData as { fullName?: string }).fullName ?? "",
      cnicNumber: formData.cnicNumber ?? "",
      visitDate: formData.visitDate ?? "",
      timeValidityStart: formData.timeValidityStart ?? "",
      timeValidityEnd: formData.timeValidityEnd ?? "",
      accessZone: formData.accessZone ?? "",
      entryGate: formData.entryGate ?? "",
      qrCodeId: formData.qrCodeId ?? "",
      visitorRefNumber: formData.visitorRefNumber ?? "",
      visitPurpose: (formData as { visitPurpose?: string }).visitPurpose ?? "",
      department: (formData as { department?: string }).department ?? "",
    }
    return JSON.stringify(payload)
  }, [
    (formData as { fullName?: string }).fullName,
    formData.cnicNumber,
    formData.visitDate,
    formData.timeValidityStart,
    formData.timeValidityEnd,
    formData.accessZone,
    formData.entryGate,
    formData.qrCodeId,
    formData.visitorRefNumber,
    (formData as { visitPurpose?: string }).visitPurpose,
    (formData as { department?: string }).department,
  ])

  const visitorName = ((formData as { fullName?: string }).fullName ?? "").trim() || "Visitor"
  const validFrom = (formData.timeValidityStart ?? "").trim() || "00:00"
  const validTo = (formData.timeValidityEnd ?? "").trim() || "23:59"

  const [qrDataUrl, setQrDataUrl] = useState<string>("")
  useEffect(() => {
    QRCode.toDataURL(qrPayload, { width: 200, margin: 2 })
      .then(setQrDataUrl)
      .catch(() => setQrDataUrl(""))
  }, [qrPayload])

  return (
    <div className="space-y-8">
      <Label className="text-[22px] font-bold text-foreground">QR Code Generation</Label>
      <p className="text-base text-muted-foreground">
        QR code is generated from the information you added. Print it or finish to save the registration.
      </p>

      {/* Generated QR from form data */}
      <div className="rounded-lg border-2 border-[#93c5fd] bg-white p-6 flex flex-col items-center justify-center gap-4 min-h-[240px]">
        <div className="rounded-lg border border-border bg-white p-4">
          {qrDataUrl ? (
            <img src={qrDataUrl} alt="QR Code" className="h-[200px] w-[200px]" />
          ) : (
            <div className="h-[200px] w-[200px] rounded border border-border bg-muted flex items-center justify-center text-sm text-muted-foreground">
              Generating…
            </div>
          )}
        </div>
        <div className="text-center text-sm text-muted-foreground space-y-0.5">
          <p className="font-medium text-foreground">{visitorName}</p>
          <p>Valid: {validFrom} – {validTo}</p>
        </div>
      </div>

      {/* Action buttons: Previous, Print, Finish */}
      <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-4 pt-6 border-t border-border">
        <div className="flex items-center gap-3">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="rounded-md border border-[#CCCCCC] bg-white px-4 py-2.5 text-base font-normal text-[#3366CC] transition-colors hover:bg-gray-50"
            >
              Cancel
            </button>
          )}
          {onReset && (
            <button
              type="button"
              onClick={onReset}
              className="rounded-md border border-[#CCCCCC] bg-white px-4 py-2.5 text-base font-normal text-[#3366CC] transition-colors hover:bg-gray-50"
            >
              Reset Form
            </button>
          )}
        </div>
        <div className="flex items-center gap-3">
          {onPrevious && (
            <button
              type="button"
              onClick={onPrevious}
              className="rounded-md border border-border bg-white px-4 py-2.5 text-base font-normal text-foreground hover:bg-muted/50"
            >
              Previous
            </button>
          )}
          {onPrint && (
            <button
              type="button"
              onClick={onPrint}
              className="rounded-md border border-[#3366FF] bg-white px-4 py-2.5 text-base font-normal text-[#3366FF] hover:bg-[#3366FF]/10 flex items-center gap-2"
            >
              <QrCode className="h-4 w-4" />
              Print
            </button>
          )}
          {onFinish && (
            <button
              type="button"
              onClick={onFinish}
              className="shrink-0 rounded-md bg-[#3366FF] px-5 py-2.5 text-base font-normal text-white transition-colors hover:bg-[#2952CC]"
            >
              Finish
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
