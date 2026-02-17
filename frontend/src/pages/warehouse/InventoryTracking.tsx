
import { Package, TrendingUp, AlertTriangle, RotateCcw } from "lucide-react"
import { ModulePageLayout } from "@/components/dashboard/module-page-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

export default function InventoryTrackingPage() {
  return (
    <ModulePageLayout
      title="Inventory Tracking"
      description="Real-time visibility of stock levels, movements, and locations across warehouses."
      breadcrumbs={[{ label: "WMS" }, { label: "Inventory Tracking" }]}
    >
      <div className="grid gap-6">
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total SKUs
              </CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2,847</div>
              <p className="text-xs text-muted-foreground mt-1">Active products</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Units
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">156,420</div>
              <p className="text-xs text-muted-foreground mt-1">In stock</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Low Stock
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">42</div>
              <p className="text-xs text-muted-foreground mt-1">Below reorder point</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Movements Today
              </CardTitle>
              <RotateCcw className="h-4 w-4 text-[#3b82f6]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">384</div>
              <p className="text-xs text-muted-foreground mt-1">In / Out / Transfer</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Inventory by Location</CardTitle>
              <CardDescription>Current stock levels per warehouse and zone</CardDescription>
            </div>
            <div className="flex gap-2">
              <Input placeholder="Search SKU or product..." className="w-64" />
              <Button variant="outline">Export</Button>
              <Button className="bg-[#3b82f6] hover:bg-[#2563eb] text-white">
                Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>SKU</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Warehouse</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  { sku: "SKU-7821", product: "Electronics - Category A", wh: "WH-001", loc: "Z-C03-A-12-04", qty: 450, status: "In Stock" },
                  { sku: "SKU-9103", product: "Textiles - Bulk", wh: "WH-001", loc: "Z-B02-B-08-01", qty: 1200, status: "In Stock" },
                  { sku: "SKU-4452", product: "Pharma - Temp Control", wh: "WH-005", loc: "Z-CLD-01-02", qty: 85, status: "Low Stock" },
                  { sku: "SKU-2298", product: "General Merchandise", wh: "WH-002", loc: "Z-A01-N-05-03", qty: 320, status: "In Stock" },
                  { sku: "SKU-6671", product: "Automotive Parts", wh: "WH-001", loc: "Z-B02-C-15-02", qty: 12, status: "Reorder" },
                ].map((row) => (
                  <TableRow key={row.sku}>
                    <TableCell className="font-medium">{row.sku}</TableCell>
                    <TableCell>{row.product}</TableCell>
                    <TableCell>{row.wh}</TableCell>
                    <TableCell className="font-mono text-xs">{row.loc}</TableCell>
                    <TableCell>{row.qty}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          row.status === "In Stock"
                            ? "default"
                            : row.status === "Low Stock"
                              ? "secondary"
                              : "destructive"
                        }
                      >
                        {row.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </ModulePageLayout>
  )
}
