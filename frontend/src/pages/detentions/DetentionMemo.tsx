import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { AlertTriangle, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Eye, Package, Plus, Printer } from "lucide-react"
import { ModulePageLayout } from "@/components/dashboard/module-page-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ROUTES, getDetentionMemoDetailPath } from "@/routes/config"

const STORAGE_KEY = "wms_detention_memo"
const SEIZED_STORAGE_KEY = "wms_seized_inventory"
const PAGE_SIZE_OPTIONS = [10, 25, 50, 100]
const DEFAULT_PAGE_SIZE = 10
const DETENTION_ALERT_DAYS = 60 // Alert when in detention over 2 months
const SWITCH_ROLE_PLACEHOLDER = "__select_role__"

type DetentionMemoRow = {
  id: string
  caseNo: string
  firNumber?: string
  referenceNumber: string
  dateTimeOccurrence: string
  placeOfOccurrence: string
  dateTimeDetention: string
  placeOfDetention: string
  detentionType: string
  directorate: string
  reasonForDetention: string
  whereDeposited: string
  settlementStatus: string
  verificationStatus: string
  createdAt: string
  updatedAt?: string
}

const defaultRows: DetentionMemoRow[] = [
  {
    id: "1",
    caseNo: "DM-2024-001",
    firNumber: "FIR-2024-001",
    referenceNumber: "REF-001",
    dateTimeOccurrence: "2024-02-01 09:00",
    placeOfOccurrence: "Port Qasim",
    dateTimeDetention: "2024-02-01 10:30",
    placeOfDetention: "D.I.Khan",
    detentionType: "Un-Claimed",
    directorate: "MCC D.I Khan AFU Import",
    reasonForDetention: "Pending Examination",
    whereDeposited: "State Warehouse, D.I Khan",
    settlementStatus: "Partial Settled",
    verificationStatus: "Verified",
    createdAt: "2024-02-01",
    updatedAt: "2024-02-01",
  },
]

function loadRows(): DetentionMemoRow[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((r: DetentionMemoRow) => ({
          ...r,
          updatedAt: r.updatedAt ?? r.createdAt,
        }))
      }
    }
  } catch {}
  return defaultRows
}

/** Load full memo by id (for Seize action). */
function getFullMemoById(id: string): Record<string, unknown> | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return null
    const row = parsed.find((r: { id?: string }) => r.id === id)
    return row ?? null
  } catch {
    return null
  }
}

function addToSeizedInventory(sourceId: string): boolean {
  const full = getFullMemoById(sourceId)
  if (!full) return false
  const seized = {
    ...full,
    id: `seized-${Date.now()}`,
    sourceDetentionId: sourceId,
    seizedAt: new Date().toISOString(),
  }
  try {
    const raw = window.localStorage.getItem(SEIZED_STORAGE_KEY)
    const list = raw ? JSON.parse(raw) : []
    if (!Array.isArray(list)) throw new Error()
    list.unshift(seized)
    window.localStorage.setItem(SEIZED_STORAGE_KEY, JSON.stringify(list))
    return true
  } catch {
    window.localStorage.setItem(SEIZED_STORAGE_KEY, JSON.stringify([seized]))
    return true
  }
}

function isDetentionOverTwoMonths(dateTimeDetention: string): boolean {
  if (!dateTimeDetention || !dateTimeDetention.trim()) return false
  try {
    const det = new Date(dateTimeDetention.replace(" ", "T"))
    const now = new Date()
    const days = (now.getTime() - det.getTime()) / (1000 * 60 * 60 * 24)
    return days > DETENTION_ALERT_DAYS
  } catch {
    return false
  }
}

/** Open A4 print view with Pakistan Customs logo and memo details. */
function printMemo(id: string) {
  const memo = getFullMemoById(id) as Record<string, unknown> | null
  if (!memo) {
    window.alert("Memo not found.")
    return
  }
  const caseNo = String(memo.caseNo ?? "—")
  const firNumber = String(memo.firNumber ?? "—")
  const ref = String(memo.referenceNumber ?? "—")
  const dateTimeOccurrence = String(memo.dateTimeOccurrence ?? "—")
  const placeOccurrence = String(memo.placeOfOccurrence ?? "—")
  const dateTimeDetention = String(memo.dateTimeDetention ?? "—")
  const placeDetention = String(memo.placeOfDetention ?? "—")
  const detentionType = String(memo.detentionType ?? "—")
  const directorate = String(memo.directorate ?? "—")
  const reason = String(memo.reasonForDetention ?? "—")
  const whereDeposited = String(memo.whereDeposited ?? "—")
  const settlementStatus = String(memo.settlementStatus ?? "—")
  const verificationStatus = String(memo.verificationStatus ?? "—")
  const createdAt = String(memo.createdAt ?? "—")
  const updatedAt = String(memo.updatedAt ?? memo.createdAt ?? "—")
  const briefFacts = String(memo.briefFacts ?? "")
  const goodsItems = (memo.goodsItems as Array<Record<string, unknown>>) ?? []
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Detention Memo - ${caseNo}</title>
  <style>
    @media print { @page { size: A4; margin: 18mm; } }
    body { font-family: system-ui, sans-serif; font-size: 11pt; color: #222; max-width: 210mm; margin: 0 auto; padding: 12px; }
    .logo { text-align: center; margin-bottom: 20px; padding-bottom: 12px; border-bottom: 2px solid #1e40af; }
    .logo h1 { font-size: 22pt; color: #1e40af; margin: 0; letter-spacing: 0.05em; }
    .logo p { font-size: 10pt; color: #555; margin: 4px 0 0 0; }
    h2 { font-size: 14pt; margin: 16px 0 8px 0; color: #1e40af; }
    table { width: 100%; border-collapse: collapse; margin: 8px 0; }
    th, td { border: 1px solid #ccc; padding: 6px 8px; text-align: left; }
    th { background: #f1f5f9; font-weight: 600; }
    .row { display: flex; margin: 6px 0; }
    .label { width: 180px; flex-shrink: 0; color: #555; }
    .value { font-weight: 500; }
  </style>
</head>
<body>
  <div class="logo">
    <h1>PAKISTAN CUSTOMS</h1>
    <p>Detention Memo</p>
  </div>
  <h2>Basic Information</h2>
  <div class="row"><span class="label">Case No.</span><span class="value">${caseNo}</span></div>
  <div class="row"><span class="label">FIR Number</span><span class="value">${firNumber}</span></div>
  <div class="row"><span class="label">Reference Number</span><span class="value">${ref}</span></div>
  <div class="row"><span class="label">Date/Time of occurrence</span><span class="value">${dateTimeOccurrence}</span></div>
  <div class="row"><span class="label">Place of occurrence</span><span class="value">${placeOccurrence}</span></div>
  <div class="row"><span class="label">Date/Time of detention</span><span class="value">${dateTimeDetention}</span></div>
  <div class="row"><span class="label">Place of detention</span><span class="value">${placeDetention}</span></div>
  <div class="row"><span class="label">Detention Type</span><span class="value">${detentionType}</span></div>
  <div class="row"><span class="label">Directorate</span><span class="value">${directorate}</span></div>
  <div class="row"><span class="label">Reason for detention</span><span class="value">${reason}</span></div>
  <div class="row"><span class="label">Where deposited</span><span class="value">${whereDeposited}</span></div>
  <div class="row"><span class="label">Settlement Status</span><span class="value">${settlementStatus}</span></div>
  <div class="row"><span class="label">Verification Status</span><span class="value">${verificationStatus}</span></div>
  <div class="row"><span class="label">Posting Date</span><span class="value">${createdAt}</span></div>
  <div class="row"><span class="label">Updation Date</span><span class="value">${updatedAt}</span></div>
  ${briefFacts ? `<h2>Brief Facts</h2><p>${briefFacts.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>` : ""}
  ${goodsItems.length > 0 ? `
  <h2>Goods Information</h2>
  <table>
    <thead><tr><th>QR Code</th><th>Description</th><th>PCT</th><th>Qty</th><th>Unit</th><th>Condition</th><th>Assessable Value (PKR)</th><th>ID/Chassis</th><th>Item Notes</th></tr></thead>
    <tbody>
    ${goodsItems.map((g: Record<string, unknown>) => `
      <tr>
        <td>${String(g.qrCodeNumber ?? "—")}</td>
        <td>${String(g.description ?? "—")}</td>
        <td>${String(g.pctCode ?? "—")}</td>
        <td>${String(g.quantity ?? "—")}</td>
        <td>${String(g.unit ?? "—")}</td>
        <td>${String(g.condition ?? "—")}</td>
        <td>${String(g.assessableValuePkr ?? "—")}</td>
        <td>${String(g.identificationRef ?? "—")}</td>
        <td>${String(g.itemNotes ?? "—")}</td>
      </tr>`).join("")}
    </tbody>
  </table>
  ` : ""}
</body>
</html>`
  const win = window.open("", "_blank")
  if (!win) {
    window.alert("Please allow pop-ups to print.")
    return
  }
  win.document.write(html)
  win.document.close()
  win.focus()
  setTimeout(() => {
    win.print()
    win.close()
  }, 250)
}

export default function DetentionMemoPage() {
  const [rows, setRows] = useState<DetentionMemoRow[]>([])
  const [caseNumberSearch, setCaseNumberSearch] = useState("")
  const [switchRole, setSwitchRole] = useState(SWITCH_ROLE_PLACEHOLDER)
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)
  const [page, setPage] = useState(1)

  useEffect(() => {
    setRows(loadRows())
  }, [])

  const filteredRows = useMemo(() => {
    if (!caseNumberSearch.trim()) return rows
    const q = caseNumberSearch.trim().toLowerCase()
    return rows.filter((r) => r.caseNo.toLowerCase().includes(q))
  }, [rows, caseNumberSearch])

  const totalPages = Math.max(0, Math.ceil(filteredRows.length / pageSize))
  const from = filteredRows.length === 0 ? 0 : (page - 1) * pageSize + 1
  const to = Math.min(page * pageSize, filteredRows.length)
  const pageRows = useMemo(
    () => filteredRows.slice((page - 1) * pageSize, page * pageSize),
    [filteredRows, page, pageSize]
  )

  const handleSearch = () => {
    setPage(1)
  }
  const handleClear = () => {
    setCaseNumberSearch("")
    setPage(1)
  }

  const handleSeize = (row: DetentionMemoRow) => {
    if (addToSeizedInventory(row.id)) {
      window.alert("Added to Seizure Register. View it under Seizure & Receipt → Seizure Register.")
    } else {
      window.alert("Could not load memo. Please try again.")
    }
  }

  return (
    <ModulePageLayout
      title="Detention Memo"
      description="Pakistan Customs detention memos. Add and manage detention records. Data stored in localStorage."
      breadcrumbs={[{ label: "WMS" }, { label: "Detentions" }, { label: "Detention Memo" }]}
    >
      <div className="grid gap-6">
        <Card>
          <CardContent className="pt-6">
            {/* Top row: Switch Roles + Add New Detention Memo */}
            <div className="flex flex-row items-center justify-between gap-4 flex-wrap mb-6">
              <div className="flex items-center gap-2">

              </div>
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90" asChild>
                <Link to={ROUTES.DETENTION_MEMO_CREATE}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Detention Memo
                </Link>
              </Button>
            </div>

            {/* Search: Case Number + Search + Clear */}
            <div className="flex flex-wrap items-end gap-2 mb-4">
              <div className="grid gap-2 min-w-[200px]">
                <Label>Case Number</Label>
                <Input
                  value={caseNumberSearch}
                  onChange={(e) => setCaseNumberSearch(e.target.value)}
                  placeholder="Case Number"
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
              </div>
              <Button onClick={handleSearch}>Search</Button>
              <Button variant="outline" onClick={handleClear}>
                Clear
              </Button>
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-md border">
              <div className="overflow-auto max-h-[60vh] w-full">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Case Number</TableHead>
                      <TableHead>FIR Number</TableHead>
                      <TableHead>Detention Date/Time</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Posting Date</TableHead>
                      <TableHead>Updation Date</TableHead>
                      <TableHead className="min-w-[180px]">Alert</TableHead>

                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pageRows.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                          No data found
                        </TableCell>
                      </TableRow>
                    ) : (
                      pageRows.map((row) => (
                        <TableRow key={row.id}>
                          <TableCell className="font-medium">{row.caseNo}</TableCell>
                          <TableCell className="font-mono">{row.firNumber || "—"}</TableCell>
                          <TableCell>{row.dateTimeDetention || "—"}</TableCell>
                          <TableCell>
                            <Badge variant={row.verificationStatus === "Verified" ? "default" : "secondary"}>
                              {row.verificationStatus}
                            </Badge>
                          </TableCell>
                         
                          <TableCell>{row.createdAt || "—"}</TableCell>
                          <TableCell>{row.updatedAt ?? row.createdAt ?? "—"}</TableCell>
                          <TableCell>
                            {isDetentionOverTwoMonths(row.dateTimeDetention) ? (
                              <span className="inline-flex items-center gap-1 text-amber-700 text-xs font-medium bg-amber-100 px-2 py-1 rounded" title="This detention has exceeded 2 months. Transfer to Seizure Register if applicable.">
                                <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                                In detention &gt;2 mo – not transferred to seized
                              </span>
                            ) : (
                              "—"
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1 flex-wrap">
                              <Button variant="ghost" size="sm" asChild>
                                <Link to={getDetentionMemoDetailPath(row.id)}>
                                  <Eye className="h-4 w-4 mr-1" />
                                  View
                                </Link>
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => printMemo(row.id)}
                                title="Print (A4)"
                              >
                                <Printer className="h-4 w-4 mr-1" />
                                Print
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleSeize(row)}
                                title="Add to Seizure Register"
                              >
                                <Package className="h-4 w-4 mr-1" />
                                Seize
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Pagination */}
            <div className="flex flex-wrap items-center justify-between gap-4 mt-4">
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground whitespace-nowrap">Items per Page:</span>
                <Select
                  value={String(pageSize)}
                  onValueChange={(v) => {
                    setPageSize(Number(v))
                    setPage(1)
                  }}
                >
                  <SelectTrigger className="w-[72px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PAGE_SIZE_OPTIONS.map((size) => (
                      <SelectItem key={size} value={String(size)}>
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground whitespace-nowrap">
                  Page: {totalPages === 0 ? "0" : page}/{totalPages}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setPage(1)}
                  disabled={page <= 1 || totalPages === 0}
                  aria-label="First page"
                >
                  <ChevronsLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1 || totalPages === 0}
                  aria-label="Previous page"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages || totalPages === 0}
                  aria-label="Next page"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setPage(totalPages)}
                  disabled={page >= totalPages || totalPages === 0}
                  aria-label="Last page"
                >
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ModulePageLayout>
  )
}
