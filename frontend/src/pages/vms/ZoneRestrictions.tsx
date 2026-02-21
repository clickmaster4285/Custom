import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { MapPin, Plus, Trash2 } from "lucide-react"
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

type ZoneRestriction = {
  id: string
  zoneId: string
  zoneName: string
  allowedVisitorTypes: string
  notes: string
}

const STORAGE_KEY = "vms-zone-restrictions"

function loadRestrictions(): ZoneRestriction[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function saveRestrictions(list: ZoneRestriction[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
}

export default function ZoneRestrictions() {
  const { toast } = useToast()
  const [restrictions, setRestrictions] = useState<ZoneRestriction[]>(loadRestrictions)
  const [zoneId, setZoneId] = useState("")
  const [zoneName, setZoneName] = useState("")
  const [allowedTypes, setAllowedTypes] = useState("")
  const [notes, setNotes] = useState("")
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const addRestriction = (e: React.FormEvent) => {
    e.preventDefault()
    if (!zoneId.trim() || !zoneName.trim()) {
      toast({ title: "Zone ID and name required", variant: "destructive" })
      return
    }
    const newEntry: ZoneRestriction = {
      id: crypto.randomUUID(),
      zoneId: zoneId.trim(),
      zoneName: zoneName.trim(),
      allowedVisitorTypes: allowedTypes.trim() || "All",
      notes: notes.trim() || "—",
    }
    const next = [newEntry, ...restrictions]
    setRestrictions(next)
    saveRestrictions(next)
    setZoneId("")
    setZoneName("")
    setAllowedTypes("")
    setNotes("")
    toast({ title: "Zone restriction added" })
  }

  const removeRestriction = (id: string) => {
    const next = restrictions.filter((r) => r.id !== id)
    setRestrictions(next)
    saveRestrictions(next)
    setDeleteId(null)
    toast({ title: "Restriction removed", variant: "destructive" })
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#3b82f6]/10 text-[#3b82f6]">
          <MapPin className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-foreground">Zone Restrictions</h1>
          <p className="text-sm text-muted-foreground">
            Configure zone-based access restrictions. Define which visitor types can access each zone.
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="font-medium text-foreground mb-4">Add zone restriction</h2>
        <form onSubmit={addRestriction} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="zr-id">Zone ID</Label>
              <Input id="zr-id" value={zoneId} onChange={(e) => setZoneId(e.target.value)} placeholder="e.g. zone-a" className="mt-1" />
            </div>
            <div>
              <Label htmlFor="zr-name">Zone name</Label>
              <Input id="zr-name" value={zoneName} onChange={(e) => setZoneName(e.target.value)} placeholder="e.g. Main building" className="mt-1" />
            </div>
          </div>
          <div>
            <Label htmlFor="zr-types">Allowed visitor types</Label>
            <Input
              id="zr-types"
              value={allowedTypes}
              onChange={(e) => setAllowedTypes(e.target.value)}
              placeholder="e.g. Pre-registered, Contractor (comma-separated or leave blank for All)"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="zr-notes">Notes (optional)</Label>
            <Input id="zr-notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Additional notes" className="mt-1" />
          </div>
          <Button type="submit">
            <Plus className="h-4 w-4 mr-2" />
            Add restriction
          </Button>
        </form>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="px-4 py-3 border-b border-border font-medium text-foreground">
          Zone restrictions ({restrictions.length})
        </div>
        {restrictions.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground text-sm">No zone restrictions. Add one above.</div>
        ) : (
          <ul className="divide-y divide-border">
            {restrictions.map((r) => (
              <li key={r.id} className="p-4 flex items-center justify-between gap-4">
                <div>
                  <p className="font-medium text-foreground">{r.zoneName} <span className="text-muted-foreground font-normal">({r.zoneId})</span></p>
                  <p className="text-sm text-muted-foreground">Allowed: {r.allowedVisitorTypes}</p>
                  {r.notes !== "—" && <p className="text-xs text-muted-foreground mt-1">{r.notes}</p>}
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
            <AlertDialogTitle>Remove zone restriction</AlertDialogTitle>
            <AlertDialogDescription>This zone will no longer have a configured restriction. Continue?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteId && removeRestriction(deleteId)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
