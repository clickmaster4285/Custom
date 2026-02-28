import { useEffect, useState } from "react"
import { FileText, Upload } from "lucide-react"
import { ModulePageLayout } from "@/components/dashboard/module-page-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const STORAGE_KEY = "wms_legal_documents"

type DocRow = { name: string; caseId: string; type: string; uploaded: string }

const defaultRows: DocRow[] = [
  { name: "Order-0841.pdf", caseId: "CF-2024-0841", type: "Court Order", uploaded: "2024-02-04" },
  { name: "Evidence-0840.pdf", caseId: "CF-2024-0840", type: "Evidence", uploaded: "2024-02-03" },
]

function loadRows(): DocRow[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as DocRow[]
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch {}
  return defaultRows
}

function saveRows(rows: DocRow[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(rows))
}

const DOC_TYPES = ["Court Order", "Evidence", "FIR", "Memo", "Other"]

export default function LegalDocumentsPage() {
  const [rows, setRows] = useState<DocRow[]>([])
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ name: "", caseId: "", type: "Court Order" })
  const [search, setSearch] = useState("")

  useEffect(() => {
    setRows(loadRows())
  }, [])

  useEffect(() => {
    if (rows.length > 0) saveRows(rows)
  }, [rows])

  const openAddForm = () => {
    setForm({ name: "", caseId: "", type: "Court Order" })
    setOpen(true)
  }

  const onSave = () => {
    if (!form.name.trim() || !form.caseId.trim()) return
    const uploaded = new Date().toISOString().slice(0, 10)
    setRows((prev) => [{ ...form, name: form.name.trim(), caseId: form.caseId.trim(), uploaded }, ...prev])
    setForm({ name: "", caseId: "", type: "Court Order" })
    setOpen(false)
  }

  const filtered = rows.filter(
    (r) =>
      !search.trim() ||
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.caseId.toLowerCase().includes(search.toLowerCase())
  )

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
            <Button className="bg-[#3b82f6] hover:bg-[#2563eb] text-white" onClick={openAddForm}>
              <Upload className="h-4 w-4 mr-2" /> Add / Upload
            </Button>
          </CardHeader>
          <CardContent>
            <Input
              placeholder="Search documents..."
              className="mb-4 w-64"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
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
                {filtered.map((row) => (
                  <TableRow key={`${row.name}-${row.caseId}-${row.uploaded}`}>
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

      <Dialog open={open} onOpenChange={(isOpen) => { setOpen(isOpen); if (!isOpen) setForm({ name: "", caseId: "", type: "Court Order" }) }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Document</DialogTitle>
            <p className="text-sm text-muted-foreground">Add a legal document entry (dummy data saved locally).</p>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Document name *</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                placeholder="e.g. Order-0841.pdf"
              />
            </div>
            <div className="space-y-2">
              <Label>Case ID *</Label>
              <Input
                value={form.caseId}
                onChange={(e) => setForm((p) => ({ ...p, caseId: e.target.value }))}
                placeholder="e.g. CF-2024-0841"
              />
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={form.type} onValueChange={(v) => setForm((p) => ({ ...p, type: v }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DOC_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={onSave}>Save</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </ModulePageLayout>
  )
}
