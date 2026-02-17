
import { Package, CheckCircle, Clock, AlertCircle } from "lucide-react"
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

export default function StorageAllocationPage() {
  return (
    <ModulePageLayout
      title="Storage Allocation"
      description="Allocate and reserve storage locations for incoming and existing inventory."
      breadcrumbs={[{ label: "WMS" }, { label: "Storage Allocation" }]}
    >
      <div className="grid gap-6">
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Allocated
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3,480</div>
              <p className="text-xs text-muted-foreground mt-1">Locations in use</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pending
              </CardTitle>
              <Clock className="h-4 w-4 text-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">124</div>
              <p className="text-xs text-muted-foreground mt-1">Awaiting allocation</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Reserved
              </CardTitle>
              <Package className="h-4 w-4 text-[#3b82f6]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">89</div>
              <p className="text-xs text-muted-foreground mt-1">Reserved for inbound</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Overflows
              </CardTitle>
              <AlertCircle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-muted-foreground mt-1">Requires attention</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Allocation Queue</CardTitle>
              <CardDescription>Items pending storage allocation</CardDescription>
            </div>
            <div className="flex gap-2">
              <Input placeholder="Search by SKU or PO..." className="w-64" />
              <Button className="bg-[#3b82f6] hover:bg-[#2563eb] text-white">
                Auto-allocate
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reference</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Warehouse</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  { ref: "ALC-2024-0841", sku: "SKU-7821", product: "Electronics - Category A", qty: 120, wh: "WH-001", priority: "High" },
                  { ref: "ALC-2024-0842", sku: "SKU-9103", product: "Textiles - Bulk", qty: 500, wh: "WH-001", priority: "Normal" },
                  { ref: "ALC-2024-0843", sku: "SKU-4452", product: "Pharma - Temp Control", qty: 80, wh: "WH-005", priority: "High" },
                  { ref: "ALC-2024-0844", sku: "SKU-2298", product: "General Merchandise", qty: 200, wh: "WH-002", priority: "Normal" },
                ].map((row) => (
                  <TableRow key={row.ref}>
                    <TableCell className="font-medium">{row.ref}</TableCell>
                    <TableCell>{row.sku}</TableCell>
                    <TableCell>{row.product}</TableCell>
                    <TableCell>{row.qty}</TableCell>
                    <TableCell>{row.wh}</TableCell>
                    <TableCell>
                      <Badge variant={row.priority === "High" ? "destructive" : "secondary"}>
                        {row.priority}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" className="text-[#3b82f6]">
                        Allocate
                      </Button>
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
