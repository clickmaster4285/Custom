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
const CASE_COUNTER_KEY = "wms_detention_case_counter"

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
    serialNo: 1,
    year: 2026,
  },
]

// Generate next case number in "1/2026" format
function getNextCaseNumber(): string {
  try {
    const currentYear = new Date().getFullYear()
    const counterData = localStorage.getItem(CASE_COUNTER_KEY)
    let counter = counterData ? JSON.parse(counterData) : { year: currentYear, lastNumber: 0 }

    if (counter.year !== currentYear) {
      counter = { year: currentYear, lastNumber: 0 }
    }

    counter.lastNumber += 1
    localStorage.setItem(CASE_COUNTER_KEY, JSON.stringify(counter))

    return `${counter.lastNumber}/${currentYear}`
  } catch {
    return `1/${new Date().getFullYear()}`
  }
}

// Extract serialNo and year from caseNo (e.g., "1/2026")
function extractSerialInfo(caseNo: string): { serialNo: number; year: number } | null {
  const match = caseNo.match(/(\d+)\/(\d{4})/)
  if (match) {
    return { serialNo: parseInt(match[1], 10), year: parseInt(match[2], 10) }
  }
  return null
}

// Load rows from localStorage
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
            serialNo: serialInfo?.serialNo || r.serialNo,
            year: serialInfo?.year || r.year,
          }
        })
      }
    }
  } catch {}
  return defaultRows
}

function getFullMemoById(id: string): Record<string, unknown> | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return null
    return parsed.find((r: { id?: string }) => r.id === id) ?? null
  } catch {
    return null
  }
}

function addToSeizedInventory(sourceId: string): boolean {
  const full = getFullMemoById(sourceId)
  if (!full) return false
  const seized = { ...full, id: `seized-${Date.now()}`, sourceDetentionId: sourceId, seizedAt: new Date().toISOString() }
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

function isDetentionOverTwoMonths(dateTimeDetention: string): boolean {
  if (!dateTimeDetention.trim()) return false
  try {
    const det = new Date(dateTimeDetention.replace(" ", "T"))
    const days = (new Date().getTime() - det.getTime()) / (1000 * 60 * 60 * 24)
    return days > DETENTION_ALERT_DAYS
  } catch {
    return false
  }
}

function printMemo(id: string) {
  const memo = getFullMemoById(id) as Record<string, unknown> | null
  if (!memo) return alert("Memo not found.")
  const caseNo = String(memo.caseNo ?? "—")
  const firNumber = String(memo.firNumber ?? "—")
  const html = `<html><body><h1>Detention Memo - ${caseNo}</h1><p>FIR: ${firNumber}</p></body></html>`
  const win = window.open("", "_blank")
  if (!win) return alert("Please allow pop-ups to print.")
  win.document.write(html)
  win.document.close()
  setTimeout(() => { win.print(); win.close() }, 250)
}

export default function DetentionMemoPage() {
  const [rows, setRows] = useState<DetentionMemoRow[]>([])
  const [caseNumberSearch, setCaseNumberSearch] = useState("")
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)
  const [page, setPage] = useState(1)

  useEffect(() => {
    setRows(loadRows())

    // Initialize counter if not present
    const currentYear = new Date().getFullYear()
    if (!localStorage.getItem(CASE_COUNTER_KEY)) {
      const existingRows = loadRows()
      const currentYearRows = existingRows.filter(row => extractSerialInfo(row.caseNo)?.year === currentYear)
      let maxNumber = 0
      currentYearRows.forEach(row => {
        const serial = extractSerialInfo(row.caseNo)
        if (serial && serial.serialNo > maxNumber) maxNumber = serial.serialNo
      })
      localStorage.setItem(CASE_COUNTER_KEY, JSON.stringify({ year: currentYear, lastNumber: maxNumber }))
    }
  }, [])

  const filteredRows = useMemo(() => {
    if (!caseNumberSearch.trim()) return rows
    const q = caseNumberSearch.trim().toLowerCase()
    return rows.filter((r) => r.caseNo.toLowerCase().includes(q))
  }, [rows, caseNumberSearch])

  const totalPages = Math.max(0, Math.ceil(filteredRows.length / pageSize))
  const pageRows = useMemo(() => filteredRows.slice((page - 1) * pageSize, page * pageSize), [filteredRows, page, pageSize])

  const handleSearch = () => setPage(1)
  const handleClear = () => { setCaseNumberSearch(""); setPage(1) }
  const handleSeize = (row: DetentionMemoRow) => {
    if (addToSeizedInventory(row.id)) {
      window.alert("Added to Seizure Register. View it under Seizure & Receipt → Seizure Register.")
    } else window.alert("Could not load memo. Please try again.")
  }

  return (
    <ModulePageLayout title="Detention Memo" breadcrumbs={[{ label: "WMS" }, { label: "Detentions" }, { label: "Detention Memo" }]}>
      <div className="grid gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-row items-center justify-between gap-4 flex-wrap mb-6">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90" asChild>
                <Link to={ROUTES.DETENTION_MEMO_CREATE}><Plus className="h-4 w-4 mr-2"/>Add New Detention Memo</Link>
              </Button>
            </div>

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
              <Button variant="outline" onClick={handleClear}>Clear</Button>
            </div>

            <div className="overflow-hidden rounded-md border">
              <div className="overflow-auto max-h-[60vh] w-full">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Sr.No</TableHead>
                      <TableHead>Case Number</TableHead>
                      <TableHead>FIR Number</TableHead>
                      <TableHead>Detention Date/Time</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Posting Date</TableHead>
                      <TableHead>Updation Date</TableHead>
                      <TableHead>Alert</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pageRows.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center text-muted-foreground py-8">No data found</TableCell>
                      </TableRow>
                    ) : pageRows.map((row, index) => {
                      const serialInfo = extractSerialInfo(row.caseNo)
                      return (
                        <TableRow key={row.id}>
                          <TableCell>{serialInfo ? `${serialInfo.serialNo}/${serialInfo.year}` : row.serialNo ?? index + 1}</TableCell>
                          <TableCell>{row.caseNo}</TableCell>
                          <TableCell>{row.firNumber || "—"}</TableCell>
                          <TableCell>{row.dateTimeDetention || "—"}</TableCell>
                          <TableCell><Badge variant={row.verificationStatus === "Verified" ? "default" : "secondary"}>{row.verificationStatus}</Badge></TableCell>
                          <TableCell>{row.createdAt || "—"}</TableCell>
                          <TableCell>{row.updatedAt ?? row.createdAt ?? "—"}</TableCell>
                          <TableCell>
                            {isDetentionOverTwoMonths(row.dateTimeDetention) ? (
                              <span className="inline-flex items-center gap-1 text-amber-700 text-xs font-medium bg-amber-100 px-2 py-1 rounded" title="This detention has exceeded 2 months. Transfer to Seizure Register if applicable.">
                                <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                               not transferred yet
                              </span>
                            ) : "—"}
                          </TableCell>
                          <TableCell className="text-right flex gap-1 flex-wrap">
                            <Button variant="ghost" size="sm" asChild><Link to={getDetentionMemoDetailPath(row.id)}><Eye className="h-4 w-4 mr-1"/>View</Link></Button>
                            <Button variant="outline" size="sm" onClick={() => printMemo(row.id)} title="Print (A4)"><Printer className="h-4 w-4 mr-1"/>Print</Button>
                            <Button variant="outline" size="sm" onClick={() => handleSeize(row)} title="Add to Seizure Register"><Package className="h-4 w-4 mr-1"/>Seize</Button>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ModulePageLayout>
  )
}