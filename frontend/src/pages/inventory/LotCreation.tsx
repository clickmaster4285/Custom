
import { Package, Plus } from "lucide-react"
import { ModulePageLayout } from "@/components/dashboard/module-page-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

export default function LotCreationPage() {
  return (
    <ModulePageLayout
      title="Lot Creation"
      description="Create and manage auction lots."
      breadcrumbs={[{ label: "WMS" }, { label: "Lot Creation" }]}
    >
      <div className="grid gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Auction Lots</CardTitle>
              <CardDescription>Create and manage lots for auction</CardDescription>
            </div>
            <Button className="bg-[#3b82f6] hover:bg-[#2563eb] text-white">
              <Plus className="h-4 w-4 mr-2" /> Create Lot
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Lot No</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Reserve Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  { no: "LOT-2024-0841", desc: "Electronics - Category A", reserve: "PKR 50,000", status: "Draft" },
                  { no: "LOT-2024-0840", desc: "Textiles - Bulk", reserve: "PKR 120,000", status: "Published" },
                ].map((row) => (
                  <TableRow key={row.no}>
                    <TableCell className="font-medium">{row.no}</TableCell>
                    <TableCell>{row.desc}</TableCell>
                    <TableCell>{row.reserve}</TableCell>
                    <TableCell><Badge variant="outline">{row.status}</Badge></TableCell>
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
