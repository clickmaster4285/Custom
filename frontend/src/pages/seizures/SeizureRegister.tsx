import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { ClipboardList, Eye, FileText } from "lucide-react"
import { ModulePageLayout } from "@/components/dashboard/module-page-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { getSeizedInventoryDetailPath } from "@/routes/config"

const STORAGE_KEY = "wms_seized_inventory"

type SeizedRow = {
  id: string
  sourceDetentionId: string
  seizedAt: string
  caseNo: string
  qrCodeNumber?: string
  firNumber?: string
  placeOfDetention?: string
  settlementStatus?: string
  [key: string]: unknown
}

const defaultRows: SeizedRow[] = [
  {
    id: "seized-1",
    sourceDetentionId: "1",
    seizedAt: "2026-01-20T10:15:00Z",
    caseNo: "1/2026",
    qrCodeNumber: "QR-DM-2026-0001",
    firNumber: "FIR-2024-001",
    referenceNumber: "REF-001",
    dateTimeOccurrence: "2024-02-01 09:00",
    placeOfOccurrence: "Yarik Checkpoint",
    dateTimeDetention: "2024-02-01 10:30",
    placeOfDetention: "DI Khan",
    detentionType: "Un-Claimed",
    directorate: "MCC DI Khan",
    reasonForDetention: "Pending examination of goods",
    whereDeposited: "State Warehouse, DI Khan",
    settlementStatus: "Registered",
    verificationStatus: "Verified",
    briefFacts: "Goods detained at Yarik Checkpoint and later seized after verification.",
    accusedName: "Muhammad Ali",
    accusedCnic: "12345-6789012-3",
    accusedAddress: "DI Khan",
    createdAt: "2024-02-01",
    updatedAt: "2024-02-01",
  },
  {
    id: "seized-2",
    sourceDetentionId: "2",
    seizedAt: "2026-02-18T14:30:00Z",
    caseNo: "2/2026",
    qrCodeNumber: "QR-DM-2026-0002",
    firNumber: "FIR-2024-002",
    referenceNumber: "REF-002",
    dateTimeOccurrence: "2024-03-05 11:15",
    placeOfOccurrence: "Peshawar Ring Road",
    dateTimeDetention: "2024-03-05 12:00",
    placeOfDetention: "Peshawar",
    detentionType: "Mis-declared",
    directorate: "MCC Peshawar",
    reasonForDetention: "Mis-declaration of quantity in goods declaration.",
    whereDeposited: "State Warehouse, Peshawar",
    settlementStatus: "Registered",
    verificationStatus: "Pending",
    briefFacts: "Mis-declared consignment intercepted at Peshawar Ring Road and seized.",
    accusedName: "Khan Traders",
    accusedCnic: "",
    accusedAddress: "Peshawar",
    createdAt: "2024-03-05",
    updatedAt: "2024-03-05",
  },
  {
    id: "seized-3",
    sourceDetentionId: "3",
    seizedAt: "2026-03-10T09:45:00Z",
    caseNo: "3/2026",
    qrCodeNumber: "QR-DM-2026-0003",
    firNumber: "FIR-2024-003",
    referenceNumber: "REF-003",
    dateTimeOccurrence: "2024-04-10 16:45",
    placeOfOccurrence: "Mardan Bypass",
    dateTimeDetention: "2024-04-10 17:30",
    placeOfDetention: "Mardan",
    detentionType: "Un-claimed",
    directorate: "MCC Mardan",
    reasonForDetention: "Un-claimed goods found in transit at Mardan Bypass.",
    whereDeposited: "State Warehouse, Mardan",
    settlementStatus: "Pending Disposal",
    verificationStatus: "Verified",
    briefFacts: "Un-claimed consignment taken into custody and seized pending disposal orders.",
    accusedName: "Unknown",
    accusedCnic: "",
    accusedAddress: "Mardan",
    createdAt: "2024-04-10",
    updatedAt: "2024-04-10",
  },
]

function loadRows(): SeizedRow[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) return parsed
    }
  } catch {}
  // If nothing stored yet, seed with dummy seizure records for the report
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultRows))
  } catch {
    // ignore write errors
  }
  return defaultRows
}

function formatDate(d: string) {
  if (!d) return "—"
  try {
    const date = new Date(d.replace(" ", "T"))
    return date.toISOString().slice(0, 10)
  } catch {
    return d
  }
}

export default function SeizureRegisterPage() {
  const [rows, setRows] = useState<SeizedRow[]>([])
  const [search, setSearch] = useState("")

  useEffect(() => {
    setRows(loadRows())
  }, [])

  const filteredRows = useMemo(() => {
    if (!search.trim()) return rows
    const q = search.trim().toLowerCase()
    return rows.filter(
      (r) =>
        (r.caseNo && r.caseNo.toLowerCase().includes(q)) ||
        (r.qrCodeNumber && r.qrCodeNumber.toLowerCase().includes(q)) ||
        (r.firNumber && r.firNumber.toLowerCase().includes(q)) ||
        (r.placeOfDetention && r.placeOfDetention.toLowerCase().includes(q))
    )
  }, [rows, search])

  const totalSeizures = rows.length
  const thisMonth = useMemo(() => {
    const now = new Date()
    const y = now.getFullYear()
    const m = now.getMonth()
    return rows.filter((r) => {
      try {
        const d = new Date(r.seizedAt.replace(" ", "T"))
        return d.getFullYear() === y && d.getMonth() === m
      } catch {
        return false
      }
    }).length
  }, [rows])
  const pendingDisposal = rows.filter((r) => r.settlementStatus !== "Fully Settled" && r.settlementStatus !== "Disposed").length

  return (
    <ModulePageLayout
      title="Seizure Register"
      description="Central register of all seizure cases and status. Items seized from Detention Memo appear here."
      breadcrumbs={[{ label: "WMS" }, { label: "Seizure & Receipt" }, { label: "Seizure Register" }]}
    >
      <div className="grid gap-6">
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Seizures</CardTitle>
              <ClipboardList className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalSeizures}</div>
              <p className="text-xs text-muted-foreground mt-1">All time (from detention memo)</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">This Month</CardTitle>
              <FileText className="h-4 w-4 text-[#3b82f6]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{thisMonth}</div>
              <p className="text-xs text-muted-foreground mt-1">New entries</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending Disposal</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingDisposal}</div>
              <p className="text-xs text-muted-foreground mt-1">Awaiting action</p>
            </CardContent>
          </Card>
        </div>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Seizure Register</CardTitle>
              <CardDescription>Search and view all seizure records (seized from Detention Memo)</CardDescription>
            </div>
            <Button variant="outline" size="sm">
              Export
            </Button>
          </CardHeader>
          <CardContent>
            <Input
              placeholder="Search by reference, location..."
              className="mb-4 w-64"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div className="overflow-auto max-h-[50vh]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Reference</TableHead>
                    <TableHead>QR Code</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                        No seizure records. Use &quot;Seize&quot; on a Detention Memo to add items here.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredRows.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell className="font-medium">{row.caseNo || "—"}</TableCell>
                        <TableCell className="font-mono text-xs">{row.qrCodeNumber || "—"}</TableCell>
                        <TableCell>{formatDate(row.seizedAt)}</TableCell>
                        <TableCell>{row.placeOfDetention || "—"}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{row.settlementStatus || "Registered"}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" className="text-[#3b82f6]" asChild>
                            <Link to={getSeizedInventoryDetailPath(row.id)}>
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
          </CardContent>
        </Card>
      </div>
    </ModulePageLayout>
  )
}
