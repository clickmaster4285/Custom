import { useEffect } from "react"
import { useParams, Link, useSearchParams } from "react-router-dom"
import { ArrowLeft, FileText, Package, QrCode, Printer, FileOutput } from "lucide-react"
import { ModulePageLayout } from "@/components/dashboard/module-page-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ROUTES } from "@/routes/config"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import DetentionMemoReport from "@/components/detention/DetentionMemoReport"
import DetentionMemoQRPrint from "@/components/detention/DetentionMemoQRPrint"

const STORAGE_KEY = "wms_detention_memo"

type GoodsLineItem = {
  id: string
  qrCodeNumber?: string
  description: string
  pctCode: string
  quantity: string
  unit: string
  condition: string
  assessableValuePkr: string
  identificationRef: string
  itemNotes: string
  perishable?: boolean
}

type DetentionMemoRow = {
  [key: string]: unknown
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
  briefFacts?: string
  forwardingOfficerRemarks?: string
  accusedName?: string
  accusedCnic?: string
  accusedAddress?: string
  goodsItems?: GoodsLineItem[]
  seizingOfficerNotes?: string
  examiningOfficerNotes?: string
  detentionNotes?: string
  createdAt: string
  updatedAt?: string
  createdBy?: string
  memoQrCodeNumber?: string
  memoQrCodePayload?: string
}

function loadById(id: string): DetentionMemoRow | null {
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

function DetailRow({ label, value }: { label: string; value: string | undefined }) {
  return (
    <div className="grid grid-cols-[180px_1fr] gap-2 py-2 border-b border-border/50 last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value ?? "—"}</span>
    </div>
  )
}

function getQrCodeUrl(data: string, size = 180) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(data)}`
}

function getGoodsQrPayload(memoId: string, item: GoodsLineItem): string {
  const ref = item.qrCodeNumber || `${memoId}-${item.id}`
  return `${window.location.origin}/detention-memo/${encodeURIComponent(memoId)}?goodsQr=${encodeURIComponent(ref)}`
}

function formatLabel(key: string): string {
  return key
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (m) => m.toUpperCase())
}

function stringifyValue(value: unknown): string {
  if (value === null || value === undefined || value === "") return "—"
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") return String(value)
  if (Array.isArray(value)) return value.length ? `${value.length} item(s)` : "—"
  if (typeof value === "object") return JSON.stringify(value)
  return "—"
}

export default function DetentionMemoDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()
  const row = id ? loadById(id) : null
  const printMode = searchParams.get("print")
  const autoPrint = searchParams.get("autoprint") === "1"
  const isPrintMode = printMode === "qr" || printMode === "full"

  useEffect(() => {
    if (isPrintMode && autoPrint && row) {
      const timer = window.setTimeout(() => window.print(), 350)
      return () => window.clearTimeout(timer)
    }
  }, [isPrintMode, autoPrint, row])

  if (!id || !row) {
    return (
      <ModulePageLayout
        title="Detention Memo Not Found"
        description="The requested record could not be found."
        breadcrumbs={[
          { label: "WMS" },
          { label: "Detentions" },
          { label: "Detention Memo", href: ROUTES.DETENTION_MEMO },
          { label: "Detail" },
        ]}
      >
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground mb-4">Record not found or has been removed.</p>
            <Button asChild variant="outline">
              <Link to={ROUTES.DETENTION_MEMO}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Detention Memo
              </Link>
            </Button>
          </CardContent>
        </Card>
      </ModulePageLayout>
    )
  }

  const qrPayload = row.memoQrCodePayload || `${window.location.origin}/detention-memo/${encodeURIComponent(row.id)}?print=full`
  const qrNumber = row.memoQrCodeNumber || `DM-${row.caseNo}`
  const excludedKeys = new Set([
    "id",
    "caseNo",
    "goodsItems",
    "owner",
    "driver",
    "memoQrCodePayload",
    "memoQrCodeNumber",
  ])
  const additionalEntries = Object.entries(row)
    .filter(([key]) => !excludedKeys.has(key))
    .map(([key, value]) => ({ label: formatLabel(key), value: stringifyValue(value) }))

  if (printMode === "qr") {
    return (
      <DetentionMemoQRPrint
        caseNo={row.caseNo}
        referenceNumber={row.referenceNumber}
        createdBy={row.createdBy || "ASO Portal"}
        createdAt={row.createdAt}
        qrPayload={qrPayload}
        qrNumber={qrNumber}
      />
    )
  }

  if (printMode === "full") {
    return (
      <DetentionMemoReport
        row={row}
        qrPayload={qrPayload}
        qrNumber={qrNumber}
      />
    )
  }

  // Normal view (screen) – includes sidebar via ModulePageLayout
  return (
    <ModulePageLayout
      title={`Detention Memo: ${row.caseNo}`}
      description="Pakistan Customs detention memo details. Data from localStorage."
      breadcrumbs={[
        { label: "WMS" },
        { label: "Detentions" },
        { label: "Detention Memo", href: ROUTES.DETENTION_MEMO },
        { label: row.caseNo },
      ]}
    >
      {/* Global print style to hide sidebar if user accidentally prints this view */}
      <style>{`
        @media print {
          aside, nav, header, .sidebar, .main-nav, .breadcrumbs {
            display: none !important;
          }
          main, .main-content, .print-keep {
            margin-left: 0 !important;
            padding: 0 !important;
            width: 100% !important;
          }
        }
      `}</style>
      <div className="grid gap-6 print-keep">
        <Card className="border-0 shadow-sm">
          <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-xl">
                <FileText className="h-5 w-5" />
                {row.caseNo}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">Detention memo details and printable report.</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={row.verificationStatus === "Verified" ? "default" : "secondary"}>
                {row.verificationStatus}
              </Badge>
              <Button variant="outline" asChild>
                <Link to={`${ROUTES.DETENTION_MEMO}/${encodeURIComponent(row.id)}?print=full`}>
                  <Printer className="h-4 w-4 mr-2" />
                  Print Report
                </Link>
              </Button>
              <Button variant="default" asChild>
                <Link to={`${ROUTES.DETENTION_MEMO}/${encodeURIComponent(row.id)}?print=full`}>
                  <FileOutput className="h-4 w-4 mr-2" />
                  Save as PDF
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-[1fr_220px]">
              <Card className="border-dashed">
                <CardContent className="pt-5">
                  <h4 className="text-sm font-semibold mb-3">Basic Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5">
                    <DetailRow label="Case No." value={row.caseNo} />
                    <DetailRow label="FIR Number" value={row.firNumber} />
                    <DetailRow label="Reference Number" value={row.referenceNumber} />
                    <DetailRow label="Date/Time of occurrence" value={row.dateTimeOccurrence} />
                    <DetailRow label="Place of occurrence" value={row.placeOfOccurrence} />
                    <DetailRow label="Date/Time of detention" value={row.dateTimeDetention} />
                    <DetailRow label="Place of detention" value={row.placeOfDetention} />
                    <DetailRow label="Detention Type" value={row.detentionType} />
                    <DetailRow label="Directorate" value={row.directorate} />
                    <DetailRow label="Reason for detention" value={row.reasonForDetention} />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-5">
                  <h4 className="text-sm font-semibold mb-3 flex items-center gap-2"><QrCode className="h-4 w-4" /> Memo QR</h4>
                  <img src={getQrCodeUrl(qrPayload, 180)} alt="Memo QR code" className="border rounded-lg p-2 bg-white mx-auto" />
                  <p className="text-xs text-muted-foreground mt-3 break-all">{qrNumber}</p>
                  <Button variant="outline" size="sm" className="w-full mt-3" asChild>
                    <Link to={`${ROUTES.DETENTION_MEMO}/${encodeURIComponent(row.id)}?print=qr`}>
                      Print QR
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader><CardTitle className="text-base">Memo Details</CardTitle></CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-5">
                <DetailRow label="Where deposited" value={row.whereDeposited} />
                <DetailRow label="Settlement Status" value={row.settlementStatus} />
                <DetailRow label="Posting Date" value={row.createdAt} />
                <DetailRow label="Updation Date" value={row.updatedAt ?? row.createdAt} />
                <DetailRow label="Created By" value={row.createdBy || "ASO Portal"} />
              </CardContent>
            </Card>

            {row.briefFacts && (
              <Card>
                <CardHeader><CardTitle className="text-base">Memo Description</CardTitle></CardHeader>
                <CardContent className="rounded-lg border p-4">
                  <p className="text-sm whitespace-pre-wrap">{row.briefFacts}</p>
                </CardContent>
              </Card>
            )}

            {row.goodsItems && row.goodsItems.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    Goods Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="rounded-lg border overflow-hidden p-0">
                  <ScrollArea className="w-full">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead> QR Code</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>PCT</TableHead>
                          <TableHead>Qty</TableHead>
                          <TableHead>Unit</TableHead>
                          <TableHead>Condition</TableHead>
                          <TableHead>Assessable</TableHead>
                          <TableHead>Perishable</TableHead>
                          <TableHead>ID / Chassis</TableHead>
                          <TableHead>Item Notes</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {row.goodsItems.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell className="font-mono text-xs">
                              <div className="space-y-1">
                                <img
                                  src={getQrCodeUrl(getGoodsQrPayload(row.id, item), 56)}
                                  alt={`Goods QR ${item.qrCodeNumber || item.id}`}
                                  className="h-14 w-14 border rounded p-1 bg-white"
                                />
                                <span className="block text-[10px] text-muted-foreground max-w-[80px] break-all">
                                  {item.qrCodeNumber || "—"}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="font-medium">{item.description || "—"}</TableCell>
                            <TableCell className="font-mono">{item.pctCode || "—"}</TableCell>
                            <TableCell>{item.quantity || "—"}</TableCell>
                            <TableCell>{item.unit || "—"}</TableCell>
                            <TableCell>{item.condition || "—"}</TableCell>
                            <TableCell>{item.assessableValuePkr || "—"}</TableCell>
                            <TableCell>{item.perishable ? "Yes" : "No"}</TableCell>
                            <TableCell>{item.identificationRef || "—"}</TableCell>
                            <TableCell className="text-muted-foreground max-w-[200px] truncate">{item.itemNotes || "—"}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}

            {(row.seizingOfficerNotes || row.examiningOfficerNotes || row.detentionNotes || row.forwardingOfficerRemarks) && (
              <Card>
                <CardHeader><CardTitle className="text-base">Additional Information</CardTitle></CardHeader>
                <CardContent className="rounded-lg border p-4 space-y-4">
                  {row.seizingOfficerNotes && (
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Seizing Officer Notes</p>
                      <p className="text-sm whitespace-pre-wrap">{row.seizingOfficerNotes}</p>
                    </div>
                  )}
                  {row.examiningOfficerNotes && (
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Examining Officer Notes</p>
                      <p className="text-sm whitespace-pre-wrap">{row.examiningOfficerNotes}</p>
                    </div>
                  )}
                  {row.detentionNotes && (
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Detention / Customs Clarification Notes</p>
                      <p className="text-sm whitespace-pre-wrap">{row.detentionNotes}</p>
                    </div>
                  )}
                  {row.forwardingOfficerRemarks && (
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Forwarding Officer Remarks</p>
                      <p className="text-sm whitespace-pre-wrap">{row.forwardingOfficerRemarks}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            <Button asChild variant="outline">
              <Link to={ROUTES.DETENTION_MEMO}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to list
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </ModulePageLayout>
  )
}