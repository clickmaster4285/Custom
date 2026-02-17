
import { Calendar, AlertTriangle } from "lucide-react"
import { ModulePageLayout } from "@/components/dashboard/module-page-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

export default function ExpiryTrackingPage() {
  return (
    <ModulePageLayout
      title="Expiry Tracking"
      description="Track expiry dates and alerts for perishable items."
      breadcrumbs={[{ label: "WMS" }, { label: "Expiry Tracking" }]}
    >
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Expiry Alerts</CardTitle>
            <CardDescription>Items expiring within 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item ID</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Expiry Date</TableHead>
                  <TableHead>Days Left</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  { id: "PR-7822", desc: "Pharma - Temp control", expiry: "2024-02-05", days: 1, priority: "High" },
                  { id: "PR-7821", desc: "Food items - Lot A", expiry: "2024-02-10", days: 6, priority: "Medium" },
                ].map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-medium">{row.id}</TableCell>
                    <TableCell>{row.desc}</TableCell>
                    <TableCell>{row.expiry}</TableCell>
                    <TableCell>{row.days} days</TableCell>
                    <TableCell><Badge variant={row.priority === "High" ? "destructive" : "secondary"}>{row.priority}</Badge></TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" className="text-[#3b82f6]">Dispose</Button>
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
