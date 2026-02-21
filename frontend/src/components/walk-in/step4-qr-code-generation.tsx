"use client"

import { useMemo } from "react"
import { QRCodeSVG } from "qrcode.react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { QrCode, Info } from "lucide-react"
import { buildQRPayload } from "@/components/registration/step5-qr-code-generation"

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
  formData: WalkInStep4QRCodeFormData & { cnicNumber?: string }
  updateFormData: (data: Partial<WalkInStep4QRCodeFormData>) => void
  onCancel?: () => void
  onReset?: () => void
  onPrevious?: () => void
  onFinish?: () => void
}

export function WalkInStep4QRCodeGeneration({
  formData,
  updateFormData,
  onCancel,
  onReset,
  onPrevious,
  onFinish,
}: WalkInStep4QRCodeGenerationProps) {
  const qrPayload = useMemo(() => {
    const step5Data = {
      cnicNumber: formData.cnicNumber,
      accessZone: formData.accessZone,
      timeValidityStart: formData.timeValidityStart,
      timeValidityEnd: formData.timeValidityEnd,
      qrCodeId: formData.qrCodeId,
      visitorRefNumber: formData.visitorRefNumber,
      visitDate: formData.visitDate,
      entryGate: formData.entryGate,
      expiryStatus: "",
      scanCount: "0",
      generatedOn: "",
      generatedBy: "",
    }
    return buildQRPayload(step5Data)
  }, [
    formData.cnicNumber,
    formData.accessZone,
    formData.timeValidityStart,
    formData.timeValidityEnd,
  ])
  const hasQRData =
    (formData.cnicNumber ?? "").trim() &&
    (formData.accessZone ?? "").trim() &&
    (formData.timeValidityStart ?? "").trim() &&
    (formData.timeValidityEnd ?? "").trim()

  return (
    <div className="space-y-8">
      <Label className="text-[22px] font-bold text-foreground">QR Code Generation</Label>
      <p className="text-base text-muted-foreground">Scan & Generate</p>

      {/* Scan & Generate section */}
      <div className="flex flex-col sm:flex-row gap-6">
        <div className="flex-1 rounded-lg border-2 border-dashed border-[#93c5fd] bg-white p-6 flex flex-col items-center justify-center gap-3 min-h-[200px]">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#dbeafe]">
            <QrCode className="h-8 w-8 text-[#3366FF]" />
          </div>
          <p className="text-base font-normal text-foreground text-center">
            Scan visitor CNIC/passport to populate QR data
          </p>
          <button
            type="button"
            className="rounded-md bg-[#3366FF] px-4 py-2.5 text-base font-normal text-white transition-colors hover:bg-[#2952CC]"
          >
            Scan ID
          </button>
        </div>
        <div className="flex-1 rounded-lg border-2 border-dashed border-[#93c5fd] bg-white p-6 flex flex-col items-center justify-center min-h-[200px]">
          {hasQRData ? (
            <div className="rounded-lg border border-border bg-white p-4">
              <QRCodeSVG value={qrPayload} size={160} level="M" />
            </div>
          ) : (
            <p className="text-base text-muted-foreground text-center">
              Generated QR will appear here
            </p>
          )}
        </div>
      </div>

      {/* QR Code ID */}
      <div className="grid grid-cols-1 gap-6">
        <div className="space-y-2">
            <Label className="text-base text-foreground">QR Code ID</Label>
            <Input
              placeholder="123-345-6678"
              value={formData.qrCodeId}
              onChange={(e) => updateFormData({ qrCodeId: e.target.value })}
              className="h-10 text-base bg-background border-border"
            />
      </div>
      </div>

      {/* Security Clearance */}
      <div className="space-y-4 border-t border-border pt-6">
        <Label className="text-[22px] font-bold text-foreground">Security Clearance</Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label className="text-base text-foreground">Security Level</Label>
            <Select
              value={formData.securityLevel || undefined}
              onValueChange={(v) => updateFormData({ securityLevel: v })}
            >
              <SelectTrigger className="w-full h-10 text-base bg-background border-border">
                <SelectValue placeholder="Select level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="vip">VIP</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-base text-foreground">Maximum Visit Duration</Label>
            <Input
              placeholder="Set limit"
              value={formData.maxVisitDuration}
              onChange={(e) => updateFormData({ maxVisitDuration: e.target.value })}
              className="h-10 text-base bg-background border-border"
            />
            <p className="text-base text-muted-foreground">Capacity Control</p>
          </div>
          <div className="space-y-2">
            <Label className="text-base text-foreground">Allowed Departments</Label>
            <Select
              value={formData.allowedDepartments || undefined}
              onValueChange={(v) => updateFormData({ allowedDepartments: v })}
            >
              <SelectTrigger className="w-full h-10 text-base bg-background border-border">
                <SelectValue placeholder="Select department(s)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hr">Human Resource</SelectItem>
                <SelectItem value="it">IT</SelectItem>
                <SelectItem value="enforcement">Enforcement</SelectItem>
                <SelectItem value="all">All</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-base text-foreground">Access Zone</Label>
            <Select
              value={formData.accessZone || undefined}
              onValueChange={(v) => updateFormData({ accessZone: v })}
            >
              <SelectTrigger className="w-full h-10 text-base bg-background border-border">
                <SelectValue placeholder="Select zone" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="zone-a">Zone A</SelectItem>
                <SelectItem value="zone-b">Zone B</SelectItem>
                <SelectItem value="zone-c">Zone C</SelectItem>
                <SelectItem value="all">All Zones</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-base text-foreground">Entry Gate</Label>
            <Select
              value={formData.entryGate || undefined}
              onValueChange={(v) => updateFormData({ entryGate: v })}
            >
              <SelectTrigger className="w-full h-10 text-base bg-background border-border">
                <SelectValue placeholder="Select gate" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="main-gate">Main Gate</SelectItem>
                <SelectItem value="gate-1">Gate 1</SelectItem>
                <SelectItem value="gate-2">Gate 2</SelectItem>
                <SelectItem value="vip-gate">VIP Gate</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-base text-foreground">Time Validity</Label>
            <div className="flex items-center gap-2">
              <Input
                placeholder="--- ---"
                value={formData.timeValidityStart}
                onChange={(e) => updateFormData({ timeValidityStart: e.target.value })}
                className="h-10 text-base bg-background border-border flex-1"
              />
              <Info className="h-4 w-4 shrink-0 text-muted-foreground" />
              <Input
                placeholder="--- ---"
                value={formData.timeValidityEnd}
                onChange={(e) => updateFormData({ timeValidityEnd: e.target.value })}
                className="h-10 text-base bg-background border-border flex-1"
              />
              <Info className="h-4 w-4 shrink-0 text-muted-foreground" />
            </div>
          </div>
        </div>
      </div>

      {/* Additional Remarks */}
      <div className="space-y-2 border-t border-border pt-6">
        <Label className="text-[22px] font-bold text-foreground">Additional Remarks</Label>
        <Textarea
          placeholder="Add remarks"
          value={formData.additionalRemarks}
          onChange={(e) => updateFormData({ additionalRemarks: e.target.value })}
          className="min-h-24 text-base bg-background border-border resize-none"
        />
        <p className="text-base text-muted-foreground">Visitor Address</p>
      </div>

      {/* Escort Mandatory */}
      <div className="space-y-3 border-t border-border pt-6">
        <Label className="text-[22px] font-bold text-foreground">Escort Mandatory</Label>
        <RadioGroup
          value={formData.escortMandatory || "yes"}
          onValueChange={(v) => updateFormData({ escortMandatory: v })}
          className="flex flex-row gap-6"
        >
          <div className="flex items-center gap-2">
            <RadioGroupItem value="yes" id="escort-yes" />
            <Label htmlFor="escort-yes" className="text-base font-normal cursor-pointer">
              Yes
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="no" id="escort-no" />
            <Label htmlFor="escort-no" className="text-base font-normal cursor-pointer">
              No
            </Label>
          </div>
        </RadioGroup>
      </div>

      {/* Action buttons – same as first form, Finish instead of Save & Continue */}
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
              className="rounded-md bg-[#3366FF] px-4 py-2.5 text-base font-normal text-white transition-colors hover:bg-[#2952CC]"
            >
              Previous
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
