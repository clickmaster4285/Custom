import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Lock, Plus, Trash2, Loader2 } from "lucide-react"
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

type BlacklistEntry = {
  id: string
  name: string
  idType: string
  idNumber: string
  reason: string
  addedAt: string
}

const STORAGE_KEY = "vms-blacklist"

function loadBlacklist(): BlacklistEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function saveBlacklist(list: BlacklistEntry[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
}

export default function BlacklistManagement() {
  const { toast } = useToast()
  const [entries, setEntries] = useState<BlacklistEntry[]>(loadBlacklist)
  const [name, setName] = useState("")
  const [idType, setIdType] = useState("CNIC")
  const [idNumber, setIdNumber] = useState("")
  const [reason, setReason] = useState("")
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const addEntry = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !idNumber.trim()) {
      toast({ title: "Name and ID number required", variant: "destructive" })
      return
    }
    const newEntry: BlacklistEntry = {
      id: crypto.randomUUID(),
      name: name.trim(),
      idType: idType.trim() || "CNIC",
      idNumber: idNumber.trim(),
      reason: reason.trim() || "—",
      addedAt: new Date().toISOString(),
    }
    const next = [newEntry, ...entries]
    setEntries(next)
    saveBlacklist(next)
    setName("")
    setIdNumber("")
    setReason("")
    toast({ title: "Added to blacklist" })
  }

  const removeEntry = (id: string) => {
    const next = entries.filter((e) => e.id !== id)
    setEntries(next)
    saveBlacklist(next)
    setDeleteId(null)
    toast({ title: "Removed from blacklist", variant: "destructive" })
  }

  function formatDate(iso: string) {
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
          <Lock className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-foreground">Blacklist Management</h1>
          <p className="text-sm text-muted-foreground">
            Manage blacklisted visitors and access restrictions. Blacklisted IDs are denied at screening.
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="font-medium text-foreground mb-4">Add to blacklist</h2>
        <form onSubmit={addEntry} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="bl-name">Full name</Label>
              <Input id="bl-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Visitor name" className="mt-1" />
            </div>
            <div>
              <Label htmlFor="bl-id-type">ID type</Label>
              <select
                id="bl-id-type"
                value={idType}
                onChange={(e) => setIdType(e.target.value)}
                className="mt-1 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
              >
                <option value="CNIC">CNIC</option>
                <option value="Passport">Passport</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
          <div>
            <Label htmlFor="bl-id-number">ID number</Label>
            <Input
              id="bl-id-number"
              value={idNumber}
              onChange={(e) => setIdNumber(e.target.value)}
              placeholder="e.g. 12345-6789012-3"
              className="mt-1 font-mono"
            />
          </div>
          <div>
            <Label htmlFor="bl-reason">Reason (optional)</Label>
            <Textarea id="bl-reason" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason for blacklisting" className="mt-1" rows={2} />
          </div>
          <Button type="submit">
            <Plus className="h-4 w-4 mr-2" />
            Add to blacklist
          </Button>
        </form>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="px-4 py-3 border-b border-border font-medium text-foreground">
          Blacklist entries ({entries.length})
        </div>
        {entries.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground text-sm">No blacklist entries. Add one above.</div>
        ) : (
          <ul className="divide-y divide-border">
            {entries.map((e) => (
              <li key={e.id} className="p-4 flex items-center justify-between gap-4">
                <div>
                  <p className="font-medium text-foreground">{e.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {e.idType}: {e.idNumber} · {e.reason}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Added {formatDate(e.addedAt)}</p>
                </div>
                <Button size="sm" variant="destructive" onClick={() => setDeleteId(e.id)}>
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
            <AlertDialogTitle>Remove from blacklist</AlertDialogTitle>
            <AlertDialogDescription>
              This will allow this ID to pass screening again. Continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteId && removeEntry(deleteId)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
