import { useEffect, useState } from "react"
import { Warehouse, MapPin, Package, Plus, ListOrdered } from "lucide-react"
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
import { CREATE_WAREHOUSE_FLOW, WAREHOUSE_TABLE_COLUMNS } from "@/lib/warehouse-module-spec"

const STORAGE_KEY = "wms_warehouses"

type WarehouseRow = {
  id: string
  code: string
  name: string
  location: string
  capacity: string
  totalArea: string
  zoneType: string
  currentOccupancy: string
  status: string
}

const defaultRows: WarehouseRow[] = [
  { id: "1", code: "WH-001", name: "Main Distribution Center", location: "Karachi", capacity: "10,000", totalArea: "50,000", zoneType: "Non-bonded", currentOccupancy: "7,200", status: "Active" },
  { id: "2", code: "WH-002", name: "North Regional Hub", location: "Lahore", capacity: "8,500", totalArea: "42,000", zoneType: "Non-bonded", currentOccupancy: "5,100", status: "Active" },
  { id: "3", code: "WH-003", name: "Customs Bonded Warehouse", location: "Port Qasim", capacity: "12,000", totalArea: "65,000", zoneType: "Bonded", currentOccupancy: "9,000", status: "Active" },
  { id: "4", code: "WH-004", name: "Transit Warehouse", location: "Islamabad", capacity: "5,200", totalArea: "28,000", zoneType: "Dispatch", currentOccupancy: "2,100", status: "Active" },
  { id: "5", code: "WH-005", name: "Cold Storage Unit", location: "Faisalabad", capacity: "2,800", totalArea: "12,000", zoneType: "Quarantine", currentOccupancy: "1,800", status: "Maintenance" },
]

function loadRows(): WarehouseRow[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((r: Record<string, unknown>) =>
          ensureRowShape({
            id: String(r.id ?? ""),
            code: String(r.code ?? ""),
            name: String(r.name ?? ""),
            location: String(r.location ?? ""),
            capacity: String(r.capacity ?? ""),
            status: String(r.status ?? "Active"),
            totalArea: r.totalArea != null ? String(r.totalArea) : "",
            zoneType: r.zoneType != null ? String(r.zoneType) : "",
            currentOccupancy: r.currentOccupancy != null ? String(r.currentOccupancy) : "",
          })
        )
      }
    }
  } catch {}
  return defaultRows
}

function saveRows(rows: WarehouseRow[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(rows))
}

function ensureRowShape(row: { id: string; code: string; name: string; location: string; capacity: string; status: string; totalArea?: string; zoneType?: string; currentOccupancy?: string }): WarehouseRow {
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    location: row.location,
    capacity: row.capacity,
    totalArea: row.totalArea ?? "",
    zoneType: row.zoneType ?? "",
    currentOccupancy: row.currentOccupancy ?? "",
    status: row.status,
  }
}

export default function WarehouseSetupPage() {
  const [rows, setRows] = useState<WarehouseRow[]>([])
  const [open, setOpen] = useState(false)
  const [showFlow, setShowFlow] = useState(false)
  const [form, setForm] = useState({ code: "", name: "", location: "", capacity: "", totalArea: "", zoneType: "", currentOccupancy: "", status: "Active" })

  useEffect(() => {
    setRows(loadRows())
  }, [])

  useEffect(() => {
    if (rows.length > 0) saveRows(rows)
  }, [rows])

  const openAdd = () => {
    setForm({ code: "", name: "", location: "", capacity: "", totalArea: "", zoneType: "", currentOccupancy: "", status: "Active" })
    setOpen(true)
  }

  const onSave = () => {
    if (!form.code.trim() || !form.name.trim() || !form.location.trim() || !form.capacity.trim()) return
    const newRow: WarehouseRow = {
      id: `wh-${Date.now()}`,
      code: form.code.trim(),
      name: form.name.trim(),
      location: form.location.trim(),
      capacity: form.capacity.trim(),
      totalArea: form.totalArea.trim(),
      zoneType: form.zoneType,
      currentOccupancy: form.currentOccupancy.trim(),
      status: form.status,
    }
    setRows((prev) => [newRow, ...prev])
    setOpen(false)
  }

  const totalCapacity = rows.reduce((sum, r) => sum + (parseInt(r.capacity.replace(/,/g, ""), 10) || 0), 0)
  const activeCount = rows.filter((r) => r.status === "Active").length

  return (
    <ModulePageLayout
      title="Warehouse Setup"
      description="Warehouse Master per spec: Create Warehouse → Define Zones → Assign Storage Locations → Map Cameras → Activate."
      breadcrumbs={[{ label: "WMS" }, { label: "Warehouse Setup" }]}
    >
      <div className="grid gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <ListOrdered className="h-5 w-5" />
                Create Warehouse Flow
              </CardTitle>
              <CardDescription>Create Warehouse → Define Zones → Assign Storage Locations → Map Cameras → Activate</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => setShowFlow(!showFlow)}>
              {showFlow ? "Hide" : "Show"} steps
            </Button>
          </CardHeader>
          {showFlow && (
            <CardContent className="pt-0">
              <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                {CREATE_WAREHOUSE_FLOW.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ol>
            </CardContent>
          )}
        </Card>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Warehouses</CardTitle>
              <Warehouse className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{rows.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Active locations</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Capacity</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalCapacity.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">Pallet positions</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Utilization</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeCount > 0 ? Math.round((activeCount / rows.length) * 100) : 0}%</div>
              <p className="text-xs text-muted-foreground mt-1">Active vs total</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 gap-4 flex-wrap">
            <div>
              <CardTitle>Warehouse List</CardTitle>
              <CardDescription>Spec-aligned columns: Warehouse ID, Name, Location, Total Area, Zone, Storage Capacity, Current Occupancy, Status.</CardDescription>
            </div>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 flex-shrink-0" onClick={openAdd}>
              <Plus className="h-4 w-4 mr-2" />
              Add Warehouse
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  {WAREHOUSE_TABLE_COLUMNS.map((col) => (
                    <TableHead key={col}>{col}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-medium">{row.code}</TableCell>
                    <TableCell>{row.name}</TableCell>
                    <TableCell>{row.location}</TableCell>
                    <TableCell>{row.totalArea || row.capacity}</TableCell>
                    <TableCell>{row.zoneType || "—"}</TableCell>
                    <TableCell>{row.capacity}</TableCell>
                    <TableCell>{row.currentOccupancy || "—"}</TableCell>
                    <TableCell>
                      <Badge variant={row.status === "Active" ? "default" : "secondary"}>{row.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" className="text-primary">Edit</Button>
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
            <DialogTitle>Add Warehouse</DialogTitle>
            <p className="text-sm text-muted-foreground">Warehouse Master fields per spec. Stored in localStorage.</p>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Warehouse ID (Code)</Label>
              <Input
                value={form.code}
                onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
                placeholder="e.g. WH-006"
              />
            </div>
            <div className="grid gap-2">
              <Label>Warehouse Name</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Warehouse name"
              />
            </div>
            <div className="grid gap-2">
              <Label>Location / Address</Label>
              <Input
                value={form.location}
                onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                placeholder="City or address"
              />
            </div>
            <div className="grid gap-2">
              <Label>Total Area (sq ft / sq m)</Label>
              <Input
                value={form.totalArea}
                onChange={(e) => setForm((f) => ({ ...f, totalArea: e.target.value }))}
                placeholder="e.g. 50,000"
              />
            </div>
            <div className="grid gap-2">
              <Label>Zone Type</Label>
              <Select value={form.zoneType} onValueChange={(v) => setForm((f) => ({ ...f, zoneType: v }))}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Bonded">Bonded</SelectItem>
                  <SelectItem value="Non-bonded">Non-bonded</SelectItem>
                  <SelectItem value="Quarantine">Quarantine</SelectItem>
                  <SelectItem value="Inspection">Inspection</SelectItem>
                  <SelectItem value="Dispatch">Dispatch</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Storage Capacity</Label>
              <Input
                value={form.capacity}
                onChange={(e) => setForm((f) => ({ ...f, capacity: e.target.value }))}
                placeholder="e.g. 10,000"
              />
            </div>
            <div className="grid gap-2">
              <Label>Current Occupancy</Label>
              <Input
                value={form.currentOccupancy}
                onChange={(e) => setForm((f) => ({ ...f, currentOccupancy: e.target.value }))}
                placeholder="e.g. 7,200"
              />
            </div>
            <div className="grid gap-2">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm((f) => ({ ...f, status: v }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Maintenance">Maintenance</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
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
