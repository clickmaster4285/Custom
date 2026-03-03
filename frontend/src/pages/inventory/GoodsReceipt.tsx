import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { Package, Plus, Eye } from "lucide-react"
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
import { getGoodsReceiptDetailPath } from "@/routes/config"

const STORAGE_KEY = "wms_goods_receipt"

const STATUSES = ["Pending", "Received", "Under Examination", "Examined", "Rejected"] as const

type GoodsReceiptRow = {
  id: string
  grNo: string
  gdNo: string
  customsStation: string
  portOfEntry: string
  caseSeizureRef: string
  consigneeImporterName: string
  pctCode: string
  descriptionOfGoods: string
  quantity: string
  unit: string
  receiptDate: string
  godownWarehouse: string
  examiningOfficerName: string
  status: string
}

const defaultRows: GoodsReceiptRow[] = [
  { id: "1", grNo: "GR-2024-001", gdNo: "GD-2024-001", customsStation: "Customs Karachi", portOfEntry: "Port Qasim", caseSeizureRef: "SZ-2024-001", consigneeImporterName: "ABC Imports (Pvt) Ltd", pctCode: "8471", descriptionOfGoods: "Laptops, notebooks & parts", quantity: "500", unit: "PCS", receiptDate: "2024-02-01", godownWarehouse: "Bonded Godown A", examiningOfficerName: "Inspector M. Khan", status: "Examined" },
  { id: "2", grNo: "GR-2024-002", gdNo: "GD-2024-002", customsStation: "Customs Peshawar", portOfEntry: "Torkham", caseSeizureRef: "SZ-2024-002", consigneeImporterName: "XYZ Trading Co", pctCode: "6109", descriptionOfGoods: "T-shirts, knitted, cotton", quantity: "2000", unit: "PCS", receiptDate: "2024-02-03", godownWarehouse: "Transit Shed B", examiningOfficerName: "ASI Ahmed Raza", status: "Pending" },
  { id: "3", grNo: "GR-2024-003", gdNo: "GD-2024-003", customsStation: "Customs Port Qasim", portOfEntry: "Port Qasim", caseSeizureRef: "", consigneeImporterName: "Faisal Impex", pctCode: "3004", descriptionOfGoods: "Medicaments, mixed", quantity: "120", unit: "KGS", receiptDate: "2024-02-05", godownWarehouse: "Bonded Godown C", examiningOfficerName: "Inspector S. Ali", status: "Received" },
]

function loadRows(): GoodsReceiptRow[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch {}
  return defaultRows
}

function saveRows(rows: GoodsReceiptRow[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(rows))
}

const UNITS = ["PCS", "KGS", "LTR", "MTR", "CTN", "BOX", "BAG", "DOZ", "SET", "Other"] as const

export default function GoodsReceiptPage() {
  const [rows, setRows] = useState<GoodsReceiptRow[]>([])
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({
    grNo: "",
    gdNo: "",
    customsStation: "Customs Karachi",
    portOfEntry: "",
    caseSeizureRef: "",
    consigneeImporterName: "",
    pctCode: "",
    descriptionOfGoods: "",
    quantity: "",
    unit: "PCS",
    receiptDate: new Date().toISOString().slice(0, 10),
    godownWarehouse: "",
    examiningOfficerName: "",
    status: "Pending",
  })

  useEffect(() => {
    setRows(loadRows())
  }, [])

  useEffect(() => {
    if (rows.length > 0) saveRows(rows)
  }, [rows])

  const openAdd = () => {
    setForm({
      grNo: "",
      gdNo: "",
      customsStation: "Customs Karachi",
      portOfEntry: "",
      caseSeizureRef: "",
      consigneeImporterName: "",
      pctCode: "",
      descriptionOfGoods: "",
      quantity: "",
      unit: "PCS",
      receiptDate: new Date().toISOString().slice(0, 10),
      godownWarehouse: "",
      examiningOfficerName: "",
      status: "Pending",
    })
    setOpen(true)
  }

  const onSave = () => {
    if (!form.grNo.trim() || !form.receiptDate.trim()) return
    const newRow: GoodsReceiptRow = {
      id: `gr-${Date.now()}`,
      grNo: form.grNo.trim(),
      gdNo: form.gdNo.trim(),
      customsStation: form.customsStation,
      portOfEntry: form.portOfEntry.trim(),
      caseSeizureRef: form.caseSeizureRef.trim(),
      consigneeImporterName: form.consigneeImporterName.trim(),
      pctCode: form.pctCode.trim(),
      descriptionOfGoods: form.descriptionOfGoods.trim(),
      quantity: form.quantity.trim(),
      unit: form.unit,
      receiptDate: form.receiptDate,
      godownWarehouse: form.godownWarehouse.trim(),
      examiningOfficerName: form.examiningOfficerName.trim(),
      status: form.status,
    }
    setRows((prev) => [newRow, ...prev])
    setOpen(false)
  }

  return (
    <ModulePageLayout
      title="Goods Receipt"
      description="Pakistan Customs: GR (Goods Receipt) and GD (Goods Declaration) linked receipts. PCT code, examination and godown. Data stored in localStorage."
      breadcrumbs={[{ label: "WMS" }, { label: "Inventory Management" }, { label: "Goods Receipt" }]}
    >
      <div className="grid gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 gap-4 flex-wrap">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Goods Receipt
              </CardTitle>
              <CardDescription>Incoming goods by GR/GD, customs station, PCT and examining officer. Data in localStorage.</CardDescription>
            </div>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 flex-shrink-0" onClick={openAdd}>
              <Plus className="h-4 w-4 mr-2" />
              New Receipt
            </Button>
          </CardHeader>
          <CardContent className="overflow-hidden">
            <div className="overflow-auto max-h-[60vh] w-full">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>GR No</TableHead>
                  <TableHead>GD No</TableHead>
                  <TableHead>Customs Station</TableHead>
                  <TableHead>Port of Entry</TableHead>
                  <TableHead>Case/Seizure Ref</TableHead>
                  <TableHead>Consignee/Importer</TableHead>
                  <TableHead>PCT Code</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead>Receipt Date</TableHead>
                  <TableHead>Godown/Warehouse</TableHead>
                  <TableHead>Examining Officer</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-medium">{row.grNo}</TableCell>
                    <TableCell>{row.gdNo || "—"}</TableCell>
                    <TableCell>{row.customsStation}</TableCell>
                    <TableCell>{row.portOfEntry || "—"}</TableCell>
                    <TableCell>{row.caseSeizureRef || "—"}</TableCell>
                    <TableCell>{row.consigneeImporterName || "—"}</TableCell>
                    <TableCell className="font-mono">{row.pctCode || "—"}</TableCell>
                    <TableCell className="max-w-[180px] truncate">{row.descriptionOfGoods || "—"}</TableCell>
                    <TableCell>{row.quantity}</TableCell>
                    <TableCell>{row.unit}</TableCell>
                    <TableCell>{row.receiptDate}</TableCell>
                    <TableCell>{row.godownWarehouse || "—"}</TableCell>
                    <TableCell>{row.examiningOfficerName || "—"}</TableCell>
                    <TableCell>
                      <Badge variant={row.status === "Examined" ? "default" : row.status === "Pending" ? "secondary" : "outline"}>
                        {row.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" asChild>
                        <Link to={getGoodsReceiptDetailPath(row.id)}>
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>New Goods Receipt</DialogTitle>
            <p className="text-sm text-muted-foreground">Pakistan Customs GR/GD. Stored in localStorage.</p>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>GR No (Goods Receipt) *</Label>
              <Input value={form.grNo} onChange={(e) => setForm((f) => ({ ...f, grNo: e.target.value }))} placeholder="e.g. GR-2024-003" />
            </div>
            <div className="grid gap-2">
              <Label>GD No (Goods Declaration)</Label>
              <Input value={form.gdNo} onChange={(e) => setForm((f) => ({ ...f, gdNo: e.target.value }))} placeholder="e.g. GD-2024-003" />
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
              <Label>Port of Entry</Label>
              <Input value={form.portOfEntry} onChange={(e) => setForm((f) => ({ ...f, portOfEntry: e.target.value }))} placeholder="e.g. Port Qasim, Torkham" />
            </div>
            <div className="grid gap-2">
              <Label>Case / Seizure Reference</Label>
              <Input value={form.caseSeizureRef} onChange={(e) => setForm((f) => ({ ...f, caseSeizureRef: e.target.value }))} placeholder="e.g. SZ-2024-001" />
            </div>
            <div className="grid gap-2">
              <Label>Consignee / Importer Name</Label>
              <Input value={form.consigneeImporterName} onChange={(e) => setForm((f) => ({ ...f, consigneeImporterName: e.target.value }))} placeholder="Importer or consignee" />
            </div>
            <div className="grid gap-2">
              <Label>PCT Code (Pakistan Customs Tariff)</Label>
              <Input value={form.pctCode} onChange={(e) => setForm((f) => ({ ...f, pctCode: e.target.value }))} placeholder="e.g. 8471, 6109" />
            </div>
            <div className="grid gap-2">
              <Label>Description of Goods</Label>
              <Input value={form.descriptionOfGoods} onChange={(e) => setForm((f) => ({ ...f, descriptionOfGoods: e.target.value }))} placeholder="Description" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="grid gap-2">
                <Label>Quantity</Label>
                <Input value={form.quantity} onChange={(e) => setForm((f) => ({ ...f, quantity: e.target.value }))} placeholder="e.g. 500" />
              </div>
              <div className="grid gap-2">
                <Label>Unit</Label>
                <Select value={form.unit} onValueChange={(v) => setForm((f) => ({ ...f, unit: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {UNITS.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Receipt Date *</Label>
              <Input type="date" value={form.receiptDate} onChange={(e) => setForm((f) => ({ ...f, receiptDate: e.target.value }))} />
            </div>
            <div className="grid gap-2">
              <Label>Godown / Warehouse</Label>
              <Input value={form.godownWarehouse} onChange={(e) => setForm((f) => ({ ...f, godownWarehouse: e.target.value }))} placeholder="e.g. Bonded Godown A" />
            </div>
            <div className="grid gap-2">
              <Label>Examining Officer Name</Label>
              <Input value={form.examiningOfficerName} onChange={(e) => setForm((f) => ({ ...f, examiningOfficerName: e.target.value }))} placeholder="Officer name or badge" />
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
