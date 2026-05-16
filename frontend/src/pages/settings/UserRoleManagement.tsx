import { useEffect, useState } from "react"
import { Users, Shield, UserPlus } from "lucide-react"
import { ModulePageLayout } from "@/components/dashboard/module-page-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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

const STORAGE_KEY = "wms_user_accounts"

type UserRow = { user: string; email: string; role: string; status: string }

const defaultUsers: UserRow[] = [
  { user: "admin", email: "admin@customs.gov.pk", role: "System Administrator", status: "Active" },
  { user: "sarah.martin", email: "sarah@customs.gov.pk", role: "Operations Manager", status: "Active" },
  { user: "ahmed.khan", email: "ahmed@customs.gov.pk", role: "Operations Officer", status: "Active" },
  { user: "fatima.ali", email: "fatima@customs.gov.pk", role: "Human Resource Manager", status: "Active" },
  { user: "ali.ahmed", email: "ali@customs.gov.pk", role: "Warehouse Manager", status: "Active" },
  { user: "sara.khan", email: "sara@customs.gov.pk", role: "Warehouse Officer", status: "Active" },
  { user: "muhammad.ali", email: "muhammad@customs.gov.pk", role: "Warehouse Officer", status: "Active" },
  { user: "ahmed.ali", email: "ahmed@customs.gov.pk", role: "Warehouse Officer", status: "Active" },
  { user: "ali.ahmed", email: "ali@customs.gov.pk", role: "Warehouse Officer", status: "Active" },
  { user: "muhammad.ali", email: "muhammad@customs.gov.pk", role: "Warehouse Officer", status: "Active" },
  { user: "ahmed.ali", email: "ahmed@customs.gov.pk", role: "Warehouse Officer", status: "Active" },
]

function loadRows(): UserRow[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as UserRow[]
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch {}
  return defaultUsers
}

function saveRows(rows: UserRow[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(rows))
}

const ROLES = [
  { value: "Admin", label: "Admin" },
  { value: "Operation Manager", label: "Operation Manager" },
  { value: "Inspector", label: "Inspector" },
  { value: "Collector", label: "Collector" },
  { value: "Deputy Collector", label: "Deputy Collector" },
  { value: "Assistant Collector", label: "Assistant Collector" },
  { value: "Receptionist", label: "Receptionist" },
  { value: "Human Resource", label: "Human Resource" },
  { value: "Warehouse Officer", label: "Warehouse Officer" },
  { value: "Detection Officer", label: "Detection Officer" },
  { value: "FIR Officer", label: "FIR Officer" },
  { value: "Investigation Officer", label: "Investigation Officer" },
  { value: "Seizing Officer", label: "Seizing Officer" },
]

export default function UserRoleManagementPage() {
  const [users, setUsers] = useState<UserRow[]>([])
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ user: "", email: "", role: "Admin", status: "Active" })
  const [search, setSearch] = useState("")

  useEffect(() => {
    setUsers(loadRows())
  }, [])

  useEffect(() => {
    if (users.length > 0) saveRows(users)
  }, [users])

  const openAddForm = () => {
    setForm({ user: "", email: "", role: "Admin", status: "Active" })
    setOpen(true)
  }

  const onSave = () => {
    if (!form.user.trim() || !form.email.trim()) return
    if (users.some((u) => u.user === form.user.trim())) return
    setUsers((prev) => [
      { user: form.user.trim(), email: form.email.trim(), role: form.role, status: form.status },
      ...prev,
    ])
    setForm({ user: "", email: "", role: "Admin", status: "Active" })
    setOpen(false)
  }

  const filteredUsers = users.filter(
    (u) =>
      !search.trim() ||
      u.user.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <ModulePageLayout
      title="User & Role Management"
      description="Manage system users, roles, and permissions."
      breadcrumbs={[{ label: "System configuration" }, { label: "User & Role Management" }]}
    >
      <div className="grid gap-6">
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Users
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Active accounts</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Roles
              </CardTitle>
              <Shield className="h-4 w-4 text-[#3b82f6]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{ROLES.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Defined roles</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Last Login
              </CardTitle>
              <UserPlus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Today</div>
              <p className="text-xs text-muted-foreground mt-1">42 users active</p>
            </CardContent>
          </Card>
        </div>

        <Card className="w-full min-w-0">
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <CardTitle>Users & Roles</CardTitle>
              <CardDescription>Assign roles and manage access</CardDescription>
            </div>
            <Button className="w-full bg-[#3b82f6] text-white hover:bg-[#2563eb] sm:w-auto" onClick={openAddForm}>
              <UserPlus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </CardHeader>
          <CardContent className="w-full min-w-0">
            <Tabs defaultValue="users" className="w-full">
              <TabsList>
                <TabsTrigger value="users">Users</TabsTrigger>
                <TabsTrigger value="roles">Roles</TabsTrigger>
              </TabsList>
              <TabsContent value="users" className="mt-6">
                <Input
                  placeholder="Search users..."
                  className="mb-4 w-full sm:w-64"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <div className="w-full max-w-full overflow-x-auto rounded-lg border pb-2">
                <Table className="min-w-[760px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Username</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((row) => (
                      <TableRow key={row.user}>
                        <TableCell className="font-medium">{row.user}</TableCell>
                        <TableCell className="text-muted-foreground">{row.email}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{row.role}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="default">{row.status}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" className="text-[#3b82f6]">
                            Edit
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                </div>
              </TabsContent>
              <TabsContent value="roles" className="mt-6">
                <div className="w-full max-w-full overflow-x-auto rounded-lg border pb-2">
                <Table className="min-w-[760px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Role Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Users</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[
                      { name: "Admin", desc: "Full system access", users: 2 },
                      { name: "Operation Manager", desc: "Operations oversight", users: 0 },
                      { name: "Inspector", desc: "Inspection and field ops", users: 0 },
                      { name: "Collector", desc: "Collectorate level access", users: 0 },
                      { name: "Deputy Collector", desc: "Deputy collectorate duties", users: 0 },
                      { name: "Assistant Collector", desc: "Assistant collectorate duties", users: 0 },
                      { name: "Receptionist", desc: "Reception and front desk", users: 0 },
                      { name: "Human Resource", desc: "HR module and personnel", users: 0 },
                      { name: "Warehouse Officer", desc: "Warehouse and inventory", users: 0 },
                      { name: "Detection Officer", desc: "Detection and enforcement", users: 0 },
                      { name: "FIR Officer", desc: "FIR registration and records", users: 0 },
                      { name: "Investigation Officer", desc: "Case investigation workflow", users: 0 },
                      { name: "Seizing Officer", desc: "Seizure and custody operations", users: 0 },
                    ].map((row) => (
                      <TableRow key={row.name}>
                        <TableCell className="font-medium">{row.name}</TableCell>
                        <TableCell className="text-muted-foreground">{row.desc}</TableCell>
                        <TableCell>{row.users}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" className="text-[#3b82f6]">
                            Permissions
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      <Dialog open={open} onOpenChange={(isOpen) => { setOpen(isOpen); if (!isOpen) setForm({ user: "", email: "", role: "Admin", status: "Active" }) }}>
        <DialogContent className="w-[95vw] sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add User</DialogTitle>
            <p className="text-sm text-muted-foreground">User account (dummy data saved locally).</p>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Username *</Label>
              <Input
                value={form.user}
                onChange={(e) => setForm((p) => ({ ...p, user: e.target.value }))}
                placeholder="e.g. john.doe"
              />
            </div>
            <div className="space-y-2">
              <Label>Email *</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                placeholder="e.g. john@customs.gov.pk"
              />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={form.role} onValueChange={(v) => setForm((p) => ({ ...p, role: v }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map((r) => (
                    <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col-reverse justify-end gap-2 pt-2 sm:flex-row">
              <Button variant="outline" onClick={() => setOpen(false)} className="w-full sm:w-auto">Cancel</Button>
              <Button onClick={onSave} className="w-full sm:w-auto">Save</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </ModulePageLayout>
  )
}
