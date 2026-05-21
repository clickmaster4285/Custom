import { useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { Users, Shield, UserPlus, Loader2, Eye, EyeOff } from "lucide-react"
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
import { useToast } from "@/hooks/use-toast"
import { getStoredToken } from "@/lib/api"
import {
  createUser,
  updateUser,
  fetchUsers,
  ROLE_OPTIONS,
  LOCATION_OPTIONS,
  locationLabel,
  roleLabel,
  type ApiUser,
} from "@/lib/users-api"

type UserForm = {
  user: string
  email: string
  password: string
  phone: string
  role: string
  location: string
  is_active: boolean
}

const emptyForm: UserForm = {
  user: "",
  email: "",
  password: "",
  phone: "",
  role: "ADMIN",
  location: "PESHAWAR",
  is_active: true,
}

export default function UserRoleManagementPage() {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const [editingUserId, setEditingUserId] = useState<number | null>(null)
  const [form, setForm] = useState<UserForm>(emptyForm)
  const [search, setSearch] = useState("")
  const [saving, setSaving] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const isEditing = editingUserId !== null

  const hasAuth = Boolean(getStoredToken())

  const {
    data: users = [],
    isLoading,
    error: loadError,
  } = useQuery({
    queryKey: ["users", "list"],
    queryFn: fetchUsers,
    enabled: hasAuth,
  })

  const openAddForm = () => {
    if (!hasAuth) {
      toast({
        title: "Sign in required",
        description: "Log in as Admin or HR to create users in the database.",
        variant: "destructive",
      })
      return
    }
    setEditingUserId(null)
    setShowPassword(false)
    setForm(emptyForm)
    setOpen(true)
  }

  const openEditForm = (user: ApiUser) => {
    if (!hasAuth) {
      toast({
        title: "Sign in required",
        description: "Log in as Admin or HR to edit users.",
        variant: "destructive",
      })
      return
    }
    setEditingUserId(user.id)
    setShowPassword(false)
    setForm({
      user: user.username,
      email: user.email,
      password: "",
      phone: user.phone === "0000000000" ? "" : user.phone,
      role: user.role,
      location: user.location || "PESHAWAR",
      is_active: user.is_active,
    })
    setOpen(true)
  }

  const closeDialog = () => {
    setOpen(false)
    setEditingUserId(null)
    setShowPassword(false)
    setForm(emptyForm)
  }

  const onSave = async () => {
    const username = form.user.trim()
    const email = form.email.trim()
    const password = form.password

    if (!username || !email) {
      toast({
        title: "Missing fields",
        description: "Username and email are required.",
        variant: "destructive",
      })
      return
    }

    if (!isEditing) {
      if (!password || password.length < 6) {
        toast({
          title: "Invalid password",
          description: "Password is required and must be at least 6 characters.",
          variant: "destructive",
        })
        return
      }
      if (users.some((u) => u.username === username)) {
        toast({
          title: "Username taken",
          description: "Choose a different username.",
          variant: "destructive",
        })
        return
      }
    } else {
      if (password && password.length < 6) {
        toast({
          title: "Invalid password",
          description: "New password must be at least 6 characters, or leave blank to keep current.",
          variant: "destructive",
        })
        return
      }
      const taken = users.some(
        (u) => u.id !== editingUserId && u.username.toLowerCase() === username.toLowerCase()
      )
      if (taken) {
        toast({
          title: "Username taken",
          description: "Choose a different username.",
          variant: "destructive",
        })
        return
      }
    }

    setSaving(true)
    try {
      if (isEditing && editingUserId !== null) {
        await updateUser(editingUserId, {
          username,
          email,
          role: form.role,
          phone: form.phone.trim() || undefined,
          location: form.location,
          is_active: form.is_active,
          ...(password ? { password } : {}),
        })
        toast({
          title: "User updated",
          description: `${username} was saved to the database.`,
        })
      } else {
        await createUser({
          username,
          email,
          password,
          role: form.role,
          phone: form.phone.trim() || undefined,
          location: form.location,
        })
        toast({
          title: "User created",
          description: `${username} was saved to the database.`,
        })
      }
      void queryClient.invalidateQueries({ queryKey: ["users"] })
      closeDialog()
    } catch (err) {
      toast({
        title: isEditing ? "Could not update user" : "Could not create user",
        description: err instanceof Error ? err.message : "Request failed",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const filteredUsers = users.filter(
    (u) =>
      !search.trim() ||
      u.username.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      roleLabel(u.role).toLowerCase().includes(search.toLowerCase())
  )

  const activeCount = users.filter((u) => u.is_active).length

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
              <div className="text-2xl font-bold">{hasAuth ? users.length : "—"}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {hasAuth ? `${activeCount} active in database` : "Log in to load users"}
              </p>
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
              <div className="text-2xl font-bold">{ROLE_OPTIONS.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Defined roles</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Storage
              </CardTitle>
              <UserPlus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{hasAuth ? "API" : "—"}</div>
              <p className="text-xs text-muted-foreground mt-1">PostgreSQL / Django</p>
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
            {!hasAuth && (
              <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-3 py-2 mb-4">
                Sign in with an Admin or HR account to view and create users in the database.
              </p>
            )}
            {loadError && (
              <p className="text-sm text-destructive mb-4">
                {loadError instanceof Error ? loadError.message : "Failed to load users"}
              </p>
            )}
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
                {isLoading ? (
                  <p className="text-sm text-muted-foreground py-8 flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading users…
                  </p>
                ) : (
                <div className="w-full max-w-full overflow-x-auto rounded-lg border pb-2">
                <Table className="min-w-[760px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Username</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                          {hasAuth ? "No users found." : "Sign in to see users."}
                        </TableCell>
                      </TableRow>
                    ) : (
                    filteredUsers.map((row: ApiUser) => (
                      <TableRow key={row.id}>
                        <TableCell className="font-medium">{row.username}</TableCell>
                        <TableCell className="text-muted-foreground">{row.email}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{roleLabel(row.role)}</Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {locationLabel(row.location)}
                        </TableCell>
                        <TableCell>
                          <Badge variant={row.is_active ? "default" : "secondary"}>
                            {row.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-[#3b82f6]"
                            onClick={() => openEditForm(row)}
                          >
                            Edit
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                    )}
                  </TableBody>
                </Table>
                </div>
                )}
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
                      { name: "Admin", desc: "Full system access", role: "ADMIN" },
                      { name: "Operation Manager", desc: "Operations oversight", role: "OPERATION_MANAGER" },
                      { name: "Inspector", desc: "Inspection and field ops", role: "INSPECTOR" },
                      { name: "Collector", desc: "Collectorate level access", role: "COLLECTOR" },
                      { name: "Deputy Collector", desc: "Deputy collectorate duties", role: "DEPUTY_COLLECTOR" },
                      { name: "Assistant Collector", desc: "Assistant collectorate duties", role: "ASSISTANT_COLLECTOR" },
                      { name: "Receptionist", desc: "Reception and front desk", role: "RECEPTIONIST" },
                      { name: "Human Resource", desc: "HR module and personnel", role: "HR" },
                      { name: "Warehouse Officer", desc: "Warehouse and inventory", role: "WAREHOUSE_OFFICER" },
                      { name: "Detection Officer", desc: "Detection and enforcement", role: "DETECTION_OFFICER" },
                      { name: "FIR Officer", desc: "FIR registration and records", role: "FIR_OFFICER" },
                      { name: "Investigation Officer", desc: "Case investigation workflow", role: "INVESTIGATION_OFFICER" },
                      { name: "Seizing Officer", desc: "Seizure and custody operations", role: "SEIZING_OFFICER" },
                    ].map((row) => (
                      <TableRow key={row.role}>
                        <TableCell className="font-medium">{row.name}</TableCell>
                        <TableCell className="text-muted-foreground">{row.desc}</TableCell>
                        <TableCell>
                          {users.filter((u) => u.role === row.role).length}
                        </TableCell>
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

      <Dialog
        open={open}
        onOpenChange={(isOpen) => {
          if (!isOpen) closeDialog()
          else setOpen(true)
        }}
      >
        <DialogContent className="w-[95vw] sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{isEditing ? "Edit User" : "Add User"}</DialogTitle>
            <p className="text-sm text-muted-foreground">
              {isEditing
                ? "Update account details including username. Leave password blank to keep the current password."
                : "Creates a login account with a hashed password stored in the database."}
            </p>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="add-user-username">Username *</Label>
              <Input
                id="add-user-username"
                value={form.user}
                onChange={(e) => setForm((p) => ({ ...p, user: e.target.value }))}
                placeholder="e.g. john.doe"
                autoComplete="username"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-user-email">Email *</Label>
              <Input
                id="add-user-email"
                type="email"
                value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                placeholder="e.g. john@customs.gov.pk"
                autoComplete="email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-user-password">
                {isEditing ? "New password" : "Password *"}
              </Label>
              <div className="relative">
                <Input
                  id="add-user-password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                  placeholder={isEditing ? "Leave blank to keep current" : "At least 6 characters"}
                  autoComplete="new-password"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-user-phone">Phone</Label>
              <Input
                id="add-user-phone"
                type="tel"
                value={form.phone}
                onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                placeholder="e.g. 0300-1234567"
                autoComplete="tel"
              />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={form.role} onValueChange={(v) => setForm((p) => ({ ...p, role: v }))}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLE_OPTIONS.map((r) => (
                    <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Location *</Label>
              <Select
                value={form.location}
                onValueChange={(v) => setForm((p) => ({ ...p, location: v }))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LOCATION_OPTIONS.map((loc) => (
                    <SelectItem key={loc.value} value={loc.value}>
                      {loc.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {isEditing && (
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={form.is_active ? "active" : "inactive"}
                  onValueChange={(v) => setForm((p) => ({ ...p, is_active: v === "active" }))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="flex flex-col-reverse justify-end gap-2 pt-2 sm:flex-row">
              <Button variant="outline" onClick={closeDialog} className="w-full sm:w-auto" disabled={saving}>
                Cancel
              </Button>
              <Button onClick={() => void onSave()} className="w-full sm:w-auto" disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving…
                  </>
                ) : isEditing ? (
                  "Update"
                ) : (
                  "Save"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </ModulePageLayout>
  )
}
