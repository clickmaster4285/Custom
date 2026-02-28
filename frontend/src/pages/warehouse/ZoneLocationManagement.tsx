import { useEffect, useState } from "react"
import { MapPin, Layers, Box, Plus } from "lucide-react"
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

const STORAGE_KEY = "wms_zone_locations"

type ZoneRow = {
  id: string
  code: string
  name: string
  warehouse: string
  locations: number
  type: string
}

const defaultRows: ZoneRow[] = [
  { id: "1", code: "Z-A01", name: "Receiving Zone", warehouse: "WH-001", locations: 320, type: "Receiving" },
  { id: "2", code: "Z-B02", name: "Bulk Storage", warehouse: "WH-001", locations: 850, type: "Bulk" },
  { id: "3", code: "Z-C03", name: "Picking Zone", warehouse: "WH-001", locations: 420, type: "Picking" },
  { id: "4", code: "Z-D04", name: "Shipping Zone", warehouse: "WH-001", locations: 180, type: "Shipping" },
  { id: "5", code: "Z-A01-N", name: "North Receiving", warehouse: "WH-002", locations: 250, type: "Receiving" },
]

function loadRows(): ZoneRow[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch {}
  return defaultRows
}

function saveRows(rows: ZoneRow[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(rows))
}

const ZONE_TYPES = ["Receiving", "Bulk", "Picking", "Shipping", "Staging", "Quarantine"]

export default function ZoneLocationManagementPage() {
  const [rows, setRows] = useState<ZoneRow[]>([])
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ code: "", name: "", warehouse: "WH-001", locations: 0, type: "Receiving" })

  useEffect(() => {
    setRows(loadRows())
  }, [])

  useEffect(() => {
    if (rows.length > 0) saveRows(rows)
  }, [rows])

  const openAdd = () => {
    setForm({ code: "", name: "", warehouse: "WH-001", locations: 0, type: "Receiving" })
    setOpen(true)
  }

  const onSave = () => {
    if (!form.code.trim() || !form.name.trim()) return
    const newRow: ZoneRow = {
      id: `zone-${Date.now()}`,
      code: form.code.trim(),
      name: form.name.trim(),
      warehouse: form.warehouse,
      locations: form.locations || 0,
      type: form.type,
    }
    setRows((prev) => [newRow, ...prev])
    setOpen(false)
  }

  const totalLocations = rows.reduce((s, r) => s + r.locations, 0)
  const warehouseCodes = Array.from(new Set(rows.map((r) => r.warehouse)))

  return (
    <ModulePageLayout
      title="Zone & Location Management"
      description="Define zones, aisles, racks, and bin locations for efficient storage."
      breadcrumbs={[{ label: "WMS" }, { label: "Zone & Location Management" }]}
    >
      <div className="grid gap-6">
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Zones</CardTitle>
              <Layers className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{rows.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Defined zones</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Locations</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalLocations.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">Total bins</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Warehouses</CardTitle>
              <Box className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{warehouseCodes.length}</div>
              <p className="text-xs text-muted-foreground mt-1">With zones</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 gap-4 flex-wrap">
            <div>
              <CardTitle>Zone & Location Hierarchy</CardTitle>
              <CardDescription>Warehouse → Zone → Aisle → Rack → Level → Bin. Data in localStorage.</CardDescription>
            </div>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 flex-shrink-0" onClick={openAdd}>
              <Plus className="h-4 w-4 mr-2" />
              Add Zone
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Zone Code</TableHead>
                  <TableHead>Zone Name</TableHead>
                  <TableHead>Warehouse</TableHead>
                  <TableHead>Locations</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-medium">{row.code}</TableCell>
                    <TableCell>{row.name}</TableCell>
                    <TableCell>{row.warehouse}</TableCell>
                    <TableCell>{row.locations}</TableCell>
                    <TableCell><Badge variant="outline">{row.type}</Badge></TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" className="text-primary">Manage</Button>
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
            <DialogTitle>Add Zone</DialogTitle>
            <p className="text-sm text-muted-foreground">New zone. Stored in localStorage.</p>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Zone Code</Label>
              <Input value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))} placeholder="e.g. Z-E05" />
            </div>
            <div className="grid gap-2">
              <Label>Zone Name</Label>
              <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Zone name" />
            </div>
            <div className="grid gap-2">
              <Label>Warehouse</Label>
              <Input value={form.warehouse} onChange={(e) => setForm((f) => ({ ...f, warehouse: e.target.value }))} placeholder="e.g. WH-001" />
            </div>
            <div className="grid gap-2">
              <Label>Locations (count)</Label>
              <Input
                type="number"
                min={0}
                value={form.locations || ""}
                onChange={(e) => setForm((f) => ({ ...f, locations: parseInt(e.target.value, 10) || 0 }))}
                placeholder="Number of bins"
              />
            </div>
            <div className="grid gap-2">
              <Label>Type</Label>
              <Select value={form.type} onValueChange={(v) => setForm((f) => ({ ...f, type: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ZONE_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
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
