import { DEFAULT_LIVE_STREAM_URL } from "@/lib/live-stream-url"

export const CAMERA_INTEGRATION_STORAGE_KEY = "wms_camera_integration"

export type CameraType = "PTZ" | "Fixed" | "Thermal" | "360°"
export type CameraStatus = "Online" | "Offline"

export type IntegrationCamera = {
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

function ensureCameraShape(r: Record<string, unknown>): IntegrationCamera {
  return {
    id: String(r.id ?? ""),
    name: String(r.name ?? r.location ?? ""),
    location: String(r.location ?? "").trim(),
    wh: String(r.wh ?? "Peshawar"),
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

const defaultCameras: IntegrationCamera[] = [
  {
    id: "CAM-WH001-01",
    name: "Main Gate",
    location: "Main Gate",
    wh: "Peshawar",
    zone: "Z-A01",
    cameraType: "Fixed",
    status: "Online",
    streamUrl: "/camera1feed.mp4",
    resolution: "1920x1080",
    frameRate: "30",
    recording: true,
    storagePath: "/recordings/wh001-01",
    aiModelApplied: "Object Detection",
    active: true,
  },
  {
    id: "CAM-WH001-02",
    name: "Receiving Dock",
    location: "Receiving Dock",
    wh: "Peshawar",
    zone: "Z-A01",
    cameraType: "PTZ",
    status: "Online",
    streamUrl: "/camera2feed.mp4",
    resolution: "1920x1080",
    frameRate: "30",
    recording: true,
    storagePath: "/recordings/wh001-02",
    aiModelApplied: "ANPR",
    active: true,
  },
  {
    id: "CAM-WH001-03",
    name: "Bulk Storage A",
    location: "Bulk Storage A",
    wh: "Peshawar",
    zone: "Z-B02",
    cameraType: "Fixed",
    status: "Offline",
    streamUrl: "/camera3feed.mp4",
    resolution: "1280x720",
    frameRate: "25",
    recording: false,
    storagePath: "/recordings/wh001-03",
    aiModelApplied: "",
    active: false,
  },
  {
    id: "CAM-WH001-04",
    name: "Picking Zone",
    location: "Picking Zone",
    wh: "Peshawar",
    zone: "Z-C03",
    cameraType: "Fixed",
    status: "Online",
    streamUrl: "/camera4feed.mp4",
    resolution: "1920x1080",
    frameRate: "30",
    recording: true,
    storagePath: "/recordings/wh001-04",
    aiModelApplied: "Object Detection",
    active: true,
  },
]

export function loadIntegrationCameras(): IntegrationCamera[] {
  if (typeof window === "undefined") return defaultCameras
  try {
    const raw = window.localStorage.getItem(CAMERA_INTEGRATION_STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as Record<string, unknown>[]
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map(ensureCameraShape)
      }
    }
  } catch {
    // ignore
  }
  return defaultCameras
}

export function saveIntegrationCameras(rows: IntegrationCamera[]): void {
  if (typeof window === "undefined") return
  window.localStorage.setItem(CAMERA_INTEGRATION_STORAGE_KEY, JSON.stringify(rows))
  window.dispatchEvent(new Event("camera-integration-updated"))
}

/** Browser-playable video URL (MP4/HLS/http), not raw RTSP placeholder. */
export function resolveCameraVideoSrc(streamUrl: string | undefined | null): string | null {
  const url = (streamUrl ?? "").trim()
  if (!url || url === DEFAULT_LIVE_STREAM_URL) return null
  if (url.startsWith("rtsp://") || url.startsWith("rtsps://")) return null
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("/")) {
    return url
  }
  return url
}

export function hasPlayableVideo(cam: IntegrationCamera): boolean {
  return resolveCameraVideoSrc(cam.streamUrl) !== null
}

export function getIntegrationCameraLocations(cameras: IntegrationCamera[]): string[] {
  const set = new Set<string>()
  for (const cam of cameras) {
    const loc = cam.location.trim()
    if (loc) set.add(loc)
  }
  return Array.from(set).sort((a, b) => a.localeCompare(b))
}

export function filterCamerasByLocation(
  cameras: IntegrationCamera[],
  location: string
): IntegrationCamera[] {
  if (!location || location === "all") return cameras
  return cameras.filter((c) => c.location.trim() === location)
}

export function getDashboardFeedCameras(
  cameras: IntegrationCamera[],
  location: string,
  maxFeeds = 4
): IntegrationCamera[] {
  return filterCamerasByLocation(cameras, location)
    .filter((c) => c.active && c.status === "Online" && hasPlayableVideo(c))
    .slice(0, maxFeeds)
}
