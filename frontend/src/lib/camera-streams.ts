import { API_BASE_URL, getAuthHeaders, getStoredToken } from "@/lib/api"

export type DashboardCamera = {
  id: number
  label: string
  stream_path: string
}

export type CameraStreamListResponse = {
  cameras: DashboardCamera[]
  ffmpeg_available: boolean
}

/** MJPEG URL for <img> (includes token query param because img cannot send Authorization header). */
export function getCameraMjpegUrl(streamPath: string): string {
  const base = API_BASE_URL.replace(/\/$/, "")
  const path = streamPath.startsWith("/") ? streamPath : `/${streamPath}`
  const token = getStoredToken()
  const qs = token ? `?token=${encodeURIComponent(token)}` : ""
  return `${base}${path}${qs}`
}

export async function fetchDashboardCameras(): Promise<CameraStreamListResponse> {
  const res = await fetch(`${API_BASE_URL}/api/cameras/streams/`, {
    headers: getAuthHeaders(),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || `Failed to load cameras (${res.status})`)
  }
  return res.json() as Promise<CameraStreamListResponse>
}
