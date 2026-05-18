import { useEffect, useRef } from "react"
import { Link } from "react-router-dom"
import { Video, RefreshCw } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ROUTES } from "@/routes/config"

const DASHBOARD_CAMERA_FEEDS = [
  { id: 1, label: "Camera 1", src: "/camera1feed.mp4" },
  { id: 2, label: "Camera 2", src: "/camera2feed.mp4" },
  { id: 3, label: "Camera 3", src: "/camera3feed.mp4" },
  { id: 4, label: "Camera 4", src: "/camera4feed.mp4" },
] as const

export function DashboardRtspCameraGrid() {
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([])

  const refreshFeeds = () => {
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
  }, [])

  return (
    <Card className="min-w-0 overflow-hidden rounded-[10px] border-gray-200">
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Video className="h-5 w-5 text-[#155DFC]" />
            Live Camera Feeds
          </CardTitle>
          <CardDescription className="text-sm">
            Four camera feeds on the dashboard.
          </CardDescription>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button type="button" variant="outline" size="sm" onClick={refreshFeeds}>
            <RefreshCw className="mr-1.5 h-4 w-4" />
            Refresh
          </Button>
          <Button asChild size="sm" className="bg-[#155DFC] text-white hover:bg-[#155DFC]/90">
            <Link to={ROUTES.LIVE_CAMERA_GRID}>Full view</Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {DASHBOARD_CAMERA_FEEDS.map((feed, index) => (
            <div
              key={feed.id}
              className="flex min-w-0 flex-col overflow-hidden rounded-lg border border-gray-200 bg-black"
            >
              <div className="relative aspect-video w-full bg-zinc-900">
                <video
                  ref={(el) => {
                    videoRefs.current[index] = el
                  }}
                  src={feed.src}
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="auto"
                  className="h-full w-full object-contain"
                />
                <span className="absolute bottom-1 left-1 max-w-[calc(100%-0.5rem)] truncate rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-medium text-white sm:text-xs">
                  {feed.label}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
