
import { FileText, Upload } from "lucide-react"
import { ModulePageLayout } from "@/components/dashboard/module-page-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

export default function LegalDocumentsPage() {
  return (
    <ModulePageLayout
      title="Legal Documents"
      description="Manage legal documents and case attachments."
      breadcrumbs={[{ label: "WMS" }, { label: "Legal Documents" }]}
    >
      <div className="grid gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Legal Documents</CardTitle>
              <CardDescription>Upload and manage case-related documents</CardDescription>
            </div>
            <Button className="bg-[#3b82f6] hover:bg-[#2563eb] text-white">
              <Upload className="h-4 w-4 mr-2" /> Upload
            </Button>
          </CardHeader>
          <CardContent>
            <Input placeholder="Search documents..." className="mb-4 w-64" />
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Document</TableHead>
                  <TableHead>Case ID</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Uploaded</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  { name: "Order-0841.pdf", caseId: "CF-2024-0841", type: "Court Order", uploaded: "2024-02-04" },
                  { name: "Evidence-0840.pdf", caseId: "CF-2024-0840", type: "Evidence", uploaded: "2024-02-03" },
                ].map((row) => (
                  <TableRow key={row.name}>
                    <TableCell className="font-medium">{row.name}</TableCell>
                    <TableCell>{row.caseId}</TableCell>
                    <TableCell><Badge variant="outline">{row.type}</Badge></TableCell>
                    <TableCell>{row.uploaded}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" className="text-[#3b82f6]">Download</Button>
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
