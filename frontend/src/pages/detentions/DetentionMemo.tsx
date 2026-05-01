import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { AlertTriangle, BookOpen, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Eye, Package, Plus, Printer, Search, CheckCircle, Clock } from "lucide-react"
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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ROUTES, getDetentionMemoDetailPath } from "@/routes/config"

const STORAGE_KEY = "wms_detention_memo"
const SEIZED_STORAGE_KEY = "wms_seized_inventory"
const PAGE_SIZE_OPTIONS = [10, 25, 50, 100]
const DEFAULT_PAGE_SIZE = 10
const DETENTION_ALERT_DAYS = 60

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
  createdBy?: string
  memoQrCodeNumber?: string
  memoQrCodePayload?: string
  serialNo?: number
  year?: number
}

const defaultRows: DetentionMemoRow[] = [
  {
    id: "1",
    caseNo: "1/2026",
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
    createdBy: "ASO Portal",
    serialNo: 1,
    year: 2026,
  },
]

function extractSerialInfo(caseNo: string): { serialNo: number; year: number } | null {
  const match = caseNo.match(/(\d+)\/(\d{4})/)
  if (match) {
    return { serialNo: parseInt(match[1], 10), year: parseInt(match[2], 10) }
  }
  return null
}

function loadRows(): DetentionMemoRow[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((r: any) => {
          const serialInfo = extractSerialInfo(r.caseNo)
          return {
            ...r,
            updatedAt: r.updatedAt ?? r.createdAt,
            createdBy: r.createdBy ?? "ASO Portal",
            serialNo: serialInfo?.serialNo || r.serialNo,
            year: serialInfo?.year || r.year,
          }
        })
      }
    }
  } catch {}
  return defaultRows
}

function addToSeizedInventory(row: DetentionMemoRow): boolean {
  const seized = { ...row, id: `seized-${Date.now()}`, sourceDetentionId: row.id, seizedAt: new Date().toISOString() }
  try {
    const raw = localStorage.getItem(SEIZED_STORAGE_KEY)
    const list = raw ? JSON.parse(raw) : []
    if (!Array.isArray(list)) throw new Error()
    list.unshift(seized)
    localStorage.setItem(SEIZED_STORAGE_KEY, JSON.stringify(list))
    return true
  } catch {
    localStorage.setItem(SEIZED_STORAGE_KEY, JSON.stringify([seized]))
    return true
  }
}

function addToDepositAccount(row: DetentionMemoRow): boolean {
  const deposit = {
    id: `dep-${Date.now()}`,
    treasuryChallanNo: "",
    depositType: "Detention",
    caseSeizureRef: row.caseNo,
    firNo: row.firNumber || "",
    customsStation: row.placeOfDetention,
    amount: "",
    depositDate: new Date().toISOString().slice(0, 10),
    bankTreasuryName: "",
    status: "Pending",
    remarks: ""
  }
  try {
    const raw = localStorage.getItem("wms_deposit_account_register")
    const list = raw ? JSON.parse(raw) : []
    if (!Array.isArray(list)) throw new Error()
    list.unshift(deposit)
    localStorage.setItem("wms_deposit_account_register", JSON.stringify(list))
    return true
  } catch {
    localStorage.setItem("wms_deposit_account_register", JSON.stringify([deposit]))
    return true
  }
}

function isDetentionOverTwoMonths(dateTimeDetention: string): boolean {
  if (!dateTimeDetention?.trim()) return false
  try {
    const det = new Date(dateTimeDetention.replace(" ", "T"))
    const days = (new Date().getTime() - det.getTime()) / (1000 * 60 * 60 * 24)
    return days > DETENTION_ALERT_DAYS
  } catch {
    return false
  }
}

function printMemo(id: string) {
  const reportUrl = `${getDetentionMemoDetailPath(id)}?print=full&autoprint=1`
  window.location.assign(reportUrl)
}

function printQr(id: string) {
  const reportUrl = `${getDetentionMemoDetailPath(id)}?print=qr&autoprint=1`
  window.location.assign(reportUrl)
}

export default function DetentionMemoPage() {
  const [rows, setRows] = useState<DetentionMemoRow[]>([])
  const [caseNumberSearch, setCaseNumberSearch] = useState("")
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

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize))
  const pageRows = useMemo(() => filteredRows.slice((page - 1) * pageSize, page * pageSize), [filteredRows, page, pageSize])

  const handleSearch = () => setPage(1)
  const handleClear = () => { setCaseNumberSearch(""); setPage(1) }
  
  const handleSeize = (row: DetentionMemoRow) => {
    if (addToSeizedInventory(row)) {
      alert("✓ Added to Seizure Register.\nView under Seizure & Receipt → Seizure Register.")
    } else {
      alert("✗ Could not add to Seizure Register.")
    }
  }

  const handleDeposit = (row: DetentionMemoRow) => {
    if (addToDepositAccount(row)) {
      alert("✓ Deposit entry created.\nCheck Deposit Account Register for details.")
    } else {
      alert("✗ Could not create deposit entry.")
    }
  }

  return (
    <ModulePageLayout
      title="Detention Memo"
      description="Create, view, and print detention memo records with QR-enabled report access."
      breadcrumbs={[{ label: "WMS" }, { label: "Detentions" }, { label: "Detention Memo" }]}
    >
      <div className="grid gap-6">
        <Card className="shadow-sm border-0">
          <CardContent className="pt-6">
            {/* Header with Add Button */}
            <div className="flex flex-row items-center justify-between gap-4 flex-wrap mb-6">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm" asChild>
                <Link to={ROUTES.DETENTION_MEMO_CREATE}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Detention Memo
                </Link>
              </Button>
              <div className="text-sm text-muted-foreground">
                Total Records: <span className="font-semibold text-foreground">{filteredRows.length}</span>
              </div>
            </div>

            {/* Search Bar */}
            <div className="flex flex-wrap items-end gap-3 mb-6">
              <div className="flex-1 min-w-[240px]">
                <Label className="text-sm font-medium mb-2 block">Case Number</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={caseNumberSearch}
                    onChange={(e) => setCaseNumberSearch(e.target.value)}
                    placeholder="Search by case number..."
                    className="pl-9"
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  />
                </div>
              </div>
              <Button onClick={handleSearch} className="gap-2">
                <Search className="h-4 w-4" />
                Search
              </Button>
              <Button variant="outline" onClick={handleClear} className="gap-2">
                Clear
              </Button>
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-lg border bg-background">
              <div className="overflow-auto max-h-[65vh]">
                <Table>
                  <TableHeader className="sticky top-0 bg-muted/50 backdrop-blur-sm">
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="w-[80px] font-semibold">Sr.No</TableHead>
                      <TableHead className="font-semibold">Case Number</TableHead>
                      <TableHead className="font-semibold">FIR Number</TableHead>
                      <TableHead className="font-semibold">Detention Date/Time</TableHead>
                      <TableHead className="font-semibold">Status</TableHead>
                      <TableHead className="font-semibold">Posting Date</TableHead>
                      <TableHead className="font-semibold">Updation Date</TableHead>
                      <TableHead className="font-semibold">Alert</TableHead>
                      <TableHead className="font-semibold">created by </TableHead>
                      <TableHead className="text-right font-semibold">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pageRows.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={10} className="text-center py-12 text-muted-foreground">
                          <Package className="h-12 w-12 mx-auto mb-3 opacity-30" />
                          No detention memos found
                        </TableCell>
                      </TableRow>
                    ) : (
                      pageRows.map((row, index) => {
                        const serialInfo = extractSerialInfo(row.caseNo)
                        const isAlert = isDetentionOverTwoMonths(row.dateTimeDetention)
                        return (
                          <TableRow key={row.id} className="hover:bg-muted/40 transition-colors">
                            <TableCell className="font-mono text-xs">
                              {serialInfo ? `${serialInfo.serialNo}/${serialInfo.year}` : row.serialNo ?? index + 1}
                            </TableCell>
                            <TableCell className="font-medium">{row.caseNo}</TableCell>
                            <TableCell className="font-mono text-xs">{row.firNumber || "—"}</TableCell>
                            <TableCell className="whitespace-nowrap text-sm">{row.dateTimeDetention || "—"}</TableCell>
                            <TableCell>
                              {row.verificationStatus === "Verified" ? (
                                <Badge className="bg-green-100 text-green-800 hover:bg-green-100 gap-1">
                                  <CheckCircle className="h-3 w-3" /> Verified
                                </Badge>
                              ) : (
                                <Badge variant="secondary" className="gap-1">
                                  <Clock className="h-3 w-3" /> {row.verificationStatus}
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-sm">{row.createdAt || "—"}</TableCell>
                            <TableCell className="text-sm">{row.updatedAt ?? row.createdAt ?? "—"}</TableCell>
                            <TableCell>
                              {isAlert ? (
                                <div className="group relative inline-block">
                                  <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 text-xs font-medium px-2.5 py-1 rounded-full border border-amber-200">
                                    <AlertTriangle className="h-3.5 w-3.5" />
                                    <span>Over 60 days</span>
                                  </span>
                                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition pointer-events-none whitespace-nowrap z-10">
                                    Transfer to Seizure Register if applicable
                                  </div>
                                </div>
                              ) : (
                                <span className="text-muted-foreground text-sm">—</span>
                              )}
                            </TableCell>
                            <TableCell className="text-sm">{row.createdBy || "ASO Portal"}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex gap-1 justify-end flex-wrap">
                                <Button variant="ghost" size="sm" asChild className="h-8 px-2">
                                  <Link to={getDetentionMemoDetailPath(row.id)}>
                                    <Eye className="h-3.5 w-3.5 mr-1" /> View
                                  </Link>
                                </Button>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm" className="h-8 px-2">
                                      <Printer className="h-3.5 w-3.5 mr-1" /> Print
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => printQr(row.id)}>Print QR Code</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => printMemo(row.id)}>Print Full Report</DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                                <Button variant="outline" size="sm" onClick={() => handleDeposit(row)} className="h-8 px-2">
                                  <BookOpen className="h-3.5 w-3.5 mr-1" /> Deposit
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => handleSeize(row)} className="h-8 px-2">
                                  <Package className="h-3.5 w-3.5 mr-1" /> Seize
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        )
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Pagination */}
            {filteredRows.length > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Rows per page:</span>
                  <Select
                    value={pageSize.toString()}
                    onValueChange={(value) => {
                      setPageSize(Number(value))
                      setPage(1)
                    }}
                  >
                    <SelectTrigger className="w-[80px] h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PAGE_SIZE_OPTIONS.map(size => (
                        <SelectItem key={size} value={size.toString()}>{size}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="text-sm text-muted-foreground">
                  Showing {((page - 1) * pageSize) + 1} to {Math.min(page * pageSize, filteredRows.length)} of {filteredRows.length} entries
                </div>
                
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(1)}
                    disabled={page === 1}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronsLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(prev => Math.max(1, prev - 1))}
                    disabled={page === 1}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="px-3 text-sm">
                    Page {page} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={page === totalPages}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(totalPages)}
                    disabled={page === totalPages}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronsRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </ModulePageLayout>
  )
}