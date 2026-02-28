import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { DoorOpen, Plus, Trash2 } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

type GateEntry = {
  id: string
  gateId: string
  gateName: string
  zone: string
  status: "active" | "inactive" | "maintenance"
  lastSync?: string
}

const STORAGE_KEY = "vms-gate-integration"

function loadGates(): GateEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function saveGates(list: GateEntry[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
}

export default function GateIntegration() {
  const { toast } = useToast()
  const [gates, setGates] = useState<GateEntry[]>(loadGates)
  const [gateId, setGateId] = useState("")
  const [gateName, setGateName] = useState("")
  const [zone, setZone] = useState("main-gate")
  const [status, setStatus] = useState<GateEntry["status"]>("active")
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const addGate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!gateId.trim() || !gateName.trim()) {
      toast({ title: "Gate ID and name required", variant: "destructive" })
      return
    }
    const newEntry: GateEntry = {
      id: crypto.randomUUID(),
      gateId: gateId.trim(),
      gateName: gateName.trim(),
      zone,
      status,
      lastSync: new Date().toISOString(),
    }
    const next = [newEntry, ...gates]
    setGates(next)
    saveGates(next)
    setGateId("")
    setGateName("")
    toast({ title: "Gate added" })
  }

  const updateGateStatus = (id: string, newStatus: GateEntry["status"]) => {
    const next = gates.map((g) => (g.id === id ? { ...g, status: newStatus } : g))
    setGates(next)
    saveGates(next)
    toast({ title: "Gate status updated" })
  }

  const removeGate = (id: string) => {
    const next = gates.filter((g) => g.id !== id)
    setGates(next)
    saveGates(next)
    setDeleteId(null)
    toast({ title: "Gate removed", variant: "destructive" })
  }

  function formatDate(iso: string | undefined) {
    if (!iso) return "—"
    try {
      return new Date(iso).toLocaleString(undefined, { dateStyle: "short", timeStyle: "short" })
    } catch {
      return iso
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#3b82f6]/10 text-[#3b82f6]">
          <DoorOpen className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-foreground">Gate Integration</h1>
          <p className="text-sm text-muted-foreground">
            Integrate and manage gate access systems. Add gates and set their status.
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="font-medium text-foreground mb-4">Add gate</h2>
        <form onSubmit={addGate} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="gi-id">Gate ID</Label>
              <Input id="gi-id" value={gateId} onChange={(e) => setGateId(e.target.value)} placeholder="e.g. gate-1" className="mt-1" />
            </div>
            <div>
              <Label htmlFor="gi-name">Gate name</Label>
              <Input id="gi-name" value={gateName} onChange={(e) => setGateName(e.target.value)} placeholder="e.g. Main entrance" className="mt-1" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Zone</Label>
              <Select value={zone} onValueChange={setZone}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="main-gate">main-gate</SelectItem>
                  <SelectItem value="zone-a">zone-a</SelectItem>
                  <SelectItem value="zone-b">zone-b</SelectItem>
                  <SelectItem value="zone-c">zone-c</SelectItem>
                  <SelectItem value="vip-gate">vip-gate</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as GateEntry["status"])}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button type="submit">
            <Plus className="h-4 w-4 mr-2" />
            Add gate
          </Button>
        </form>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="px-4 py-3 border-b border-border font-medium text-foreground">
          Gates ({gates.length})
        </div>
        {gates.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground text-sm">No gates configured. Add one above.</div>
        ) : (
          <ul className="divide-y divide-border">
            {gates.map((g) => (
              <li key={g.id} className="p-4 flex items-center justify-between gap-4">
                <div>
                  <p className="font-medium text-foreground">{g.gateName} <span className="text-muted-foreground font-normal">({g.gateId})</span></p>
                  <p className="text-sm text-muted-foreground">Zone: {g.zone} · Last sync: {formatDate(g.lastSync)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Select value={g.status} onValueChange={(v) => updateGateStatus(g.id, v as GateEntry["status"])}>
                    <SelectTrigger className="w-[130px] h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button size="sm" variant="destructive" onClick={() => setDeleteId(g.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <AlertDialog open={deleteId != null} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove gate</AlertDialogTitle>
            <AlertDialogDescription>This gate will be removed from the integration list. Continue?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteId && removeGate(deleteId)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
