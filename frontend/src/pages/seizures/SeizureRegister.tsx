import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { ClipboardList, Eye, FileText, LogOut } from "lucide-react"
import { ModulePageLayout } from "@/components/dashboard/module-page-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { getSeizedInventoryDetailPath, ROUTES } from "@/routes/config"
import { WMS_STOCK_UPDATED_EVENT, loadSeizedInventory } from "@/lib/wms-stock-storage"
import {
  fetchReleaseItemLinesForMemo,
  fetchSeizureRecords,
  resolveQrCode,
  releaseInventoryApi,
  type ReleaseItemLine,
  type SeizureRecordApi,
} from "@/lib/wms-flow-api"

const EMPTY_RELEASE_FORM = {
  warehouse: "",
  releasedOnBehalfOf: "",
  deputyName: "",
  collectorName: "",
  releaseDescription: "",
}

type SeizedRow = {
  id: string
  sourceDetentionId: string
  seizedAt: string
  caseNo: string
  firNumber?: string
  placeOfDetention?: string
  settlementStatus?: string
  dispositionStatus?: string
  referenceNumber?: string
  [key: string]: unknown
}

function apiSeizureToRow(s: SeizureRecordApi): SeizedRow {
  return {
    id: s.id,
    sourceDetentionId: s.detention_memo_id,
    seizedAt: s.seized_at,
    caseNo: s.case_no,
    firNumber: s.fir_number,
    placeOfDetention: s.place_of_detention,
    dispositionStatus: "In Warehouse",
    settlementStatus: "Forwarded to seizure",
  }
}

function loadRows(): SeizedRow[] {
  return loadSeizedInventory() as SeizedRow[]
}

async function loadRowsFromApi(): Promise<SeizedRow[]> {
  try {
    const apiRows = await fetchSeizureRecords()
    if (apiRows.length > 0) return apiRows.map(apiSeizureToRow)
  } catch {
    // fallback to local cache
  }
  return loadRows()
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
  const [releaseOpen, setReleaseOpen] = useState(false)
  const [releaseTarget, setReleaseTarget] = useState<SeizedRow | null>(null)
  const [releaseForm, setReleaseForm] = useState(EMPTY_RELEASE_FORM)
  const [releaseItems, setReleaseItems] = useState<ReleaseItemLine[]>([])
  const [releaseItemsAll, setReleaseItemsAll] = useState<ReleaseItemLine[]>([])
  const [releaseItemsLoading, setReleaseItemsLoading] = useState(false)
  const [releasing, setReleasing] = useState(false)

  const [releaseInputMode, setReleaseInputMode] = useState<"scan" | "manual">("scan")
  const [scanQrValue, setScanQrValue] = useState("")
  const [scanFiltering, setScanFiltering] = useState(false)

  useEffect(() => {
    const refresh = () => {
      void loadRowsFromApi().then(setRows)
    }
    refresh()
    window.addEventListener(WMS_STOCK_UPDATED_EVENT, refresh)
    window.addEventListener("storage", refresh)
    window.addEventListener("focus", refresh)
    return () => {
      window.removeEventListener(WMS_STOCK_UPDATED_EVENT, refresh)
      window.removeEventListener("storage", refresh)
      window.removeEventListener("focus", refresh)
    }
  }, [])

  const filteredRows = useMemo(() => {
    if (!search.trim()) return rows
    const q = search.trim().toLowerCase()
    return rows.filter(
      (r) =>
        (r.caseNo && r.caseNo.toLowerCase().includes(q)) ||
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
  const pendingDisposal = rows.filter(
    (r) =>
      r.dispositionStatus !== "Destructed" &&
      r.settlementStatus !== "Destructed" &&
      r.settlementStatus !== "Fully Settled" &&
      r.settlementStatus !== "Disposed"
  ).length

  const openRelease = (row: SeizedRow) => {
    setReleaseTarget(row)
    setReleaseForm({
      ...EMPTY_RELEASE_FORM,
      warehouse: row.placeOfDetention || "",
    })
    setReleaseItems([])
    setReleaseItemsAll([])
    setReleaseInputMode("scan")
    setScanQrValue("")
    setReleaseOpen(true)
    setReleaseItemsLoading(true)
    void fetchReleaseItemLinesForMemo(row.sourceDetentionId)
      .then((items) => {
        setReleaseItemsAll(items)
        setReleaseItems(items)
      })
      .finally(() => setReleaseItemsLoading(false))
  }

  const updateReleaseItemQty = (index: number, releaseQty: string) => {
    setReleaseItems((items) =>
      items.map((item, i) => (i === index ? { ...item, releaseQty } : item))
    )
  }

  const fillAllReleaseQuantities = () => {
    setReleaseItems((items) =>
      items.map((item) => ({ ...item, releaseQty: item.availableQty }))
    )
  }

  const showAllReleaseItems = () => {
    // Preserve already-entered release quantities (if any) when switching filters.
    const qtyByQr = new Map(releaseItems.map((i) => [i.qrCode, i.releaseQty]))
    setReleaseItems(
      releaseItemsAll.map((item) => ({
        ...item,
        releaseQty: qtyByQr.get(item.qrCode) ?? item.releaseQty,
      }))
    )
  }

  const applyQrFilter = async (code: string) => {
    if (!releaseTarget) return
    const raw = (code || "").trim()
    if (!raw) return
    if (!releaseItemsAll.length) return

    setScanFiltering(true)
    try {
      const resolved = await resolveQrCode(raw)
      if (!resolved) {
        window.alert("QR not recognized. Try again.")
        return
      }

      // Preserve quantities currently typed on the table.
      const qtyByQr = new Map(releaseItems.map((i) => [i.qrCode, i.releaseQty]))

      if (resolved.type === "goods_line") {
        const goodsQr = resolved.goods_line?.qrCodeNumber
        const memoId = resolved.memo?.id
        if (memoId && memoId !== releaseTarget.sourceDetentionId) {
          window.alert("This goods QR belongs to another detention memo.")
          return
        }
        if (!goodsQr) {
          window.alert("Goods QR not found in scan result.")
          return
        }

        const filtered = releaseItemsAll.filter(
          (i) => i.qrCode?.trim().toLowerCase() === goodsQr.trim().toLowerCase()
        )
        setReleaseItems(
          filtered.map((item) => ({
            ...item,
            releaseQty: qtyByQr.get(item.qrCode) ?? item.releaseQty,
          }))
        )
        return
      }

      if (resolved.type === "memo") {
        showAllReleaseItems()
        return
      }

      if (resolved.type === "stock") {
        const stockQr = resolved.stock?.qrCode
        if (!stockQr) {
          window.alert("Stock QR not found in scan result.")
          return
        }
        const filtered = releaseItemsAll.filter(
          (i) => i.qrCode?.trim().toLowerCase() === stockQr.trim().toLowerCase()
        )
        setReleaseItems(
          filtered.map((item) => ({
            ...item,
            releaseQty: qtyByQr.get(item.qrCode) ?? item.releaseQty,
          }))
        )
        return
      }

      // deposit / unknown
      window.alert(
        "Scanned QR is not related to release goods. Scan goods QR (for single item) or detention memo / case number (for full detention)."
      )
    } catch (e) {
      window.alert(e instanceof Error ? e.message : "QR scan failed.")
    } finally {
      setScanFiltering(false)
    }
  }

  const submitRelease = async () => {
    if (!releaseTarget) return
    const { warehouse, releasedOnBehalfOf, deputyName, collectorName, releaseDescription } = releaseForm

    if (!warehouse.trim()) {
      window.alert("Warehouse (release from) is required.")
      return
    }
    if (!releasedOnBehalfOf.trim()) {
      window.alert("On whose behalf is required.")
      return
    }
    if (!deputyName.trim()) {
      window.alert("Deputy name (approval) is required.")
      return
    }
    if (!collectorName.trim()) {
      window.alert("Collector name (approval) is required.")
      return
    }
    if (!releaseDescription.trim()) {
      window.alert("Release description is required.")
      return
    }

    const linesToRelease = releaseItems
      .map((item) => ({
        ...item,
        qty: Number(item.releaseQty),
        available: Number(item.availableQty),
      }))
      .filter((item) => item.qty > 0)

    if (linesToRelease.length === 0) {
      window.alert("Enter release quantity for at least one seized item.")
      return
    }

    for (const item of linesToRelease) {
      if (item.qty > item.available) {
        window.alert(
          `Release quantity (${item.qty}) cannot exceed available (${item.available}) for ${item.qrCode}.`
        )
        return
      }
    }

    const totalQty = linesToRelease.reduce((sum, item) => sum + item.qty, 0)

    setReleasing(true)
    try {
      await releaseInventoryApi({
        detentionMemoId: releaseTarget.sourceDetentionId,
        qrCode: linesToRelease.map((i) => i.qrCode).join(", "),
        warehouse: warehouse.trim(),
        quantityReleased: String(totalQty),
        releasedOnBehalfOf: releasedOnBehalfOf.trim(),
        deputyName: deputyName.trim(),
        collectorName: collectorName.trim(),
        releaseDescription: releaseDescription.trim(),
        releasedItems: linesToRelease.map((item) => ({
          stockItemId: item.stockId || undefined,
          qrCode: item.qrCode,
          quantity: String(item.qty),
          unit: item.unit,
          description: item.description,
        })),
        remarks: `Released from Seizure Register for case ${releaseTarget.caseNo}`,
      })
      setReleaseOpen(false)
      setReleaseTarget(null)
      setReleaseForm(EMPTY_RELEASE_FORM)
      setReleaseItems([])
      void loadRowsFromApi().then(setRows)
    } catch (e) {
      window.alert(e instanceof Error ? e.message : "Release failed")
    } finally {
      setReleasing(false)
    }
  }

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
        <Card className="w-full min-w-0">
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <CardTitle>Seizure Register</CardTitle>
              <CardDescription className="break-words">Search and view all seizure records (seized from Detention Memo)</CardDescription>
            </div>
            <Button variant="outline" size="sm" className="w-full sm:w-auto">
              Export
            </Button>
          </CardHeader>
          <CardContent className="w-full min-w-0 space-y-3">
            <Input
              placeholder="Search by reference, location..."
              className="w-full sm:w-64"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div className="divide-y rounded-lg border md:hidden">
              {filteredRows.length === 0 ? (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  No seizure records. Use &quot;Seize&quot; on a Detention Memo to add items here.
                </div>
              ) : (
                filteredRows.map((row) => (
                  <div key={row.id} className="p-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-semibold">{row.caseNo || "—"}</p>
                      <Badge variant={row.dispositionStatus === "Destructed" ? "destructive" : "outline"}>
                        {row.dispositionStatus || row.settlementStatus || "Registered"}
                      </Badge>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">Date: {formatDate(row.seizedAt)}</p>
                    <p className="text-xs text-muted-foreground">Location: {row.placeOfDetention || "—"}</p>
                    <div className="mt-2 flex gap-2">
                      <Button variant="ghost" size="sm" className="h-7 px-0 text-[#3b82f6]" asChild>
                        <Link to={getSeizedInventoryDetailPath(row.id)}>
                          <Eye className="mr-1 h-4 w-4" />
                          View
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm" className="h-7" onClick={() => openRelease(row)}>
                        <LogOut className="mr-1 h-3.5 w-3.5" />
                        Release
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="hidden w-full min-w-0 md:block">
              <div className="max-h-[50vh] w-full max-w-full overflow-x-auto overflow-y-auto rounded-lg border pb-2">
                <Table className="min-w-[760px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Reference</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRows.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                          No seizure records. Use &quot;Seize&quot; on a Detention Memo to add items here.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredRows.map((row) => (
                        <TableRow key={row.id}>
                          <TableCell className="font-medium">{row.caseNo || "—"}</TableCell>
                          <TableCell>{formatDate(row.seizedAt)}</TableCell>
                          <TableCell>{row.placeOfDetention || "—"}</TableCell>
                          <TableCell>
                            <Badge variant={row.dispositionStatus === "Destructed" ? "destructive" : "outline"}>
                              {row.dispositionStatus || row.settlementStatus || "Registered"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button variant="ghost" size="sm" className="text-[#3b82f6]" asChild>
                                <Link to={getSeizedInventoryDetailPath(row.id)}>
                                  <Eye className="h-4 w-4 mr-1" />
                                  View
                                </Link>
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => openRelease(row)}>
                                <LogOut className="h-4 w-4 mr-1" />
                                Release
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
          </CardContent>
        </Card>
      </div>

      <Dialog open={releaseOpen} onOpenChange={setReleaseOpen}>
        <DialogContent className="w-[95vw] max-h-[90vh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Release seized goods — {releaseTarget?.caseNo}</DialogTitle>
            <p className="text-sm text-muted-foreground">
              All seized items for this memo are listed below. Enter the quantity to release for each line.
            </p>
          </DialogHeader>
          <div className="grid gap-3 py-2">
            <div className="grid gap-2">
              <Label>Warehouse (release from) *</Label>
              <Input
                value={releaseForm.warehouse}
                onChange={(e) => setReleaseForm((f) => ({ ...f, warehouse: e.target.value }))}
              />
            </div>

            <div className="grid gap-2 pt-1">
              <Label>Release selection method *</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={releaseInputMode === "scan" ? "default" : "outline"}
                  onClick={() => {
                    setReleaseInputMode("scan")
                    setScanQrValue("")
                    // Keep current filter (if any), but allow user to scan again.
                  }}
                  disabled={releaseItemsLoading}
                >
                  Scan QR
                </Button>
                <Button
                  type="button"
                  variant={releaseInputMode === "manual" ? "default" : "outline"}
                  onClick={() => {
                    setReleaseInputMode("manual")
                    setScanQrValue("")
                    showAllReleaseItems()
                  }}
                  disabled={releaseItemsLoading}
                >
                  Add manually
                </Button>
              </div>

              {releaseInputMode === "scan" ? (
                <div className="grid gap-2">
                  <Label>Scan QR (goods QR shows only one item; case/memo QR shows full detention)</Label>
                  <Input
                    value={scanQrValue}
                    onChange={(e) => setScanQrValue(e.target.value)}
                    placeholder="Scan goods QR or memo/case number"
                    disabled={scanFiltering || releaseItemsLoading || !releaseItemsAll.length}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") void applyQrFilter(scanQrValue)
                    }}
                  />
                  <div className="flex items-center justify-between gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => {
                        setScanQrValue("")
                        showAllReleaseItems()
                      }}
                      disabled={scanFiltering || releaseItemsLoading}
                    >
                      Show all items
                    </Button>
                    <p className="text-xs text-muted-foreground shrink-0">
                      QR scan filter affects only the table below.
                    </p>
                  </div>
                </div>
              ) : null}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <Label>Seized items in this memo *</Label>
                {releaseItems.length > 0 ? (
                  <Button type="button" variant="outline" size="sm" onClick={fillAllReleaseQuantities}>
                    Release all available
                  </Button>
                ) : null}
              </div>
              {releaseItemsLoading ? (
                <p className="text-sm text-muted-foreground py-4">Loading seized items…</p>
              ) : releaseItems.length === 0 ? (
                <p className="text-sm text-muted-foreground rounded-md border p-4">
                  {releaseInputMode === "scan" && scanQrValue.trim()
                    ? "No goods matched the scanned QR. Try scanning case/memo QR to show full detention, or switch to Add manually."
                    : "No in-custody items found for this memo. Ensure goods were seized and are still in warehouse inventory."}
                </p>
              ) : (
                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Description</TableHead>
                        <TableHead>QR code</TableHead>
                        <TableHead className="text-right">Available</TableHead>
                        <TableHead className="w-[120px]">Release qty</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {releaseItems.map((item, index) => (
                        <TableRow key={item.stockId || item.qrCode || index}>
                          <TableCell className="max-w-[180px]">
                            <p className="truncate text-sm" title={item.description}>{item.description}</p>
                          </TableCell>
                          <TableCell className="font-mono text-xs">{item.qrCode || "—"}</TableCell>
                          <TableCell className="text-right text-sm whitespace-nowrap">
                            {item.availableQty} {item.unit}
                          </TableCell>
                          <TableCell>
                            <Input
                              type="text"
                              inputMode="decimal"
                              className="h-8"
                              value={item.releaseQty}
                              onChange={(e) => updateReleaseItemQty(index, e.target.value)}
                              placeholder="0"
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>

            <div className="grid gap-2">
              <Label>Released on behalf of *</Label>
              <Input
                value={releaseForm.releasedOnBehalfOf}
                onChange={(e) => setReleaseForm((f) => ({ ...f, releasedOnBehalfOf: e.target.value }))}
                placeholder="Name of party / accused / representative"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="grid gap-2">
                <Label>Deputy Collector(approval) *</Label>
                <Input
                  value={releaseForm.deputyName}
                  onChange={(e) => setReleaseForm((f) => ({ ...f, deputyName: e.target.value }))}
                  placeholder="Deputy Collector name"
                />
              </div>
              <div className="grid gap-2">
                <Label>Collector (approval) *</Label>
                <Input
                  value={releaseForm.collectorName}
                  onChange={(e) => setReleaseForm((f) => ({ ...f, collectorName: e.target.value }))}
                  placeholder="Collector name"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Release notes / description *</Label>
              <Textarea
                value={releaseForm.releaseDescription}
                onChange={(e) => setReleaseForm((f) => ({ ...f, releaseDescription: e.target.value }))}
                placeholder="Reason, court order ref, documents produced, and other release details"
                rows={3}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Partial release is allowed — enter quantity per item. Memo is fully settled only when all items are released.
              For deposit-linked cases, use <Link to={ROUTES.RELEASE_INVENTORY} className="underline">Release Inventory</Link>.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setReleaseOpen(false)} disabled={releasing}>Cancel</Button>
              <Button
                onClick={() => void submitRelease()}
                disabled={releasing || releaseItemsLoading || releaseItems.length === 0}
              >
                {releasing ? "Releasing…" : "Release"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </ModulePageLayout>
  )
}
