import { useEffect, useState, useCallback } from "react"
import { Video, CheckCircle, Wifi, Settings, Play, X } from "lucide-react"
import { ModulePageLayout } from "@/components/dashboard/module-page-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
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

const STORAGE_KEY = "wms_camera_integration"

/** Default stream used when no Stream URL is set – works in browser for live demo */
const DEFAULT_LIVE_STREAM_URL = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"

type CameraType = "PTZ" | "Fixed" | "Thermal" | "360°"
type CameraStatus = "Online" | "Offline"

type CameraRow = {
  id: string
  name: string
  location: string
  wh: string
  zone: string
  cameraType: CameraType
  status: CameraStatus
  streamUrl: string
  resolution: string
  frameRate: string
  recording: boolean
  storagePath: string
  aiModelApplied: string
  active: boolean
}

function ensureCameraShape(r: Record<string, unknown>): CameraRow {
  return {
    id: String(r.id ?? ""),
    name: String(r.name ?? r.location ?? ""),
    location: String(r.location ?? ""),
    wh: String(r.wh ?? "WH-001"),
    zone: String(r.zone ?? "Z-A01"),
    cameraType: (r.cameraType as CameraType) ?? "Fixed",
    status: (r.status as CameraStatus) ?? "Online",
    streamUrl: String(r.streamUrl ?? DEFAULT_LIVE_STREAM_URL),
    resolution: String(r.resolution ?? "1920x1080"),
    frameRate: String(r.frameRate ?? "30"),
    recording: Boolean(r.recording ?? true),
    storagePath: String(r.storagePath ?? ""),
    aiModelApplied: String(r.aiModelApplied ?? ""),
    active: r.active !== false,
  }
}

const defaultCameras: CameraRow[] = [
  { id: "CAM-WH001-01", name: "Main Gate", location: "Main Gate", wh: "WH-001", zone: "Z-A01", cameraType: "Fixed", status: "Online", streamUrl: DEFAULT_LIVE_STREAM_URL, resolution: "1920x1080", frameRate: "30", recording: true, storagePath: "/recordings/wh001-01", aiModelApplied: "Object Detection", active: true },
  { id: "CAM-WH001-02", name: "Receiving Dock", location: "Receiving Dock", wh: "WH-001", zone: "Z-A01", cameraType: "PTZ", status: "Online", streamUrl: DEFAULT_LIVE_STREAM_URL, resolution: "1920x1080", frameRate: "30", recording: true, storagePath: "/recordings/wh001-02", aiModelApplied: "ANPR", active: true },
  { id: "CAM-WH001-03", name: "Bulk Storage A", location: "Bulk Storage A", wh: "WH-001", zone: "Z-B02", cameraType: "Fixed", status: "Offline", streamUrl: DEFAULT_LIVE_STREAM_URL, resolution: "1280x720", frameRate: "25", recording: false, storagePath: "/recordings/wh001-03", aiModelApplied: "", active: false },
  { id: "CAM-WH001-04", name: "Picking Zone", location: "Picking Zone", wh: "WH-001", zone: "Z-C03", cameraType: "Fixed", status: "Online", streamUrl: DEFAULT_LIVE_STREAM_URL, resolution: "1920x1080", frameRate: "30", recording: true, storagePath: "/recordings/wh001-04", aiModelApplied: "Object Detection", active: true },
  { id: "CAM-WH001-05", name: "Staging Area", location: "Staging Area", wh: "WH-001", zone: "Z-C03", cameraType: "360°", status: "Online", streamUrl: DEFAULT_LIVE_STREAM_URL, resolution: "1920x1080", frameRate: "30", recording: true, storagePath: "/recordings/wh001-05", aiModelApplied: "Anomaly Detection", active: true },
  { id: "CAM-WH001-06", name: "Loading Dock", location: "Loading Dock", wh: "WH-001", zone: "Z-A01", cameraType: "Fixed", status: "Online", streamUrl: DEFAULT_LIVE_STREAM_URL, resolution: "1920x1080", frameRate: "30", recording: true, storagePath: "/recordings/wh001-06", aiModelApplied: "ANPR", active: true },
]

function loadCameras(): CameraRow[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as Record<string, unknown>[]
      if (Array.isArray(parsed) && parsed.length > 0) return parsed.map(ensureCameraShape)
    }
  } catch {}
  return defaultCameras
}

function saveCameras(rows: CameraRow[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(rows))
}

type FormState = Omit<CameraRow, "id">

const emptyForm = (): FormState => ({
  name: "",
  location: "",
  wh: "WH-001",
  zone: "Z-A01",
  cameraType: "Fixed",
  status: "Online",
  streamUrl: DEFAULT_LIVE_STREAM_URL,
  resolution: "1920x1080",
  frameRate: "30",
  recording: true,
  storagePath: "",
  aiModelApplied: "",
  active: true,
})

const CAMERA_TYPES: CameraType[] = ["PTZ", "Fixed", "Thermal", "360°"]
const CAMERA_STATUSES: CameraStatus[] = ["Online", "Offline"]

export default function CameraIntegrationPage() {
  const [rows, setRows] = useState<CameraRow[]>([])
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<FormState>(emptyForm())
  const [liveCamera, setLiveCamera] = useState<CameraRow | null>(null)
  const [liveGridCameras, setLiveGridCameras] = useState<CameraRow[]>([])

  useEffect(() => {
    setRows(loadCameras())
  }, [])

  useEffect(() => {
    if (rows.length > 0) saveCameras(rows)
  }, [rows])

  // Limit to 3 feeds in grid and don't auto-play all (was freezing PC with 6 videos)
  useEffect(() => {
    setLiveGridCameras(rows.filter((r) => r.active && r.status === "Online").slice(0, 3))
  }, [rows])

  const openAddForm = () => {
    setForm(emptyForm())
    setOpen(true)
  }

  const onSave = () => {
    if (!form.name.trim()) return
    if (!form.location.trim()) return
    if (!form.streamUrl.trim()) return
    const id = `CAM-${Date.now().toString(36).toUpperCase().slice(-6)}`
    const streamUrl = form.streamUrl.trim() || DEFAULT_LIVE_STREAM_URL
    setRows((prev) => [{ id, ...form, streamUrl }, ...prev])
    setForm(emptyForm())
    setOpen(false)
  }

  const getStreamUrl = useCallback((cam: CameraRow) => cam.streamUrl?.trim() || DEFAULT_LIVE_STREAM_URL, [])

  const activeCount = rows.filter((r) => r.active && r.status === "Online").length
  const recordingCount = rows.filter((r) => r.recording).length
  const canSave = form.name.trim() !== "" && form.location.trim() !== "" && form.streamUrl.trim() !== ""

  return (
    <ModulePageLayout
      title="Camera Integration"
      description="Connect and manage CCTV cameras with full configuration. View live footage from each camera."
      breadcrumbs={[{ label: "WMS" }, { label: "Camera Integration" }]}
    >
      <div className="grid gap-6">
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Cameras</CardTitle>
              <Video className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{rows.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Across all sites</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Online</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeCount}</div>
              <p className="text-xs text-muted-foreground mt-1">Active / {rows.length} total</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Recording</CardTitle>
              <Wifi className="h-4 w-4 text-[#3b82f6]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{recordingCount}</div>
              <p className="text-xs text-muted-foreground mt-1">Active recording</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Integration</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">NVR</div>
              <p className="text-xs text-muted-foreground mt-1">Primary system</p>
            </CardContent>
          </Card>
        </div>

        {/* Live footage grid – working feeds */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="h-5 w-5 text-green-600" />
              Live Camera Feeds
            </CardTitle>
            <CardDescription>
              Real-time footage from active cameras. Click a feed or &quot;View Feed&quot; in the table to open full screen.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {liveGridCameras.length === 0 ? (
                <div className="col-span-full aspect-video rounded-lg border border-dashed border-muted-foreground/30 flex items-center justify-center text-muted-foreground text-sm">
                  No active cameras. Add a camera and set Status to Online to see live feeds here.
                </div>
              ) : (
                liveGridCameras.map((cam) => (
                  <div
                    key={cam.id}
                    className="rounded-lg border border-border overflow-hidden bg-black/90 flex flex-col"
                  >
                    <div className="relative aspect-video">
                      <video
                        src={getStreamUrl(cam)}
                        className="w-full h-full object-contain"
                        preload="metadata"
                        muted
                        playsInline
                        loop
                        controls
                        title={`${cam.name} – ${cam.location}`}
                      />
                      <div className="absolute bottom-1 left-1 right-1 flex items-center justify-between">
                        <Badge variant="default" className="text-xs">
                          {cam.name}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {cam.cameraType} • {cam.resolution}
                        </Badge>
                      </div>
                    </div>
                    <div className="p-2 flex justify-between items-center bg-muted/50">
                      <span className="text-xs text-muted-foreground">{cam.id} • {cam.zone}</span>
                      <Button size="sm" variant="outline" onClick={() => setLiveCamera(cam)}>
                        Full screen
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Camera List</CardTitle>
              <CardDescription>All cameras with required fields. Stream URL is used for live footage.</CardDescription>
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
                  <TableHead>Name</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Warehouse</TableHead>
                  <TableHead>Zone</TableHead>
                  <TableHead>Resolution</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Recording</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-medium">{row.id}</TableCell>
                    <TableCell>{row.name}</TableCell>
                    <TableCell>{row.location}</TableCell>
                    <TableCell>{row.cameraType}</TableCell>
                    <TableCell>{row.wh}</TableCell>
                    <TableCell>{row.zone}</TableCell>
                    <TableCell>{row.resolution}</TableCell>
                    <TableCell>
                      <Badge variant={row.status === "Online" ? "default" : "secondary"}>
                        {row.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch checked={row.recording} disabled />
                        <span className="text-sm text-muted-foreground">{row.recording ? "On" : "Off"}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-[#3b82f6]"
                        onClick={() => setLiveCamera(row)}
                      >
                        View Feed
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Add / Edit Camera – all required fields */}
      <Dialog open={open} onOpenChange={(isOpen) => { setOpen(isOpen); if (!isOpen) setForm(emptyForm()) }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Camera</DialogTitle>
            <CardDescription>All fields required for integration. Stream URL must be a valid video stream (e.g. HTTP/HTTPS MP4 or HLS) for live footage.</CardDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Camera Name *</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. Main Gate"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Location / Zone *</Label>
                <Input
                  value={form.location}
                  onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))}
                  placeholder="e.g. Main Gate, Receiving Dock"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Camera Type *</Label>
                <Select value={form.cameraType} onValueChange={(v) => setForm((p) => ({ ...p, cameraType: v as CameraType }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CAMERA_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status *</Label>
                <Select value={form.status} onValueChange={(v) => setForm((p) => ({ ...p, status: v as CameraStatus }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CAMERA_STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Warehouse</Label>
                <Select value={form.wh} onValueChange={(v) => setForm((p) => ({ ...p, wh: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="WH-001">WH-001</SelectItem>
                    <SelectItem value="WH-002">WH-002</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Zone Code</Label>
                <Input
                  value={form.zone}
                  onChange={(e) => setForm((p) => ({ ...p, zone: e.target.value }))}
                  placeholder="e.g. Z-A01"
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Stream URL *</Label>
                <Input
                  value={form.streamUrl}
                  onChange={(e) => setForm((p) => ({ ...p, streamUrl: e.target.value }))}
                  placeholder="https://... or leave default for demo stream"
                  required
                />
                <p className="text-xs text-muted-foreground">HTTP/HTTPS video URL for live feed. Default demo stream is used if empty.</p>
              </div>
              <div className="space-y-2">
                <Label>Resolution</Label>
                <Input
                  value={form.resolution}
                  onChange={(e) => setForm((p) => ({ ...p, resolution: e.target.value }))}
                  placeholder="e.g. 1920x1080"
                />
              </div>
              <div className="space-y-2">
                <Label>Frame Rate (fps)</Label>
                <Input
                  value={form.frameRate}
                  onChange={(e) => setForm((p) => ({ ...p, frameRate: e.target.value }))}
                  placeholder="e.g. 30"
                />
              </div>
              <div className="space-y-2">
                <Label>Storage Path</Label>
                <Input
                  value={form.storagePath}
                  onChange={(e) => setForm((p) => ({ ...p, storagePath: e.target.value }))}
                  placeholder="e.g. /recordings/wh001-01"
                />
              </div>
              <div className="space-y-2">
                <Label>AI Model Applied</Label>
                <Input
                  value={form.aiModelApplied}
                  onChange={(e) => setForm((p) => ({ ...p, aiModelApplied: e.target.value }))}
                  placeholder="e.g. Object Detection, ANPR"
                />
              </div>
              <div className="flex items-center gap-6 sm:col-span-2">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={form.active}
                    onCheckedChange={(v) => setForm((p) => ({ ...p, active: v }))}
                  />
                  <Label>Active</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={form.recording}
                    onCheckedChange={(v) => setForm((p) => ({ ...p, recording: v }))}
                  />
                  <Label>Recording</Label>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={onSave} disabled={!canSave}>Save</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Full-screen live feed modal */}
      <Dialog open={!!liveCamera} onOpenChange={(open) => !open && setLiveCamera(null)}>
        <DialogContent className="max-w-4xl w-[95vw] p-0 gap-0 overflow-hidden bg-black">
          <DialogHeader className="p-4 pb-0 flex flex-row items-center justify-between border-b border-white/20">
            <div>
              <DialogTitle className="text-white">
                {liveCamera?.name} – Live
              </DialogTitle>
              <CardDescription className="text-white/80">
                {liveCamera?.id} • {liveCamera?.location} • {liveCamera?.zone} • {liveCamera?.resolution} @ {liveCamera?.frameRate}fps
              </CardDescription>
            </div>
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" onClick={() => setLiveCamera(null)}>
              <X className="h-5 w-5" />
            </Button>
          </DialogHeader>
          <div className="relative aspect-video w-full">
            {liveCamera && (
              <video
                key={liveCamera.id}
                src={getStreamUrl(liveCamera)}
                className="w-full h-full object-contain"
                autoPlay
                muted={false}
                playsInline
                loop
                controls
                title={`${liveCamera.name} – Live`}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </ModulePageLayout>
  )
}
