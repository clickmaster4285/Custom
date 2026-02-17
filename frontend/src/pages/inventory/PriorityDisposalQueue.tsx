
import { ListOrdered, Plus } from "lucide-react"
import { ModulePageLayout } from "@/components/dashboard/module-page-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

export default function PriorityDisposalQueuePage() {
  return (
    <ModulePageLayout
      title="Priority Disposal Queue"
      description="Queue of items prioritized for disposal."
      breadcrumbs={[{ label: "WMS" }, { label: "Priority Disposal Queue" }]}
    >
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Disposal Queue</CardTitle>
            <CardDescription>Items ordered by priority for disposal</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Priority</TableHead>
                  <TableHead>Item ID</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Expiry</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  { priority: 1, id: "PR-7822", desc: "Pharma - Temp control", expiry: "2024-02-05", status: "Queued" },
                  { priority: 2, id: "PR-7821", desc: "Food items - Lot A", expiry: "2024-02-10", status: "Queued" },
                ].map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-medium">{row.priority}</TableCell>
                    <TableCell>{row.id}</TableCell>
                    <TableCell>{row.desc}</TableCell>
                    <TableCell>{row.expiry}</TableCell>
                    <TableCell><Badge variant="secondary">{row.status}</Badge></TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" className="text-[#3b82f6]">Process</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Button className="mt-4 bg-[#3b82f6] hover:bg-[#2563eb] text-white">
              <Plus className="h-4 w-4 mr-2" /> Create Destruction Order
            </Button>
          </CardContent>
        </Card>
      </div>
    </ModulePageLayout>
  )
}
