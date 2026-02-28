import { useState, useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { fetchVisitors, type VisitorRecord } from "@/lib/visitor-api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Link } from "react-router-dom"
import { Shield, Loader2, Search, User } from "lucide-react"

function formatDate(s: string) {
  if (!s) return "—"
  try {
    return new Date(s).toLocaleDateString(undefined, { dateStyle: "short" })
  } catch {
    return s
  }
}

export default function WatchlistScreening() {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  const { data: visitors, isLoading, isError, error } = useQuery({
    queryKey: ["visitors"],
    queryFn: fetchVisitors,
  })

  const filtered = useMemo(() => {
    if (!visitors) return []
    let list = visitors as VisitorRecord[]
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      list = list.filter(
        (v) =>
          v.full_name?.toLowerCase().includes(q) ||
          v.cnic_number?.toLowerCase().includes(q) ||
          v.passport_number?.toLowerCase().includes(q)
      )
    }
    if (statusFilter !== "all") {
      list = list.filter((v) => (v.watchlist_check_status ?? "") === statusFilter)
    }
    return list
  }, [visitors, search, statusFilter])

  const statusCounts = useMemo(() => {
    if (!visitors) return {}
    const counts: Record<string, number> = { all: (visitors as VisitorRecord[]).length }
    ;(visitors as VisitorRecord[]).forEach((v) => {
      const s = v.watchlist_check_status ?? "not_checked"
      counts[s] = (counts[s] ?? 0) + 1
    })
    return counts
  }, [visitors])

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#3b82f6]/10 text-[#3b82f6]">
          <Shield className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-foreground">Watchlist Screening</h1>
          <p className="text-sm text-muted-foreground">
            Screen visitors against watchlists. Filter by name, CNIC, passport, or screening status.
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-4 space-y-4">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <Label htmlFor="search">Search visitor</Label>
            <div className="relative mt-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="search"
                placeholder="Name, CNIC, or passport..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
          <div className="min-w-[160px]">
            <Label>Screening status</Label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="mt-1 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="all">All ({statusCounts.all ?? 0})</option>
              <option value="cleared">Cleared</option>
              <option value="flagged">Flagged</option>
              <option value="not_checked">Not checked</option>
            </select>
          </div>
        </div>
      </div>

      {isLoading && (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-[#3b82f6]" />
        </div>
      )}
      {isError && (
        <div className="rounded-xl border border-destructive/40 bg-destructive/5 px-4 py-6 text-sm text-destructive">
          {error instanceof Error ? error.message : "Failed to load visitors."}
        </div>
      )}
      {filtered && (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="px-4 py-3 border-b border-border font-medium text-foreground">
            Visitors {filtered.length > 0 ? `(${filtered.length})` : ""}
          </div>
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-sm">No visitors match the filters.</div>
          ) : (
            <ul className="divide-y divide-border">
              {filtered.map((v) => (
                <li key={v.id} className="p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-10 w-10 rounded-full bg-[#3b82f6]/10 flex items-center justify-center shrink-0">
                      <User className="h-5 w-5 text-[#3b82f6]" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-foreground truncate">{v.full_name}</p>
                      <p className="text-xs text-muted-foreground">
                        CNIC: {v.cnic_number || "—"} · Passport: {v.passport_number || "—"} · {formatDate(v.created_at)}
                      </p>
                      <span
                        className={`inline-block mt-1 text-xs px-2 py-0.5 rounded ${
                          v.watchlist_check_status === "cleared"
                            ? "bg-green-500/10 text-green-700"
                            : v.watchlist_check_status === "flagged"
                              ? "bg-amber-500/10 text-amber-700"
                              : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {v.watchlist_check_status ?? "Not checked"}
                      </span>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" asChild>
                    <Link to={`/visitors/${v.id}`}>View</Link>
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
