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
  { user: "admin", email: "admin@customs.gov.pk", role: "Administrator", status: "Active" },
  { user: "sarah.martin", email: "sarah@customs.gov.pk", role: "Manager", status: "Active" },
  { user: "ahmed.khan", email: "ahmed@customs.gov.pk", role: "Operator", status: "Active" },
  { user: "fatima.ali", email: "fatima@customs.gov.pk", role: "HR", status: "Active" },
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

const ROLES = ["Administrator", "Manager", "Operator", "HR", "Viewer"]

export default function UserRoleManagementPage() {
  const [users, setUsers] = useState<UserRow[]>([])
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ user: "", email: "", role: "Operator", status: "Active" })
  const [search, setSearch] = useState("")

  useEffect(() => {
    setUsers(loadRows())
  }, [])

  useEffect(() => {
    if (users.length > 0) saveRows(users)
  }, [users])

  const openAddForm = () => {
    setForm({ user: "", email: "", role: "Operator", status: "Active" })
    setOpen(true)
  }

  const onSave = () => {
    if (!form.user.trim() || !form.email.trim()) return
    if (users.some((u) => u.user === form.user.trim())) return
    setUsers((prev) => [
      { user: form.user.trim(), email: form.email.trim(), role: form.role, status: form.status },
      ...prev,
    ])
    setForm({ user: "", email: "", role: "Operator", status: "Active" })
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
              <div className="text-2xl font-bold">8</div>
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

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Users & Roles</CardTitle>
              <CardDescription>Assign roles and manage access</CardDescription>
            </div>
            <Button className="bg-[#3b82f6] hover:bg-[#2563eb] text-white" onClick={openAddForm}>
              <UserPlus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="users" className="w-full">
              <TabsList>
                <TabsTrigger value="users">Users</TabsTrigger>
                <TabsTrigger value="roles">Roles</TabsTrigger>
              </TabsList>
              <TabsContent value="users" className="mt-6">
                <Input
                  placeholder="Search users..."
                  className="mb-4 w-64"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <Table>
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
              </TabsContent>
              <TabsContent value="roles" className="mt-6">
                <Table>
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
                      { name: "Administrator", desc: "Full system access", users: 2 },
                      { name: "Manager", desc: "VMS, WMS, Reports", users: 12 },
                      { name: "Operator", desc: "VMS, WMS daily ops", users: 45 },
                      { name: "HR", desc: "HR module only", users: 8 },
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
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      <Dialog open={open} onOpenChange={(isOpen) => { setOpen(isOpen); if (!isOpen) setForm({ user: "", email: "", role: "Operator", status: "Active" }) }}>
        <DialogContent className="max-w-md">
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
                    <SelectItem key={r} value={r}>{r}</SelectItem>
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
