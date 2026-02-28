import { useEffect, useState } from "react"
import { ArrowRightLeft, Building2, Clock } from "lucide-react"
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

const STORAGE_KEY = "wms_inter_collectorate_transfer"

type TransferRow = { ref: string; from: string; to: string; status: string }

const defaultRows: TransferRow[] = [
  { ref: "TR-2024-0841", from: "Karachi", to: "Lahore", status: "Pending" },
  { ref: "TR-2024-0840", from: "Peshawar", to: "Karachi", status: "In Transit" },
]

function loadRows(): TransferRow[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as TransferRow[]
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch {}
  return defaultRows
}

function saveRows(rows: TransferRow[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(rows))
}

const LOCATIONS = ["Karachi", "Lahore", "Islamabad", "Rawalpindi","Peshawar", "Faisalabad", "Multan"]
const STATUSES = ["Pending", "In Transit", "Completed"]

export default function InterCollectorateTransferPage() {
  const [rows, setRows] = useState<TransferRow[]>([])
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ from: "Karachi", to: "Lahore", status: "Pending" })

  useEffect(() => {
    setRows(loadRows())
  }, [])

  useEffect(() => {
    if (rows.length > 0) saveRows(rows)
  }, [rows])

  const openAddForm = () => {
    setForm({ from: "Karachi", to: "Lahore", status: "Pending" })
    setOpen(true)
  }

  const onSave = () => {
    const ref = `TR-2024-${String(Date.now()).slice(-4)}`
    setRows((prev) => [{ ref, ...form }, ...prev])
    setForm({ from: "Karachi", to: "Lahore", status: "Pending" })
    setOpen(false)
  }

  const pending = rows.filter((r) => r.status === "Pending").length
  const inTransit = rows.filter((r) => r.status === "In Transit").length
  const completed = rows.filter((r) => r.status === "Completed").length

  return (
    <ModulePageLayout
      title="Inter-Collectorate Transfer"
      description="Manage transfers between collectorates."
      breadcrumbs={[{ label: "WMS" }, { label: "Inter-Collectorate Transfer" }]}
    >
      <div className="grid gap-6">
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending Transfers</CardTitle>
              <Clock className="h-4 w-4 text-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pending}</div>
              <p className="text-xs text-muted-foreground mt-1">Awaiting approval</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">In Transit</CardTitle>
              <ArrowRightLeft className="h-4 w-4 text-[#3b82f6]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{inTransit}</div>
              <p className="text-xs text-muted-foreground mt-1">Active</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Completed (Month)</CardTitle>
              <Building2 className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completed}</div>
              <p className="text-xs text-muted-foreground mt-1">This month</p>
            </CardContent>
          </Card>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Transfer Requests</CardTitle>
            <CardDescription>Inter-collectorate transfer register</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ref</TableHead>
                  <TableHead>From</TableHead>
                  <TableHead>To</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.ref}>
                    <TableCell className="font-medium">{row.ref}</TableCell>
                    <TableCell>{row.from}</TableCell>
                    <TableCell>{row.to}</TableCell>
                    <TableCell><Badge variant="outline">{row.status}</Badge></TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" className="text-[#3b82f6]">View</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Button className="mt-4 bg-[#3b82f6] hover:bg-[#2563eb] text-white" onClick={openAddForm}>
              New Transfer Request
            </Button>
          </CardContent>
        </Card>
      </div>

      <Dialog open={open} onOpenChange={(isOpen) => { setOpen(isOpen); if (!isOpen) setForm({ from: "Karachi", to: "Lahore", status: "Pending" }) }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>New Transfer Request</DialogTitle>
            <p className="text-sm text-muted-foreground">Ref will be auto-generated. Data saved locally.</p>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>From</Label>
              <Select value={form.from} onValueChange={(v) => setForm((p) => ({ ...p, from: v }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LOCATIONS.map((l) => (
                    <SelectItem key={l} value={l}>{l}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>To</Label>
              <Select value={form.to} onValueChange={(v) => setForm((p) => ({ ...p, to: v }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LOCATIONS.map((l) => (
                    <SelectItem key={l} value={l}>{l}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm((p) => ({ ...p, status: v }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
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
