import { useEffect, useState } from "react"
import { Users, UserPlus, Building2, Mail } from "lucide-react"
import { ModulePageLayout } from "@/components/dashboard/module-page-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Camera } from "lucide-react"
import { CameraCapture } from "@/components/camera-capture"
import { fetchStaff, createStaff, type StaffRecord, type CreateStaffPayload } from "@/lib/staff-api"

const ROLE_OPTIONS = [
  { value: "ADMIN", label: "Admin" },
  { value: "INSPECTOR", label: "Inspector" },
  { value: "COLLECTOR", label: "Collector" },
  { value: "DEPUTY_COLLECTOR", label: "Deputy Collector" },
  { value: "ASSISTANT_COLLECTOR", label: "Assistant Collector" },
  { value: "RECEPTIONIST", label: "Receptionist" },
  { value: "HR", label: "Human Resource" },
  { value: "WAREHOUSE_OFFICER", label: "Warehouse Officer" },
  { value: "DETECTION_OFFICER", label: "Detection Officer" },
]

const emptyForm: CreateStaffPayload = {
  username: "",
  password: "",
  email: "",
  role: "RECEPTIONIST",
  phone: "",
  full_name: "",
  cnic: "",
  address: "",
  date_of_birth: "",
  joining_date: new Date().toISOString().slice(0, 10),
  department: "",
  designation: "",
  emergency_contact: "",
}

export default function EmployeesPage() {
  const [staff, setStaff] = useState<StaffRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [addOpen, setAddOpen] = useState(false)
  const [form, setForm] = useState<CreateStaffPayload>(emptyForm)
  const [profileImage, setProfileImage] = useState<File | null>(null)
  const [cameraOpen, setCameraOpen] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const loadStaff = () => {
    setLoading(true)
    fetchStaff()
      .then(setStaff)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load staff"))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadStaff()
  }, [])

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError(null)
    setSubmitting(true)
    try {
      await createStaff({
        ...form,
        profile_image: profileImage ?? undefined,
      })
      setForm(emptyForm)
      setProfileImage(null)
      setAddOpen(false)
      loadStaff()
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Failed to add staff")
    } finally {
      setSubmitting(false)
    }
  }

  const filtered = staff.filter(
    (s) =>
      s.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      s.user?.toLowerCase().includes(search.toLowerCase()) ||
      s.department?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <ModulePageLayout
      title="Employees"
      description="Manage employee records, departments, and contact information."
      breadcrumbs={[{ label: "HR" }, { label: "Employees" }]}
    >
      <div className="grid gap-6">
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Employees
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{staff.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Active</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Departments
              </CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {[...new Set(staff.map((s) => s.department).filter(Boolean))].length}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Departments</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Staff
              </CardTitle>
              <UserPlus className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{staff.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Total</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                On Leave Today
              </CardTitle>
              <Mail className="h-4 w-4 text-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">—</div>
              <p className="text-xs text-muted-foreground mt-1">N/A</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Employee Directory</CardTitle>
              <CardDescription>Search and manage employee records</CardDescription>
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Search by name or ID..."
                className="w-64"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Dialog open={addOpen} onOpenChange={(open) => { setAddOpen(open); if (!open) setSubmitError(null) }}>
                <DialogTrigger asChild>
                  <Button className="bg-[#3b82f6] hover:bg-[#2563eb] text-white">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add Staff
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Add Staff</DialogTitle>
                    <DialogDescription>
                      Create a new staff member. Your session token is sent automatically for authorization.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleAddStaff} className="grid gap-4 py-4">
                    {submitError && (
                      <p className="text-sm text-destructive">{submitError}</p>
                    )}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="username">Username</Label>
                        <Input
                          id="username"
                          value={form.username}
                          onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                          id="password"
                          type="password"
                          value={form.password}
                          onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                          required
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={form.email}
                          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                          id="phone"
                          value={form.phone}
                          onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Role</Label>
                      <Select
                        value={form.role}
                        onValueChange={(value) => setForm((f) => ({ ...f, role: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ROLE_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="full_name">Full name</Label>
                      <Input
                        id="full_name"
                        value={form.full_name}
                        onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="cnic">CNIC</Label>
                        <Input
                          id="cnic"
                          value={form.cnic}
                          onChange={(e) => setForm((f) => ({ ...f, cnic: e.target.value }))}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="emergency_contact">Emergency contact</Label>
                        <Input
                          id="emergency_contact"
                          value={form.emergency_contact}
                          onChange={(e) => setForm((f) => ({ ...f, emergency_contact: e.target.value }))}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address">Address</Label>
                      <Input
                        id="address"
                        value={form.address}
                        onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="date_of_birth">Date of birth</Label>
                        <Input
                          id="date_of_birth"
                          type="date"
                          value={form.date_of_birth}
                          onChange={(e) => setForm((f) => ({ ...f, date_of_birth: e.target.value }))}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="joining_date">Joining date</Label>
                        <Input
                          id="joining_date"
                          type="date"
                          value={form.joining_date}
                          onChange={(e) => setForm((f) => ({ ...f, joining_date: e.target.value }))}
                          required
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="department">Department</Label>
                        <Input
                          id="department"
                          value={form.department}
                          onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="designation">Designation</Label>
                        <Input
                          id="designation"
                          value={form.designation}
                          onChange={(e) => setForm((f) => ({ ...f, designation: e.target.value }))}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Profile image (optional)</Label>
                      <div className="flex flex-wrap gap-2 items-center">
                        <Input
                          id="profile_image"
                          type="file"
                          accept="image/*"
                          className="max-w-xs"
                          onChange={(e) => setProfileImage(e.target.files?.[0] ?? null)}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setCameraOpen(true)}
                        >
                          <Camera className="h-4 w-4 mr-2" />
                          Capture from camera
                        </Button>
                        {profileImage && (
                          <span className="text-xs text-muted-foreground">
                            {profileImage.name}
                          </span>
                        )}
                      </div>
                      <Dialog open={cameraOpen} onOpenChange={setCameraOpen}>
                        <DialogContent className="max-w-md">
                          <CameraCapture
                            title="Capture staff photo"
                            description="Position the staff member in frame and capture. This will be used as their profile image."
                            onCapture={(file) => {
                              setProfileImage(file)
                              setCameraOpen(false)
                            }}
                            onCancel={() => setCameraOpen(false)}
                          />
                        </DialogContent>
                      </Dialog>
                    </div>
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setAddOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" className="bg-[#3b82f6] hover:bg-[#2563eb] text-white" disabled={submitting}>
                        {submitting ? "Adding…" : "Add Staff"}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {error && (
              <p className="text-sm text-destructive mb-4">{error}</p>
            )}
            {loading ? (
              <p className="text-sm text-muted-foreground py-8">Loading staff…</p>
            ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Username</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Designation</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      No staff found. Click &quot;Add Staff&quot; to create a new record.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-xs">
                              {row.full_name
                                ?.split(" ")
                                .map((n) => n[0])
                                .join("")
                                .slice(0, 2) ?? row.user?.slice(0, 2) ?? "—"}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{row.full_name ?? row.user}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-muted-foreground">{row.user}</TableCell>
                      <TableCell>{row.department}</TableCell>
                      <TableCell>{row.designation}</TableCell>
                      <TableCell>
                        <Badge variant="default">{row.role}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" className="text-[#3b82f6]">
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </ModulePageLayout>
  )
}
