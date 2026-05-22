import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Link } from "react-router-dom"
import { Video, RefreshCw, MapPin } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ROUTES } from "@/routes/config"
import {
  getDashboardFeedCameras,
  getIntegrationCameraLocations,
  loadIntegrationCameras,
  resolveCameraVideoSrc,
  type IntegrationCamera,
} from "@/lib/camera-integration"

const ALL_LOCATIONS = "all"
const MAX_FEEDS = 4

export function DashboardRtspCameraGrid() {
  const [cameras, setCameras] = useState<IntegrationCamera[]>(() => loadIntegrationCameras())
  const [location, setLocation] = useState(ALL_LOCATIONS)
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([])

  const reloadCameras = useCallback(() => {
    setCameras(loadIntegrationCameras())
  }, [])

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === "wms_camera_integration" || e.key === null) reloadCameras()
    }
    const onCustom = () => reloadCameras()
    window.addEventListener("storage", onStorage)
    window.addEventListener("camera-integration-updated", onCustom)
    window.addEventListener("focus", reloadCameras)
    return () => {
      window.removeEventListener("storage", onStorage)
      window.removeEventListener("camera-integration-updated", onCustom)
      window.removeEventListener("focus", reloadCameras)
    }
  }, [reloadCameras])

  const locations = useMemo(() => getIntegrationCameraLocations(cameras), [cameras])

  useEffect(() => {
    if (location !== ALL_LOCATIONS && !locations.includes(location)) {
      setLocation(ALL_LOCATIONS)
    }
  }, [location, locations])

  const feeds = useMemo(
    () => getDashboardFeedCameras(cameras, location, MAX_FEEDS),
    [cameras, location]
  )

  const refreshFeeds = () => {
    reloadCameras()
    videoRefs.current.forEach((video) => {
      if (!video) return
      video.pause()
      video.currentTime = 0
      void video.play()
    })
  }

  useEffect(() => {
    videoRefs.current.forEach((video) => {
      if (video) void video.play()
    })
  }, [feeds, location])

  const locationLabel =
    location === ALL_LOCATIONS ? "all locations" : location

  return (
    <Card className="min-w-0 overflow-hidden rounded-[10px] border-gray-200">
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Video className="h-5 w-5 text-[#155DFC]" />
            Live Camera Feeds
          </CardTitle>
          <CardDescription className="text-sm">
            Feeds from Camera Integration, filtered by location.
          </CardDescription>
        </div>
        <div className="flex flex-wrap shrink-0 items-center gap-2">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
            <Select value={location} onValueChange={setLocation}>
              <SelectTrigger className="h-9 w-[min(100%,220px)] sm:w-[200px]">
                <SelectValue placeholder="Select location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_LOCATIONS}>All locations</SelectItem>
                {locations.map((loc) => (
                  <SelectItem key={loc} value={loc}>
                    {loc}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={refreshFeeds}>
            <RefreshCw className="mr-1.5 h-4 w-4" />
            Refresh
          </Button>
          <Button asChild size="sm" className="bg-[#155DFC] text-white hover:bg-[#155DFC]/90">
            <Link to={ROUTES.CAMERA_INTEGRATION}>Manage cameras</Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {feeds.length === 0 ? (
          <div className="flex aspect-video max-h-[280px] flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-gray-300 bg-muted/30 px-4 text-center text-sm text-muted-foreground">
            <p>
              No active video feeds for <span className="font-medium text-foreground">{locationLabel}</span>.
            </p>
            <p className="text-xs">
              Add cameras in Camera Integration with a location and an MP4/video URL (e.g.{" "}
              <code className="rounded bg-muted px-1">/camera1feed.mp4</code>).
            </p>
            <Button asChild size="sm" variant="outline" className="mt-1">
              <Link to={ROUTES.CAMERA_INTEGRATION}>Open Camera Integration</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {feeds.map((cam, index) => {
              const src = resolveCameraVideoSrc(cam.streamUrl)
              return (
                <div
                  key={cam.id}
                  className="flex min-w-0 flex-col overflow-hidden rounded-lg border border-gray-200 bg-black"
                >
                  <div className="relative aspect-video w-full bg-zinc-900">
                    {src ? (
                      <video
                        ref={(el) => {
                          videoRefs.current[index] = el
                        }}
                        src={src}
                        autoPlay
                        muted
                        loop
                        playsInline
                        preload="auto"
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs text-zinc-400">
                        No playable video URL
                      </div>
                    )}
                    <span className="absolute bottom-1 left-1 max-w-[calc(100%-0.5rem)] truncate rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-medium text-white sm:text-xs">
                      {cam.name}
                      {cam.location ? ` · ${cam.location}` : ""}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
        {feeds.length > 0 && (
          <p className="mt-3 text-xs text-muted-foreground">
            Showing {feeds.length} feed{feeds.length === 1 ? "" : "s"} for {locationLabel}.{" "}
            {location !== ALL_LOCATIONS && (
              <>
                Change location above or{" "}
              </>
            )}
            <Link to={ROUTES.CAMERA_INTEGRATION} className="text-[#155DFC] hover:underline">
              add more cameras
            </Link>
            .
          </p>
        )}
      </CardContent>
    </Card>
  )
}
