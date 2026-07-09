import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { Activity, Flame, Package, QrCode, Truck } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { fetchWmsOverview, type WmsOverview } from "@/lib/wms-flow-api"
import { getDestructionDetailPath } from "@/routes/config"

type WmsFlowOverviewPanelProps = {
  detentionMemoId: string
  caseNo?: string
}

function eventLabel(type: string): string {
  const map: Record<string, string> = {
    memo_created: "Memo created",
    deposited: "Deposited",
    seized: "Seized → inventory",
    released: "Released",
    destructed: "Destructed",
    stock_updated: "Stock updated",
  }
  return map[type] || type
}

export function WmsFlowOverviewPanel({ detentionMemoId, caseNo }: WmsFlowOverviewPanelProps) {
  const [overview, setOverview] = useState<WmsOverview | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    fetchWmsOverview({ detentionMemoId, caseNo })
      .then((data) => {
        if (!cancelled) setOverview(data)
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "Could not load WMS flow.")
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [detentionMemoId, caseNo])

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">Loading warehouse lifecycle…</p>
        </CardContent>
      </Card>
    )
  }

  if (error || !overview?.found) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">{error || "No lifecycle data yet."}</p>
        </CardContent>
      </Card>
    )
  }

  const s = overview.summary!

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Activity className="h-4 w-4" />
          Warehouse lifecycle (QR tracked)
        </CardTitle>
        <CardDescription>
          Detention → deposit → seize → inventory → release / destruction — full audit trail.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="rounded-lg border p-3">
            <p className="text-xs text-muted-foreground">Goods lines</p>
            <p className="text-xl font-bold">{s.totalGoodsLines}</p>
            <p className="text-xs text-muted-foreground">Qty: {s.totalGoodsQuantity}</p>
          </div>
          <div className="rounded-lg border p-3">
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Package className="h-3 w-3" /> In inventory
            </p>
            <p className="text-xl font-bold">{s.inInventoryCount}</p>
            <p className="text-xs text-muted-foreground">Qty: {s.inInventoryQuantity}</p>
          </div>
          <div className="rounded-lg border p-3">
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Truck className="h-3 w-3" /> Released
            </p>
            <p className="text-xl font-bold">{s.releaseCount}</p>
            <p className="text-xs text-muted-foreground">Qty: {s.releasedQuantity}</p>
          </div>
          <div className="rounded-lg border p-3">
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Flame className="h-3 w-3" /> Destructed
            </p>
            <p className="text-xl font-bold">{s.destructedCount}</p>
            <p className="text-xs text-muted-foreground">Qty: {s.destructedQuantity}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 text-sm">
          <Badge variant={s.deposited ? "default" : "secondary"}>Deposited: {s.depositCount}</Badge>
          <Badge variant={s.seized ? "default" : "secondary"}>Seized: {s.seizureCount}</Badge>
          <Badge variant={s.released ? "default" : "secondary"}>Released: {s.releaseCount}</Badge>
          <Badge variant={s.destructionSessionCount > 0 ? "destructive" : "secondary"}>
            Destruction sessions: {s.destructionSessionCount}
          </Badge>
        </div>

        {(overview.stockItems?.length ?? 0) > 0 && (
          <div>
            <p className="text-sm font-semibold mb-2 flex items-center gap-1">
              <QrCode className="h-4 w-4" /> Inventory by QR
            </p>
            <div className="rounded-md border divide-y max-h-48 overflow-y-auto">
              {overview.stockItems!.map((item) => (
                <div key={item.id} className="p-2 text-xs flex justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-mono truncate">{item.qrCode || "—"}</p>
                    <p className="truncate text-muted-foreground">{item.description}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p>{item.quantity} {item.unit}</p>
                    <Badge variant="outline" className="text-[10px]">{item.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {(overview.destructions?.length ?? 0) > 0 && (
          <div>
            <p className="text-sm font-semibold mb-2">Destruction records & video</p>
            <div className="space-y-2">
              {overview.destructions!.map((d) => (
                <div key={d.id} className="rounded-md border p-2 text-xs">
                  <div className="flex justify-between gap-2">
                    <span className="font-medium">{d.caseNo || d.id.slice(0, 8)}</span>
                    <Badge variant="outline">{d.outcome || d.status}</Badge>
                  </div>
                  <p className="text-muted-foreground mt-1">
                    {d.completedAt ? new Date(d.completedAt).toLocaleString() : "—"}
                    {d.locationCode ? ` • ${d.locationCode}` : ""}
                    {d.performedBy ? ` • ${d.performedBy}` : ""}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" className="h-7 text-xs" asChild>
                      <Link to={getDestructionDetailPath(d.id)}>View report & videos</Link>
                    </Button>
                    {d.videoUrl && (
                      <a href={d.videoUrl} target="_blank" rel="noreferrer" className="text-[#3b82f6] underline text-xs">
                        Primary video
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {(overview.releases?.length ?? 0) > 0 && (
          <div>
            <p className="text-sm font-semibold mb-2">Release records</p>
            <div className="rounded-md border divide-y max-h-48 overflow-y-auto">
              {overview.releases!.map((r) => (
                <div key={r.id} className="p-2 text-xs">
                  <div className="flex justify-between gap-2">
                    <span className="font-mono">{r.qrCode || "—"}</span>
                    <span className="text-muted-foreground">{new Date(r.releasedAt).toLocaleString()}</span>
                  </div>
                  <p>
                    {r.quantityReleased} {r.unit} — on behalf of {r.releasedOnBehalfOf}
                  </p>
                  <p className="text-muted-foreground">
                    Deputy: {r.deputyName} • Collector: {r.collectorName}
                  </p>
                  {r.releaseDescription && <p className="mt-1">{r.releaseDescription}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {(overview.timeline?.length ?? 0) > 0 && (
          <div>
            <p className="text-sm font-semibold mb-2">Timeline</p>
            <div className="rounded-md border divide-y max-h-56 overflow-y-auto">
              {overview.timeline!.map((ev) => (
                <div key={ev.id} className="p-2 text-xs">
                  <div className="flex justify-between gap-2">
                    <span className="font-medium">{eventLabel(ev.event_type)}</span>
                    <span className="text-muted-foreground">{new Date(ev.created_at).toLocaleString()}</span>
                  </div>
                  {ev.qr_code && <p className="font-mono text-muted-foreground">QR: {ev.qr_code}</p>}
                  {ev.description && <p>{ev.description}</p>}
                  {ev.quantity != null && (
                    <p className="text-muted-foreground">
                      Qty: {ev.quantity} {ev.unit || ""}
                    </p>
                  )}
                  {ev.metadata && typeof ev.metadata === "object" && (
                    <>
                      {"releasedOnBehalfOf" in ev.metadata && ev.metadata.releasedOnBehalfOf ? (
                        <p className="text-muted-foreground">On behalf of: {String(ev.metadata.releasedOnBehalfOf)}</p>
                      ) : null}
                      {"deputyName" in ev.metadata && ev.metadata.deputyName ? (
                        <p className="text-muted-foreground">Deputy: {String(ev.metadata.deputyName)}</p>
                      ) : null}
                      {"collectorName" in ev.metadata && ev.metadata.collectorName ? (
                        <p className="text-muted-foreground">Collector: {String(ev.metadata.collectorName)}</p>
                      ) : null}
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
