import { Video } from "lucide-react"
import { ModulePageLayout } from "@/components/dashboard/module-page-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const CAMERAS = [
  { id: "CAM-01", location: "Gate 1", active: true },
  { id: "CAM-02", location: "Gate 2", active: true },
  { id: "CAM-03", location: "Warehouse A", active: false },
  { id: "CAM-04", location: "Warehouse B", active: true },
  { id: "CAM-05", location: "Loading Dock", active: true },
  { id: "CAM-06", location: "Picking Zone", active: true },
  { id: "CAM-07", location: "Receiving", active: false },
  { id: "CAM-08", location: "Staging", active: true },
  { id: "CAM-09", location: "Parking", active: true },
  { id: "CAM-10", location: "Perimeter", active: true },
]

export default function LiveCameraGridPage() {
  const activeCount = CAMERAS.filter((c) => c.active).length
  return (
    <ModulePageLayout
      title="Live Camera Grid"
      description="Live camera feeds for AI analytics."
      breadcrumbs={[{ label: "AI Analytics" }, { label: "Live Camera Grid" }]}
    >
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Video className="h-5 w-5" /> Live Camera Grid
            </CardTitle>
            <CardDescription>
              {activeCount} active / {CAMERAS.length} total cameras
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {CAMERAS.map((cam) => (
              <div
                key={cam.id}
                className="relative aspect-video rounded-lg border border-border bg-muted/30 flex flex-col items-center justify-center text-muted-foreground text-sm"
              >
                <Badge
                  variant={cam.active ? "default" : "secondary"}
                  className="absolute top-2 right-2"
                >
                  {cam.active ? "Active" : "Inactive"}
                </Badge>
                <span className="font-medium text-foreground">{cam.id}</span>
                <span className="text-xs">{cam.location}</span>
                <span className="text-xs opacity-70 mt-1">Live feed</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </ModulePageLayout>
  )
}
