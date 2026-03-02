"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Monitor } from "lucide-react"

const LAYOUTS = ["1x1", "2x2", "3x3", "4x4", "Custom"]
const QUALITIES = ["Auto", "HD", "SD", "Low"]
const MOCK_CAMERAS = ["Gate-01", "Parking-A", "Warehouse-2", "Entrance", "Hall-B", "Loading-1"]

export function DashboardLiveCameraGrid() {
  const [layout, setLayout] = useState("2x2")
  const [showOverlays, setShowOverlays] = useState(true)
  const [showTemp, setShowTemp] = useState(false)

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Monitor className="h-4 w-4" />
          Live Camera Grid
        </CardTitle>
        <div className="flex flex-wrap gap-4 pt-2">
          <div>
            <Label className="text-xs text-muted-foreground">Grid layout</Label>
            <Select value={layout} onValueChange={setLayout}>
              <SelectTrigger className="w-24 h-8 mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LAYOUTS.map((l) => (
                  <SelectItem key={l} value={l}>{l}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Video quality</Label>
            <Select defaultValue="Auto">
              <SelectTrigger className="w-24 h-8 mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {QUALITIES.map((q) => (
                  <SelectItem key={q} value={q}>{q}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Switch id="ai-overlays" checked={showOverlays} onCheckedChange={setShowOverlays} />
            <Label htmlFor="ai-overlays" className="text-xs">Show AI overlays</Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch id="show-temp" checked={showTemp} onCheckedChange={setShowTemp} />
            <Label htmlFor="show-temp" className="text-xs">Show temperature</Label>
          </div>
        </div>
        <div className="pt-2">
          <Label className="text-xs text-muted-foreground">Cameras</Label>
          <div className="flex flex-wrap gap-2 mt-1">
            {MOCK_CAMERAS.map((c) => (
              <label key={c} className="flex items-center gap-1.5 text-sm">
                <Checkbox />
                {c}
              </label>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className={`grid gap-2 ${layout === "1x1" ? "grid-cols-1" : layout === "2x2" ? "grid-cols-2" : layout === "3x3" ? "grid-cols-3" : "grid-cols-4"}`}>
          {Array.from({ length: layout === "1x1" ? 1 : layout === "2x2" ? 4 : layout === "3x3" ? 9 : 16 }, (_, i) => (
            <div key={i} className="relative aspect-video rounded-lg border border-border overflow-hidden bg-muted flex items-center justify-center text-muted-foreground text-sm">
              <span className="absolute bottom-1 left-1 z-10 text-xs font-medium bg-black/60 text-white px-1.5 py-0.5 rounded">{MOCK_CAMERAS[i % MOCK_CAMERAS.length]}</span>
              Camera {i + 1}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
