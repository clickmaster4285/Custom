import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ChevronLeft, ChevronRight } from "lucide-react"

export default function QRCodeGenerationPage() {
  const [formData, setFormData] = useState({
    qrCodeId: "",
    visitorRefNumber: "",
    visitDate: "",
    timeValidityStart: "",
    timeValidityEnd: "",
    accessZone: "",
    entryGate: "",
    expiryStatus: "",
    scanCount: "",
    generatedOn: "",
    generatedBy: "",
  })

  return (
    <>
      {/* Breadcrumb */}
          <div className="text-sm text-muted-foreground mb-2">
            Home / Visitor Registration / <span className="text-[#3b82f6]">QR Code Generation</span>
          </div>

          {/* Title */}
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-foreground">QR Code Generation</h1>
            <p className="text-sm text-muted-foreground">
              Generate unique QR for visit authentication.
            </p>
          </div>

          {/* Form Container */}
          <div className="bg-background rounded-lg border border-border p-6">
            {/* Section Title */}
            <h2 className="text-lg font-medium text-foreground mb-6">QR Code Metadata</h2>

            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* QR Code ID */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">QR Code ID</Label>
                <Input
                  type="text"
                  placeholder="Enter system generated ID"
                  value={formData.qrCodeId}
                  onChange={(e) => setFormData({ ...formData, qrCodeId: e.target.value })}
                  className="h-10 border-border"
                />
              </div>

              {/* Visitor Reference Number */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">Visitor Reference Number</Label>
                <Input
                  type="text"
                  placeholder="Enter Reference Id"
                  value={formData.visitorRefNumber}
                  onChange={(e) => setFormData({ ...formData, visitorRefNumber: e.target.value })}
                  className="h-10 border-border"
                />
              </div>

              {/* Visit Date */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">Visit Date</Label>
                <Input
                  type="text"
                  placeholder="DD/MM/YYYY"
                  value={formData.visitDate}
                  onChange={(e) => setFormData({ ...formData, visitDate: e.target.value })}
                  className="h-10 border-border"
                />
              </div>

              {/* Time Validity */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">Time Validity</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="text"
                    placeholder="Start time"
                    value={formData.timeValidityStart}
                    onChange={(e) => setFormData({ ...formData, timeValidityStart: e.target.value })}
                    className="h-10 border-border flex-1"
                  />
                  <span className="text-muted-foreground">to</span>
                  <Input
                    type="text"
                    placeholder="End time"
                    value={formData.timeValidityEnd}
                    onChange={(e) => setFormData({ ...formData, timeValidityEnd: e.target.value })}
                    className="h-10 border-border flex-1"
                  />
                </div>
              </div>

              {/* Access Zone */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">Access Zone</Label>
                <Select
                  value={formData.accessZone}
                  onValueChange={(value) => setFormData({ ...formData, accessZone: value })}
                >
                  <SelectTrigger className="h-10 border-border">
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

              {/* Entry Gate */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">Entry Gate</Label>
                <Select
                  value={formData.entryGate}
                  onValueChange={(value) => setFormData({ ...formData, entryGate: value })}
                >
                  <SelectTrigger className="h-10 border-border">
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

              {/* Expiry Status */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">Expiry Status</Label>
                <Select
                  value={formData.expiryStatus}
                  onValueChange={(value) => setFormData({ ...formData, expiryStatus: value })}
                >
                  <SelectTrigger className="h-10 border-border">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                    <SelectItem value="revoked">Revoked</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Scan Count */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">Scan Count</Label>
                <Input
                  type="text"
                  placeholder="Enter a entity"
                  value={formData.scanCount}
                  onChange={(e) => setFormData({ ...formData, scanCount: e.target.value })}
                  className="h-10 border-border"
                />
              </div>

              {/* Generated On */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">Generated On</Label>
                <Input
                  type="text"
                  placeholder="DD/MM/YYYY"
                  value={formData.generatedOn}
                  onChange={(e) => setFormData({ ...formData, generatedOn: e.target.value })}
                  className="h-10 border-border"
                />
              </div>

              {/* Generated By */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">Generated By</Label>
                <Select
                  value={formData.generatedBy}
                  onValueChange={(value) => setFormData({ ...formData, generatedBy: value })}
                >
                  <SelectTrigger className="h-10 border-border">
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

            {/* Action Buttons */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
              <div className="flex items-center gap-3">
                <Button variant="outline" className="border-border bg-transparent">
                  Cancel
                </Button>
                <Button variant="link" className="text-[#3b82f6] p-0">
                  Save & Continue
                </Button>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="outline" className="bg-transparent border-[#3b82f6] text-[#3b82f6] hover:bg-[#3b82f6]/10">
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Previous
                </Button>
                <Button className="bg-[#3b82f6] hover:bg-[#2563eb] text-white">
                  Next Step
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          </div>
    </>
  )
}
