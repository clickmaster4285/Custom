
import { FileText, Download, Calendar, Filter } from "lucide-react"
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

export default function ReportsPage() {
  return (
    <ModulePageLayout
      title="Reports"
      description="Generate and download standard and custom reports across modules."
      breadcrumbs={[{ label: "AI Analytics" }, { label: "Reports" }]}
    >
      <div className="grid gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Report Library</CardTitle>
              <CardDescription>Pre-built and scheduled reports</CardDescription>
            </div>
            <div className="flex gap-2">
              <Input placeholder="Search reports..." className="w-64" />
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
              <Button className="bg-[#3b82f6] hover:bg-[#2563eb] text-white">
                <FileText className="h-4 w-4 mr-2" />
                New Report
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Report Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Last Run</TableHead>
                  <TableHead>Schedule</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  { name: "Visitor Summary (Daily)", category: "VMS", lastRun: "Today, 06:00", schedule: "Daily" },
                  { name: "Inventory Valuation", category: "WMS", lastRun: "Yesterday", schedule: "Weekly" },
                  { name: "Stock Movement Log", category: "WMS", lastRun: "Today, 00:00", schedule: "Daily" },
                  { name: "HR Attendance Summary", category: "HR", lastRun: "Mon, 08:00", schedule: "Weekly" },
                  { name: "Customs Clearance Summary", category: "Customs", lastRun: "Yesterday", schedule: "On-demand" },
                ].map((row) => (
                  <TableRow key={row.name}>
                    <TableCell className="font-medium">{row.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{row.category}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{row.lastRun}</TableCell>
                    <TableCell>{row.schedule}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" className="text-[#3b82f6]">
                        <Download className="h-4 w-4 mr-1" />
                        Download
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
