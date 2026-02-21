import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { UserCog, Plus, Trash2 } from "lucide-react"
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

type EscortRule = {
  id: string
  zoneId: string
  visitType: string
  required: boolean
  notes: string
}

const STORAGE_KEY = "vms-escort-requirement"

function loadRules(): EscortRule[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function saveRules(list: EscortRule[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
}

export default function EscortRequirement() {
  const { toast } = useToast()
  const [rules, setRules] = useState<EscortRule[]>(loadRules)
  const [zoneId, setZoneId] = useState("zone-a")
  const [visitType, setVisitType] = useState("Contractor")
  const [required, setRequired] = useState(true)
  const [notes, setNotes] = useState("")
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const addRule = (e: React.FormEvent) => {
    e.preventDefault()
    const newEntry: EscortRule = {
      id: crypto.randomUUID(),
      zoneId,
      visitType: visitType.trim() || "All",
      required,
      notes: notes.trim() || "—",
    }
    const next = [newEntry, ...rules]
    setRules(next)
    saveRules(next)
    setNotes("")
    toast({ title: "Escort rule added" })
  }

  const removeRule = (id: string) => {
    const next = rules.filter((r) => r.id !== id)
    setRules(next)
    saveRules(next)
    setDeleteId(null)
    toast({ title: "Rule removed", variant: "destructive" })
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#3b82f6]/10 text-[#3b82f6]">
          <UserCog className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-foreground">Escort Requirement</h1>
          <p className="text-sm text-muted-foreground">
            Configure escort requirements by zone and visit type. Define when visitors must be escorted.
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="font-medium text-foreground mb-4">Add escort rule</h2>
        <form onSubmit={addRule} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Zone</Label>
              <Select value={zoneId} onValueChange={setZoneId}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="zone-a">zone-a</SelectItem>
                  <SelectItem value="zone-b">zone-b</SelectItem>
                  <SelectItem value="zone-c">zone-c</SelectItem>
                  <SelectItem value="main-gate">main-gate</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Visit type</Label>
              <Select value={visitType} onValueChange={setVisitType}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All</SelectItem>
                  <SelectItem value="Pre-registered">Pre-registered</SelectItem>
                  <SelectItem value="Walk-in">Walk-in</SelectItem>
                  <SelectItem value="Contractor">Contractor</SelectItem>
                  <SelectItem value="VIP">VIP</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={required}
                onChange={(e) => setRequired(e.target.checked)}
                className="rounded border-input"
              />
              Escort required
            </Label>
          </div>
          <div>
            <Label htmlFor="er-notes">Notes (optional)</Label>
            <Input id="er-notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="e.g. Mandatory for contractors in zone-b" className="mt-1" />
          </div>
          <Button type="submit">
            <Plus className="h-4 w-4 mr-2" />
            Add rule
          </Button>
        </form>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="px-4 py-3 border-b border-border font-medium text-foreground">
          Escort rules ({rules.length})
        </div>
        {rules.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground text-sm">No escort rules. Add one above.</div>
        ) : (
          <ul className="divide-y divide-border">
            {rules.map((r) => (
              <li key={r.id} className="p-4 flex items-center justify-between gap-4">
                <div>
                  <p className="font-medium text-foreground">
                    {r.zoneId} · {r.visitType} — {r.required ? "Escort required" : "No escort"}
                  </p>
                  {r.notes !== "—" && <p className="text-sm text-muted-foreground mt-1">{r.notes}</p>}
                </div>
                <Button size="sm" variant="destructive" onClick={() => setDeleteId(r.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <AlertDialog open={deleteId != null} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove escort rule</AlertDialogTitle>
            <AlertDialogDescription>This rule will be removed. Continue?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteId && removeRule(deleteId)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
