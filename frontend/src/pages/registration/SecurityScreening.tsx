import { useState, useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { Link } from "react-router-dom"
import { ROUTES } from "@/routes/config"
import { fetchVisitors, type VisitorRecord } from "@/lib/visitor-api"
import { getVisitorPhotoUrl } from "@/lib/image-match"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ShieldCheck, Loader2, Search, User } from "lucide-react"

function formatDate(s: string) {
  if (!s) return "—"
  try {
    return new Date(s).toLocaleDateString(undefined, { dateStyle: "short" })
  } catch {
    return s
  }
}

/** Fetch all visitors (walk-in + pre-registration) for screening. */
async function fetchAllVisitors(): Promise<VisitorRecord[]> {
  const [walkIn, preReg] = await Promise.all([
    fetchVisitors("walk-in"),
    fetchVisitors("pre-registration"),
  ])
  const walkInTagged = walkIn.map((v) => ({ ...v, _source: "walk-in" as const }))
  const preRegTagged = preReg.map((v) => ({ ...v, _source: "pre-registration" as const }))
  return [...walkInTagged, ...preRegTagged]
}

export default function SecurityScreeningPage() {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  const { data: visitors, isLoading, isError, error } = useQuery({
    queryKey: ["visitors", "screening"],
    queryFn: fetchAllVisitors,
  })

  const filtered = useMemo(() => {
    if (!visitors) return []
    let list = visitors
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
    if (!visitors) return { all: 0 }
    const counts: Record<string, number> = { all: visitors.length }
    visitors.forEach((v) => {
      const s = v.watchlist_check_status ?? "not_checked"
      counts[s] = (counts[s] ?? 0) + 1
    })
    return counts
  }, [visitors])

  const renderProfileImage = (v: VisitorRecord) => {
    const src = getVisitorPhotoUrl(v as Record<string, unknown>)
    if (src) {
      return (
        <img
          src={src}
          alt={v.full_name || "Visitor"}
          className="h-full w-full object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement
            target.style.display = "none"
            const parent = target.parentElement
            if (parent && !parent.querySelector(".fallback-icon")) {
              const fallback = document.createElement("div")
              fallback.className = "fallback-icon h-full w-full flex items-center justify-center"
              fallback.innerHTML =
                '<svg class="h-5 w-5 text-[#3b82f6]" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>'
              parent.appendChild(fallback)
            }
          }}
        />
      )
    }
    return <User className="h-5 w-5 text-[#3b82f6]" />
  }

  return (
    <>
      <nav className="text-sm text-muted-foreground mb-2">
        <Link to={ROUTES.DASHBOARD} className="hover:text-foreground">
          Home
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">Visitor Management System</span>
        <span className="mx-2">/</span>
        <span className="text-[#3b82f6]">Security & Screening</span>
      </nav>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground">Security & Screening</h1>
        <p className="text-sm text-muted-foreground">
          Search and screen visitors by name, CNIC, passport, or screening status.
        </p>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5" />
            Visitor list
          </CardTitle>
          <CardDescription>Filter by name, CNIC, passport, or screening status.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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

          {isLoading && (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-[#3b82f6]" />
            </div>
          )}
          {isError && (
            <div className="rounded-lg border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">
              {error instanceof Error ? error.message : "Failed to load visitors."}
            </div>
          )}

          {!isLoading && !isError && (
            <div className="rounded-lg border border-border overflow-hidden">
              <div className="px-4 py-3 border-b border-border font-medium text-foreground">
                Visitors {filtered.length > 0 ? `(${filtered.length})` : ""}
              </div>
              {filtered.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground text-sm">
                  No visitors match the filters.
                </div>
              ) : (
                <ul className="divide-y divide-border">
                  {filtered.map((v) => (
                    <li
                      key={`${v.registration_source ?? "v"}-${v.id}`}
                      className="p-4 flex items-center justify-between gap-4 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="h-10 w-10 rounded-full bg-[#3b82f6]/10 flex items-center justify-center shrink-0 overflow-hidden">
                          {renderProfileImage(v)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-medium text-foreground truncate">{v.full_name || "Unknown"}</p>
                            <span
                              className={`inline-block text-xs px-2 py-0.5 rounded ${
                                v.watchlist_check_status === "cleared"
                                  ? "bg-green-500/10 text-green-700"
                                  : v.watchlist_check_status === "flagged"
                                  ? "bg-amber-500/10 text-amber-700"
                                  : "bg-muted text-muted-foreground"
                              }`}
                            >
                              {v.watchlist_check_status ?? "Not checked"}
                            </span>
                            {"_source" in v && v._source ? (
                              <span className="text-xs text-muted-foreground">
                                ({String((v as { _source?: string })._source)})
                              </span>
                            ) : null}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {v.cnic_number && <span>CNIC: {v.cnic_number}</span>}
                            {v.cnic_number && v.passport_number && <span> · </span>}
                            {v.passport_number && <span>Passport: {v.passport_number}</span>}
                            {!v.cnic_number && !v.passport_number && "No ID documents"}
                            {v.created_at && <span> · Added: {formatDate(v.created_at)}</span>}
                          </p>
                        </div>
                      </div>
                      <Button size="sm" variant="outline" asChild>
                        <Link to={`/visitors/${v.id}`}>View Details</Link>
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  )
}
