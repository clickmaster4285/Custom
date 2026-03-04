import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { AlertTriangle, Package, Warehouse } from "lucide-react"
import { ModulePageLayout } from "@/components/dashboard/module-page-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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

const DEPOSIT_STORAGE_KEY = "wms_deposit_account_register"
const SEIZED_STORAGE_KEY = "wms_seized_inventory"
const RELEASE_ALERT_DAYS = 60 // Transfer to seizure when in deposit account > 2 months

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

  useEffect(() => {
    setDepositRows(loadDepositRows())
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

  return (
    <ModulePageLayout
      title="Release Inventory"
      description="Detention deposits in warehouse: when inventory exceeds 2 months in deposit account, transfer to seizure."
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
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Detention deposit accounts</CardTitle>
            <CardDescription>
              Deposit account entries with type &quot;Detention&quot;. Items in deposit for more than 2 months can be transferred to seizure.
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
                            {overTwoMonths ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleTransferToSeizure(row)}
                                title="Transfer to Seizure Register"
                              >
                                <Package className="h-4 w-4 mr-1" />
                                Transfer to Seizure
                              </Button>
                            ) : (
                              <span className="text-muted-foreground text-sm">—</span>
                            )}
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
    </ModulePageLayout>
  )
}
