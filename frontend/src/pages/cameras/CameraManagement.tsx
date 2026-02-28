import { useEffect, useState } from "react"
import { Video, CheckCircle, AlertCircle } from "lucide-react"
import { ModulePageLayout } from "@/components/dashboard/module-page-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const STORAGE_KEY = "wms_camera_management"

type CameraRow = { id: string; location: string; type: string; status: string }

const defaultRows: CameraRow[] = [
  { id: "CAM-G01", location: "Gate 1 - Main", type: "ANPR", status: "Online" },
  { id: "CAM-WH-A1", location: "Warehouse A - Aisle 1", type: "Object Detection", status: "Online" },
  { id: "CAM-WH-B2", location: "Warehouse B - Loading", type: "General", status: "Offline" },
]

function loadRows(): CameraRow[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as CameraRow[]
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch {}
  return defaultRows
}

function saveRows(rows: CameraRow[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(rows))
}

const CAMERA_TYPES = ["ANPR", "Object Detection", "General"]
const STATUSES = ["Online", "Offline"]

export default function CameraManagementPage() {
  const [rows, setRows] = useState<CameraRow[]>([])
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ location: "", type: "General", status: "Online" })

  useEffect(() => {
    setRows(loadRows())
  }, [])

  useEffect(() => {
    if (rows.length > 0) saveRows(rows)
  }, [rows])

  const openAddForm = () => {
    setForm({ location: "", type: "General", status: "Online" })
    setOpen(true)
  }

  const onSave = () => {
    if (!form.location.trim()) return
    const id = `CAM-${Date.now().toString(36).toUpperCase().slice(-6)}`
    setRows((prev) => [{ id, ...form }, ...prev])
    setForm({ location: "", type: "General", status: "Online" })
    setOpen(false)
  }

  const onlineCount = rows.filter((r) => r.status === "Online").length
  const offlineCount = rows.filter((r) => r.status === "Offline").length

  return (
    <ModulePageLayout
      title="Camera Management"
      description="Manage warehouse and gate cameras for Computer Vision."
      breadcrumbs={[{ label: "WMS" }, { label: "Camera Management" }]}
    >
      <div className="grid gap-6">
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Cameras</CardTitle>
              <Video className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{rows.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Across warehouses</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Online</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{onlineCount}</div>
              <p className="text-xs text-muted-foreground mt-1">Streaming</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Offline / Alert</CardTitle>
              <AlertCircle className="h-4 w-4 text-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{offlineCount}</div>
              <p className="text-xs text-muted-foreground mt-1">Needs attention</p>
            </CardContent>
          </Card>
        </div>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Cameras</CardTitle>
              <CardDescription>Camera list and status by location</CardDescription>
            </div>
            <Button className="bg-[#3b82f6] hover:bg-[#2563eb] text-white" onClick={openAddForm}>
              Add Camera
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Camera ID</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-medium">{row.id}</TableCell>
                    <TableCell>{row.location}</TableCell>
                    <TableCell>{row.type}</TableCell>
                    <TableCell>
                      <Badge variant={row.status === "Online" ? "default" : "destructive"}>{row.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" className="text-[#3b82f6]">Configure</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Dialog open={open} onOpenChange={(isOpen) => { setOpen(isOpen); if (!isOpen) setForm({ location: "", type: "General", status: "Online" }) }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Camera</DialogTitle>
            <p className="text-sm text-muted-foreground">Camera ID auto-generated. Data saved locally.</p>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Location *</Label>
              <Input
                value={form.location}
                onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))}
                placeholder="e.g. Gate 1 - Main"
              />
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={form.type} onValueChange={(v) => setForm((p) => ({ ...p, type: v }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CAMERA_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm((p) => ({ ...p, status: v }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={onSave}>Save</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </ModulePageLayout>
  )
}
