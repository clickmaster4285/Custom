import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Eye, Plus } from "lucide-react"
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
const PAGE_SIZE_OPTIONS = [10, 25, 50, 100]
const DEFAULT_PAGE_SIZE = 10
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
                <Label className="text-muted-foreground whitespace-nowrap">Switch Roles</Label>
                <Select value={switchRole} onValueChange={setSwitchRole}>
                  <SelectTrigger className="w-[220px]">
                    <SelectValue placeholder="Select a Role to Switch" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={SWITCH_ROLE_PLACEHOLDER}>Select a Role to Switch</SelectItem>
                  </SelectContent>
                </Select>
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
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pageRows.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
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
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm" asChild>
                              <Link to={getDetentionMemoDetailPath(row.id)}>
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Link>
                            </Button>
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
