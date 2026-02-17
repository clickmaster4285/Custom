
import { MapPin, Layers, Box, Plus } from "lucide-react"
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

export default function ZoneLocationManagementPage() {
  return (
    <ModulePageLayout
      title="Zone & Location Management"
      description="Define zones, aisles, racks, and bin locations for efficient storage."
      breadcrumbs={[{ label: "WMS" }, { label: "Zone & Location Management" }]}
    >
      <div className="grid gap-6">
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Zones
              </CardTitle>
              <Layers className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24</div>
              <p className="text-xs text-muted-foreground mt-1">Defined zones</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Locations
              </CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">4,820</div>
              <p className="text-xs text-muted-foreground mt-1">Total bins</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Available
              </CardTitle>
              <Box className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,340</div>
              <p className="text-xs text-muted-foreground mt-1">Empty locations</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Zone & Location Hierarchy</CardTitle>
              <CardDescription>Warehouse → Zone → Aisle → Rack → Level → Bin</CardDescription>
            </div>
            <Button className="bg-[#3b82f6] hover:bg-[#2563eb] text-white">
              <Plus className="h-4 w-4 mr-2" />
              Add Zone
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Zone Code</TableHead>
                  <TableHead>Zone Name</TableHead>
                  <TableHead>Warehouse</TableHead>
                  <TableHead>Locations</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  { code: "Z-A01", name: "Receiving Zone", warehouse: "WH-001", locations: 320, type: "Receiving" },
                  { code: "Z-B02", name: "Bulk Storage", warehouse: "WH-001", locations: 850, type: "Bulk" },
                  { code: "Z-C03", name: "Picking Zone", warehouse: "WH-001", locations: 420, type: "Picking" },
                  { code: "Z-D04", name: "Shipping Zone", warehouse: "WH-001", locations: 180, type: "Shipping" },
                  { code: "Z-A01-N", name: "North Receiving", warehouse: "WH-002", locations: 250, type: "Receiving" },
                ].map((row) => (
                  <TableRow key={row.code}>
                    <TableCell className="font-medium">{row.code}</TableCell>
                    <TableCell>{row.name}</TableCell>
                    <TableCell>{row.warehouse}</TableCell>
                    <TableCell>{row.locations}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{row.type}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" className="text-[#3b82f6]">
                        Manage
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
