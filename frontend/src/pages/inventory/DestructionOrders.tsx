import { useEffect, useState } from "react"
import { Plus } from "lucide-react"
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

const STORAGE_KEY = "wms_destruction_orders"

type OrderRow = {
  id: string
  items: number
  date: string
  status: string
}

const defaultRows: OrderRow[] = [
  { id: "DO-2024-0841", items: 3, date: "2024-02-04", status: "Pending" },
  { id: "DO-2024-0840", items: 2, date: "2024-02-03", status: "Completed" },
]

function loadRows(): OrderRow[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch {}
  return defaultRows
}

function saveRows(rows: OrderRow[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(rows))
}

const STATUSES = ["Pending", "In Progress", "Completed", "Cancelled"]

export default function DestructionOrdersPage() {
  const [rows, setRows] = useState<OrderRow[]>([])
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ orderId: "", items: 1, date: "", status: "Pending" })

  useEffect(() => {
    setRows(loadRows())
  }, [])

  useEffect(() => {
    if (rows.length > 0) saveRows(rows)
  }, [rows])

  const openAdd = () => {
    const nextId = `DO-2024-${String(Date.now()).slice(-4)}`
    setForm({ orderId: nextId, items: 1, date: new Date().toISOString().slice(0, 10), status: "Pending" })
    setOpen(true)
  }

  const onSave = () => {
    const id = form.orderId.trim() || `DO-${Date.now()}`
    const newRow: OrderRow = {
      id,
      items: form.items || 1,
      date: form.date || new Date().toISOString().slice(0, 10),
      status: form.status,
    }
    setRows((prev) => [newRow, ...prev])
    setOpen(false)
  }

  return (
    <ModulePageLayout
      title="Destruction Orders"
      description="Create and track destruction orders for perishable/expired items."
      breadcrumbs={[{ label: "WMS" }, { label: "Destruction Orders" }]}
    >
      <div className="grid gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 gap-4 flex-wrap">
            <div>
              <CardTitle>Destruction Orders</CardTitle>
              <CardDescription>Orders for disposal/destruction of items. Data in localStorage.</CardDescription>
            </div>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 flex-shrink-0" onClick={openAdd}>
              <Plus className="h-4 w-4 mr-2" />
              New Destruction Order
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-medium">{row.id}</TableCell>
                    <TableCell>{row.items}</TableCell>
                    <TableCell>{row.date}</TableCell>
                    <TableCell>
                      <Badge variant={row.status === "Completed" ? "default" : "secondary"}>{row.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" className="text-primary">View</Button>
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
            <DialogTitle>New Destruction Order</DialogTitle>
            <p className="text-sm text-muted-foreground">Create order. Stored in localStorage.</p>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Order ID</Label>
              <Input value={form.orderId} onChange={(e) => setForm((f) => ({ ...f, orderId: e.target.value }))} placeholder="e.g. DO-2024-0842" />
            </div>
            <div className="grid gap-2">
              <Label>Number of Items</Label>
              <Input
                type="number"
                min={1}
                value={form.items || ""}
                onChange={(e) => setForm((f) => ({ ...f, items: parseInt(e.target.value, 10) || 1 }))}
                placeholder="1"
              />
            </div>
            <div className="grid gap-2">
              <Label>Date</Label>
              <Input
                type="date"
                value={form.date}
                onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
              />
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
