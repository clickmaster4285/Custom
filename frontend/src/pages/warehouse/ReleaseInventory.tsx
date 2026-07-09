import { useCallback, useEffect, useMemo, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  LogOut,
  RefreshCw,
  Search,
  QrCode,
  Warehouse,
} from "lucide-react"
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/components/ui/use-toast"
import { ROUTES } from "@/routes/config"
import {
  fetchDepositAccounts,
  type DepositAccountRow,
} from "@/lib/deposit-account-api"
import {
  fetchReleaseItemLinesForMemo,
  fetchReleaseRecords,
  resolveQrCode,
  releaseInventoryApi,
  type QrResolveResult,
  type ReleaseItemLine,
  type ReleaseRecordApi,
} from "@/lib/wms-flow-api"
import { resolveQrNavigationTarget } from "@/lib/qr-nav"

const RELEASE_ALERT_DAYS = 60
const DEPOSIT_STATUS_RELEASED = "Released"
const DEPOSIT_STATUS_FORWARDED_SEIZURE = "Forwarded to seizure"

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
] as const

const EMPTY_RELEASE_FORM = {
  warehouse: "",
  releasedOnBehalfOf: "",
  deputyName: "",
  collectorName: "",
  releaseDescription: "",
  remarks: "",
}

type DepositRow = DepositAccountRow

type ReleaseRecord = {
  id: string
  qrCodeNumber: string
  warehouse: string
  quantityReleased: string
  unit: string
  releasedOnBehalfOf: string
  deputyName: string
  collectorName: string
  releaseDescription: string
  caseSeizureRef: string
  treasuryChallanNo: string
  sourceDepositId: string
  releasedAt: string
}

function isDepositTerminal(row: DepositRow): boolean {
  const s = (row.status || "").trim().toLowerCase()
  return (
    s === DEPOSIT_STATUS_RELEASED.toLowerCase() ||
    s === DEPOSIT_STATUS_FORWARDED_SEIZURE.toLowerCase()
  )
}

function mapReleaseApiRow(r: ReleaseRecordApi): ReleaseRecord {
  return {
    id: r.id,
    qrCodeNumber: r.qr_code,
    warehouse: r.warehouse,
    quantityReleased: r.quantity_released || "",
    unit: r.unit || "PCS",
    releasedOnBehalfOf: r.released_on_behalf_of || "",
    deputyName: r.deputy_name || "",
    collectorName: r.collector_name || "",
    releaseDescription: r.release_description || "",
    caseSeizureRef: r.case_no,
    treasuryChallanNo: "",
    sourceDepositId: r.deposit_account_id || "",
    releasedAt: r.released_at.replace("T", " ").slice(0, 19),
  }
}

function daysInDeposit(depositDate: string): number | null {
  if (!depositDate?.trim()) return null
  try {
    const d = new Date(depositDate)
    return Math.floor((Date.now() - d.getTime()) / (1000 * 60 * 60 * 24))
  } catch {
    return null
  }
}

function formatReleasedAt(iso: string): string {
  if (!iso) return "—"
  try {
    return new Date(iso.replace(" ", "T")).toLocaleString()
  } catch {
    return iso
  }
}

function normalizeQrInput(raw: string): string {
  return raw.replace(/[\r\n\u0000]+/g, "").trim()
}

function findDepositForMemo(
  depositRows: DepositRow[],
  memoId: string,
  caseNo?: string
): DepositRow | null {
  const id = memoId.trim()
  if (!id) return null
  const byMemo = depositRows.find((r) => r.detentionMemoId?.trim() === id)
  if (byMemo) return byMemo

  const cn = (caseNo || "").trim().toLowerCase()
  if (!cn) return null
  return (
    depositRows.find((r) => (r.linkedMemoCaseNo || "").trim().toLowerCase() === cn) ||
    depositRows.find((r) => (r.caseSeizureRef || "").trim().toLowerCase() === cn) ||
    null
  )
}

function buildReleaseSourceFromResolve(
  resolved: QrResolveResult,
  depositRow: DepositRow | null
): DepositRow {
  if (depositRow) return depositRow
  const memoId = resolved.memo?.id?.trim() || ""
  return {
    id: "",
    detentionMemoId: memoId,
    linkedMemoCaseNo: resolved.memo?.caseNo || "",
    treasuryChallanNo: "",
    depositType: "Detention",
    caseSeizureRef: resolved.memo?.caseNo || "",
    firNo: resolved.memo?.firNumber || "",
    customsStation: resolved.memo?.placeOfDetention || "",
    amount: "",
    depositDate: "",
    bankTreasuryName: "",
    status: "",
    remarks: "",
  }
}

function releaseItemFromResolved(
  resolved: QrResolveResult
): ReleaseItemLine | null {
  if (resolved.type === "goods_line" && resolved.goods_line?.qrCodeNumber) {
    const gl = resolved.goods_line
    return {
      stockId: resolved.stock?.id || "",
      qrCode: gl.qrCodeNumber,
      description: gl.description || "—",
      availableQty: gl.quantity || "0",
      unit: gl.unit || "PCS",
      releaseQty: "",
      godownWarehouse: "",
    }
  }
  if (resolved.type === "stock" && resolved.stock?.qrCode) {
    const stock = resolved.stock
    return {
      stockId: stock.id,
      qrCode: stock.qrCode,
      description: stock.description || "—",
      availableQty: stock.quantity || "0",
      unit: "PCS",
      releaseQty: "",
      godownWarehouse: "",
    }
  }
  return null
}

function filterReleaseItemsForResolved(
  resolved: QrResolveResult,
  itemsAll: ReleaseItemLine[]
): ReleaseItemLine[] {
  if (resolved.type === "goods_line" && resolved.goods_line?.qrCodeNumber) {
    const q = resolved.goods_line.qrCodeNumber.trim().toLowerCase()
    const matched = itemsAll.filter((i) => (i.qrCode || "").trim().toLowerCase() === q)
    if (matched.length) return matched
    const fallback = releaseItemFromResolved(resolved)
    return fallback ? [fallback] : []
  }
  if (resolved.type === "stock" && resolved.stock?.qrCode) {
    const q = resolved.stock.qrCode.trim().toLowerCase()
    const matched = itemsAll.filter((i) => (i.qrCode || "").trim().toLowerCase() === q)
    if (matched.length) return matched
    const fallback = releaseItemFromResolved(resolved)
    return fallback ? [fallback] : []
  }
  if (resolved.type === "memo") return itemsAll
  return itemsAll
}

export default function ReleaseInventoryPage() {
  const navigate = useNavigate()
  const [depositRows, setDepositRows] = useState<DepositRow[]>([])
  const [releaseRecords, setReleaseRecords] = useState<ReleaseRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [depositSearch, setDepositSearch] = useState("")
  const [releaseSearch, setReleaseSearch] = useState("")

  const [releaseOpen, setReleaseOpen] = useState(false)
  const [releaseForm, setReleaseForm] = useState(EMPTY_RELEASE_FORM)
  const [releaseItems, setReleaseItems] = useState<ReleaseItemLine[]>([])
  const [releaseItemsAll, setReleaseItemsAll] = useState<ReleaseItemLine[]>([])
  const [releaseItemsLoading, setReleaseItemsLoading] = useState(false)
  const [releaseSourceDeposit, setReleaseSourceDeposit] = useState<DepositRow | null>(null)
  const [closeLinkedMemoOnRelease, setCloseLinkedMemoOnRelease] = useState(true)
  const [releaseSaving, setReleaseSaving] = useState(false)
  const [releaseInputMode, setReleaseInputMode] = useState<"scan" | "manual">("scan")
  const [scanQrValue, setScanQrValue] = useState("")
  const [scanFiltering, setScanFiltering] = useState(false)

  const [qrPickerOpen, setQrPickerOpen] = useState(false)
  const [qrPickerValue, setQrPickerValue] = useState("")
  const [qrPickerLoading, setQrPickerLoading] = useState(false)
  const [qrPickerTargetDeposit, setQrPickerTargetDeposit] = useState<DepositRow | null>(null)
  const [qrPickerItemsAll, setQrPickerItemsAll] = useState<ReleaseItemLine[]>([])
  const [qrPickerItems, setQrPickerItems] = useState<ReleaseItemLine[]>([])
  const [qrPickerSelectedQrCodes, setQrPickerSelectedQrCodes] = useState<string[]>([])
  const [qrPickerResolvedType, setQrPickerResolvedType] = useState<string>("")
  const [qrPickerError, setQrPickerError] = useState("")

  const [scanLookupOpen, setScanLookupOpen] = useState(false)
  const [scanLookupValue, setScanLookupValue] = useState("")
  const [scanLookupLoading, setScanLookupLoading] = useState(false)

  const releaseQtyByQr = useMemo(
    () => new Map(releaseItems.map((i) => [i.qrCode, i.releaseQty] as const)),
    [releaseItems]
  )

  const resetQrPicker = useCallback(() => {
    setQrPickerValue("")
    setQrPickerLoading(false)
    setQrPickerTargetDeposit(null)
    setQrPickerItemsAll([])
    setQrPickerItems([])
    setQrPickerSelectedQrCodes([])
    setQrPickerResolvedType("")
    setQrPickerError("")

    // Also reset the release form state used by this page.
    setReleaseSourceDeposit(null)
    setReleaseItems([])
    setReleaseItemsAll([])
    setReleaseForm(EMPTY_RELEASE_FORM)
    setCloseLinkedMemoOnRelease(true)
    setReleaseSaving(false)
    setReleaseInputMode("scan")
    setScanQrValue("")
  }, [])

  const reload = useCallback(async () => {
    setLoading(true)
    setLoadError(null)
    try {
      const [deposits, releases] = await Promise.all([
        fetchDepositAccounts(),
        fetchReleaseRecords(),
      ])
      setDepositRows(deposits)
      setReleaseRecords(releases.map(mapReleaseApiRow))
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to load data."
      setLoadError(msg)
      toast({ title: "Could not load release inventory", description: msg, variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void reload()
  }, [reload])

  const detentionDeposits = useMemo(
    () =>
      depositRows.filter(
        (r) => (r.depositType || "").trim().toLowerCase() === "detention"
      ),
    [depositRows]
  )

  const pendingDeposits = useMemo(
    () => detentionDeposits.filter((r) => !isDepositTerminal(r)),
    [detentionDeposits]
  )

  const completedDeposits = useMemo(
    () => detentionDeposits.filter((r) => isDepositTerminal(r)),
    [detentionDeposits]
  )

  const overdueCount = useMemo(
    () =>
      pendingDeposits.filter((r) => {
        const days = daysInDeposit(r.depositDate)
        return days !== null && days > RELEASE_ALERT_DAYS
      }).length,
    [pendingDeposits]
  )

  const filterDeposits = useCallback(
    (rows: DepositRow[]) => {
      const q = depositSearch.trim().toLowerCase()
      if (!q) return rows
      return rows.filter(
        (r) =>
          r.treasuryChallanNo?.toLowerCase().includes(q) ||
          r.caseSeizureRef?.toLowerCase().includes(q) ||
          r.firNo?.toLowerCase().includes(q) ||
          r.customsStation?.toLowerCase().includes(q) ||
          r.linkedMemoCaseNo?.toLowerCase().includes(q)
      )
    },
    [depositSearch]
  )

  const filteredPending = useMemo(
    () => filterDeposits(pendingDeposits),
    [filterDeposits, pendingDeposits]
  )

  const filteredCompleted = useMemo(
    () => filterDeposits(completedDeposits),
    [filterDeposits, completedDeposits]
  )

  const filteredReleases = useMemo(() => {
    const q = releaseSearch.trim().toLowerCase()
    if (!q) return releaseRecords
    return releaseRecords.filter(
      (r) =>
        r.qrCodeNumber?.toLowerCase().includes(q) ||
        r.caseSeizureRef?.toLowerCase().includes(q) ||
        r.releasedOnBehalfOf?.toLowerCase().includes(q) ||
        r.warehouse?.toLowerCase().includes(q)
    )
  }, [releaseRecords, releaseSearch])

  const handleScanLookup = useCallback(async () => {
    const raw = scanLookupValue.trim()
    if (!raw) {
      toast({
        title: "Enter a QR code",
        description: "Scan or type a memo QR or goods QR to continue.",
        variant: "destructive",
      })
      return
    }

    setScanLookupLoading(true)
    try {
      const target = await resolveQrNavigationTarget(raw)
      if (!target) {
        toast({
          title: "QR not recognized",
          description: "No detention memo or goods line matched this code.",
          variant: "destructive",
        })
        return
      }
      setScanLookupOpen(false)
      setScanLookupValue("")
      navigate(target)
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Could not resolve QR code."
      toast({ title: "Scan failed", description: msg, variant: "destructive" })
    } finally {
      setScanLookupLoading(false)
    }
  }, [navigate, scanLookupValue])

  const openReleaseDialog = (row: DepositRow) => {
    setCloseLinkedMemoOnRelease(true)
    setReleaseSourceDeposit(row)
    setReleaseForm({ ...EMPTY_RELEASE_FORM, remarks: row.remarks || "" })
    setReleaseItems([])
    setReleaseItemsAll([])
    setReleaseInputMode("scan")
    setScanQrValue("")
    setReleaseOpen(true)

    if (!row.detentionMemoId?.trim()) {
      setReleaseItemsLoading(false)
      return
    }

    setReleaseItemsLoading(true)
    void fetchReleaseItemLinesForMemo(row.detentionMemoId)
      .then((items) => {
        setReleaseItemsAll(items)
        setReleaseItems(items)
        const warehouseFromStock = items.find((i) => i.godownWarehouse?.trim())?.godownWarehouse?.trim()
        if (warehouseFromStock) {
          setReleaseForm((f) => ({ ...f, warehouse: warehouseFromStock }))
        }
      })
      .catch(() => {
        toast({
          title: "Could not load goods",
          description: "Try again or ensure goods are in warehouse inventory.",
          variant: "destructive",
        })
      })
      .finally(() => setReleaseItemsLoading(false))
  }

  const fetchQrPickerItems = useCallback(async (inputValue?: string) => {
    const raw = normalizeQrInput(inputValue ?? qrPickerValue)
    if (!raw) return

    setQrPickerValue(raw)
    setQrPickerLoading(true)
    setQrPickerError("")
    try {
      // Reset any previously entered release form details.
      setReleaseSourceDeposit(null)
      setReleaseItems([])
      setReleaseItemsAll([])
      setReleaseForm(EMPTY_RELEASE_FORM)
      setCloseLinkedMemoOnRelease(true)

      const resolved = await resolveQrCode(raw)

      const memoId = resolved.memo?.id?.trim() || ""
      if (!memoId) {
        const msg = "This QR is not linked to a detention memo."
        setQrPickerError(msg)
        toast({ title: "QR not recognized", description: msg, variant: "destructive" })
        return
      }

      const depositRow =
        findDepositForMemo(depositRows, memoId, resolved.memo?.caseNo) ||
        (resolved.deposit?.id
          ? depositRows.find((r) => r.id === resolved.deposit?.id) || null
          : null)

      const releaseSource = buildReleaseSourceFromResolve(resolved, depositRow)
      const itemsAll = await fetchReleaseItemLinesForMemo(memoId)
      const items = filterReleaseItemsForResolved(resolved, itemsAll)

      if (!items.length) {
        const msg = "No goods line matched this QR code."
        setQrPickerError(msg)
        toast({ title: "Goods not found", description: msg, variant: "destructive" })
        return
      }

      const warehouseFromStock = itemsAll.find((i) => i.godownWarehouse?.trim())?.godownWarehouse?.trim()

      setQrPickerTargetDeposit(releaseSource)
      setQrPickerItemsAll(itemsAll.length ? itemsAll : items)
      setQrPickerItems(items)
      setQrPickerSelectedQrCodes(items.map((i) => i.qrCode))
      setQrPickerResolvedType(resolved.type)

      // Populate the same release form fields (quantity, deputy, collector, etc.)
      // directly inside this QR modal.
      setReleaseSourceDeposit(releaseSource)
      setReleaseItemsAll(itemsAll.length ? itemsAll : items)
      setReleaseItems(items)
      setReleaseForm({
        ...EMPTY_RELEASE_FORM,
        remarks: releaseSource.remarks || "",
        warehouse: warehouseFromStock || "",
      })
      setCloseLinkedMemoOnRelease(true)
      setReleaseInputMode("scan")
      setScanQrValue("")
      setReleaseItemsLoading(false)
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Try again."
      setQrPickerError(msg)
      toast({
        title: "QR lookup failed",
        description: msg,
        variant: "destructive",
      })
    } finally {
      setQrPickerLoading(false)
    }
  }, [qrPickerValue, depositRows])

  const toggleQrPickerSelection = (qrCode: string) => {
    setQrPickerSelectedQrCodes((prev) => {
      const next = new Set(prev)
      if (next.has(qrCode)) next.delete(qrCode)
      else next.add(qrCode)
      const qtyByQr = new Map(releaseItems.map((i) => [i.qrCode, i.releaseQty]))
      const selectedSet = next
      setReleaseItems(
        qrPickerItems.filter((i) => selectedSet.has(i.qrCode)).map((item) => ({
          ...item,
          releaseQty: qtyByQr.get(item.qrCode) ?? item.releaseQty,
        }))
      )
      return Array.from(next)
    })
  }

  const applyQrPickerSelectionToRelease = () => {
    if (!qrPickerTargetDeposit) return
    const selectedSet = new Set(qrPickerSelectedQrCodes)
    const itemsToRelease = qrPickerItems.filter((i) => selectedSet.has(i.qrCode))

    setCloseLinkedMemoOnRelease(true)
    setReleaseSourceDeposit(qrPickerTargetDeposit)
    const warehouseFromStock = qrPickerItemsAll.find((i) => i.godownWarehouse?.trim())?.godownWarehouse?.trim()
    setReleaseForm({
      ...EMPTY_RELEASE_FORM,
      remarks: qrPickerTargetDeposit.remarks || "",
      warehouse: warehouseFromStock || "",
    })
    setReleaseItemsAll(qrPickerItemsAll)
    setReleaseItems(itemsToRelease)
    setReleaseItemsLoading(false)
    setReleaseInputMode("scan")
    setScanQrValue("")
    setQrPickerOpen(false)
    setQrPickerValue("")
    setQrPickerSelectedQrCodes([])
    setQrPickerResolvedType("")
    setReleaseOpen(true)
  }

  const updateReleaseItemQty = (index: number, releaseQty: string) => {
    setReleaseItems((items) =>
      items.map((item, i) => (i === index ? { ...item, releaseQty } : item))
    )
  }

  const updateReleaseItemQtyByQr = (qrCode: string, releaseQty: string) => {
    setReleaseItems((items) => items.map((item) => (item.qrCode === qrCode ? { ...item, releaseQty } : item)))
  }

  const fillAllReleaseQuantities = () => {
    setReleaseItems((items) =>
      items.map((item) => ({ ...item, releaseQty: item.availableQty }))
    )
  }

  const showAllReleaseItems = useCallback(() => {
    const qtyByQr = new Map(releaseItems.map((item) => [item.qrCode, item.releaseQty]))
    setReleaseItems(
      releaseItemsAll.map((item) => ({
        ...item,
        releaseQty: qtyByQr.get(item.qrCode) ?? item.releaseQty,
      }))
    )
  }, [releaseItems, releaseItemsAll])

  const applyQrFilter = useCallback(
    async (code: string) => {
      if (!releaseSourceDeposit) return
      const raw = code.trim()
      if (!raw || !releaseItemsAll.length) return

      setScanFiltering(true)
      try {
        const resolved = await resolveQrCode(raw)
        if (!resolved) {
          toast({
            title: "QR not recognized",
            description: "Try scanning the goods QR or memo/case QR again.",
            variant: "destructive",
          })
          return
        }

        const qtyByQr = new Map(releaseItems.map((item) => [item.qrCode, item.releaseQty]))

        if (resolved.type === "goods_line") {
          const goodsQr = resolved.goods_line?.qrCodeNumber
          const memoId = resolved.memo?.id
          if (memoId && memoId !== releaseSourceDeposit.detentionMemoId) {
            toast({
              title: "Wrong detention memo",
              description: "This goods QR belongs to another detention memo.",
              variant: "destructive",
            })
            return
          }
          if (!goodsQr) {
            toast({
              title: "Goods QR missing",
              description: "Goods QR was not found in the scan result.",
              variant: "destructive",
            })
            return
          }

          const filtered = releaseItemsAll.filter(
            (item) => item.qrCode?.trim().toLowerCase() === goodsQr.trim().toLowerCase()
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
          const memoId = resolved.memo?.id
          if (memoId && memoId !== releaseSourceDeposit.detentionMemoId) {
            toast({
              title: "Wrong detention memo",
              description: "This memo QR belongs to another detention memo.",
              variant: "destructive",
            })
            return
          }
          showAllReleaseItems()
          return
        }

        if (resolved.type === "stock") {
          const stockQr = resolved.stock?.qrCode
          if (!stockQr) {
            toast({
              title: "Stock QR missing",
              description: "Stock QR was not found in the scan result.",
              variant: "destructive",
            })
            return
          }

          const filtered = releaseItemsAll.filter(
            (item) => item.qrCode?.trim().toLowerCase() === stockQr.trim().toLowerCase()
          )
          setReleaseItems(
            filtered.map((item) => ({
              ...item,
              releaseQty: qtyByQr.get(item.qrCode) ?? item.releaseQty,
            }))
          )
          return
        }

        toast({
          title: "Unsupported QR",
          description:
            "Scan a goods QR for one item, or a detention memo / case QR to show all items.",
          variant: "destructive",
        })
      } catch (e) {
        toast({
          title: "QR scan failed",
          description: e instanceof Error ? e.message : "Could not resolve scanned QR code.",
          variant: "destructive",
        })
      } finally {
        setScanFiltering(false)
      }
    },
    [releaseItems, releaseItemsAll, releaseSourceDeposit, showAllReleaseItems]
  )

  const handleReleaseSubmit = async (opts?: { closeQrPicker?: boolean }) => {
    const memoId = releaseSourceDeposit?.detentionMemoId?.trim()
    if (!memoId) return
    const { warehouse, releasedOnBehalfOf, deputyName, collectorName, releaseDescription, remarks } =
      releaseForm

    if (!warehouse.trim()) {
      toast({ title: "Warehouse required", variant: "destructive" })
      return
    }
    if (!releasedOnBehalfOf.trim()) {
      toast({ title: "On whose behalf is required", variant: "destructive" })
      return
    }
    if (!deputyName.trim()) {
      toast({ title: "Deputy name is required", variant: "destructive" })
      return
    }
    if (!collectorName.trim()) {
      toast({ title: "Collector name is required", variant: "destructive" })
      return
    }
    if (!releaseDescription.trim()) {
      toast({ title: "Release notes are required", variant: "destructive" })
      return
    }

    const parsedLines = releaseItems
      .map((item) => ({
        ...item,
        qty: Number(item.releaseQty),
        available: Number(item.availableQty),
      }))
    let linesToRelease = parsedLines.filter((item) => item.qty > 0)

    if (linesToRelease.length === 0) {
      // Convenience: if user didn't enter quantities, release all available.
      const availableLines = parsedLines
        .map((item) => ({ ...item, qty: item.available }))
        .filter((item) => item.qty > 0)

      if (availableLines.length === 0) {
        toast({
          title: "No items available",
          description: "There is nothing available to release for this memo.",
          variant: "destructive",
        })
        return
      }

      setReleaseItems((items) => items.map((i) => ({ ...i, releaseQty: i.availableQty })))
      linesToRelease = availableLines
    }

    for (const item of linesToRelease) {
      if (item.qty > item.available) {
        toast({
          title: "Quantity too high",
          description: `Cannot release ${item.qty} — only ${item.available} available for ${item.qrCode}.`,
          variant: "destructive",
        })
        return
      }
    }

    const totalQty = linesToRelease.reduce((sum, item) => sum + item.qty, 0)
    const releasedAt = new Date().toISOString().slice(0, 19).replace("T", " ")
    const depositRemarkParts = [
      releaseSourceDeposit?.remarks?.trim(),
      remarks.trim(),
      `Released ${totalQty} on behalf of ${releasedOnBehalfOf.trim()}; Deputy: ${deputyName.trim()}; Collector: ${collectorName.trim()}.`,
      releaseDescription.trim(),
      `Released to party ${releasedAt}; warehouse ${warehouse.trim()}.`,
    ].filter(Boolean)

    setReleaseSaving(true)
    try {
      await releaseInventoryApi({
        depositAccountId: releaseSourceDeposit?.id || undefined,
        detentionMemoId: memoId,
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
        firNumber: releaseSourceDeposit?.firNo || "",
        treasuryChallanNo: releaseSourceDeposit?.treasuryChallanNo || "",
        customsStation: releaseSourceDeposit?.customsStation || "",
        amount: releaseSourceDeposit?.amount || "",
        bankTreasuryName: releaseSourceDeposit?.bankTreasuryName || "",
        remarks: depositRemarkParts.join("\n"),
        settleMemo: closeLinkedMemoOnRelease,
      })

      const hadMemo = !!memoId
      let description = "Deposit closed as Released."
      if (hadMemo && closeLinkedMemoOnRelease) {
        description += " Linked detention memo marked Fully Settled when all goods released."
      } else if (hadMemo) {
        description += " Linked memo left unchanged."
      }
      toast({ title: "Release saved", description })

      if (opts?.closeQrPicker) setQrPickerOpen(false)
      setReleaseOpen(false)
      setReleaseSourceDeposit(null)
      setReleaseForm(EMPTY_RELEASE_FORM)
      setReleaseItems([])
      void reload()
      if (opts?.closeQrPicker) resetQrPicker()
    } catch (e) {
      toast({
        title: "Release failed",
        description: e instanceof Error ? e.message : "Could not save release.",
        variant: "destructive",
      })
    } finally {
      setReleaseSaving(false)
    }
  }

  const renderDepositRow = (row: DepositRow, terminal: boolean) => {
    const days = daysInDeposit(row.depositDate)
    const overTwoMonths = days !== null && days > RELEASE_ALERT_DAYS

    return (
      <TableRow key={row.id} className={terminal ? "opacity-60" : undefined}>
        <TableCell>
          <div className="font-medium">{row.treasuryChallanNo || "—"}</div>
          {row.linkedMemoCaseNo ? (
            <div className="text-xs text-muted-foreground mt-0.5">{row.linkedMemoCaseNo}</div>
          ) : null}
        </TableCell>
        <TableCell>{row.caseSeizureRef || "—"}</TableCell>
        <TableCell className="font-mono text-sm">{row.firNo || "—"}</TableCell>
        <TableCell>{row.customsStation || "—"}</TableCell>
        <TableCell className="whitespace-nowrap">{row.depositDate || "—"}</TableCell>
        <TableCell>{days !== null ? `${days}d` : "—"}</TableCell>
        <TableCell>
          <Badge variant={terminal ? "secondary" : overTwoMonths ? "destructive" : "outline"}>
            {row.status}
          </Badge>
        </TableCell>
        <TableCell>
          {!terminal && overTwoMonths ? (
            <span className="inline-flex items-center gap-1 text-amber-700 text-xs font-medium bg-amber-50 border border-amber-200 px-2 py-1 rounded-md">
              <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
              &gt;2 months
            </span>
          ) : terminal ? (
            <span className="text-xs text-muted-foreground">Closed</span>
          ) : (
            <span className="text-xs text-emerald-700">Active</span>
          )}
        </TableCell>
        <TableCell className="text-right">
          {!terminal ? (
            <div className="flex items-center justify-end gap-1 flex-wrap">
              <Button variant="default" size="sm" onClick={() => openReleaseDialog(row)}>
                <LogOut className="h-4 w-4 mr-1" />
                Release
              </Button>
            </div>
          ) : null}
        </TableCell>
      </TableRow>
    )
  }

  return (
    <ModulePageLayout
      title="Release Inventory"
      description="Release detained goods when documents are furnished."
      breadcrumbs={[{ label: "WMS" }, { label: "Warehouse" }, { label: "Release Inventory" }]}
    >
      <div className="grid gap-6">
        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending release</CardTitle>
              <Clock className="h-4 w-4 text-[#3b82f6]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingDeposits.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Detention deposits awaiting action</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Overdue (&gt;60 days)</CardTitle>
              <AlertTriangle className="h-4 w-4 text-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overdueCount}</div>
              <p className="text-xs text-muted-foreground mt-1">Consider follow-up or seizure transfer</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedDeposits.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Released or forwarded to seizure</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Release records</CardTitle>
              <LogOut className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{releaseRecords.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Total inventory releases logged</p>
            </CardContent>
          </Card>
        </div>

     
        {/* Release history */}
        <Card>
          <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <LogOut className="h-5 w-5" />
                Release history
              </CardTitle>
              <CardDescription>Audit trail of all inventory releases with approvals and quantities.</CardDescription>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-8"
                placeholder="Search releases…"
                value={releaseSearch}
                onChange={(e) => setReleaseSearch(e.target.value)}
              />
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="sm:ml-2"
              onClick={() => {
                setScanLookupValue("")
                setScanLookupOpen(true)
              }}
            >
              <QrCode className="h-4 w-4 mr-2" />
              Scan QR
            </Button>
            <Button
              type="button"
              variant="default"
              size="sm"
              className="sm:ml-1 bg-[#3b82f6] hover:bg-[#2563eb] text-white"
              onClick={() => {
                setQrPickerOpen(true)
                resetQrPicker()
              }}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Release Inventory
            </Button>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border overflow-x-auto">
              <Table className="min-w-[1100px]">
                <TableHeader>
                  <TableRow>
                    <TableHead>Released</TableHead>
                    <TableHead>Case / QR</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Warehouse</TableHead>
                    <TableHead>On behalf of</TableHead>
                    <TableHead>Deputy</TableHead>
                    <TableHead>Collector</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReleases.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="py-10 text-center text-muted-foreground">
                        No release records yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredReleases.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell className="text-sm whitespace-nowrap text-muted-foreground">
                          {formatReleasedAt(r.releasedAt)}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm font-medium">{r.caseSeizureRef || "—"}</div>
                          <div className="font-mono text-xs text-muted-foreground truncate max-w-[160px]" title={r.qrCodeNumber}>
                            {r.qrCodeNumber}
                          </div>
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          {r.quantityReleased ? `${r.quantityReleased} ${r.unit}` : "—"}
                        </TableCell>
                        <TableCell className="max-w-[140px] truncate" title={r.warehouse}>{r.warehouse || "—"}</TableCell>
                        <TableCell className="max-w-[120px] truncate" title={r.releasedOnBehalfOf}>{r.releasedOnBehalfOf || "—"}</TableCell>
                        <TableCell>{r.deputyName || "—"}</TableCell>
                        <TableCell>{r.collectorName || "—"}</TableCell>
                        <TableCell className="max-w-[200px] truncate text-sm" title={r.releaseDescription}>
                          {r.releaseDescription || "—"}
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

      {/* Release dialog */}
      <Dialog open={releaseOpen} onOpenChange={setReleaseOpen}>
        <DialogContent className="w-[95vw] max-h-[90vh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              Release seized goods —{" "}
              {(releaseSourceDeposit?.detentionMemoId ||
                releaseSourceDeposit?.linkedMemoCaseNo ||
                releaseSourceDeposit?.caseSeizureRef ||
                "—") as string}
            </DialogTitle>
            <p className="text-sm text-muted-foreground">
              All seized items for this memo are listed below. Enter the quantity to release for each
              line.
            </p>
          </DialogHeader>

          {releaseSourceDeposit ? (
            <div className="rounded-lg border bg-muted/30 p-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Challan</p>
                <p className="font-medium">{releaseSourceDeposit.treasuryChallanNo || "—"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Case ref</p>
                <p className="font-medium">{releaseSourceDeposit.caseSeizureRef || "—"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">FIR</p>
                <p className="font-mono">{releaseSourceDeposit.firNo || "—"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Station</p>
                <p>{releaseSourceDeposit.customsStation || "—"}</p>
              </div>
            </div>
          ) : null}

          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label>Warehouse (release from) *</Label>
              <select
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                value={releaseForm.warehouse}
                onChange={(e) => setReleaseForm((f) => ({ ...f, warehouse: e.target.value }))}
              >
                <option value="">Select warehouse</option>
                {WAREHOUSE_OPTIONS.map((w) => (
                  <option key={w} value={w}>{w}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
                <div className="grid gap-2 pt-1">
                  <Label>Release selection method *</Label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={releaseInputMode === "scan" ? "default" : "outline"}
                      onClick={() => {
                        setReleaseInputMode("scan")
                        setScanQrValue("")
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

              <div className="flex items-center justify-between gap-2">
                <Label>Seized items in this memo *</Label>
                {releaseItems.length > 0 ? (
                  <Button type="button" variant="outline" size="sm" onClick={fillAllReleaseQuantities}>
                    Release all available
                  </Button>
                ) : null}
              </div>
              {releaseItemsLoading ? (
                <p className="text-sm text-muted-foreground py-6 text-center border rounded-lg">
                  Loading goods for this deposit…
                </p>
              ) : !releaseSourceDeposit?.detentionMemoId?.trim() ? (
                <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg p-4">
                  This deposit is not linked to a detention memo. Link it in Deposit Account Register to load goods lines.
                </p>
              ) : releaseItems.length === 0 ? (
                <p className="text-sm text-muted-foreground border rounded-lg p-4">
                  {releaseInputMode === "scan" && scanQrValue.trim()
                    ? "No goods matched the scanned QR. Try scanning case/memo QR to show full detention, or switch to Add manually."
                    : "No in-custody items found. Goods may need to be received into inventory first, or were already released."}
                </p>
              ) : (
                <div className="rounded-lg border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Description</TableHead>
                        <TableHead>QR code</TableHead>
                        <TableHead className="text-right">Available</TableHead>
                        <TableHead className="w-[110px]">Release qty</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {releaseItems.map((item, index) => (
                        <TableRow key={item.stockId || item.qrCode || index}>
                          <TableCell className="max-w-[200px]">
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
                placeholder="Party / accused / representative name"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label>Deputy (approval) *</Label>
                <Input
                  value={releaseForm.deputyName}
                  onChange={(e) => setReleaseForm((f) => ({ ...f, deputyName: e.target.value }))}
                  placeholder="Deputy name"
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
              <Label>Release notes *</Label>
              <Textarea
                value={releaseForm.releaseDescription}
                onChange={(e) => setReleaseForm((f) => ({ ...f, releaseDescription: e.target.value }))}
                placeholder="Court order, documents produced, reason for release…"
                rows={3}
              />
            </div>

            <div className="grid gap-2">
              <Label>Additional remarks</Label>
              <Input
                value={releaseForm.remarks}
                onChange={(e) => setReleaseForm((f) => ({ ...f, remarks: e.target.value }))}
                placeholder="Optional internal notes"
              />
            </div>

            {releaseSourceDeposit?.detentionMemoId?.trim() ? (
              <div className="flex items-start gap-3 rounded-lg border bg-blue-50/50 dark:bg-muted/30 p-3">
                <Checkbox
                  id="close-linked-memo"
                  checked={closeLinkedMemoOnRelease}
                  onCheckedChange={(v) => setCloseLinkedMemoOnRelease(v === true)}
                  className="mt-0.5"
                />
                <label htmlFor="close-linked-memo" className="text-sm leading-snug cursor-pointer">
                  When all goods are released, set linked detention memo to{" "}
                  <strong>Fully Settled</strong>.
                </label>
              </div>
            ) : null}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setReleaseOpen(false)}
              disabled={releaseSaving}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => void handleReleaseSubmit()}
              disabled={
                releaseSaving ||
                releaseItemsLoading ||
                !releaseSourceDeposit?.detentionMemoId ||
                releaseItems.length === 0
              }
            >
                {releaseSaving ? "Releasing…" : "Release"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Scan QR — open memo detail or goods-only view */}
      <Dialog
        open={scanLookupOpen}
        onOpenChange={(o) => {
          setScanLookupOpen(o)
          if (!o) {
            setScanLookupValue("")
            setScanLookupLoading(false)
          }
        }}
      >
        <DialogContent className="w-[95vw] sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Scan QR</DialogTitle>
            <p className="text-sm text-muted-foreground">
              Scan or enter a memo QR to open the full detention memo, or a goods QR to open only that item&apos;s information.
            </p>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label>Memo QR or Goods QR</Label>
              <div className="flex gap-2">
                <Input
                  value={scanLookupValue}
                  onChange={(e) => setScanLookupValue(e.target.value)}
                  placeholder="Scan memo QR or goods QR"
                  disabled={scanLookupLoading}
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") void handleScanLookup()
                  }}
                />
                <Button
                  type="button"
                  onClick={() => void handleScanLookup()}
                  disabled={scanLookupLoading || !scanLookupValue.trim()}
                >
                  {scanLookupLoading ? "Opening…" : "Open"}
                </Button>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setScanLookupOpen(false)}
              disabled={scanLookupLoading}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => void handleScanLookup()}
              disabled={scanLookupLoading || !scanLookupValue.trim()}
            >
              {scanLookupLoading ? "Opening…" : "Open"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* QR picker for selecting goods/case before opening release dialog */}
      <Dialog
        open={qrPickerOpen}
        onOpenChange={(o) => {
          setQrPickerOpen(o)
          if (!o) resetQrPicker()
        }}
      >
        <DialogContent className="w-[95vw] max-h-[90vh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Release by QR</DialogTitle>
            <p className="text-sm text-muted-foreground">
              Enter goods QR (single item) or case/memo QR (loads all goods for the detention memo).
            </p>
          </DialogHeader>

          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label>Goods QR or Case Number</Label>
              <div className="flex gap-2">
                <Input
                  value={qrPickerValue}
                  onChange={(e) => {
                    setQrPickerValue(e.target.value)
                    setQrPickerError("")
                  }}
                  placeholder="Scan goods QR or memo/case QR"
                  disabled={qrPickerLoading}
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") void fetchQrPickerItems()
                  }}
                  onPaste={(e) => {
                    const pasted = normalizeQrInput(e.clipboardData.getData("text"))
                    if (!pasted) return
                    e.preventDefault()
                    setQrPickerValue(pasted)
                    window.setTimeout(() => {
                      void fetchQrPickerItems(pasted)
                    }, 0)
                  }}
                  onBlur={() => {
                    if (qrPickerValue.trim() && !qrPickerItems.length && !qrPickerLoading) {
                      void fetchQrPickerItems()
                    }
                  }}
                />
                <Button
                  type="button"
                  onClick={() => void fetchQrPickerItems()}
                  disabled={qrPickerLoading || !qrPickerValue.trim()}
                >
                  {qrPickerLoading ? "Resolving…" : "Fetch"}
                </Button>
              </div>
              {qrPickerResolvedType ? (
                <p className="text-xs text-muted-foreground">
                  Detected: <span className="font-medium">{qrPickerResolvedType}</span>
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  After scanning, press Enter or click Fetch to load goods.
                </p>
              )}
              {qrPickerError ? (
                <p className="text-xs text-destructive">{qrPickerError}</p>
              ) : null}
            </div>

            {qrPickerLoading ? (
              <div className="text-sm text-muted-foreground border rounded-lg p-4 text-center">
                Resolving QR…
              </div>
            ) : null}

            {qrPickerItems.length ? (
              <div className="grid gap-4">
                {qrPickerItems.some((i) => !i.stockId) ? (
                  <div className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-900">
                    Goods are not in warehouse stock yet. They will be added to inventory automatically when you
                    release.
                  </div>
                ) : null}
                {releaseSourceDeposit ? (
                  <div className="rounded-lg border bg-muted/30 p-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground">Challan</p>
                      <p className="font-medium">{releaseSourceDeposit.treasuryChallanNo || "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Case ref</p>
                      <p className="font-medium">{releaseSourceDeposit.caseSeizureRef || "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">FIR</p>
                      <p className="font-mono">{releaseSourceDeposit.firNo || "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Station</p>
                      <p>{releaseSourceDeposit.customsStation || "—"}</p>
                    </div>
                  </div>
                ) : null}

                <div className="grid gap-2">
                  <Label>Warehouse (release from) *</Label>
                  <select
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                    value={releaseForm.warehouse}
                    onChange={(e) => setReleaseForm((f) => ({ ...f, warehouse: e.target.value }))}
                  >
                    <option value="">Select warehouse</option>
                    {WAREHOUSE_OPTIONS.map((w) => (
                      <option key={w} value={w}>
                        {w}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="rounded-lg border overflow-x-auto">
                  <div className="flex items-center justify-between gap-2 p-3 border-b">
                    <p className="text-sm font-medium">Select items to release</p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const selected = qrPickerItems.map((i) => i.qrCode)
                        const qtyByQr = new Map(releaseItems.map((i) => [i.qrCode, i.releaseQty]))
                        setQrPickerSelectedQrCodes(selected)
                        setReleaseItems(
                          qrPickerItems.map((item) => ({
                            ...item,
                            releaseQty: qtyByQr.get(item.qrCode) ?? item.releaseQty,
                          }))
                        )
                      }}
                      disabled={qrPickerLoading}
                    >
                      Select all ({qrPickerItems.length})
                    </Button>
                  </div>

                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Select</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>QR code</TableHead>
                        <TableHead className="text-right">Available</TableHead>
                        <TableHead className="w-[130px] text-right">Release qty</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {qrPickerItems.map((item) => {
                        const checked = qrPickerSelectedQrCodes.includes(item.qrCode)
                        return (
                          <TableRow key={item.stockId || item.qrCode}>
                            <TableCell>
                              <Checkbox
                                checked={checked}
                                onCheckedChange={() => toggleQrPickerSelection(item.qrCode)}
                              />
                            </TableCell>
                            <TableCell className="max-w-[240px]">
                              <p className="truncate text-sm" title={item.description}>
                                {item.description}
                              </p>
                            </TableCell>
                            <TableCell className="font-mono text-xs">{item.qrCode}</TableCell>
                            <TableCell className="text-right whitespace-nowrap">
                              {item.availableQty} {item.unit}
                            </TableCell>
                            <TableCell>
                              <Input
                                type="text"
                                inputMode="decimal"
                                className="h-8 text-right"
                                value={releaseQtyByQr.get(item.qrCode) ?? ""}
                                onChange={(e) => updateReleaseItemQtyByQr(item.qrCode, e.target.value)}
                                placeholder="0"
                                disabled={!checked}
                              />
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>

                <div className="grid gap-2">
                  <Label>Released on behalf of *</Label>
                  <Input
                    value={releaseForm.releasedOnBehalfOf}
                    onChange={(e) => setReleaseForm((f) => ({ ...f, releasedOnBehalfOf: e.target.value }))}
                    placeholder="Party / accused / representative name"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-2">
                    <Label>Deputy (approval) *</Label>
                    <Input
                      value={releaseForm.deputyName}
                      onChange={(e) => setReleaseForm((f) => ({ ...f, deputyName: e.target.value }))}
                      placeholder="Deputy name"
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
                  <Label>Release notes *</Label>
                  <Textarea
                    value={releaseForm.releaseDescription}
                    onChange={(e) =>
                      setReleaseForm((f) => ({ ...f, releaseDescription: e.target.value }))
                    }
                    placeholder="Court order, documents produced, reason for release…"
                    rows={3}
                  />
                </div>

                <div className="grid gap-2">
                  <Label>Additional remarks</Label>
                  <Input
                    value={releaseForm.remarks}
                    onChange={(e) => setReleaseForm((f) => ({ ...f, remarks: e.target.value }))}
                    placeholder="Optional internal notes"
                  />
                </div>

                {releaseSourceDeposit?.detentionMemoId?.trim() ? (
                  <div className="flex items-start gap-3 rounded-lg border bg-blue-50/50 dark:bg-muted/30 p-3">
                    <Checkbox
                      id="close-linked-memo"
                      checked={closeLinkedMemoOnRelease}
                      onCheckedChange={(v) => setCloseLinkedMemoOnRelease(v === true)}
                      className="mt-0.5"
                    />
                    <label
                      htmlFor="close-linked-memo"
                      className="text-sm leading-snug cursor-pointer"
                    >
                      When all goods are released, set linked detention memo to{" "}
                      <strong>Fully Settled</strong>.
                    </label>
                  </div>
                ) : null}
              </div>
            ) : !qrPickerLoading ? (
              <p className="text-sm text-muted-foreground border rounded-lg p-4">
                {qrPickerError ||
                  "No goods loaded yet. Scan a goods QR or memo/case QR, then press Enter or click Fetch."}
              </p>
            ) : null}

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setQrPickerOpen(false)}
                disabled={qrPickerLoading}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={() => void handleReleaseSubmit({ closeQrPicker: true })}
                disabled={
                  qrPickerLoading ||
                  releaseSaving ||
                  !releaseSourceDeposit?.detentionMemoId?.trim() ||
                  releaseItems.length === 0
                }
              >
                {releaseSaving ? "Releasing…" : "Release"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </ModulePageLayout>
  )
}
