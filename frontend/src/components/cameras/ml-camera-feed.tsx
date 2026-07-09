import { useCallback, useEffect, useRef, useState } from "react"
import { Maximize2, Minimize2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  fetchMlLiveDetections,
  getMlLiveMjpegUrl,
  getRawMjpegUrl,
  cameraSourceLabel,
  type CameraRecord,
} from "@/lib/cameras-api"
import { cn } from "@/lib/utils"

type DetectionBox = {
  class_name?: string
  label: string
  confidence: number
  bbox: [number, number, number, number]
  alert?: boolean
  track_id?: number | null
  person_qr?: string | null
}

type MlCameraFeedProps = {
  camera: CameraRecord
  pollMl?: boolean
  /** When true, show model bounding boxes (ML annotated stream or canvas overlay). */
  showOverlay?: boolean
  pollIntervalMs?: number
  className?: string
  showBrandLogo?: boolean
  showFullscreenButton?: boolean
  onDetections?: (boxes: DetectionBox[]) => void
  onMlError?: (message: string) => void
  onScanStart?: () => void
}

const TEKEYE_LOGO_SRC = "/pakistan-customs-logo.png"

function StreamBrandMarks() {
  return (
    <>
      <div
        className="absolute top-3 left-3 z-10 rounded-lg border border-white/10 bg-black/50 px-3 py-2 pointer-events-none backdrop-blur-sm"
        aria-hidden
      >
        <img
          src={TEKEYE_LOGO_SRC}
          alt="Pakistan Customs"
          className="h-12 w-auto max-w-[180px] object-contain sm:h-14"
        />
      </div>
      <div
        className="absolute bottom-3 right-3 z-10 rounded-lg border border-white/10 bg-black/50 px-4 py-2.5 pointer-events-none backdrop-blur-sm"
        aria-hidden
      >
        <span className="text-xl font-extrabold uppercase tracking-[0.16em] text-white sm:text-2xl">
          TekEye
        </span>
      </div>
    </>
  )
}

function boxColor(det: DetectionBox): string {
  if (det.alert) return "#ef4444"
  const label = (det.label || "").toLowerCase()
  if (label === "unknown") return "#f97316"
  return "#22c55e"
}

function formatBoxLabel(det: DetectionBox): string {
  const parts = [det.label, `${Math.round(det.confidence * 100)}%`]
  if (det.track_id != null) parts.push(`T${det.track_id}`)
  if (det.person_qr) parts.push(det.person_qr)
  return parts.join(" ")
}

function drawDetectionOverlay(
  canvas: HTMLCanvasElement,
  container: HTMLElement,
  detections: DetectionBox[],
  frameWidth: number,
  frameHeight: number
) {
  const ctx = canvas.getContext("2d")
  if (!ctx) return

  const cw = container.clientWidth
  const ch = container.clientHeight
  if (cw <= 0 || ch <= 0) return

  canvas.width = cw
  canvas.height = ch
  ctx.clearRect(0, 0, cw, ch)

  if (!detections.length || frameWidth <= 0 || frameHeight <= 0) return

  const scale = Math.min(cw / frameWidth, ch / frameHeight)
  const dispW = frameWidth * scale
  const dispH = frameHeight * scale
  const offsetX = (cw - dispW) / 2
  const offsetY = (ch - dispH) / 2
  const sx = dispW / frameWidth
  const sy = dispH / frameHeight

  for (const det of detections) {
    const [x1, y1, x2, y2] = det.bbox
    const left = offsetX + x1 * sx
    const top = offsetY + y1 * sy
    const width = (x2 - x1) * sx
    const height = (y2 - y1) * sy
    const color = boxColor(det)

    ctx.strokeStyle = color
    ctx.lineWidth = 2
    ctx.strokeRect(left, top, width, height)

    const label = formatBoxLabel(det)
    ctx.font = "12px system-ui, sans-serif"
    const textW = ctx.measureText(label).width
    const textH = 14
    const textY = Math.max(textH + 2, top - 2)
    ctx.fillStyle = "rgba(0,0,0,0.7)"
    ctx.fillRect(left, textY - textH, textW + 6, textH + 4)
    ctx.fillStyle = color
    ctx.fillText(label, left + 3, textY)
  }
}

export function MlCameraFeed({
  camera,
  pollMl = false,
  showOverlay = true,
  pollIntervalMs = 2000,
  className = "",
  showBrandLogo = true,
  showFullscreenButton = false,
  onDetections,
  onMlError,
  onScanStart,
}: MlCameraFeedProps) {
  const [mlError, setMlError] = useState<string | null>(null)
  const [streamError, setStreamError] = useState<string | null>(null)
  const [streamRetry, setStreamRetry] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [overlayBoxes, setOverlayBoxes] = useState<DetectionBox[]>([])
  const [frameSize, setFrameSize] = useState({ width: 0, height: 0 })

  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const mlLiveSrc = getMlLiveMjpegUrl(camera)
  const rawMjpegSrc = camera.is_rtsp ? getRawMjpegUrl(camera) : null
  const useMlAnnotatedStream = showOverlay && !!mlLiveSrc
  const useCanvasOverlay = showOverlay && !useMlAnnotatedStream && !!rawMjpegSrc
  const streamSrc = useMlAnnotatedStream
    ? mlLiveSrc
    : rawMjpegSrc || mlLiveSrc

  const exitFullscreen = useCallback(() => setIsFullscreen(false), [])

  const shouldPoll = pollMl || useCanvasOverlay

  useEffect(() => {
    if (!shouldPoll || !streamSrc) return
    let cancelled = false

    const run = async () => {
      onScanStart?.()
      try {
        const result = await fetchMlLiveDetections(camera.id)
        if (cancelled) return
        const next = (result.detections || []).map((d) => ({
          class_name: d.class_name,
          label: d.label,
          confidence: d.confidence,
          bbox: d.bbox,
          alert: d.alert,
          track_id: d.track_id,
          person_qr: d.person_qr,
        }))
        setMlError(null)
        if (useCanvasOverlay) {
          setOverlayBoxes(next)
          const fw = result.display_width || result.frame_width || 0
          const fh = result.display_height || result.frame_height || 0
          if (fw > 0 && fh > 0) setFrameSize({ width: fw, height: fh })
        }
        onDetections?.(next)
      } catch (err) {
        if (!cancelled) {
          const msg = err instanceof Error ? err.message : "ML detection failed"
          setMlError(msg)
          onMlError?.(msg)
        }
      }
    }

    void run()
    const id = window.setInterval(run, pollIntervalMs)
    return () => {
      cancelled = true
      window.clearInterval(id)
    }
  }, [
    camera.id,
    streamSrc,
    shouldPoll,
    useCanvasOverlay,
    pollIntervalMs,
    onDetections,
    onMlError,
    onScanStart,
  ])

  const paintOverlay = useCallback(() => {
    if (!useCanvasOverlay) return
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return
    drawDetectionOverlay(canvas, container, overlayBoxes, frameSize.width, frameSize.height)
  }, [useCanvasOverlay, overlayBoxes, frameSize])

  useEffect(() => {
    paintOverlay()
  }, [paintOverlay])

  useEffect(() => {
    if (!useCanvasOverlay) return
    const container = containerRef.current
    if (!container) return
    const ro = new ResizeObserver(() => paintOverlay())
    ro.observe(container)
    return () => ro.disconnect()
  }, [useCanvasOverlay, paintOverlay])

  useEffect(() => {
    if (!isFullscreen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") exitFullscreen()
    }
    document.addEventListener("keydown", onKey)
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", onKey)
      document.body.style.overflow = ""
    }
  }, [isFullscreen, exitFullscreen])

  return (
    <div
      className={cn(
        "flex flex-col",
        isFullscreen && "fixed inset-0 z-[200] bg-black",
        className
      )}
    >
      <div
        ref={containerRef}
        className={cn(
          "relative aspect-video w-full overflow-hidden bg-black",
          isFullscreen && "flex-1 aspect-auto min-h-0"
        )}
      >
        {streamSrc ? (
          <img
            key={`${streamSrc}-${streamRetry}`}
            src={streamSrc}
            alt={camera.name}
            className="h-full w-full object-contain"
            onLoad={() => {
              setStreamError(null)
              paintOverlay()
            }}
            onError={() => {
              if (mlLiveSrc && streamRetry < 8) {
                window.setTimeout(() => setStreamRetry((n) => n + 1), 3000)
                return
              }
              setStreamError(
                mlLiveSrc
                  ? "ML stream failed — ensure ML service is running and camera is registered."
                  : "Cannot load stream — verify NVR credentials and ML service."
              )
            }}
          />
        ) : (
          <div className="flex h-full min-h-[120px] items-center justify-center px-4 text-center text-sm text-muted-foreground">
            Configure an NVR channel for this camera in Camera Management.
          </div>
        )}

        {useCanvasOverlay && (
          <canvas
            ref={canvasRef}
            className="pointer-events-none absolute inset-0 z-[5] h-full w-full"
            aria-hidden
          />
        )}

        <div className="absolute top-2 left-2 z-10 flex max-w-[70%] flex-wrap gap-1">
          <Badge variant="secondary" className="text-xs">
            {camera.name}
          </Badge>
          {useMlAnnotatedStream && <Badge className="bg-[#3b82f6] text-xs">ML live</Badge>}
          {useCanvasOverlay && <Badge className="bg-[#3b82f6] text-xs">ML overlay</Badge>}
          <Badge className="bg-[#3b82f6]/80 text-xs">{camera.purpose_label}</Badge>
        </div>

        {showFullscreenButton && (
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="absolute top-2 right-2 z-20 h-8 w-8 bg-black/55 text-white hover:bg-black/75 hover:text-white"
            onClick={() => (isFullscreen ? exitFullscreen() : setIsFullscreen(true))}
            title={isFullscreen ? "Exit full screen (Esc)" : "View full screen"}
            aria-label={isFullscreen ? "Exit full screen" : "View full screen"}
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
        )}

        {showBrandLogo && <StreamBrandMarks />}

        {(streamError || mlError) && (
          <p className="absolute bottom-10 left-1 right-1 z-10 truncate rounded bg-black/60 px-1 text-[10px] text-amber-300">
            {streamError || mlError}
          </p>
        )}
      </div>

      {isFullscreen && (
        <div className="shrink-0 border-t border-white/10 bg-black/90 px-4 py-2 text-center text-xs text-white/80">
          {camera.name}
          {" · "}
          {cameraSourceLabel(camera)}
          {" · "}
          Press Esc or tap minimize to exit
        </div>
      )}
    </div>
  )
}
