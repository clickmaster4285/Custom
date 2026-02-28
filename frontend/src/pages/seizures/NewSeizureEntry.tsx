"use client"

import { useState, useEffect } from "react"
import { Plus, ListOrdered } from "lucide-react"
import { ModulePageLayout } from "@/components/dashboard/module-page-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  SEIZURE_REGISTRATION_FLOW,
  SEIZURE_TABLE_COLUMNS,
  type SeizureRegistrationForm,
} from "@/lib/warehouse-module-spec"

const STORAGE_KEY = "seizureEntries"

const emptyForm: SeizureRegistrationForm = {
  seizureReferenceNumber: "",
  caseNumber: "",
  incidentNumber: "",
  seizureDate: "",
  seizureTime: "",
  seizureLocation: "",
  gpsCoordinates: "",
  locationType: "",
  jurisdiction: "",
  customsOfficeCode: "",
  seizureAuthorityType: "",
  legalBasisForSeizure: "",
  courtOrderNumber: "",
  primaryAgency: "",
  leadOfficerName: "",
  leadOfficerBadgeId: "",
  subjectType: "",
  subjectName: "",
  subjectIdPassport: "",
  subjectAddress: "",
  subjectContact: "",
  seizureType: "",
  seizureCategory: "",
  discoveryMethod: "",
  totalNumberOfItems: "",
  totalGrossWeight: "",
  totalEstimatedValue: "",
  currency: "",
  temporaryStorageLocation: "",
  custodianName: "",
  description: "",
  status: "Registered",
}

function getDefaultForm(): SeizureRegistrationForm {
  return { ...emptyForm }
}

type StoredSeizure = SeizureRegistrationForm & { id: string }

export default function NewSeizureEntryPage() {
  const [entries, setEntries] = useState<StoredSeizure[]>([])
  const [showModal, setShowModal] = useState(false)
  const [showFlow, setShowFlow] = useState(false)
  const [formData, setFormData] = useState<SeizureRegistrationForm>(getDefaultForm())

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed)) setEntries(parsed)
      }
    } catch {}
  }, [])

  useEffect(() => {
    if (entries.length > 0) localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
  }, [entries])

  const handleChange = (key: keyof SeizureRegistrationForm, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }))
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const ref = formData.seizureReferenceNumber.trim() ||
      `SZ-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9000 + 1000))}`
    const withRef = { ...formData, seizureReferenceNumber: ref }
    const newEntry: StoredSeizure = { ...withRef, id: `sz-${Date.now()}` }
    setEntries((prev) => [newEntry, ...prev])
    setFormData(getDefaultForm())
    setShowModal(false)
  }

  const requiredForSubmit = formData.seizureLocation.trim() && formData.seizureDate

  return (
    <ModulePageLayout
      title="New Seizure Entry"
      description="Record new seizure cases per Seizure Registration & Intake flow. Authority verification, legal document check, evidence tagging, chain of custody."
      breadcrumbs={[{ label: "WMS" }, { label: "New Seizure Entry" }]}
    >
      <div className="grid gap-6">
        {/* Flow guide (spec) */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <ListOrdered className="h-5 w-5" />
                Standard Seizure Registration Flow
              </CardTitle>
              <CardDescription>Follow this flow: Seizure Event → Authority Verification → Documentation → Chain of Custody → System Registration</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => setShowFlow(!showFlow)}>
              {showFlow ? "Hide" : "Show"} steps
            </Button>
          </CardHeader>
          {showFlow && (
            <CardContent className="pt-0">
              <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                {SEIZURE_REGISTRATION_FLOW.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ol>
            </CardContent>
          )}
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Create Seizure Entry</CardTitle>
              <CardDescription>Enter seizure details per spec. Attach supporting documents where applicable.</CardDescription>
            </div>
            <Button className="bg-[#3b82f6] hover:bg-[#2563eb] text-white" onClick={() => setShowModal(true)}>
              <Plus className="h-4 w-4 mr-2" /> New Entry
            </Button>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Seizure Entries</CardTitle>
            <CardDescription>Latest seizure records (spec-aligned columns)</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  {SEIZURE_TABLE_COLUMNS.map((col) => (
                    <TableHead key={col}>{col}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-medium">{row.seizureReferenceNumber || row.id}</TableCell>
                    <TableCell>{row.caseNumber}</TableCell>
                    <TableCell>{row.seizureDate}</TableCell>
                    <TableCell>{row.seizureTime}</TableCell>
                    <TableCell>{row.seizureLocation}</TableCell>
                    <TableCell>{row.locationType}</TableCell>
                    <TableCell>{row.primaryAgency}</TableCell>
                    <TableCell>{row.subjectName}</TableCell>
                    <TableCell>{row.seizureType}</TableCell>
                    <TableCell>{row.totalNumberOfItems}</TableCell>
                    <TableCell>{row.totalEstimatedValue} {row.currency}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{row.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" className="text-[#3b82f6]">View</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>New Seizure Entry</DialogTitle>
            <CardDescription>Seizure Registration & Intake – authority verification, legal document check, evidence tagging.</CardDescription>
          </DialogHeader>
          <form onSubmit={handleFormSubmit} className="grid gap-4 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Seizure Reference Number</Label>
                <Input
                  placeholder="Auto if empty"
                  value={formData.seizureReferenceNumber}
                  onChange={(e) => handleChange("seizureReferenceNumber", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Case Number</Label>
                <Input
                  value={formData.caseNumber}
                  onChange={(e) => handleChange("caseNumber", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Seizure Date *</Label>
                <Input
                  type="date"
                  value={formData.seizureDate}
                  onChange={(e) => handleChange("seizureDate", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Seizure Time</Label>
                <Input
                  type="time"
                  value={formData.seizureTime}
                  onChange={(e) => handleChange("seizureTime", e.target.value)}
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Seizure Location / Address *</Label>
                <Input
                  placeholder="Location/Address"
                  value={formData.seizureLocation}
                  onChange={(e) => handleChange("seizureLocation", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>GPS Coordinates</Label>
                <Input
                  value={formData.gpsCoordinates}
                  onChange={(e) => handleChange("gpsCoordinates", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Location Type</Label>
                <Select value={formData.locationType} onValueChange={(v) => handleChange("locationType", v)}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    {["Port", "Airport", "Land Border", "Warehouse", "Premises", "Vehicle", "Other"].map((o) => (
                      <SelectItem key={o} value={o}>{o}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Primary Agency</Label>
                <Input
                  value={formData.primaryAgency}
                  onChange={(e) => handleChange("primaryAgency", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Lead Officer Name</Label>
                <Input
                  value={formData.leadOfficerName}
                  onChange={(e) => handleChange("leadOfficerName", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Lead Officer Badge/ID</Label>
                <Input
                  value={formData.leadOfficerBadgeId}
                  onChange={(e) => handleChange("leadOfficerBadgeId", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Subject Type</Label>
                <Select value={formData.subjectType} onValueChange={(v) => handleChange("subjectType", v)}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Individual">Individual</SelectItem>
                    <SelectItem value="Company">Company</SelectItem>
                    <SelectItem value="Unknown">Unknown</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Subject Name / Company</Label>
                <Input
                  value={formData.subjectName}
                  onChange={(e) => handleChange("subjectName", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Subject ID/Passport</Label>
                <Input
                  value={formData.subjectIdPassport}
                  onChange={(e) => handleChange("subjectIdPassport", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Seizure Type</Label>
                <Select value={formData.seizureType} onValueChange={(v) => handleChange("seizureType", v)}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    {["Contraband", "Prohibited Goods", "Smuggled Goods", "Undeclared Goods", "Counterfeit", "Tax Evasion", "Other"].map((o) => (
                      <SelectItem key={o} value={o}>{o}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Seizure Category</Label>
                <Select value={formData.seizureCategory} onValueChange={(v) => handleChange("seizureCategory", v)}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Import">Import</SelectItem>
                    <SelectItem value="Export">Export</SelectItem>
                    <SelectItem value="Transit">Transit</SelectItem>
                    <SelectItem value="Domestic">Domestic</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Discovery Method</Label>
                <Select value={formData.discoveryMethod} onValueChange={(v) => handleChange("discoveryMethod", v)}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    {["X-ray", "Physical Examination", "K9 Unit", "Intelligence", "Random Check", "Tip-off", "Surveillance"].map((o) => (
                      <SelectItem key={o} value={o}>{o}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Total Number of Items</Label>
                <Input
                  type="number"
                  value={formData.totalNumberOfItems}
                  onChange={(e) => handleChange("totalNumberOfItems", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Total Gross Weight (kg)</Label>
                <Input
                  value={formData.totalGrossWeight}
                  onChange={(e) => handleChange("totalGrossWeight", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Total Estimated Value</Label>
                <Input
                  value={formData.totalEstimatedValue}
                  onChange={(e) => handleChange("totalEstimatedValue", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Currency</Label>
                <Input
                  placeholder="e.g. USD, PKR"
                  value={formData.currency}
                  onChange={(e) => handleChange("currency", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Temporary Storage Location</Label>
                <Input
                  value={formData.temporaryStorageLocation}
                  onChange={(e) => handleChange("temporaryStorageLocation", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Custodian Name</Label>
                <Input
                  value={formData.custodianName}
                  onChange={(e) => handleChange("custodianName", e.target.value)}
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Description / Remarks</Label>
                <Input
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={formData.status} onValueChange={(v) => handleChange("status", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Registered">Registered</SelectItem>
                    <SelectItem value="Under Investigation">Under Investigation</SelectItem>
                    <SelectItem value="Pending Court">Pending Court</SelectItem>
                    <SelectItem value="Concluded">Concluded</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white" disabled={!requiredForSubmit}>
                Save Entry
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </ModulePageLayout>
  )
}
