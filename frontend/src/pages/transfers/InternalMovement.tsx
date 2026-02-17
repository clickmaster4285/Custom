
import { Move } from "lucide-react"
import { ModulePageLayout } from "@/components/dashboard/module-page-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

export default function InternalMovementPage() {
  return (
    <ModulePageLayout
      title="Internal Movement"
      description="Track internal movement of goods within warehouse/location."
      breadcrumbs={[{ label: "WMS" }, { label: "Internal Movement" }]}
    >
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Internal Movements</CardTitle>
            <CardDescription>Movement log within premises</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ref</TableHead>
                  <TableHead>From Zone</TableHead>
                  <TableHead>To Zone</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  { ref: "IM-2024-0841", from: "Z-A01", to: "Z-B02", date: "2024-02-04", status: "Completed" },
                ].map((row) => (
                  <TableRow key={row.ref}>
                    <TableCell className="font-medium">{row.ref}</TableCell>
                    <TableCell>{row.from}</TableCell>
                    <TableCell>{row.to}</TableCell>
                    <TableCell>{row.date}</TableCell>
                    <TableCell><Badge variant="default">{row.status}</Badge></TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" className="text-[#3b82f6]">View</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Button className="mt-4 bg-[#3b82f6] hover:bg-[#2563eb] text-white">Record Movement</Button>
          </CardContent>
        </Card>
      </div>
    </ModulePageLayout>
  )
}
