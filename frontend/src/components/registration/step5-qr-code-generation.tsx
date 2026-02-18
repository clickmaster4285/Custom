"use client";

import { useMemo } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface QRCodeFormData {
  qrCodeId: string;
  visitorRefNumber: string;
  visitDate: string;
  timeValidityStart: string;
  timeValidityEnd: string;
  accessZone: string;
  entryGate: string;
  expiryStatus: string;
  scanCount: string;
  generatedOn: string;
  generatedBy: string;
}

/** Form data passed from parent may include CNIC (from Step 1) for QR payload */
type Step5FormData = QRCodeFormData & { cnicNumber?: string };

interface Step5QRCodeGenerationProps {
  formData: Step5FormData;
  updateFormData: (data: Partial<QRCodeFormData>) => void;
}

/** Build QR payload from CNIC, access zone and validation time (used for frontend QR generation). */
export function buildQRPayload(formData: Step5FormData): string {
  const cnic = (formData.cnicNumber ?? "").trim();
  const zone = (formData.accessZone ?? "").trim();
  const validFrom = (formData.timeValidityStart ?? "").trim();
  const validTo = (formData.timeValidityEnd ?? "").trim();
  const payload = { cnic, zone, validFrom, validTo };
  return JSON.stringify(payload);
}

/** Build same QR payload from a visitor record (e.g. from API) for re-print from table. */
export function buildQRPayloadFromVisitor(visitor: {
  cnic_number?: string;
  passport_number?: string;
  access_zone?: string;
  time_validity_start?: string;
  time_validity_end?: string;
}): string {
  const cnic = (visitor.cnic_number || visitor.passport_number || "").trim();
  const zone = (visitor.access_zone ?? "").trim();
  const validFrom = (visitor.time_validity_start ?? "").trim();
  const validTo = (visitor.time_validity_end ?? "").trim();
  return JSON.stringify({ cnic, zone, validFrom, validTo });
}

export function Step5QRCodeGeneration({ formData, updateFormData }: Step5QRCodeGenerationProps) {
  const qrPayload = useMemo(() => buildQRPayload(formData), [
    formData.cnicNumber,
    formData.accessZone,
    formData.timeValidityStart,
    formData.timeValidityEnd,
  ]);

  const hasQRData = (formData.cnicNumber ?? "").trim() && (formData.accessZone ?? "").trim();

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-semibold text-foreground tracking-tight">
          QR Code & Access
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          QR is generated from CNIC, access zone and validity time. Set these fields below and the code updates automatically.
        </p>
      </div>

      {/* Frontend-generated QR from CNIC + access zone + validation time */}
      <div className="rounded-lg border border-border bg-muted/30 p-6">
        <h4 className="text-sm font-medium text-foreground mb-3">Generated QR Code</h4>
        {hasQRData ? (
          <div className="flex flex-col sm:flex-row items-start gap-6">
            <div className="rounded-lg border-2 border-border bg-white p-4 shrink-0">
              <QRCodeSVG value={qrPayload} size={200} level="M" />
            </div>
            <div className="text-sm text-muted-foreground space-y-1 min-w-0">
              <p><span className="font-medium text-foreground">CNIC:</span> {formData.cnicNumber || "—"}</p>
              <p><span className="font-medium text-foreground">Access zone:</span> {formData.accessZone || "—"}</p>
              <p><span className="font-medium text-foreground">Valid:</span> {formData.timeValidityStart || "—"} to {formData.timeValidityEnd || "—"}</p>
              <p className="text-xs mt-2 break-all">Payload: {qrPayload}</p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground py-4">
            Enter CNIC (from Step 1) and select Access zone and Time validity below to generate the QR code.
          </p>
        )}
      </div>

      <div className="rounded-lg border border-border bg-muted/30 p-6">
        <h4 className="text-sm font-medium text-foreground mb-4">Access & validity</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label className="text-sm font-medium text-muted-foreground">QR Code ID</Label>
          <Input
            placeholder="Enter system generated ID"
            value={formData.qrCodeId}
            onChange={(e) => updateFormData({ qrCodeId: e.target.value })}
            className="h-11 border-border"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-medium text-muted-foreground">Visitor Reference Number</Label>
          <Input
            placeholder="Enter Reference Id"
            value={formData.visitorRefNumber}
            onChange={(e) => updateFormData({ visitorRefNumber: e.target.value })}
            className="h-11 border-border"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-medium text-muted-foreground">Visit Date</Label>
          <Input
            placeholder="DD/MM/YYYY"
            value={formData.visitDate}
            onChange={(e) => updateFormData({ visitDate: e.target.value })}
            className="h-11 border-border"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-medium text-muted-foreground">Time Validity</Label>
          <div className="flex items-center gap-2">
            <Input
              placeholder="Start time"
              value={formData.timeValidityStart}
              onChange={(e) => updateFormData({ timeValidityStart: e.target.value })}
              className="h-11 border-border flex-1"
            />
            <span className="text-muted-foreground text-sm">to</span>
            <Input
              placeholder="End time"
              value={formData.timeValidityEnd}
              onChange={(e) => updateFormData({ timeValidityEnd: e.target.value })}
              className="h-11 border-border flex-1"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-medium text-muted-foreground">Access Zone</Label>
          <Select
            value={formData.accessZone}
            onValueChange={(value) => updateFormData({ accessZone: value })}
          >
            <SelectTrigger className="h-11 border-border">
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
          <Label className="text-sm font-medium text-muted-foreground">Entry Gate</Label>
          <Select
            value={formData.entryGate}
            onValueChange={(value) => updateFormData({ entryGate: value })}
          >
            <SelectTrigger className="h-11 border-border">
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
          <Label className="text-sm font-medium text-muted-foreground">Expiry Status</Label>
          <Select
            value={formData.expiryStatus}
            onValueChange={(value) => updateFormData({ expiryStatus: value })}
          >
            <SelectTrigger className="h-11 border-border">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
              <SelectItem value="revoked">Revoked</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-medium text-muted-foreground">Generated By</Label>
          <Select
            value={formData.generatedBy}
            onValueChange={(value) => updateFormData({ generatedBy: value })}
          >
            <SelectTrigger className="h-11 border-border">
              <SelectValue placeholder="Select source" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="system">System</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="operator">Operator</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      </div>
    </div>
  );
}
