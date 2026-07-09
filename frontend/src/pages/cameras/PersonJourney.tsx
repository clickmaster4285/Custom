import { useEffect, useMemo, useState } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { QRCodeCanvas } from "qrcode.react"
import {
  Route,
  Search,
  User,
  MapPin,
  Camera,
  Clock,
  ChevronRight,
  Loader2,
  UserCheck,
  UserX,
} from "lucide-react"
import { ModulePageLayout } from "@/components/dashboard/module-page-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import {
  fetchPersonIdentities,
  fetchPersonJourney,
  resolveMediaUrl,
  type PersonJourney,
  type PersonJourneySighting,
} from "@/lib/cameras-api"
import { getPersonJourneyPath, ROUTES } from "@/routes/config"
import { cn } from "@/lib/utils"

function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return "—"
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    })
  } catch {
    return iso
  }
}

function personTypeBadge(type: string) {
  const t = type.toLowerCase()
  if (t === "staff") {
    return (
      <Badge className="gap-1 bg-emerald-600 hover:bg-emerald-600">
        <UserCheck className="h-3 w-3" />
        Staff
      </Badge>
    )
  }
  if (t === "visitor") {
    return (
      <Badge className="gap-1 bg-blue-600 hover:bg-blue-600">
        <User className="h-3 w-3" />
        Visitor
      </Badge>
    )
  }
  return (
    <Badge variant="secondary" className="gap-1">
      <UserX className="h-3 w-3" />
      Unknown
    </Badge>
  )
}

function SnapshotImage({
  url,
  alt,
  className,
}: {
  url: string
  alt: string
  className?: string
}) {
  const src = resolveMediaUrl(url)
  if (!src) return null
  return (
    <a href={src} target="_blank" rel="noopener noreferrer" className="block">
      <img
        src={src}
        alt={alt}
        className={cn(
          "rounded-md border bg-muted object-cover hover:opacity-95 transition-opacity",
          className
        )}
        loading="lazy"
      />
    </a>
  )
}

function SnapshotPlaceholder({ status }: { status?: string }) {
  if (status === "pending" || status === "recording") {
    return (
      <div className="flex h-36 w-full items-center justify-center rounded-md border border-dashed bg-muted/40 text-xs text-muted-foreground">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Capturing snapshot…
      </div>
    )
  }
  if (status === "failed") {
    return (
      <div className="flex h-36 w-full items-center justify-center rounded-md border border-dashed bg-muted/40 text-xs text-destructive">
        Snapshot capture failed
      </div>
    )
  }
  return (
    <div className="flex h-36 w-full items-center justify-center rounded-md border border-dashed bg-muted/40 text-xs text-muted-foreground">
      No snapshot for this sighting
    </div>
  )
}

function SightingSnapshots({ sighting }: { sighting: PersonJourneySighting }) {
  const urls =
    sighting.snapshot_urls && sighting.snapshot_urls.length > 0
      ? sighting.snapshot_urls
      : sighting.snapshot_url
        ? [sighting.snapshot_url]
        : []

  if (urls.length === 0) {
    return <SnapshotPlaceholder status={sighting.clip_status} />
  }

  const title = sighting.camera_name || sighting.camera_code

  if (urls.length === 1) {
    return (
      <SnapshotImage
        url={urls[0]}
        alt={`${title} detection`}
        className="h-44 w-full sm:h-52"
      />
    )
  }

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {urls.map((url, i) => (
        <SnapshotImage
          key={`${url}-${i}`}
          url={url}
          alt={`${title} detection ${i + 1}`}
          className="h-28 w-full"
        />
      ))}
    </div>
  )
}

function SightingCard({
  sighting,
  index,
  total,
}: {
  sighting: PersonJourneySighting
  index: number
  total: number
}) {
  const ongoing = !sighting.ended_at
  return (
    <div className="relative flex gap-4 pb-8 last:pb-0">
      {index < total - 1 && (
        <div
          className="absolute left-[15px] top-8 bottom-0 w-px bg-border"
          aria-hidden
        />
      )}
      <div
        className={cn(
          "relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold",
          ongoing
            ? "border-primary bg-primary text-primary-foreground"
            : "border-muted-foreground/30 bg-muted text-muted-foreground"
        )}
      >
        {index + 1}
      </div>
      <Card className="min-w-0 flex-1">
        <CardHeader className="py-3 px-4">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <Camera className="h-4 w-4 text-muted-foreground" />
                {sighting.camera_name || sighting.camera_code}
              </CardTitle>
              <CardDescription className="mt-1 font-mono text-xs">
                {sighting.camera_code}
                {sighting.global_track_id != null
                  ? ` · Track P${sighting.global_track_id}`
                  : sighting.local_track_id != null
                    ? ` · Track T${sighting.local_track_id}`
                    : ""}
              </CardDescription>
            </div>
            {ongoing ? (
              <Badge variant="outline" className="border-primary text-primary">
                On camera
              </Badge>
            ) : (
              <Badge variant="outline">Completed</Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="px-4 pb-4 pt-0 space-y-3 text-sm">
          <SightingSnapshots sighting={sighting} />
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {sighting.site_code || "—"}
              {sighting.zone ? ` · ${sighting.zone}` : ""}
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {formatDateTime(sighting.started_at)}
              {sighting.ended_at ? ` → ${formatDateTime(sighting.ended_at)}` : " → now"}
            </span>
          </div>
          {sighting.label ? (
            <p className="text-foreground">
              Label: <span className="font-medium">{sighting.label}</span>
            </p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  )
}

export default function PersonJourneyPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialQr = searchParams.get("qr")?.trim() ?? ""
  const [query, setQuery] = useState(initialQr)
  const [activeQr, setActiveQr] = useState(initialQr)

  useEffect(() => {
    const fromUrl = searchParams.get("qr")?.trim() ?? ""
    if (fromUrl && fromUrl !== activeQr) {
      setQuery(fromUrl)
      setActiveQr(fromUrl)
    }
  }, [searchParams, activeQr])

  const {
    data: journey,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["person-journey", activeQr],
    queryFn: () => fetchPersonJourney(activeQr),
    enabled: Boolean(activeQr),
    retry: false,
  })

  const { data: recentPersons } = useQuery({
    queryKey: ["person-identities", "recent"],
    queryFn: () => fetchPersonIdentities(30),
  })

  const path = journey?.path ?? []

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault()
    const code = query.trim().toUpperCase()
    if (!code) return
    setActiveQr(code)
    setSearchParams({ qr: code })
  }

  const summaryStats = useMemo(() => {
    if (!journey) return null
    const sites = new Set(path.map((p) => p.site_code).filter(Boolean))
    const cameras = new Set(path.map((p) => p.camera_code).filter(Boolean))
    return {
      sightings: journey.sightings_count,
      sites: sites.size,
      cameras: cameras.size,
    }
  }, [journey, path])

  return (
    <ModulePageLayout
      title="Person Journey"
      description="Track a person across cameras using their unique PQR code (PQR-STF / PQR-VIS / PQR-UNK)."
      breadcrumbs={[
        { label: "AI Analytics" },
        { label: "Person Journey" },
      ]}
    >
      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Search className="h-4 w-4" />
                Lookup by PQR
              </CardTitle>
              <CardDescription>
                Enter a person QR code from detection logs or a printed badge.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleSearch} className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="pqr-search">Person QR (PQR-…)</Label>
                  <Input
                    id="pqr-search"
                    placeholder="PQR-UNK-a1b2c3"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="font-mono uppercase"
                    autoComplete="off"
                  />
                </div>
                <Button type="submit" className="w-full" disabled={!query.trim() || isFetching}>
                  {isFetching ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loading…
                    </>
                  ) : (
                    <>
                      <Route className="mr-2 h-4 w-4" />
                      Show journey
                    </>
                  )}
                </Button>
              </form>
              <p className="text-xs text-muted-foreground">
                Tip: open from{" "}
                <Link to={ROUTES.OBJECT_DETECTION} className="text-primary underline-offset-2 hover:underline">
                  Object Detection
                </Link>{" "}
                logs via the Person QR column.
              </p>
            </CardContent>
          </Card>

          {recentPersons && recentPersons.results.length > 0 ? (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Recent persons</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 max-h-[360px] overflow-y-auto">
                {recentPersons.results.map((p) => (
                  <button
                    key={p.qr_code_number}
                    type="button"
                    onClick={() => {
                      setQuery(p.qr_code_number)
                      setActiveQr(p.qr_code_number)
                      setSearchParams({ qr: p.qr_code_number })
                    }}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm hover:bg-muted/80 transition-colors",
                      activeQr === p.qr_code_number && "bg-muted"
                    )}
                  >
                    {p.snapshot_url ? (
                      <img
                        src={resolveMediaUrl(p.snapshot_url)}
                        alt=""
                        className="h-10 w-14 shrink-0 rounded border object-cover bg-muted"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-10 w-14 shrink-0 items-center justify-center rounded border bg-muted/50">
                        <User className="h-4 w-4 text-muted-foreground" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="font-mono text-xs truncate">{p.qr_code_number}</p>
                      <p className="text-muted-foreground truncate text-xs">
                        {p.display_name || p.person_type}
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                  </button>
                ))}
              </CardContent>
            </Card>
          ) : null}
        </div>

        <div className="space-y-4 min-w-0">
          {!activeQr ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
                <Route className="h-12 w-12 mb-3 opacity-30" />
                <p>Search a PQR code to view the camera journey.</p>
              </CardContent>
            </Card>
          ) : isLoading ? (
            <Card>
              <CardContent className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin" />
                Loading journey…
              </CardContent>
            </Card>
          ) : isError ? (
            <Card className="border-destructive/50">
              <CardContent className="py-10 text-center space-y-3">
                <p className="text-destructive font-medium">
                  {error instanceof Error ? error.message : "Person not found"}
                </p>
                <Button variant="outline" size="sm" onClick={() => refetch()}>
                  Retry
                </Button>
              </CardContent>
            </Card>
          ) : journey ? (
            <>
              <Card>
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row gap-6">
                    <div className="flex flex-col items-center gap-2 shrink-0">
                      <div className="rounded-lg border bg-white p-3">
                        <QRCodeCanvas value={journey.qr_code_number} size={140} level="M" />
                      </div>
                      <p className="font-mono text-sm font-semibold">{journey.qr_code_number}</p>
                    </div>
                    {journey.snapshot_url ? (
                      <div className="w-full sm:max-w-xs shrink-0">
                        <p className="text-xs text-muted-foreground mb-1.5">Latest snapshot</p>
                        <SnapshotImage
                          url={journey.snapshot_url}
                          alt={`${journey.display_name || journey.qr_code_number} latest sighting`}
                          className="h-44 w-full"
                        />
                      </div>
                    ) : null}
                    <div className="flex-1 space-y-3 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        {personTypeBadge(journey.person_type)}
                        {journey.staff_id ? (
                          <Badge variant="outline">Staff ID {journey.staff_id}</Badge>
                        ) : null}
                        {journey.visitor_id ? (
                          <Badge variant="outline">Visitor ID {journey.visitor_id}</Badge>
                        ) : null}
                      </div>
                      <h2 className="text-xl font-semibold truncate">
                        {journey.display_name || "Unidentified person"}
                      </h2>
                      {journey.global_track_id != null ? (
                        <p className="text-sm font-mono text-muted-foreground">
                          Global track ID: P{journey.global_track_id}
                        </p>
                      ) : null}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                        <div>
                          <p className="text-muted-foreground text-xs">Sightings</p>
                          <p className="font-semibold">{summaryStats?.sightings ?? 0}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">Cameras</p>
                          <p className="font-semibold">{summaryStats?.cameras ?? 0}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">Sites</p>
                          <p className="font-semibold">{summaryStats?.sites ?? 0}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">Last seen</p>
                          <p className="font-semibold text-xs">{formatDateTime(journey.last_seen_at)}</p>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        First seen {formatDateTime(journey.first_seen_at)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Route className="h-4 w-4" />
                    Camera path
                  </CardTitle>
                  <CardDescription>
                    Chronological sightings across all connected cameras.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {path.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-6 text-center">
                      No sightings recorded yet for this person.
                    </p>
                  ) : (
                    <div className="pt-2">
                      {path.map((sighting, index) => (
                        <SightingCard
                          key={`${sighting.camera_id}-${sighting.started_at}-${index}`}
                          sighting={sighting}
                          index={index}
                          total={path.length}
                        />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          ) : null}
        </div>
      </div>
    </ModulePageLayout>
  )
}
