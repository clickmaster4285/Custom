
import { MapPin, Truck } from "lucide-react"
import { ModulePageLayout } from "@/components/dashboard/module-page-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

export default function TransferTrackingPage() {
  return (
    <ModulePageLayout
      title="Transfer Tracking"
      description="Track status and location of transfers."
      breadcrumbs={[{ label: "WMS" }, { label: "Transfer Tracking" }]}
    >
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Active Transfers</CardTitle>
            <CardDescription>Track transfer status in real time</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ref</TableHead>
                  <TableHead>From</TableHead>
                  <TableHead>To</TableHead>
                  <TableHead>Current Status</TableHead>
                  <TableHead>ETA</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  { ref: "TR-2024-0841", from: "Karachi", to: "Lahore", status: "In Transit", eta: "2024-02-06" },
                  { ref: "TR-2024-0840", from: "Islamabad", to: "Karachi", status: "Received", eta: "—" },
                ].map((row) => (
                  <TableRow key={row.ref}>
                    <TableCell className="font-medium">{row.ref}</TableCell>
                    <TableCell>{row.from}</TableCell>
                    <TableCell>{row.to}</TableCell>
                    <TableCell><Badge variant="outline">{row.status}</Badge></TableCell>
                    <TableCell>{row.eta}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" className="text-[#3b82f6]">Track</Button>
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
