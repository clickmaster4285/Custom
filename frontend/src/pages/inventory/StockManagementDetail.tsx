import { useParams, Link } from "react-router-dom"
import { ArrowLeft, Layers } from "lucide-react"
import { ModulePageLayout } from "@/components/dashboard/module-page-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ROUTES } from "@/routes/config"

const STORAGE_KEY = "wms_stock_management"

type StockRow = {
  id: string
  seizureCaseRef: string
  pctCode: string
  descriptionOfGoods: string
  customsStation: string
  godownWarehouse: string
  quantity: string
  unitOfMeasure: string
  condition: string
  custody: string
  custodianOfficerName: string
  status: string
}

function loadById(id: string): StockRow | null {
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

function DetailRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="grid grid-cols-[180px_1fr] gap-2 py-2 border-b border-border/50 last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value ?? "—"}</span>
    </div>
  )
}

export default function StockManagementDetailPage() {
  const { id } = useParams<{ id: string }>()
  const row = id ? loadById(id) : null

  if (!id || !row) {
    return (
      <ModulePageLayout
        title="Stock Lot Not Found"
        description="The requested record could not be found."
        breadcrumbs={[{ label: "WMS" }, { label: "Inventory Management" }, { label: "Stock Management", href: ROUTES.STOCK_MANAGEMENT }, { label: "Detail" }]}
      >
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground mb-4">Record not found or has been removed.</p>
            <Button asChild variant="outline">
              <Link to={ROUTES.STOCK_MANAGEMENT}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Stock Management
              </Link>
            </Button>
          </CardContent>
        </Card>
      </ModulePageLayout>
    )
  }

  return (
    <ModulePageLayout
      title={`Stock: ${row.seizureCaseRef}`}
      description="Pakistan Customs seized/detained stock details. Data from localStorage."
      breadcrumbs={[
        { label: "WMS" },
        { label: "Inventory Management" },
        { label: "Stock Management", href: ROUTES.STOCK_MANAGEMENT },
        { label: row.seizureCaseRef },
      ]}
    >
      <div className="space-y-4">
        <Button asChild variant="outline" size="sm">
          <Link to={ROUTES.STOCK_MANAGEMENT}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to list
          </Link>
        </Button>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Layers className="h-5 w-5" />
              {row.seizureCaseRef}
            </CardTitle>
            <Badge variant={row.status === "In Custody" ? "default" : "secondary"}>{row.status}</Badge>
          </CardHeader>
          <CardContent className="grid gap-1">
            <DetailRow label="Seizure/Case Ref" value={row.seizureCaseRef} />
            <DetailRow label="PCT Code" value={row.pctCode} />
            <DetailRow label="Description of Goods" value={row.descriptionOfGoods} />
            <DetailRow label="Customs Station" value={row.customsStation} />
            <DetailRow label="Godown/Warehouse" value={row.godownWarehouse} />
            <DetailRow label="Quantity" value={row.quantity} />
            <DetailRow label="Unit of Measure" value={row.unitOfMeasure} />
            <DetailRow label="Condition" value={row.condition} />
            <DetailRow label="Custody" value={row.custody} />
            <DetailRow label="Custodian Officer" value={row.custodianOfficerName} />
          </CardContent>
        </Card>
      </div>
    </ModulePageLayout>
  )
}
