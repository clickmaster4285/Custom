import { useEffect, useState } from "react"
import { Package, CheckCircle, Clock, AlertCircle, Plus } from "lucide-react"
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

const STORAGE_KEY = "wms_storage_allocations"

type AllocationRow = {
  id: string
  ref: string
  sku: string
  product: string
  qty: number
  wh: string
  priority: string
}

const defaultRows: AllocationRow[] = [
  { id: "1", ref: "ALC-2024-0841", sku: "SKU-7821", product: "Electronics - Category A", qty: 120, wh: "WH-001", priority: "High" },
  { id: "2", ref: "ALC-2024-0842", sku: "SKU-9103", product: "Textiles - Bulk", qty: 500, wh: "WH-001", priority: "Normal" },
  { id: "3", ref: "ALC-2024-0843", sku: "SKU-4452", product: "Pharma - Temp Control", qty: 80, wh: "WH-005", priority: "High" },
  { id: "4", ref: "ALC-2024-0844", sku: "SKU-2298", product: "General Merchandise", qty: 200, wh: "WH-002", priority: "Normal" },
]

function loadRows(): AllocationRow[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch {}
  return defaultRows
}

function saveRows(rows: AllocationRow[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(rows))
}

export default function StorageAllocationPage() {
  const [rows, setRows] = useState<AllocationRow[]>([])
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ ref: "", sku: "", product: "", qty: 0, wh: "WH-001", priority: "Normal" })

  useEffect(() => {
    setRows(loadRows())
  }, [])

  useEffect(() => {
    if (rows.length > 0) saveRows(rows)
  }, [rows])

  const openAdd = () => {
    setForm({ ref: "", sku: "", product: "", qty: 0, wh: "WH-001", priority: "Normal" })
    setOpen(true)
  }

  const onSave = () => {
    if (!form.ref.trim() || !form.sku.trim() || !form.product.trim()) return
    const newRow: AllocationRow = {
      id: `alc-${Date.now()}`,
      ref: form.ref.trim(),
      sku: form.sku.trim(),
      product: form.product.trim(),
      qty: form.qty || 0,
      wh: form.wh,
      priority: form.priority,
    }
    setRows((prev) => [newRow, ...prev])
    setOpen(false)
  }

  const pending = rows.length
  const allocated = 0
  const reserved = 0
  const overflows = 0

  return (
    <ModulePageLayout
      title="Storage Allocation"
      description="Allocate and reserve storage locations for incoming and existing inventory."
      breadcrumbs={[{ label: "WMS" }, { label: "Storage Allocation" }]}
    >
      <div className="grid gap-6">
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Allocated</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{allocated}</div>
              <p className="text-xs text-muted-foreground mt-1">Locations in use</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
              <Clock className="h-4 w-4 text-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pending}</div>
              <p className="text-xs text-muted-foreground mt-1">Awaiting allocation</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Reserved</CardTitle>
              <Package className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reserved}</div>
              <p className="text-xs text-muted-foreground mt-1">Reserved for inbound</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Overflows</CardTitle>
              <AlertCircle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overflows}</div>
              <p className="text-xs text-muted-foreground mt-1">Requires attention</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 gap-4 flex-wrap">
            <div>
              <CardTitle>Allocation Queue</CardTitle>
              <CardDescription>Items pending storage allocation. Data in localStorage.</CardDescription>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <Input placeholder="Search by SKU or PO..." className="w-64" />
              <Button variant="outline">Auto-allocate</Button>
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={openAdd}>
                <Plus className="h-4 w-4 mr-2" />
                Add to Queue
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reference</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Warehouse</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-medium">{row.ref}</TableCell>
                    <TableCell>{row.sku}</TableCell>
                    <TableCell>{row.product}</TableCell>
                    <TableCell>{row.qty}</TableCell>
                    <TableCell>{row.wh}</TableCell>
                    <TableCell>
                      <Badge variant={row.priority === "High" ? "destructive" : "secondary"}>
                        {row.priority}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" className="text-primary">Allocate</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add to Allocation Queue</DialogTitle>
            <p className="text-sm text-muted-foreground">New allocation. Stored in localStorage.</p>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Reference</Label>
              <Input value={form.ref} onChange={(e) => setForm((f) => ({ ...f, ref: e.target.value }))} placeholder="e.g. ALC-2024-0845" />
            </div>
            <div className="grid gap-2">
              <Label>SKU</Label>
              <Input value={form.sku} onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value }))} placeholder="e.g. SKU-1234" />
            </div>
            <div className="grid gap-2">
              <Label>Product</Label>
              <Input value={form.product} onChange={(e) => setForm((f) => ({ ...f, product: e.target.value }))} placeholder="Product name" />
            </div>
            <div className="grid gap-2">
              <Label>Quantity</Label>
              <Input
                type="number"
                min={0}
                value={form.qty || ""}
                onChange={(e) => setForm((f) => ({ ...f, qty: parseInt(e.target.value, 10) || 0 }))}
                placeholder="0"
              />
            </div>
            <div className="grid gap-2">
              <Label>Warehouse</Label>
              <Input value={form.wh} onChange={(e) => setForm((f) => ({ ...f, wh: e.target.value }))} placeholder="WH-001" />
            </div>
            <div className="grid gap-2">
              <Label>Priority</Label>
              <Select value={form.priority} onValueChange={(v) => setForm((f) => ({ ...f, priority: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Normal">Normal</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
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
