
import { ClipboardList, Plus } from "lucide-react"
import { ModulePageLayout } from "@/components/dashboard/module-page-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

export default function NewSeizureEntryPage() {
  return (
    <ModulePageLayout
      title="New Seizure Entry"
      description="Record new seizure cases and related details."
      breadcrumbs={[{ label: "WMS" }, { label: "New Seizure Entry" }]}
    >
      <div className="grid gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Create Seizure Entry</CardTitle>
              <CardDescription>Enter seizure details and attach supporting documents</CardDescription>
            </div>
            <Button className="bg-[#3b82f6] hover:bg-[#2563eb] text-white">
              <Plus className="h-4 w-4 mr-2" /> New Entry
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Seizure Reference</label>
                <Input placeholder="Auto-generated or enter reference" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Date & Time</label>
                <Input type="datetime-local" />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <label className="text-sm font-medium">Description</label>
                <Input placeholder="Brief description of seizure" />
              </div>
            </div>
            <Button className="mt-4 bg-[#3b82f6] hover:bg-[#2563eb] text-white">Save Entry</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Recent Seizure Entries</CardTitle>
            <CardDescription>Latest seizure records</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reference</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  { ref: "SZ-2024-0841", date: "2024-02-04", location: "Karachi Port", status: "Registered" },
                  { ref: "SZ-2024-0840", date: "2024-02-03", location: "Lahore", status: "Under Review" },
                ].map((row) => (
                  <TableRow key={row.ref}>
                    <TableCell className="font-medium">{row.ref}</TableCell>
                    <TableCell>{row.date}</TableCell>
                    <TableCell>{row.location}</TableCell>
                    <TableCell><Badge variant="outline">{row.status}</Badge></TableCell>
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
