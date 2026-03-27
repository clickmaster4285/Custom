import { useMemo, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { QrCode, ScanLine, Search, UserCheck } from "lucide-react"
import { ROUTES } from "@/routes/config"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { fetchVisitors, updateVisitor, type RegistrationSource, type VisitorRecord } from "@/lib/visitor-api"

type GuardVisitor = {
  id: number
  source: RegistrationSource
  name: string
  qrCodeId: string
  host: string
  purpose: string
  status: string
  entryTime: string
}

function toDisplayDateTime(value: string | null | undefined): string {
  if (!value) return "—"
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return "—"
  return d.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })
}

function mapGuardVisitor(row: VisitorRecord & Record<string, unknown>, source: RegistrationSource): GuardVisitor {
  const qrCodeId = String(row.qr_code_id ?? row.qrCodeId ?? row.visitor_ref_number ?? "").trim()
  const status = String(row.registration_status ?? "approved")
  const entryTimeRaw = String(row.guard_entry_time ?? row.check_in_time ?? row.entry_time ?? "")
  return {
    id: row.id,
    source,
    name: String(row.full_name ?? "Unknown Visitor"),
    qrCodeId,
    host: String(row.host_officer_name ?? row.hostFullName ?? row.host_name ?? "—"),
    purpose: String(row.visit_purpose ?? row.visitPurpose ?? "—"),
    status: entryTimeRaw ? "Checked In" : status === "sent" || status === "approved" ? "Expected" : "Draft",
    entryTime: entryTimeRaw,
  }
}

export default function GuardReceptionPanelPage() {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const [scanMode, setScanMode] = useState<"scan" | "manual">("scan")
  const [qrInput, setQrInput] = useState("")
  const [search, setSearch] = useState("")
  const [guardName, setGuardName] = useState("")
  const [lastCheckedIn, setLastCheckedIn] = useState<GuardVisitor | null>(null)

  const walkInQuery = useQuery({
    queryKey: ["visitors", "walk-in", "guard-panel"],
    queryFn: () => fetchVisitors("walk-in"),
  })
  const preRegQuery = useQuery({
    queryKey: ["visitors", "pre-registration", "guard-panel"],
    queryFn: () => fetchVisitors("pre-registration"),
  })

  const visitors = useMemo(() => {
    const walkin = (walkInQuery.data ?? []).map((v) => mapGuardVisitor(v as VisitorRecord & Record<string, unknown>, "walk-in"))
    const prereg = (preRegQuery.data ?? []).map((v) => mapGuardVisitor(v as VisitorRecord & Record<string, unknown>, "pre-registration"))
    return [...walkin, ...prereg].sort((a, b) => b.id - a.id)
  }, [walkInQuery.data, preRegQuery.data])

  const filteredVisitors = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return visitors
    return visitors.filter((v) => {
      return (
        v.name.toLowerCase().includes(q) ||
        v.qrCodeId.toLowerCase().includes(q) ||
        v.host.toLowerCase().includes(q) ||
        v.purpose.toLowerCase().includes(q) ||
        v.source.toLowerCase().includes(q)
      )
    })
  }, [search, visitors])

  const checkInMutation = useMutation({
    mutationFn: async () => {
      const normalizedInput = qrInput.trim().toLowerCase()
      if (!normalizedInput) throw new Error("Please scan or enter QR code number.")
      const matched = visitors.find((v) => v.qrCodeId.trim().toLowerCase() === normalizedInput)
      if (!matched) throw new Error("No visitor found for this QR code number.")

      const now = new Date().toISOString()
      const updated = await updateVisitor(
        matched.id,
        {
          guard_entry_time: now,
          check_in_time: now,
          scanned_qr_code: qrInput.trim(),
          checked_in_by: guardName.trim() || "Guard",
          flow_stage: "checked-in",
        },
        matched.source,
        { registrationStatus: "sent" },
      )
      if (!updated) throw new Error("Could not update visitor record.")
      return matched
    },
    onSuccess: (matched) => {
      setLastCheckedIn(matched)
      setQrInput("")
      queryClient.invalidateQueries({ queryKey: ["visitors", "walk-in"] })
      queryClient.invalidateQueries({ queryKey: ["visitors", "pre-registration"] })
      toast({
        title: "Entrance marked",
        description: `${matched.name} has been checked in.`,
      })
    },
    onError: (err) => {
      toast({
        title: "Check-in failed",
        description: err instanceof Error ? err.message : "Unable to mark entrance time.",
        variant: "destructive",
      })
    },
  })

  const handleMarkEntry = () => {
    checkInMutation.mutate()
  }

  const handleScanFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText()
      if (!text?.trim()) {
        toast({ title: "Clipboard is empty", variant: "destructive" })
        return
      }
      setQrInput(text.trim())
      toast({ title: "Scanned", description: "QR code number captured from scanner/clipboard." })
    } catch {
      toast({
        title: "Scan not available",
        description: "Paste or type QR code number manually.",
        variant: "destructive",
      })
    }
  }

  const isLoading = walkInQuery.isLoading || preRegQuery.isLoading

  return (
    <div className="w-full px-4 sm:px-6 space-y-6">
      <nav className="text-base text-muted-foreground flex flex-wrap items-center gap-x-2 gap-y-1" aria-label="Breadcrumb">
        <span>Home</span>
        <span aria-hidden className="text-muted-foreground/70">/</span>
        <span>Visitor Management System</span>
        <span aria-hidden className="text-muted-foreground/70">/</span>
        <span className="text-[#3b82f6] font-medium">Guard & Reception Panel</span>
      </nav>

      <div>
        <h1 className="text-[22px] font-bold tracking-tight text-foreground">Guard & Reception Panel</h1>
        <p className="text-base text-muted-foreground mt-1">
          Guard scans or enters visitor QR code and marks entrance time for walk-in and pre-registration records.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5 text-[#3b82f6]" />
            Entrance Check-In
          </CardTitle>
          <CardDescription>Select scan mode, input QR code number, and mark entry.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Button variant={scanMode === "scan" ? "default" : "outline"} onClick={() => setScanMode("scan")} type="button">
              <ScanLine className="h-4 w-4 mr-2" />
              Scan
            </Button>
            <Button variant={scanMode === "manual" ? "default" : "outline"} onClick={() => setScanMode("manual")} type="button">
              <QrCode className="h-4 w-4 mr-2" />
              Enter QR Number
            </Button>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <div className="md:col-span-2">
              <Label htmlFor="guard-qr-input">
                {scanMode === "scan" ? "Scanned QR code number" : "QR code number"}
              </Label>
              <Input
                id="guard-qr-input"
                placeholder="e.g. QR-2026-0012"
                value={qrInput}
                onChange={(e) => setQrInput(e.target.value)}
                className="mt-1 font-mono"
              />
            </div>
            <div>
              <Label htmlFor="guard-name">Guard name</Label>
              <Input
                id="guard-name"
                placeholder="Guard name"
                value={guardName}
                onChange={(e) => setGuardName(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {scanMode === "scan" && (
              <Button type="button" variant="outline" onClick={handleScanFromClipboard}>
                <ScanLine className="h-4 w-4 mr-2" />
                Capture from scanner
              </Button>
            )}
            <Button type="button" onClick={handleMarkEntry} disabled={checkInMutation.isPending}>
              <UserCheck className="h-4 w-4 mr-2" />
              {checkInMutation.isPending ? "Marking..." : "Mark Entrance Time"}
            </Button>
          </div>

          {lastCheckedIn && (
            <div className="rounded-md border bg-green-500/5 border-green-500/40 px-3 py-2 text-sm">
              Last check-in: <span className="font-medium">{lastCheckedIn.name}</span> ({lastCheckedIn.qrCodeId || "No QR ID"})
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5 text-[#3b82f6]" />
            Visitor Lookup
          </CardTitle>
          <CardDescription>Search by name, QR code, source, host, or purpose.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Search visitor / QR code / host..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <div className="rounded-md border overflow-x-auto">
            <table className="w-full min-w-[980px]">
              <thead>
                <tr className="border-b bg-muted/20">
                  <th className="px-3 py-2 text-left text-xs uppercase text-muted-foreground">Visitor</th>
                  <th className="px-3 py-2 text-left text-xs uppercase text-muted-foreground">Source</th>
                  <th className="px-3 py-2 text-left text-xs uppercase text-muted-foreground">QR Code</th>
                  <th className="px-3 py-2 text-left text-xs uppercase text-muted-foreground">Host</th>
                  <th className="px-3 py-2 text-left text-xs uppercase text-muted-foreground">Purpose</th>
                  <th className="px-3 py-2 text-left text-xs uppercase text-muted-foreground">Status</th>
                  <th className="px-3 py-2 text-left text-xs uppercase text-muted-foreground">Entrance Time</th>
                  <th className="px-3 py-2 text-right text-xs uppercase text-muted-foreground">Action</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={8} className="px-3 py-4 text-sm text-center text-muted-foreground">Loading visitors...</td>
                  </tr>
                ) : filteredVisitors.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-3 py-4 text-sm text-center text-muted-foreground">No visitors found.</td>
                  </tr>
                ) : (
                  filteredVisitors.map((v) => (
                    <tr key={`${v.source}-${v.id}`} className="border-b last:border-b-0">
                      <td className="px-3 py-2 text-sm font-medium">{v.name}</td>
                      <td className="px-3 py-2 text-sm text-muted-foreground capitalize">{v.source}</td>
                      <td className="px-3 py-2 text-sm font-mono">{v.qrCodeId || "—"}</td>
                      <td className="px-3 py-2 text-sm text-muted-foreground">{v.host || "—"}</td>
                      <td className="px-3 py-2 text-sm text-muted-foreground max-w-[220px] truncate" title={v.purpose}>
                        {v.purpose || "—"}
                      </td>
                      <td className="px-3 py-2 text-sm">{v.status}</td>
                      <td className="px-3 py-2 text-sm text-muted-foreground">{toDisplayDateTime(v.entryTime)}</td>
                      <td className="px-3 py-2 text-right">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setQrInput(v.qrCodeId)
                            handleMarkEntry()
                          }}
                          disabled={!v.qrCodeId || checkInMutation.isPending}
                        >
                          Check In
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
