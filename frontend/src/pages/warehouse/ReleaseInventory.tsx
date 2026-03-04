import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { AlertTriangle, Package, Warehouse, LogOut } from "lucide-react"
import { ModulePageLayout } from "@/components/dashboard/module-page-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ROUTES } from "@/routes/config"
import { CUSTOMS_STATIONS } from "@/lib/case-fir-spec"

const DEPOSIT_STORAGE_KEY = "wms_deposit_account_register"
const SEIZED_STORAGE_KEY = "wms_seized_inventory"
const RELEASE_STORAGE_KEY = "wms_release_inventory"
const RELEASE_ALERT_DAYS = 60

const WAREHOUSE_OPTIONS = [
  "State Warehouse, Kohat Tunnel",
  "State Warehouse, Bannu",
  "State Warehouse, Salt House, Kohat",
  "State Warehouse, D.I Khan",
  "Bonded Godown A",
  "Bonded Godown B",
  "Transit Shed",
  "Customs House Peshawar",
  "Customs House Yarik",
]

type DepositRow = {
  id: string
  treasuryChallanNo: string
  depositType: string
  caseSeizureRef: string
  firNo: string
  customsStation: string
  amount: string
  depositDate: string
  bankTreasuryName: string
  status: string
  remarks: string
}

type ReleaseRecord = {
  id: string
  qrCodeNumber: string
  warehouse: string
  firNumber: string
  stackCount: string
  treasuryChallanNo: string
  caseSeizureRef: string
  customsStation: string
  depositDate: string
  amount: string
  bankTreasuryName: string
  sourceDepositId: string
  releasedAt: string
  remarks: string
}

function loadDepositRows(): DepositRow[] {
  try {
    const raw = window.localStorage.getItem(DEPOSIT_STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) return parsed
    }
  } catch {}
  return []
}

function loadReleaseRecords(): ReleaseRecord[] {
  try {
    const raw = window.localStorage.getItem(RELEASE_STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) return parsed
    }
  } catch {}
  return []
}

function saveReleaseRecords(rows: ReleaseRecord[]) {
  window.localStorage.setItem(RELEASE_STORAGE_KEY, JSON.stringify(rows))
}

function daysInDeposit(depositDate: string): number | null {
  if (!depositDate || !depositDate.trim()) return null
  try {
    const d = new Date(depositDate)
    const now = new Date()
    return Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24))
  } catch {
    return null
  }
}

function addToSeizedFromDeposit(row: DepositRow): boolean {
  const seized = {
    id: `seized-${Date.now()}`,
    sourceDetentionId: `deposit-${row.id}`,
    seizedAt: new Date().toISOString(),
    caseNo: row.caseSeizureRef || row.treasuryChallanNo,
    firNumber: row.firNo || "",
    referenceNumber: row.treasuryChallanNo,
    dateTimeDetention: row.depositDate,
    placeOfDetention: row.customsStation,
    directorate: "",
    reasonForDetention: "Transferred from deposit account (exceeded 2 months)",
    whereDeposited: row.bankTreasuryName,
    settlementStatus: row.status,
    verificationStatus: "Registered",
    createdAt: row.depositDate,
    updatedAt: new Date().toISOString().slice(0, 10),
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

export default function ReleaseInventoryPage() {
  const [depositRows, setDepositRows] = useState<DepositRow[]>([])
  const [releaseRecords, setReleaseRecords] = useState<ReleaseRecord[]>([])
  const [releaseOpen, setReleaseOpen] = useState(false)
  const [releaseForm, setReleaseForm] = useState({
    qrCodeNumber: "",
    warehouse: "",
    firNumber: "",
    stackCount: "",
    treasuryChallanNo: "",
    caseSeizureRef: "",
    customsStation: "",
    depositDate: "",
    amount: "",
    bankTreasuryName: "",
    remarks: "",
  })
  const [releaseSourceDeposit, setReleaseSourceDeposit] = useState<DepositRow | null>(null)

  useEffect(() => {
    setDepositRows(loadDepositRows())
    setReleaseRecords(loadReleaseRecords())
  }, [])

  const detentionDeposits = useMemo(
    () => depositRows.filter((r) => r.depositType === "Detention"),
    [depositRows]
  )

  const handleTransferToSeizure = (row: DepositRow) => {
    if (addToSeizedFromDeposit(row)) {
      window.alert("Transferred to Seizure Register. View under Seizure & Receipt → Seizure Register.")
      setDepositRows(loadDepositRows())
    } else {
      window.alert("Could not transfer. Please try again.")
    }
  }

  const openReleaseDialog = (row: DepositRow) => {
    setReleaseSourceDeposit(row)
    setReleaseForm({
      qrCodeNumber: "",
      warehouse: row.bankTreasuryName || "",
      firNumber: row.firNo || "",
      stackCount: "",
      treasuryChallanNo: row.treasuryChallanNo || "",
      caseSeizureRef: row.caseSeizureRef || "",
      customsStation: row.customsStation || "",
      depositDate: row.depositDate || "",
      amount: row.amount || "",
      bankTreasuryName: row.bankTreasuryName || "",
      remarks: row.remarks || "",
    })
    setReleaseOpen(true)
  }

  const handleReleaseSubmit = () => {
    if (!releaseForm.qrCodeNumber.trim()) {
      window.alert("QR Code number is required.")
      return
    }
    if (!releaseForm.warehouse.trim()) {
      window.alert("Warehouse (from which) is required.")
      return
    }
    if (!releaseSourceDeposit) return
    const record: ReleaseRecord = {
      id: `rel-${Date.now()}`,
      qrCodeNumber: releaseForm.qrCodeNumber.trim(),
      warehouse: releaseForm.warehouse.trim(),
      firNumber: releaseForm.firNumber.trim(),
      stackCount: releaseForm.stackCount.trim(),
      treasuryChallanNo: releaseForm.treasuryChallanNo.trim(),
      caseSeizureRef: releaseForm.caseSeizureRef.trim(),
      customsStation: releaseForm.customsStation.trim(),
      depositDate: releaseForm.depositDate,
      amount: releaseForm.amount.trim(),
      bankTreasuryName: releaseForm.bankTreasuryName.trim(),
      sourceDepositId: releaseSourceDeposit.id,
      releasedAt: new Date().toISOString().slice(0, 19).replace("T", " "),
      remarks: releaseForm.remarks.trim(),
    }
    const next = [record, ...releaseRecords]
    setReleaseRecords(next)
    saveReleaseRecords(next)
    setReleaseOpen(false)
    setReleaseSourceDeposit(null)
    window.alert("Release record saved. QR Code and full details recorded.")
  }

  return (
    <ModulePageLayout
      title="Release Inventory"
      description="Record release of inventory from warehouse: QR Code, Warehouse, FIR, stacks. Detention deposits &gt;2 months can be transferred to seizure."
      breadcrumbs={[{ label: "WMS" }, { label: "Warehouse" }, { label: "Release Inventory" }]}
    >
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Warehouse className="h-5 w-5" />
              Warehouse flow
            </CardTitle>
            <CardDescription>
              Detention info is added (Detention Memo), then deposited in a specific warehouse via Deposit Account Register.
              If the detention account inventory exceeds <strong>2 months</strong> in deposit, it is transferred to Seizure Register.
              Use <strong>Release Inventory</strong> to record release of specific items (QR Code, Warehouse, FIR, stacks).
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Released inventory records */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LogOut className="h-5 w-5" />
              Released inventory records
            </CardTitle>
            <CardDescription>
              Complete info for each release: QR Code, Warehouse (from which), FIR, Number of stacks, Treasury Challan, Case Ref, and dates.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-auto max-h-[50vh]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>QR Code No</TableHead>
                    <TableHead>Warehouse</TableHead>
                    <TableHead>FIR No</TableHead>
                    <TableHead>Stacks</TableHead>
                    <TableHead>Treasury Challan</TableHead>
                    <TableHead>Case/Seizure Ref</TableHead>
                    <TableHead>Customs Station</TableHead>
                    <TableHead>Deposit Date</TableHead>
                    <TableHead>Released At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {releaseRecords.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center text-muted-foreground py-6">
                        No release records yet. Use &quot;Release Inventory&quot; on a detention deposit row below to add one.
                      </TableCell>
                    </TableRow>
                  ) : (
                    releaseRecords.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell className="font-mono">{r.qrCodeNumber}</TableCell>
                        <TableCell>{r.warehouse || "—"}</TableCell>
                        <TableCell className="font-mono">{r.firNumber || "—"}</TableCell>
                        <TableCell>{r.stackCount || "—"}</TableCell>
                        <TableCell>{r.treasuryChallanNo || "—"}</TableCell>
                        <TableCell>{r.caseSeizureRef || "—"}</TableCell>
                        <TableCell>{r.customsStation || "—"}</TableCell>
                        <TableCell>{r.depositDate || "—"}</TableCell>
                        <TableCell>{r.releasedAt || "—"}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Detention deposit accounts */}
        <Card>
          <CardHeader>
            <CardTitle>Detention deposit accounts</CardTitle>
            <CardDescription>
              Deposit account entries with type &quot;Detention&quot;. Release specific items with QR Code and full details, or transfer to seizure if &gt;2 months.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-auto max-h-[60vh]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Treasury Challan</TableHead>
                    <TableHead>Case/Seizure Ref</TableHead>
                    <TableHead>FIR No</TableHead>
                    <TableHead>Customs Station</TableHead>
                    <TableHead>Deposit Date</TableHead>
                    <TableHead>Days in deposit</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="min-w-[200px]">Alert</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {detentionDeposits.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                        No detention-type deposit accounts. Add entries in Detentions → Deposit Account Register with type &quot;Detention&quot;.
                      </TableCell>
                    </TableRow>
                  ) : (
                    detentionDeposits.map((row) => {
                      const days = daysInDeposit(row.depositDate)
                      const overTwoMonths = days !== null && days > RELEASE_ALERT_DAYS
                      return (
                        <TableRow key={row.id}>
                          <TableCell className="font-medium">{row.treasuryChallanNo}</TableCell>
                          <TableCell>{row.caseSeizureRef || "—"}</TableCell>
                          <TableCell className="font-mono">{row.firNo || "—"}</TableCell>
                          <TableCell>{row.customsStation}</TableCell>
                          <TableCell>{row.depositDate}</TableCell>
                          <TableCell>{days !== null ? days : "—"}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{row.status}</Badge>
                          </TableCell>
                          <TableCell>
                            {overTwoMonths ? (
                              <span
                                className="inline-flex items-center gap-1 text-amber-700 text-xs font-medium bg-amber-100 px-2 py-1 rounded"
                                title="Exceeded 2 months in deposit account. Transfer to Seizure Register."
                              >
                                <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                                In deposit &gt;2 mo – transfer to seizure
                              </span>
                            ) : (
                              "—"
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1 flex-wrap">
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => openReleaseDialog(row)}
                                title="Release this item (record QR Code, Warehouse, FIR, Stacks)"
                              >
                                <LogOut className="h-4 w-4 mr-1" />
                                Release Inventory
                              </Button>
                              {overTwoMonths && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleTransferToSeizure(row)}
                                  title="Transfer to Seizure Register"
                                >
                                  <Package className="h-4 w-4 mr-1" />
                                  Transfer to Seizure
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              After transfer, view records under <Link to={ROUTES.SEIZURE_REGISTER} className="text-primary hover:underline">Seizure & Receipt → Seizure Register</Link>.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Release Inventory dialog */}
      <Dialog open={releaseOpen} onOpenChange={setReleaseOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Release Inventory</DialogTitle>
            <p className="text-sm text-muted-foreground">
              Record release of specific items. QR Code number is required. Enter warehouse (from which), FIR, and number of stacks.
            </p>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>QR Code Number *</Label>
              <Input
                value={releaseForm.qrCodeNumber}
                onChange={(e) => setReleaseForm((f) => ({ ...f, qrCodeNumber: e.target.value }))}
                placeholder="e.g. QR-REL-2024-001"
              />
            </div>
            <div className="grid gap-2">
              <Label>Warehouse (from which) *</Label>
              <select
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                value={releaseForm.warehouse}
                onChange={(e) => setReleaseForm((f) => ({ ...f, warehouse: e.target.value }))}
              >
                <option value="">Select warehouse</option>
                {WAREHOUSE_OPTIONS.map((w) => (
                  <option key={w} value={w}>{w}</option>
                ))}
              </select>
            </div>
            <div className="grid gap-2">
              <Label>FIR Number</Label>
              <Input
                value={releaseForm.firNumber}
                onChange={(e) => setReleaseForm((f) => ({ ...f, firNumber: e.target.value }))}
                placeholder="e.g. FIR-2024-0845"
              />
            </div>
            <div className="grid gap-2">
              <Label>Number of stacks</Label>
              <Input
                type="text"
                inputMode="numeric"
                value={releaseForm.stackCount}
                onChange={(e) => setReleaseForm((f) => ({ ...f, stackCount: e.target.value }))}
                placeholder="How many stacks"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="grid gap-2">
                <Label>Treasury Challan</Label>
                <Input
                  value={releaseForm.treasuryChallanNo}
                  onChange={(e) => setReleaseForm((f) => ({ ...f, treasuryChallanNo: e.target.value }))}
                  placeholder="TCH No"
                />
              </div>
              <div className="grid gap-2">
                <Label>Case/Seizure Ref</Label>
                <Input
                  value={releaseForm.caseSeizureRef}
                  onChange={(e) => setReleaseForm((f) => ({ ...f, caseSeizureRef: e.target.value }))}
                  placeholder="Case ref"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Customs Station</Label>
              <select
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                value={releaseForm.customsStation}
                onChange={(e) => setReleaseForm((f) => ({ ...f, customsStation: e.target.value }))}
              >
                <option value="">Select</option>
                {CUSTOMS_STATIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="grid gap-2">
                <Label>Deposit Date</Label>
                <Input
                  type="date"
                  value={releaseForm.depositDate}
                  onChange={(e) => setReleaseForm((f) => ({ ...f, depositDate: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label>Amount (PKR)</Label>
                <Input
                  value={releaseForm.amount}
                  onChange={(e) => setReleaseForm((f) => ({ ...f, amount: e.target.value }))}
                  placeholder="Amount"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Bank / Treasury name</Label>
              <Input
                value={releaseForm.bankTreasuryName}
                onChange={(e) => setReleaseForm((f) => ({ ...f, bankTreasuryName: e.target.value }))}
                placeholder="Bank or treasury"
              />
            </div>
            <div className="grid gap-2">
              <Label>Remarks</Label>
              <Input
                value={releaseForm.remarks}
                onChange={(e) => setReleaseForm((f) => ({ ...f, remarks: e.target.value }))}
                placeholder="Optional remarks"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setReleaseOpen(false)}>Cancel</Button>
            <Button onClick={handleReleaseSubmit}>Save release record</Button>
          </div>
        </DialogContent>
      </Dialog>
    </ModulePageLayout>
  )
}
