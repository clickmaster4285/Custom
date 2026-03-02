"use client"

import { useEffect, useState } from "react"
import { Video, CheckCircle, AlertCircle, Plus, Settings, Users, MapPin, Activity } from "lucide-react"
import { ModulePageLayout } from "@/components/dashboard/module-page-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChevronDown } from "lucide-react"

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

const CAMERA_TYPES = ["Fixed", "PTZ", "Thermal", "360°", "LPR"]
const STATUSES = ["Online", "Offline", "Error", "Tampered"]
const MANUFACTURERS = ["Dahua", "Hikvision", "Axis", "Bosch", "Hanwha", "Other"]
const PROTOCOLS = ["ONVIF", "RTSP", "HTTP"]
const RESOLUTIONS = ["4K", "1080P", "720P", "VGA", "CIF"]
const CODECS = ["H.264", "H.265", "MJPG", "MPEG"]
const RECORDING_MODES = ["Continuous", "Motion", "Event", "Schedule"]
const PTZ_PROTOCOLS = ["ONVIF", "Dahua", "Hikvision"]
const DAY_NIGHT_MODES = ["Auto", "Day", "Night"]
const LOCATION_TYPES = ["Site", "Building", "Floor", "Zone", "Area"]
const MOCK_LOCATIONS = ["Site A", "Building 1", "Floor 2", "Gate Zone", "Loading Area"]

export function CameraManagementContent() {
  const [rows, setRows] = useState<CameraRow[]>([])
  const [ptzSpeed, setPtzSpeed] = useState(5)
  const [mainFps, setMainFps] = useState(25)
  const [mainBitrate, setMainBitrate] = useState(4000)
  const [subFps, setSubFps] = useState(15)
  const [iframeInterval, setIframeInterval] = useState(50)
  const [preBuffer, setPreBuffer] = useState(20)
  const [postBuffer, setPostBuffer] = useState(20)

  useEffect(() => {
    setRows(loadRows())
  }, [])
  useEffect(() => {
    if (rows.length > 0) saveRows(rows)
  }, [rows])

  const onlineCount = rows.filter((r) => r.status === "Online").length
  const offlineCount = rows.filter((r) => r.status !== "Online").length

  return (
    <ScrollArea className="h-[calc(100vh-10rem)]">
      <div className="space-y-6 pb-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Cameras</CardTitle>
                <Video className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{rows.length}</div>
                <p className="text-xs text-muted-foreground mt-1">Across locations</p>
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

          {/* 1. Add Camera */}
          <Card>
            <Collapsible defaultOpen>
              <CollapsibleTrigger className="w-full px-6 py-4 flex items-center justify-between hover:bg-muted/50">
                <CardTitle className="text-base flex items-center gap-2"><Plus className="h-4 w-4" /> Add Camera</CardTitle>
                <ChevronDown className="h-4 w-4" />
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="pt-0">
                  <Tabs defaultValue="manual">
                    <TabsList className="grid w-full max-w-md grid-cols-2">
                      <TabsTrigger value="discovery">Auto-Discovery</TabsTrigger>
                      <TabsTrigger value="manual">Manual Add</TabsTrigger>
                    </TabsList>
                    <TabsContent value="discovery" className="space-y-4 pt-4">
                      <div>
                        <Label className="text-sm">Network scan range (CIDR) *</Label>
                        <Input placeholder="e.g. 192.168.1.0/24" className="mt-1" />
                      </div>
                      <div>
                        <Label className="text-sm">Protocol filter</Label>
                        <div className="flex gap-4 mt-1">
                          {PROTOCOLS.map((p) => (
                            <label key={p} className="flex items-center gap-2 text-sm">
                              <Checkbox value={p} /> {p}
                            </label>
                          ))}
                        </div>
                      </div>
                      <Button>Scan Now</Button>
                      <div>
                        <Label className="text-sm">Discovered cameras (selectable table)</Label>
                        <div className="mt-1 rounded border border-border overflow-hidden">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="w-10" />
                                <TableHead>IP</TableHead>
                                <TableHead>Protocol</TableHead>
                                <TableHead>Model</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              <TableRow>
                                <TableCell><Checkbox /></TableCell>
                                <TableCell>192.168.1.101</TableCell>
                                <TableCell>ONVIF</TableCell>
                                <TableCell>—</TableCell>
                              </TableRow>
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    </TabsContent>
                    <TabsContent value="manual" className="space-y-4 pt-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm">Camera name *</Label>
                          <Input placeholder="Friendly display name" className="mt-1" />
                        </div>
                        <div>
                          <Label className="text-sm">Camera type *</Label>
                          <Select><SelectTrigger className="mt-1"><SelectValue placeholder="Select" /></SelectTrigger><SelectContent>{CAMERA_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select>
                        </div>
                        <div>
                          <Label className="text-sm">Manufacturer</Label>
                          <Select><SelectTrigger className="mt-1"><SelectValue placeholder="e.g. Dahua, Hikvision" /></SelectTrigger><SelectContent>{MANUFACTURERS.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent></Select>
                        </div>
                        <div>
                          <Label className="text-sm">Model number</Label>
                          <Input placeholder="Camera model" className="mt-1" />
                        </div>
                        <div>
                          <Label className="text-sm">Serial number</Label>
                          <Input placeholder="Device serial" className="mt-1" />
                        </div>
                        <div>
                          <Label className="text-sm">IP address *</Label>
                          <Input placeholder="Camera IP" className="mt-1 font-mono" />
                        </div>
                        <div>
                          <Label className="text-sm">HTTP port * (default 80)</Label>
                          <Input type="number" defaultValue={80} className="mt-1 w-24" />
                        </div>
                        <div>
                          <Label className="text-sm">RTSP port * (default 554)</Label>
                          <Input type="number" defaultValue={554} className="mt-1 w-24" />
                        </div>
                        <div>
                          <Label className="text-sm">ONVIF port (default 80)</Label>
                          <Input type="number" defaultValue={80} className="mt-1 w-24" />
                        </div>
                        <div>
                          <Label className="text-sm">Username * (stored encrypted)</Label>
                          <Input placeholder="Camera login" className="mt-1" />
                        </div>
                        <div>
                          <Label className="text-sm">Password * (stored encrypted)</Label>
                          <Input type="password" placeholder="••••••••" className="mt-1" />
                        </div>
                        <div className="md:col-span-2">
                          <Label className="text-sm">RTSP URL (override)</Label>
                          <Input placeholder="Custom RTSP URL if needed (auto built if empty)" className="mt-1" />
                        </div>
                        <div>
                          <Label className="text-sm">Assigned location *</Label>
                          <Select><SelectTrigger className="mt-1"><SelectValue placeholder="Where camera is installed" /></SelectTrigger><SelectContent>{MOCK_LOCATIONS.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent></Select>
                        </div>
                        <div>
                          <Label className="text-sm">GPS latitude</Label>
                          <Input type="number" step="any" placeholder="Decimal" className="mt-1" />
                        </div>
                        <div>
                          <Label className="text-sm">GPS longitude</Label>
                          <Input type="number" step="any" placeholder="Decimal" className="mt-1" />
                        </div>
                        <div>
                          <Label className="text-sm">Camera direction (°) 0–360</Label>
                          <Input type="number" min={0} max={360} className="mt-1 w-24" />
                        </div>
                        <div>
                          <Label className="text-sm">Camera tilt (°) 0–90</Label>
                          <Input type="number" min={0} max={90} className="mt-1 w-24" />
                        </div>
                      </div>
                      <Button>Add Camera</Button>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>

          {/* 2. Camera Configuration */}
          <Card>
            <Collapsible>
              <CollapsibleTrigger className="w-full px-6 py-4 flex items-center justify-between hover:bg-muted/50">
                <CardTitle className="text-base flex items-center gap-2"><Settings className="h-4 w-4" /> Camera Configuration</CardTitle>
                <ChevronDown className="h-4 w-4" />
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="pt-0 space-y-6">
                  <div className="border-l-2 border-primary/30 pl-4 space-y-4">
                    <h4 className="font-medium text-sm">Basic Settings</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm">Camera name *</Label>
                        <Input placeholder="Update display name" className="mt-1" />
                      </div>
                      <div className="md:col-span-2">
                        <Label className="text-sm">Description</Label>
                        <Textarea placeholder="Notice about this camera" className="mt-1" />
                      </div>
                      <div>
                        <Label className="text-sm">Tags (searchable)</Label>
                        <Input placeholder="Tag input" className="mt-1" />
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch id="cfg-enabled" defaultChecked />
                        <Label htmlFor="cfg-enabled" className="text-sm cursor-pointer">Enabled *</Label>
                      </div>
                    </div>
                  </div>
                  <div className="border-l-2 border-primary/30 pl-4 space-y-4">
                    <h4 className="font-medium text-sm">Video Settings</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm">Main stream resolution *</Label>
                        <Select><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent>{RESOLUTIONS.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent></Select>
                      </div>
                      <div>
                        <Label className="text-sm">Main stream FPS * (default 25)</Label>
                        <Input type="number" min={1} max={60} value={mainFps} onChange={(e) => setMainFps(Number(e.target.value))} className="mt-1 w-24" />
                      </div>
                      <div>
                        <Label className="text-sm">Main stream bitrate (Kbps, default 4000)</Label>
                        <Input type="number" value={mainBitrate} onChange={(e) => setMainBitrate(Number(e.target.value))} className="mt-1 w-28" />
                      </div>
                      <div>
                        <Label className="text-sm">Sub stream resolution</Label>
                        <Select><SelectTrigger className="mt-1"><SelectValue placeholder="Lower for streaming" /></SelectTrigger><SelectContent>{RESOLUTIONS.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent></Select>
                      </div>
                      <div>
                        <Label className="text-sm">Sub stream FPS (default 15)</Label>
                        <Input type="number" value={subFps} onChange={(e) => setSubFps(Number(e.target.value))} className="mt-1 w-24" />
                      </div>
                      <div>
                        <Label className="text-sm">Codec *</Label>
                        <Select><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent>{CODECS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select>
                      </div>
                      <div>
                        <Label className="text-sm">I-frame interval (frames, default 50)</Label>
                        <Input type="number" value={iframeInterval} onChange={(e) => setIframeInterval(Number(e.target.value))} className="mt-1 w-24" />
                      </div>
                    </div>
                  </div>
                  <div className="border-l-2 border-primary/30 pl-4 space-y-4">
                    <h4 className="font-medium text-sm">Recording Settings</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm">Recording mode *</Label>
                        <Select><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent>{RECORDING_MODES.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent></Select>
                      </div>
                      <div>
                        <Label className="text-sm">Pre-event buffer (sec, 0–300, default 20)</Label>
                        <Input type="number" min={0} max={300} value={preBuffer} onChange={(e) => setPreBuffer(Number(e.target.value))} className="mt-1 w-24" />
                      </div>
                      <div>
                        <Label className="text-sm">Post-event buffer (sec, 0–300, default 20)</Label>
                        <Input type="number" min={0} max={300} value={postBuffer} onChange={(e) => setPostBuffer(Number(e.target.value))} className="mt-1 w-24" />
                      </div>
                      <div>
                        <Label className="text-sm">Recording schedule (days/hours)</Label>
                        <div className="mt-1 h-20 rounded border border-dashed border-border bg-muted/20 flex items-center justify-center text-xs text-muted-foreground">Schedule grid</div>
                      </div>
                      <div>
                        <Label className="text-sm">Retention days *</Label>
                        <Input type="number" placeholder="Days to keep recordings" className="mt-1 w-28" />
                      </div>
                    </div>
                  </div>
                  <div className="border-l-2 border-primary/30 pl-4 space-y-4">
                    <h4 className="font-medium text-sm">PTZ Settings (for PTZ cameras)</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-2">
                        <Switch id="ptz-enable" />
                        <Label htmlFor="ptz-enable" className="text-sm cursor-pointer">Enable PTZ</Label>
                      </div>
                      <div>
                        <Label className="text-sm">PTZ protocol</Label>
                        <Select><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent>{PTZ_PROTOCOLS.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent></Select>
                      </div>
                      <div>
                        <Label className="text-sm">PTZ speed default (1–10)</Label>
                        <Slider value={[ptzSpeed]} onValueChange={([v]) => setPtzSpeed(v)} min={1} max={10} className="mt-1 w-40" />
                        <span className="text-sm ml-2">{ptzSpeed}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch id="ptz-return" />
                        <Label htmlFor="ptz-return" className="text-sm cursor-pointer">Auto return to home (+ delay)</Label>
                      </div>
                      <div>
                        <Label className="text-sm">Home preset</Label>
                        <Select><SelectTrigger className="mt-1"><SelectValue placeholder="Default home position" /></SelectTrigger><SelectContent><SelectItem value="1">Preset 1</SelectItem><SelectItem value="2">Preset 2</SelectItem></SelectContent></Select>
                      </div>
                    </div>
                  </div>
                  <div className="border-l-2 border-primary/30 pl-4 space-y-4">
                    <h4 className="font-medium text-sm">Advanced Settings</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <Label className="text-sm">Privacy masks (draw rectangles)</Label>
                        <div className="mt-1 h-24 rounded border border-dashed border-border bg-muted/20 flex items-center justify-center text-xs text-muted-foreground">Draw tool — Rectangles</div>
                      </div>
                      <div>
                        <Label className="text-sm">Image flip</Label>
                        <div className="flex gap-4 mt-1">
                          <label className="flex items-center gap-2 text-sm"><Checkbox /> H (Horizontal)</label>
                          <label className="flex items-center gap-2 text-sm"><Checkbox /> V (Vertical)</label>
                          <label className="flex items-center gap-2 text-sm"><Checkbox /> Both</label>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch id="wdr" />
                        <Label htmlFor="wdr" className="text-sm cursor-pointer">WDR mode</Label>
                      </div>
                      <div>
                        <Label className="text-sm">Day/Night mode</Label>
                        <Select><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent>{DAY_NIGHT_MODES.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent></Select>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>

          {/* 3. Camera Groups */}
          <Card>
            <Collapsible>
              <CollapsibleTrigger className="w-full px-6 py-4 flex items-center justify-between hover:bg-muted/50">
                <CardTitle className="text-base flex items-center gap-2"><Users className="h-4 w-4" /> Camera Groups</CardTitle>
                <ChevronDown className="h-4 w-4" />
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="pt-0 space-y-4">
                  <div>
                    <Label className="text-sm">Group name *</Label>
                    <Input placeholder="Name of camera group" className="mt-1" />
                  </div>
                  <div>
                    <Label className="text-sm">Group description</Label>
                    <Textarea placeholder="Purpose of group" className="mt-1" />
                  </div>
                  <div>
                    <Label className="text-sm">Cameras in group *</Label>
                    <div className="flex flex-wrap gap-3 mt-1">
                      {rows.map((r) => (
                        <label key={r.id} className="flex items-center gap-2 text-sm">
                          <Checkbox value={r.id} /> {r.id} — {r.location}
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm">Group icon/color</Label>
                    <div className="flex gap-2 mt-1 items-center">
                      <Input type="color" className="w-10 h-9 p-1 cursor-pointer" defaultValue="#3b82f6" />
                      <Input placeholder="Icon picker" className="w-32" />
                    </div>
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>

          {/* 4. Location Management */}
          <Card>
            <Collapsible>
              <CollapsibleTrigger className="w-full px-6 py-4 flex items-center justify-between hover:bg-muted/50">
                <CardTitle className="text-base flex items-center gap-2"><MapPin className="h-4 w-4" /> Location Management</CardTitle>
                <ChevronDown className="h-4 w-4" />
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="pt-0 space-y-4">
                  <div>
                    <Label className="text-sm">Location name *</Label>
                    <Input placeholder="Name of location" className="mt-1" />
                  </div>
                  <div>
                    <Label className="text-sm">Parent location</Label>
                    <Select><SelectTrigger className="mt-1"><SelectValue placeholder="Parent in hierarchy" /></SelectTrigger><SelectContent>{MOCK_LOCATIONS.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent></Select>
                  </div>
                  <div>
                    <Label className="text-sm">Location type *</Label>
                    <Select><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent>{LOCATION_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select>
                  </div>
                  <div>
                    <Label className="text-sm">Address</Label>
                    <Input placeholder="Physical address" className="mt-1" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm">Latitude</Label>
                      <Input type="number" step="any" className="mt-1" />
                    </div>
                    <div>
                      <Label className="text-sm">Longitude</Label>
                      <Input type="number" step="any" className="mt-1" />
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm">Map image upload (floor plan / site map)</Label>
                    <Input type="file" accept="image/*" className="mt-1" />
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>

          {/* 5. Health Monitoring */}
          <Card>
            <Collapsible>
              <CollapsibleTrigger className="w-full px-6 py-4 flex items-center justify-between hover:bg-muted/50">
                <CardTitle className="text-base flex items-center gap-2"><Activity className="h-4 w-4" /> Health Monitoring</CardTitle>
                <ChevronDown className="h-4 w-4" />
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="pt-0 space-y-6">
                  <div className="border-l-2 border-primary/30 pl-4 space-y-4">
                    <h4 className="font-medium text-sm">Camera Status</h4>
                    <div>
                      <Label className="text-sm">Status filter</Label>
                      <div className="flex gap-4 mt-1">
                        {STATUSES.map((s) => (
                          <label key={s} className="flex items-center gap-2 text-sm">
                            <Checkbox value={s} /> {s}
                          </label>
                        ))}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm">Last seen (auto)</Label>
                        <div className="mt-1 px-3 py-2 rounded border border-border bg-muted/30 text-sm">{new Date().toLocaleString()}</div>
                      </div>
                      <div>
                        <Label className="text-sm">Health score (auto, 0–100%)</Label>
                        <div className="mt-1 px-3 py-2 rounded border border-border bg-muted/30 text-sm">92%</div>
                      </div>
                    </div>
                  </div>
                  <div className="border-l-2 border-primary/30 pl-4 space-y-4">
                    <h4 className="font-medium text-sm">Diagnostics</h4>
                    <div className="flex gap-2">
                      <Button variant="outline">Run Ping Test</Button>
                      <Button variant="outline">Run Stream Test</Button>
                    </div>
                  </div>
                  <div className="border-l-2 border-primary/30 pl-4 space-y-4">
                    <h4 className="font-medium text-sm">Firmware Updates</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm">Current firmware (auto)</Label>
                        <div className="mt-1 px-3 py-2 rounded border border-border bg-muted/30 text-sm">v2.1.4</div>
                      </div>
                      <div>
                        <Label className="text-sm">Available update (auto)</Label>
                        <div className="mt-1 px-3 py-2 rounded border border-border bg-muted/30 text-sm">v2.2.0</div>
                      </div>
                      <div>
                        <Button variant="outline">Update Now (Confirm)</Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>

          {/* Camera list table */}
          <Card>
            <CardHeader>
              <CardTitle>Cameras</CardTitle>
              <CardDescription>Camera list and status by location</CardDescription>
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
    </ScrollArea>
  )
}

export default function CameraManagementPage() {
  return (
    <ModulePageLayout
      title="Camera Management — Add, configure, group, and monitor cameras"
      description="* Required = Yes. + Field Type defines input. ^ Developer Notes = implementation context."
      breadcrumbs={[{ label: "WMS" }, { label: "Camera Management" }]}
    >
      <CameraManagementContent />
    </ModulePageLayout>
  )
}
