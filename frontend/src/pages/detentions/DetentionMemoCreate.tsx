import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { ArrowLeft, ChevronDown, Plus, Trash2 } from "lucide-react"
import { ModulePageLayout } from "@/components/dashboard/module-page-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ROUTES } from "@/routes/config"
import { CUSTOMS_STATIONS } from "@/lib/case-fir-spec"

const STORAGE_KEY = "wms_detention_memo"

const DETENTION_TYPES = ["Claimed", "Un-Claimed"] as const
const REASONS = [
  "Inability to pay duty and taxes",
  "Pending clearance from Customs",
  "Pending Examination",
  "Pending Departure",
  "Unclaimed",
  "Others",
] as const
const WAREHOUSES = [
  "State Warehouse, Kohat Tunnel",
  "State Warehouse, Bannu",
  "State Warehouse, Salt House, Kohat",
  "State Warehouse, D.I Khan",
] as const
/** Radix Select does not allow value=""; use this for placeholder and treat as empty when saving */
const SELECT_WAREHOUSE_PLACEHOLDER = "__select_warehouse__"
const DIRECTORATES = ["MCC D.I Khan AFU Import", "MCC Peshawar", "MCC Karachi", "MCC Lahore"] as const
const GOODS_CONDITIONS = ["Seized", "Detained", "Under Examination", "Pending Clearance", "Unclaimed"] as const
const GOODS_UNITS = ["PCS", "KGS", "LTR", "MTR", "CTN", "BOX", "BAG", "DOZ", "SET", "Other"] as const

/** Unique QR code format: QR-DM-{timestamp}-{random} */
function generateUniqueQrCodeNumber(): string {
  return `QR-DM-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`
}

export type GoodsLineItem = {
  id: string
  qrCodeNumber: string
  description: string
  pctCode: string
  quantity: string
  unit: string
  condition: string
  assessableValuePkr: string
  identificationRef: string
  itemNotes: string
}

const emptyGoodsItem = (): GoodsLineItem => ({
  id: `gi-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
  qrCodeNumber: generateUniqueQrCodeNumber(),
  description: "",
  pctCode: "",
  quantity: "",
  unit: "PCS",
  condition: "Seized",
  assessableValuePkr: "",
  identificationRef: "",
  itemNotes: "",
})

export default function DetentionMemoCreatePage() {
  const navigate = useNavigate()
  const [caseNo, setCaseNo] = useState("")
  const [dateTimeOccurrence, setDateTimeOccurrence] = useState(() => {
    const d = new Date()
    return d.toISOString().slice(0, 16).replace("T", " ")
  })
  const [placeOfOccurrence, setPlaceOfOccurrence] = useState("")
  const [dateTimeDetention, setDateTimeDetention] = useState(() => {
    const d = new Date()
    return d.toISOString().slice(0, 16).replace("T", " ")
  })
  const [placeOfDetention, setPlaceOfDetention] = useState("D.I.Khan")
  const [detentionType, setDetentionType] = useState("")
  const [referenceNumber, setReferenceNumber] = useState("")
  const [firNumber, setFirNumber] = useState("")
  const [directorate, setDirectorate] = useState("MCC D.I Khan AFU Import")
  const [reasonForDetention, setReasonForDetention] = useState("")
  const [locationOfDetention, setLocationOfDetention] = useState("")
  const [gdNumber, setGdNumber] = useState("")
  const [whereDeposited, setWhereDeposited] = useState(SELECT_WAREHOUSE_PLACEHOLDER)
  const [searchChassisNumber, setSearchChassisNumber] = useState("")
  const [receiptOfficer, setReceiptOfficer] = useState("")
  const [settlementStatus, setSettlementStatus] = useState("")
  const [gdNumber2, setGdNumber2] = useState("")
  const [verificationStatus, setVerificationStatus] = useState("")
  const [briefFacts, setBriefFacts] = useState("")
  const [forwardingOfficerRemarks, setForwardingOfficerRemarks] = useState("")
  const [accusedName, setAccusedName] = useState("")
  const [accusedCnic, setAccusedCnic] = useState("")
  const [accusedAddress, setAccusedAddress] = useState("")
  const [goodsItems, setGoodsItems] = useState<GoodsLineItem[]>([])
  const [seizingOfficerNotes, setSeizingOfficerNotes] = useState("")
  const [examiningOfficerNotes, setExaminingOfficerNotes] = useState("")
  const [detentionNotes, setDetentionNotes] = useState("")

  const addGoodsLine = () => setGoodsItems((prev) => [...prev, emptyGoodsItem()])
  const removeGoodsLine = (id: string) => setGoodsItems((prev) => prev.filter((i) => i.id !== id))
  const updateGoodsLine = (id: string, field: keyof GoodsLineItem, value: string) => {
    setGoodsItems((prev) => prev.map((i) => (i.id === id ? { ...i, [field]: value } : i)))
  }

  const handleSave = () => {
    const row = {
      id: `dm-${Date.now()}`,
      caseNo: caseNo || `DM-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`,
      referenceNumber,
      firNumber,
      dateTimeOccurrence,
      placeOfOccurrence,
      dateTimeDetention,
      placeOfDetention,
      detentionType,
      directorate,
      reasonForDetention,
      whereDeposited: whereDeposited === SELECT_WAREHOUSE_PLACEHOLDER ? "" : whereDeposited,
      settlementStatus,
      verificationStatus,
      briefFacts,
      forwardingOfficerRemarks,
      accusedName,
      accusedCnic,
      accusedAddress,
      goodsItems,
      seizingOfficerNotes,
      examiningOfficerNotes,
      detentionNotes,
      createdAt: new Date().toISOString().slice(0, 10),
      updatedAt: new Date().toISOString().slice(0, 10),
    }
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      const list = raw ? JSON.parse(raw) : []
      if (!Array.isArray(list)) throw new Error()
      list.unshift(row)
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
    } catch {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify([row]))
    }
    navigate(ROUTES.DETENTION_MEMO)
  }

  const handleSubmit = () => {
    handleSave()
  }

  return (
    <ModulePageLayout
      title="Detention Memo / Create"
      description="Add a new detention memo (prepared after the detention). All fields as per Pakistan Customs detention memo. Data stored in localStorage."
      breadcrumbs={[
        { label: "WMS" },
        { label: "Detentions" },
        { label: "Detention Memo", href: ROUTES.DETENTION_MEMO },
        { label: "Create" },
      ]}
    >
      {/* Full-screen form container: uses full layout width and scrollable height */}
      <div className="w-full min-h-[calc(100vh-12rem)] overflow-y-auto">
        <div className="mb-4 flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link to={ROUTES.DETENTION_MEMO}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to list
            </Link>
          </Button>
        </div>
        <p className="mb-4 text-sm text-muted-foreground rounded-md bg-muted/60 px-3 py-2 border border-border/50">
          This detention memo is prepared <strong>after</strong> the detention. Record all details of the detention event and goods for customs record.
        </p>

        <div className="space-y-4 w-full">
          {/* Basic Information */}
          <Collapsible defaultOpen>
            <Card>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer flex flex-row items-center justify-between hover:bg-muted/50 rounded-t-lg">
                  <CardTitle className="text-base">Basic Information</CardTitle>
                  <ChevronDown className="h-4 w-4 shrink-0" />
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="pt-0 grid gap-4 md:grid-cols-2">
                  <div className="grid gap-2">
                    <Label>Case No.</Label>
                    <Input value={caseNo} onChange={(e) => setCaseNo(e.target.value)} placeholder="e.g. DM-2024-001" />
                  </div>
                  <div className="grid gap-2">
                    <Label>Reference Number</Label>
                    <Input value={referenceNumber} onChange={(e) => setReferenceNumber(e.target.value)} placeholder="Reference No" />
                  </div>
                  <div className="grid gap-2">
                    <Label>FIR Number</Label>
                    <Input value={firNumber} onChange={(e) => setFirNumber(e.target.value)} placeholder="e.g. FIR-2024-001 (user may enter)" />
                  </div>
                  <div className="grid gap-2">
                    <Label>Date/Time of occurrence</Label>
                    <Input
                      type="datetime-local"
                      value={dateTimeOccurrence.replace(" ", "T")}
                      onChange={(e) => setDateTimeOccurrence(e.target.value.replace("T", " "))}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Place of occurrence</Label>
                    <Input value={placeOfOccurrence} onChange={(e) => setPlaceOfOccurrence(e.target.value)} placeholder="Place of occurrence" />
                  </div>
                  <div className="grid gap-2">
                    <Label>Date/time of detention</Label>
                    <Input
                      type="datetime-local"
                      value={dateTimeDetention.replace(" ", "T")}
                      onChange={(e) => setDateTimeDetention(e.target.value.replace("T", " "))}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Place of detention</Label>
                    <Select value={placeOfDetention} onValueChange={setPlaceOfDetention}>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        {CUSTOMS_STATIONS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                        <SelectItem value="D.I.Khan">D.I.Khan</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Detention Type</Label>
                    <Select value={detentionType} onValueChange={setDetentionType}>
                      <SelectTrigger><SelectValue placeholder="Select Detention Type" /></SelectTrigger>
                      <SelectContent>
                        {DETENTION_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          {/* Accused Person Details */}
          <Collapsible>
            <Card>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer flex flex-row items-center justify-between hover:bg-muted/50 rounded-t-lg">
                  <CardTitle className="text-base">Accused Person Details</CardTitle>
                  <ChevronDown className="h-4 w-4 shrink-0" />
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="pt-0 grid gap-4 md:grid-cols-2">
                  <div className="grid gap-2">
                    <Label>Accused Name</Label>
                    <Input value={accusedName} onChange={(e) => setAccusedName(e.target.value)} placeholder="Name" />
                  </div>
                  <div className="grid gap-2">
                    <Label>CNIC</Label>
                    <Input value={accusedCnic} onChange={(e) => setAccusedCnic(e.target.value)} placeholder="CNIC" />
                  </div>
                  <div className="grid gap-2 md:col-span-2">
                    <Label>Address</Label>
                    <Input value={accusedAddress} onChange={(e) => setAccusedAddress(e.target.value)} placeholder="Address" />
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          {/* Detention Information */}
          <Collapsible defaultOpen>
            <Card>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer flex flex-row items-center justify-between hover:bg-muted/50 rounded-t-lg">
                  <CardTitle className="text-base">Detention Information</CardTitle>
                  <ChevronDown className="h-4 w-4 shrink-0" />
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="pt-0 grid gap-4 md:grid-cols-2">
                  <div className="grid gap-2">
                    <Label>Directorate *</Label>
                    <Select value={directorate} onValueChange={setDirectorate}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {DIRECTORATES.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Reason for detention *</Label>
                    <Select value={reasonForDetention} onValueChange={setReasonForDetention}>
                      <SelectTrigger><SelectValue placeholder="Select Reason" /></SelectTrigger>
                      <SelectContent>
                        {REASONS.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Location of Detention</Label>
                    <Select value={locationOfDetention} onValueChange={setLocationOfDetention}>
                      <SelectTrigger><SelectValue placeholder="Select Detention Location" /></SelectTrigger>
                      <SelectContent>
                        {CUSTOMS_STATIONS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>GD Number</Label>
                    <div className="flex gap-2">
                      <Input value={gdNumber} onChange={(e) => setGdNumber(e.target.value)} placeholder="GD Number" />
                      <Button type="button" variant="outline" size="sm">View</Button>
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label>Where detained goods deposited</Label>
                    <Select value={whereDeposited} onValueChange={setWhereDeposited}>
                      <SelectTrigger><SelectValue placeholder="Select Warehouse" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value={SELECT_WAREHOUSE_PLACEHOLDER}>Select Warehouse</SelectItem>
                        {WAREHOUSES.map((w) => <SelectItem key={w} value={w}>{w}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Search Chassis Number</Label>
                    <div className="flex gap-2">
                      <Input value={searchChassisNumber} onChange={(e) => setSearchChassisNumber(e.target.value)} placeholder="Chassis No" />
                      <Button type="button" variant="outline" size="sm">Search</Button>
                    </div>
                  </div>
                  <div className="grid gap-2 md:col-span-2">
                    <Label>Receipt Officer receiving Detained Goods in deposit *</Label>
                    <Input value={receiptOfficer} onChange={(e) => setReceiptOfficer(e.target.value)} placeholder="Officer name" />
                  </div>
                  <div className="grid gap-2">
                    <Label>Settlement Status</Label>
                    <RadioGroup value={settlementStatus} onValueChange={setSettlementStatus} className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <RadioGroupItem value="Fully Settled" />
                        <span>Fully Settled</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <RadioGroupItem value="Partial Settled" />
                        <span>Partial Settled</span>
                      </label>
                    </RadioGroup>
                  </div>
                  <div className="grid gap-2">
                    <Label>GD Number</Label>
                    <div className="flex gap-2">
                      <Input value={gdNumber2} onChange={(e) => setGdNumber2(e.target.value)} placeholder="GD Number" />
                      <Button type="button" variant="outline" size="sm">View</Button>
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label>Verification Status</Label>
                    <RadioGroup value={verificationStatus} onValueChange={setVerificationStatus} className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <RadioGroupItem value="Verified" />
                        <span>Verified</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <RadioGroupItem value="Not Verified" />
                        <span>Not Verified</span>
                      </label>
                    </RadioGroup>
                  </div>
                  <div className="grid gap-2 md:col-span-2">
                    <Label>Brief Facts *</Label>
                    <Textarea value={briefFacts} onChange={(e) => setBriefFacts(e.target.value)} placeholder="Brief facts of detention" rows={4} />
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          {/* Goods Information — seized/detained inventory */}
          <Collapsible defaultOpen>
            <Card>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer flex flex-row items-center justify-between hover:bg-muted/50 rounded-t-lg">
                  <CardTitle className="text-base">Goods Information</CardTitle>
                  <ChevronDown className="h-4 w-4 shrink-0" />
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="pt-0">
                  <p className="text-sm text-muted-foreground mb-4">
                    List of seized/detained goods where customs status is unclear. Add line items with description, PCT, quantity and officer notes.
                  </p>
                  <div className="overflow-auto max-w-full">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[140px]">QR Code No</TableHead>
                          <TableHead className="min-w-[160px]">Description of Goods *</TableHead>
                          <TableHead className="w-[90px]">PCT Code</TableHead>
                          <TableHead className="w-[80px]">Qty</TableHead>
                          <TableHead className="w-[70px]">Unit</TableHead>
                          <TableHead className="w-[120px]">Condition</TableHead>
                          <TableHead className="w-[110px]">Assessable Value (PKR)</TableHead>
                          <TableHead className="min-w-[100px]">ID / Chassis No.</TableHead>
                          <TableHead className="min-w-[140px]">Item Notes</TableHead>
                          <TableHead className="w-[44px]"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {goodsItems.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={10} className="text-muted-foreground text-center py-6">
                              No goods added. Click &quot;Add line&quot; to add seized/detained items.
                            </TableCell>
                          </TableRow>
                        ) : (
                          goodsItems.map((item) => (
                            <TableRow key={item.id}>
                              <TableCell className="font-mono text-xs align-middle whitespace-nowrap" title={item.qrCodeNumber}>
                                {item.qrCodeNumber}
                              </TableCell>
                              <TableCell>
                                <Input
                                  value={item.description}
                                  onChange={(e) => updateGoodsLine(item.id, "description", e.target.value)}
                                  placeholder="Description of goods"
                                  className="min-w-[140px]"
                                />
                              </TableCell>
                              <TableCell>
                                <Input
                                  value={item.pctCode}
                                  onChange={(e) => updateGoodsLine(item.id, "pctCode", e.target.value)}
                                  placeholder="e.g. 8471"
                                />
                              </TableCell>
                              <TableCell>
                                <Input
                                  type="text"
                                  inputMode="numeric"
                                  value={item.quantity}
                                  onChange={(e) => updateGoodsLine(item.id, "quantity", e.target.value)}
                                  placeholder="Qty"
                                />
                              </TableCell>
                              <TableCell>
                                <Select value={item.unit} onValueChange={(v) => updateGoodsLine(item.id, "unit", v)}>
                                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                                  <SelectContent>
                                    {GOODS_UNITS.map((u) => (
                                      <SelectItem key={u} value={u}>{u}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </TableCell>
                              <TableCell>
                                <Select value={item.condition} onValueChange={(v) => updateGoodsLine(item.id, "condition", v)}>
                                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                                  <SelectContent>
                                    {GOODS_CONDITIONS.map((c) => (
                                      <SelectItem key={c} value={c}>{c}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </TableCell>
                              <TableCell>
                                <Input
                                  value={item.assessableValuePkr}
                                  onChange={(e) => updateGoodsLine(item.id, "assessableValuePkr", e.target.value)}
                                  placeholder="PKR"
                                />
                              </TableCell>
                              <TableCell>
                                <Input
                                  value={item.identificationRef}
                                  onChange={(e) => updateGoodsLine(item.id, "identificationRef", e.target.value)}
                                  placeholder="Chassis / Serial"
                                />
                              </TableCell>
                              <TableCell>
                                <Input
                                  value={item.itemNotes}
                                  onChange={(e) => updateGoodsLine(item.id, "itemNotes", e.target.value)}
                                  placeholder="Officer notes for this item"
                                />
                              </TableCell>
                              <TableCell>
                                <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => removeGoodsLine(item.id)} aria-label="Remove line">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                  <Button type="button" variant="outline" size="sm" className="mt-3" onClick={addGoodsLine}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add line
                  </Button>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          {/* Upload Documents */}
          <Collapsible>
            <Card>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer flex flex-row items-center justify-between hover:bg-muted/50 rounded-t-lg">
                  <CardTitle className="text-base">Upload Documents</CardTitle>
                  <ChevronDown className="h-4 w-4 shrink-0" />
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="pt-0">
                  <Input type="file" multiple className="max-w-md" />
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          {/* Upload Videos */}
          <Collapsible>
            <Card>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer flex flex-row items-center justify-between hover:bg-muted/50 rounded-t-lg">
                  <CardTitle className="text-base">Upload Videos</CardTitle>
                  <ChevronDown className="h-4 w-4 shrink-0" />
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="pt-0">
                  <Input type="file" accept="video/*" multiple className="max-w-md" />
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          {/* Officer Details */}
          <Collapsible>
            <Card>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer flex flex-row items-center justify-between hover:bg-muted/50 rounded-t-lg">
                  <CardTitle className="text-base">Officer Details directly Assisting in Detention</CardTitle>
                  <ChevronDown className="h-4 w-4 shrink-0" />
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="pt-0">
                  <p className="text-sm text-muted-foreground">Officer name, badge, role.</p>
                  <Input className="mt-2 max-w-md" placeholder="Officer name" />
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          {/* Remarks & notes for customs officers */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Remarks & Notes</CardTitle>
              <p className="text-sm text-muted-foreground font-normal">
                Officer notes for seizure/detention. All fields are saved with the memo in localStorage.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label>Seizing Officer Notes *</Label>
                <Textarea
                  value={seizingOfficerNotes}
                  onChange={(e) => setSeizingOfficerNotes(e.target.value)}
                  placeholder="Reason for seizure, observations at scene, grounds for detention (e.g. documents not clear, duty unpaid, misdeclaration)."
                  rows={3}
                />
              </div>
              <div className="grid gap-2">
                <Label>Examining Officer Notes</Label>
                <Textarea
                  value={examiningOfficerNotes}
                  onChange={(e) => setExaminingOfficerNotes(e.target.value)}
                  placeholder="Examination findings, condition of goods, quantity/description verification."
                  rows={3}
                />
              </div>
              <div className="grid gap-2">
                <Label>Detention / Customs Clarification Notes</Label>
                <Textarea
                  value={detentionNotes}
                  onChange={(e) => setDetentionNotes(e.target.value)}
                  placeholder="Additional notes on why customs is not clear (e.g. pending lab test, valuation dispute, legal hold)."
                  rows={2}
                />
              </div>
              <div className="grid gap-2">
                <Label>Forwarding Officer Remarks *</Label>
                <Textarea
                  value={forwardingOfficerRemarks}
                  onChange={(e) => setForwardingOfficerRemarks(e.target.value)}
                  placeholder="Remarks by forwarding officer; recommendation or next steps."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex flex-wrap gap-2 pb-8">
            <Button onClick={handleSave}>Save</Button>
            <Button onClick={handleSubmit}>Submit</Button>
            <Button variant="outline" asChild>
              <Link to={ROUTES.DETENTION_MEMO}>Cancel</Link>
            </Button>
          </div>
        </div>
      </div>
    </ModulePageLayout>
  )
}
