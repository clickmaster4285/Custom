import { useEffect, useState } from "react"
import { BookOpen, Plus } from "lucide-react"
import { ModulePageLayout } from "@/components/dashboard/module-page-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { CUSTOMS_STATIONS } from "@/lib/case-fir-spec"

const STORAGE_KEY = "wms_deposit_account_register"

const DEPOSIT_TYPES = ["Bail", "Security", "Duty", "Detention", "Fine", "Other"] as const
const STATUSES = ["Pending", "Posted", "Reversed"] as const

type DepositRow = {
  id: string
  treasuryChallanNo: string
  depositType: string
  caseSeizureRef: string
  firNo: string
  customsStation: string
  amount: string
  depositDate: string
  bankTreasuryName: string
  status: string
  remarks: string
}

const defaultRows: DepositRow[] = [
  { id: "1", treasuryChallanNo: "TCH-2024-001", depositType: "Bail", caseSeizureRef: "SZ-2024-001", firNo: "FIR-2024-0841", customsStation: "DI Khan", amount: "125,000", depositDate: "2024-02-01", bankTreasuryName: "State Bank Treasury", status: "Posted", remarks: "Bail against release of consignment" },
  { id: "2", treasuryChallanNo: "TCH-2024-002", depositType: "Security", caseSeizureRef: "SZ-2024-002", firNo: "FIR-2024-0842", customsStation: "Customs Peshawar", amount: "50,000", depositDate: "2024-02-03", bankTreasuryName: "National Treasury", status: "Pending", remarks: "" },
  { id: "3", treasuryChallanNo: "TCH-2024-003", depositType: "Duty", caseSeizureRef: "GD-2024-0156", firNo: "", customsStation: "Yarik", amount: "275,000", depositDate: "2024-02-05", bankTreasuryName: "State Bank Treasury", status: "Posted", remarks: "Provisional duty deposit" },
  { id: "4", treasuryChallanNo: "TCH-2024-004", depositType: "Detention", caseSeizureRef: "SZ-2024-003", firNo: "FIR-2024-0845", customsStation: "Mardan", amount: "75,000", depositDate: "2024-02-07", bankTreasuryName: "Customs House Peshawar", status: "Pending", remarks: "Detention charges" },
]

function loadRows(): DepositRow[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch {}
  return defaultRows
}

function saveRows(rows: DepositRow[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(rows))
}

export default function DepositAccountRegisterPage() {
  const [rows, setRows] = useState<DepositRow[]>([])
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({
    treasuryChallanNo: "",
    depositType: "Bail",
    caseSeizureRef: "",
    firNo: "",
    customsStation: "DI Khan",
    amount: "",
    depositDate: new Date().toISOString().slice(0, 10),
    bankTreasuryName: "",
    status: "Pending",
    remarks: "",
  })

  useEffect(() => {
    setRows(loadRows())
  }, [])

  useEffect(() => {
    if (rows.length > 0) saveRows(rows)
  }, [rows])

  const openAdd = () => {
    setForm({
      treasuryChallanNo: "",
      depositType: "Bail",
      caseSeizureRef: "",
      firNo: "",
      customsStation: "DI Khan",
      amount: "",
      depositDate: new Date().toISOString().slice(0, 10),
      bankTreasuryName: "",
      status: "Pending",
      remarks: "",
    })
    setOpen(true)
  }

  const onSave = () => {
    if (!form.treasuryChallanNo.trim() || !form.amount.trim() || !form.depositDate.trim()) return
    const newRow: DepositRow = {
      id: `dep-${Date.now()}`,
      treasuryChallanNo: form.treasuryChallanNo.trim(),
      depositType: form.depositType,
      caseSeizureRef: form.caseSeizureRef.trim(),
      firNo: form.firNo.trim(),
      customsStation: form.customsStation,
      amount: form.amount.trim(),
      depositDate: form.depositDate,
      bankTreasuryName: form.bankTreasuryName.trim(),
      status: form.status,
      remarks: form.remarks.trim(),
    }
    setRows((prev) => [newRow, ...prev])
    setOpen(false)
  }

  return (
    <ModulePageLayout
      title="Deposit Account Register"
      description="Pakistan Customs: Treasury challans, bail, security, duty and detention deposits. Data stored in localStorage."
      breadcrumbs={[{ label: "WMS" }, { label: "Detentions" }, { label: "Deposit Account Register" }]}
    >
      <div className="grid gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 gap-4 flex-wrap">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Deposit Account Register
              </CardTitle>
              <CardDescription>Treasury challans and deposits linked to case/seizure and FIR. Data in localStorage.</CardDescription>
            </div>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 flex-shrink-0" onClick={openAdd}>
              <Plus className="h-4 w-4 mr-2" />
              New Entry
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Treasury Challan No</TableHead>
                  <TableHead>Deposit Type</TableHead>
                  <TableHead>Case/Seizure Ref</TableHead>
                  <TableHead>FIR No</TableHead>
                  <TableHead>Customs Station</TableHead>
                  <TableHead>Average Value</TableHead>
                  <TableHead>Deposit Date</TableHead>
                  <TableHead>Bank/Treasury</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-medium">{row.treasuryChallanNo}</TableCell>
                    <TableCell>{row.depositType}</TableCell>
                    <TableCell>{row.caseSeizureRef || "—"}</TableCell>
                    <TableCell>{row.firNo || "—"}</TableCell>
                    <TableCell>{row.customsStation}</TableCell>
                    <TableCell>{row.amount}</TableCell>
                    <TableCell>{row.depositDate}</TableCell>
                    <TableCell>{row.bankTreasuryName || "—"}</TableCell>
                    <TableCell>
                      <Badge variant={row.status === "Posted" ? "default" : row.status === "Pending" ? "secondary" : "outline"}>
                        {row.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>New Deposit Entry</DialogTitle>
            <p className="text-sm text-muted-foreground">Pakistan Customs deposit account (treasury challan). Stored in localStorage.</p>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Treasury Challan No *</Label>
              <Input value={form.treasuryChallanNo} onChange={(e) => setForm((f) => ({ ...f, treasuryChallanNo: e.target.value }))} placeholder="e.g. TCH-2024-003" />
            </div>
            <div className="grid gap-2">
              <Label>Deposit Type</Label>
              <Select value={form.depositType} onValueChange={(v) => setForm((f) => ({ ...f, depositType: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {DEPOSIT_TYPES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Case / Seizure Reference</Label>
              <Input value={form.caseSeizureRef} onChange={(e) => setForm((f) => ({ ...f, caseSeizureRef: e.target.value }))} placeholder="e.g. SZ-2024-001" />
            </div>
            <div className="grid gap-2">
              <Label>FIR No</Label>
              <Input value={form.firNo} onChange={(e) => setForm((f) => ({ ...f, firNo: e.target.value }))} placeholder="e.g. FIR-2024-0841" />
            </div>
            <div className="grid gap-2">
              <Label>Customs Station</Label>
              <Select value={form.customsStation} onValueChange={(v) => setForm((f) => ({ ...f, customsStation: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CUSTOMS_STATIONS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Amount (PKR) *</Label>
              <Input value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))} placeholder="e.g. 125,000" />
            </div>
            <div className="grid gap-2">
              <Label>Deposit Date *</Label>
              <Input type="date" value={form.depositDate} onChange={(e) => setForm((f) => ({ ...f, depositDate: e.target.value }))} />
            </div>
            <div className="grid gap-2">
              <Label>Bank / Treasury Name</Label>
              <Input value={form.bankTreasuryName} onChange={(e) => setForm((f) => ({ ...f, bankTreasuryName: e.target.value }))} placeholder="e.g. State Bank Treasury" />
            </div>
            <div className="grid gap-2">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm((f) => ({ ...f, status: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Remarks</Label>
              <Input value={form.remarks} onChange={(e) => setForm((f) => ({ ...f, remarks: e.target.value }))} placeholder="Optional" />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={onSave}>Save</Button>
          </div>
        </DialogContent>
      </Dialog>
    </ModulePageLayout>
  )
}
