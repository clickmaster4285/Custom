import { useEffect, useState } from "react"
import { AlertTriangle, Plus } from "lucide-react"
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

const STORAGE_KEY = "wms_expiry_tracking"

type ExpiryRow = {
  id: string
  itemId: string
  desc: string
  expiry: string
  days: number
  priority: string
}

const defaultRows: ExpiryRow[] = [
  { id: "1", itemId: "PR-7822", desc: "Pharma - Temp control", expiry: "2024-02-05", days: 1, priority: "High" },
  { id: "2", itemId: "PR-7821", desc: "Food items - Lot A", expiry: "2024-02-10", days: 6, priority: "Medium" },
]

function loadRows(): ExpiryRow[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch {}
  return defaultRows
}

function saveRows(rows: ExpiryRow[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(rows))
}

const PRIORITIES = ["High", "Medium", "Low"]

export default function ExpiryTrackingPage() {
  const [rows, setRows] = useState<ExpiryRow[]>([])
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ itemId: "", desc: "", expiry: "", days: 0, priority: "Medium" })

  useEffect(() => {
    setRows(loadRows())
  }, [])

  useEffect(() => {
    if (rows.length > 0) saveRows(rows)
  }, [rows])

  const openAdd = () => {
    setForm({ itemId: "", desc: "", expiry: "", days: 0, priority: "Medium" })
    setOpen(true)
  }

  const onSave = () => {
    if (!form.itemId.trim() || !form.desc.trim() || !form.expiry.trim()) return
    const newRow: ExpiryRow = {
      id: `exp-${Date.now()}`,
      itemId: form.itemId.trim(),
      desc: form.desc.trim(),
      expiry: form.expiry,
      days: form.days ?? 0,
      priority: form.priority,
    }
    setRows((prev) => [newRow, ...prev])
    setOpen(false)
  }

  return (
    <ModulePageLayout
      title="Expiry Tracking"
      description="Track expiry dates and alerts for perishable items."
      breadcrumbs={[{ label: "WMS" }, { label: "Expiry Tracking" }]}
    >
      <div className="grid gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 gap-4 flex-wrap">
            <div>
              <CardTitle>Expiry Alerts</CardTitle>
              <CardDescription>Items expiring within 30 days. Data in localStorage.</CardDescription>
            </div>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 flex-shrink-0" onClick={openAdd}>
              <Plus className="h-4 w-4 mr-2" />
              Add Expiry Entry
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item ID</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Expiry Date</TableHead>
                  <TableHead>Days Left</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-medium">{row.itemId}</TableCell>
                    <TableCell>{row.desc}</TableCell>
                    <TableCell>{row.expiry}</TableCell>
                    <TableCell>{row.days} days</TableCell>
                    <TableCell>
                      <Badge variant={row.priority === "High" ? "destructive" : "secondary"}>{row.priority}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" className="text-primary">Dispose</Button>
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
            <DialogTitle>Add Expiry Entry</DialogTitle>
            <p className="text-sm text-muted-foreground">New expiry alert. Stored in localStorage.</p>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Item ID</Label>
              <Input value={form.itemId} onChange={(e) => setForm((f) => ({ ...f, itemId: e.target.value }))} placeholder="e.g. PR-7823" />
            </div>
            <div className="grid gap-2">
              <Label>Description</Label>
              <Input value={form.desc} onChange={(e) => setForm((f) => ({ ...f, desc: e.target.value }))} placeholder="Description" />
            </div>
            <div className="grid gap-2">
              <Label>Expiry Date</Label>
              <Input
                type="date"
                value={form.expiry}
                onChange={(e) => setForm((f) => ({ ...f, expiry: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label>Days Left</Label>
              <Input
                type="number"
                min={0}
                value={form.days || ""}
                onChange={(e) => setForm((f) => ({ ...f, days: parseInt(e.target.value, 10) || 0 }))}
                placeholder="0"
              />
            </div>
            <div className="grid gap-2">
              <Label>Priority</Label>
              <Select value={form.priority} onValueChange={(v) => setForm((f) => ({ ...f, priority: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PRIORITIES.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
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
