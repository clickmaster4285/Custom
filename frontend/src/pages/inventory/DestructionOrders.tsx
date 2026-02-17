
import { Trash2, Plus } from "lucide-react"
import { ModulePageLayout } from "@/components/dashboard/module-page-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

export default function DestructionOrdersPage() {
  return (
    <ModulePageLayout
      title="Destruction Orders"
      description="Create and track destruction orders for perishable/expired items."
      breadcrumbs={[{ label: "WMS" }, { label: "Destruction Orders" }]}
    >
      <div className="grid gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Destruction Orders</CardTitle>
              <CardDescription>Orders for disposal/destruction of items</CardDescription>
            </div>
            <Button className="bg-[#3b82f6] hover:bg-[#2563eb] text-white">
              <Plus className="h-4 w-4 mr-2" /> New Destruction Order
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  { id: "DO-2024-0841", items: 3, date: "2024-02-04", status: "Pending" },
                  { id: "DO-2024-0840", items: 2, date: "2024-02-03", status: "Completed" },
                ].map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-medium">{row.id}</TableCell>
                    <TableCell>{row.items}</TableCell>
                    <TableCell>{row.date}</TableCell>
                    <TableCell><Badge variant={row.status === "Completed" ? "default" : "secondary"}>{row.status}</Badge></TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" className="text-[#3b82f6]">View</Button>
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
