import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { ROUTES } from "@/routes/config"
import type { Zone, ZoneType } from "@/lib/gate-types"
import { ZONE_TYPES } from "@/lib/gate-types"
import { getZones, setZones, getGates, ensureDefaultZones } from "@/lib/gate-storage"

function generateZoneId(): string {
  return `zone-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

const emptyZone = (): Omit<Zone, "zone_id"> => ({
  zone_name: "",
  zone_code: "",
  zone_type: "Public",
  floor: "",
  building: "",
  allowed_categories: [],
  max_occupancy: 0,
  requires_escort: false,
  access_hours_start: "06:00",
  access_hours_end: "22:00",
  weekend_access: false,
  camera_ids: [],
  gate_ids: [],
  zone_active: true,
})

export default function ZoneRestrictionsPage() {
  const [zones, setZonesState] = useState<Zone[]>([])
  const [gates, setGates] = useState<{ gate_id: string; gate_name: string }[]>([])
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState(emptyZone())

  useEffect(() => {
    ensureDefaultZones()
    setZonesState(getZones())
    setGates(getGates().map((g) => ({ gate_id: g.gate_id, gate_name: g.gate_name })))
  }, [])

  useEffect(() => {
    if (zones.length > 0) setZones(zones)
  }, [zones])

  const filteredZones = useMemo(() => {
    const q = search.trim().toLowerCase()
    return zones.filter((row) => {
      const matchType = typeFilter === "all" || (row.zone_type ?? "") === typeFilter
      const matchSearch =
        q.length === 0 ||
        [row.zone_id, row.zone_name, row.zone_code, row.floor, row.building].some((v) =>
          (v ?? "").toString().toLowerCase().includes(q)
        )
      return matchType && matchSearch
    })
  }, [zones, search, typeFilter])

  const onAdd = () => {
    if (!formData.zone_name?.trim() || !formData.zone_code?.trim()) return
    const code = formData.zone_code.trim().slice(0, 10)
    if (zones.some((z) => z.zone_code === code)) return
    const newZone: Zone = {
      ...formData,
      zone_id: generateZoneId(),
      zone_code: code,
      max_occupancy: Number(formData.max_occupancy) || 0,
    }
    setZonesState((prev) => [newZone, ...prev])
    setFormData(emptyZone())
    setOpen(false)
  }

  const breadcrumbs = [
        { label: "Home", href: ROUTES.DASHBOARD },
        { label: "Visitor Management System" },
        { label: "Access Control" },
        { label: "Zone Restrictions" },
  ]

  return (
    <>
      <nav className="text-sm text-muted-foreground mb-2">
        {breadcrumbs.map((bc, i) => (
          <span key={`${bc.label}-${i}`}>
            {bc.href ? (
              <Link to={bc.href} className="hover:text-foreground">
                {bc.label}
              </Link>
            ) : (
              <span
                className={
                  i === breadcrumbs.length - 1 ? "text-[#3b82f6]" : "text-foreground"
                }
              >
                {bc.label}
              </span>
            )}
            {i < breadcrumbs.length - 1 && <span className="mx-2">/</span>}
          </span>
        ))}
      </nav>

      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground">Zone Restrictions</h1>
        <p className="text-sm text-muted-foreground">
          Define zones with access hours, occupancy, escort rules, and linked gates. Important info in list; full fields when you Add zone.
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
            <div>
              <CardTitle>Zones</CardTitle>
              <CardDescription>
                List shows key info; click Add zone for all fields.
              </CardDescription>
            </div>
            <div className="flex flex-col md:flex-row gap-2">
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name, code, floor..."
                className="md:w-56"
              />
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="md:w-40">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  {ZONE_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" asChild>
                <Link to={ROUTES.GATE_INTEGRATION}>Gate Integration</Link>
              </Button>
              <Button onClick={() => { setFormData(emptyZone()); setOpen(true) }}>Add zone</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Zone ID</TableHead>
                  <TableHead>Zone Name</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Floor</TableHead>
                  <TableHead>Building</TableHead>
                  <TableHead>Max Occupancy</TableHead>
                  <TableHead>Escort</TableHead>
                  <TableHead>Access Hours</TableHead>
                  <TableHead>Weekend</TableHead>
                  <TableHead>Active</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredZones.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={11}
                      className="text-center text-muted-foreground py-8"
                    >
                      No zones. Click &quot;Add zone&quot; to create one.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredZones.map((z) => (
                    <TableRow key={z.zone_id}>
                      <TableCell className="font-mono text-xs">
                        {z.zone_id.slice(0, 14)}…
                      </TableCell>
                      <TableCell>{z.zone_name ?? "—"}</TableCell>
                      <TableCell className="font-mono">{z.zone_code ?? "—"}</TableCell>
                      <TableCell>{z.zone_type ?? "—"}</TableCell>
                      <TableCell>{z.floor || "—"}</TableCell>
                      <TableCell>{z.building || "—"}</TableCell>
                      <TableCell>{z.max_occupancy ?? "—"}</TableCell>
                      <TableCell>{z.requires_escort ? "Yes" : "No"}</TableCell>
                      <TableCell className="text-xs">
                        {z.access_hours_start}–{z.access_hours_end}
                      </TableCell>
                      <TableCell>{z.weekend_access ? "Yes" : "No"}</TableCell>
                      <TableCell>
                        <Badge variant={z.zone_active ? "default" : "secondary"}>
                          {z.zone_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={(isOpen) => { setOpen(isOpen); if (!isOpen) setFormData(emptyZone()) }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add zone</DialogTitle>
            <p className="text-sm text-muted-foreground">
              All zone fields. Zone ID is auto-generated. Zone code must be unique.
            </p>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="space-y-1.5">
              <Label>Zone name *</Label>
              <Input
                value={formData.zone_name}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, zone_name: e.target.value.slice(0, 50) }))
                }
                placeholder="Max 50"
                maxLength={50}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Zone code * (unique)</Label>
              <Input
                value={formData.zone_code}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, zone_code: e.target.value.slice(0, 10) }))
                }
                placeholder="Max 10, unique"
                maxLength={10}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Zone type *</Label>
              <Select
                value={formData.zone_type}
                onValueChange={(v) =>
                  setFormData((p) => ({ ...p, zone_type: v as ZoneType }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ZONE_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Max occupancy *</Label>
              <Input
                type="number"
                min={0}
                value={formData.max_occupancy || ""}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, max_occupancy: Number(e.target.value) || 0 }))
                }
                placeholder="Number"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Floor (optional)</Label>
              <Input
                value={formData.floor}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, floor: e.target.value.slice(0, 10) }))
                }
                placeholder="Max 10"
                maxLength={10}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Building (optional)</Label>
              <Input
                value={formData.building}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, building: e.target.value.slice(0, 50) }))
                }
                placeholder="Max 50"
                maxLength={50}
              />
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <Label>Allowed categories (Visitor Category IDs, comma-separated)</Label>
              <Input
                value={(formData.allowed_categories ?? []).join(", ")}
                onChange={(e) =>
                  setFormData((p) => ({
                    ...p,
                    allowed_categories: e.target.value
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean),
                  }))
                }
                placeholder="e.g. cat1, cat2"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Access hours start *</Label>
              <Input
                type="time"
                value={formData.access_hours_start}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, access_hours_start: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label>Access hours end *</Label>
              <Input
                type="time"
                value={formData.access_hours_end}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, access_hours_end: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <Label>Gate IDs * (select gates linked to this zone)</Label>
              <div className="flex flex-wrap gap-3 rounded-md border p-3">
                {gates.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No gates. Add gates in Gate Integration first.
                  </p>
                ) : (
                  gates.map((g) => (
                    <div key={g.gate_id} className="flex items-center gap-2">
                      <Checkbox
                        id={`gate-${g.gate_id}`}
                        checked={formData.gate_ids.includes(g.gate_id)}
                        onCheckedChange={(checked) => {
                          setFormData((p) => ({
                            ...p,
                            gate_ids:
                              checked === true
                                ? [...p.gate_ids, g.gate_id]
                                : p.gate_ids.filter((id) => id !== g.gate_id),
                          }))
                        }}
                      />
                      <Label
                        htmlFor={`gate-${g.gate_id}`}
                        className="text-sm font-normal cursor-pointer"
                      >
                        {g.gate_name} ({g.gate_id.slice(0, 10)}…)
                      </Label>
                    </div>
                  ))
                )}
              </div>
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <Label>Camera IDs (optional, comma-separated)</Label>
              <Input
                value={(formData.camera_ids ?? []).join(", ")}
                onChange={(e) =>
                  setFormData((p) => ({
                    ...p,
                    camera_ids: e.target.value
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean),
                  }))
                }
                placeholder="Camera registry IDs"
              />
            </div>
            <div className="flex flex-wrap items-center gap-6 md:col-span-2">
              <div className="flex items-center gap-2">
                <Switch
                  id="requires_escort"
                  checked={formData.requires_escort}
                  onCheckedChange={(c) =>
                    setFormData((p) => ({ ...p, requires_escort: c }))
                  }
                />
                <Label htmlFor="requires_escort">Requires escort</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="weekend_access"
                  checked={formData.weekend_access}
                  onCheckedChange={(c) =>
                    setFormData((p) => ({ ...p, weekend_access: c }))
                  }
                />
                <Label htmlFor="weekend_access">Weekend access</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="zone_active"
                  checked={formData.zone_active}
                  onCheckedChange={(c) =>
                    setFormData((p) => ({ ...p, zone_active: c }))
                  }
                />
                <Label htmlFor="zone_active">Zone active</Label>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={onAdd}>Add zone</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
