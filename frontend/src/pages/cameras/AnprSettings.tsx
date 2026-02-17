
import { Car, Settings, FileText } from "lucide-react"
import { ModulePageLayout } from "@/components/dashboard/module-page-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

export default function AnprSettingsPage() {
  return (
    <ModulePageLayout
      title="ANPR Settings"
      description="Configure Automatic Number Plate Recognition for gates and toll plazas."
      breadcrumbs={[{ label: "WMS" }, { label: "ANPR Settings" }]}
    >
      <div className="grid gap-6">
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">ANPR Cameras</CardTitle>
              <Car className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">6</div>
              <p className="text-xs text-muted-foreground mt-1">Active</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Reads Today</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">412</div>
              <p className="text-xs text-muted-foreground mt-1">Plates captured</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Match Rate</CardTitle>
              <Settings className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">96%</div>
              <p className="text-xs text-muted-foreground mt-1">Recognition accuracy</p>
            </CardContent>
          </Card>
        </div>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>ANPR Gate Configuration</CardTitle>
              <CardDescription>Cameras and rules per gate / toll plaza</CardDescription>
            </div>
            <Button className="bg-[#3b82f6] hover:bg-[#2563eb] text-white">Add Gate</Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Gate / Location</TableHead>
                  <TableHead>Camera</TableHead>
                  <TableHead>Region</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  { gate: "Main Gate - JCP", camera: "CAM-G01", region: "PK-Punjab", status: "Active" },
                  { gate: "Toll Plaza North", camera: "CAM-TP01", region: "PK-Punjab", status: "Active" },
                  { gate: "Warehouse Entry", camera: "CAM-WH-E1", region: "PK-KP", status: "Active" },
                ].map((row) => (
                  <TableRow key={row.gate}>
                    <TableCell className="font-medium">{row.gate}</TableCell>
                    <TableCell>{row.camera}</TableCell>
                    <TableCell>{row.region}</TableCell>
                    <TableCell><Badge variant="default">{row.status}</Badge></TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" className="text-[#3b82f6]">Edit</Button>
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
