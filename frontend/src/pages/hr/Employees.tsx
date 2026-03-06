import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Users, UserPlus, Building2, Mail, Search, Eye, Edit, Trash2 } from "lucide-react"
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
} from "@/components/ui/dialog"
import { fetchStaff, type StaffRecord } from "@/lib/staff-api"
import { ROUTES } from "@/routes/config"

export default function EmployeesPage() {
  const navigate = useNavigate()
  const [staff, setStaff] = useState<StaffRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [viewOpen, setViewOpen] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState<StaffRecord | null>(null)

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

  const handleViewEmployee = (employee: StaffRecord) => {
    setSelectedEmployee(employee)
    setViewOpen(true)
  }

  const filtered = staff.filter(
    (s) =>
      s.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      s.user?.toLowerCase().includes(search.toLowerCase()) ||
      s.personal_number?.toLowerCase().includes(search.toLowerCase()) ||
      s.login_username?.toLowerCase().includes(search.toLowerCase()) ||
      s.department?.toLowerCase().includes(search.toLowerCase()) ||
      s.designation?.toLowerCase().includes(search.toLowerCase()) ||
      s.cnic?.includes(search)
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
              <CardTitle className="text-xl font-semibold">Disposition List of Assistant/Deputy Collectors</CardTitle>
              <CardDescription>of respect of Collectorate of Customs (Enforcement), Peshawar</CardDescription>
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  placeholder="Search by name, CNIC, designation..."
                  className="pl-9 w-80"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Button 
                className="bg-[#3b82f6] hover:bg-[#2563eb] text-white"
                onClick={() => navigate(ROUTES.ADD_STAFF)}
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Add Staff
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {error && (
              <p className="text-sm text-destructive mb-4">{error}</p>
            )}
            {loading ? (
              <p className="text-sm text-muted-foreground py-8">Loading staff…</p>
            ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="w-12 text-center">S.No.</TableHead>
                    <TableHead>Personal No.</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Father's Name</TableHead>
                    <TableHead>Designation</TableHead>
                    <TableHead className="text-center">BPS</TableHead>
                    <TableHead>CNIC</TableHead>
                    <TableHead>Mobile No.</TableHead>
                    <TableHead>Date of Birth</TableHead>
                    <TableHead>Qualification</TableHead>
                    <TableHead>Current place of Posting</TableHead>
                    <TableHead>Name of Collector</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={13} className="text-center text-muted-foreground py-8">
                        No staff found. Click "Add Staff" to create a new record.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((row, index) => (
                      <TableRow 
                        key={row.id} 
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => handleViewEmployee(row)}
                      >
                        <TableCell className="text-center font-medium">{index + 1}</TableCell>
                        <TableCell>{row.personal_number || row.user || "—"}</TableCell>
                        <TableCell className="font-medium">{row.full_name || row.user}</TableCell>
                        <TableCell>{row.father_name || "—"}</TableCell>
                        <TableCell>{row.designation || "—"}</TableCell>
                        <TableCell className="text-center">{row.bps || "—"}</TableCell>
                        <TableCell>{row.cnic || "—"}</TableCell>
                        <TableCell>{row.phone || "—"}</TableCell>
                        <TableCell>{row.date_of_birth || "—"}</TableCell>
                        <TableCell>{row.qualification || "—"}</TableCell>
                        <TableCell>{row.current_posting || "—"}</TableCell>
                        <TableCell>{row.collector_name || "—"}</TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center gap-1">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-blue-600"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleViewEmployee(row)
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-green-600"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-red-600"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Employee Details Dialog */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Employee Details</DialogTitle>
            <DialogDescription>
              Complete information of the selected employee
            </DialogDescription>
          </DialogHeader>
          
          {selectedEmployee && (
            <div className="grid gap-6 py-4">
              {/* Header with Avatar and Basic Info */}
              <div className="flex items-start gap-4 pb-4 border-b">
                <Avatar className="h-20 w-20">
                  <AvatarFallback className="text-lg">
                    {selectedEmployee.full_name
                      ?.split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2) ?? selectedEmployee.user?.slice(0, 2) ?? "—"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">{selectedEmployee.full_name || selectedEmployee.user}</h3>
                  <p className="text-sm text-muted-foreground">{selectedEmployee.designation} • {selectedEmployee.department}</p>
                  <div className="flex gap-2 mt-2">
                    <Badge>{selectedEmployee.role}</Badge>
                    <Badge variant="outline">BPS: {selectedEmployee.bps || "—"}</Badge>
                  </div>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Personal No.</Label>
                  <p className="text-sm font-medium">{selectedEmployee.personal_number || selectedEmployee.user || "—"}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Father's Name</Label>
                  <p className="text-sm font-medium">{selectedEmployee.father_name || "—"}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">CNIC</Label>
                  <p className="text-sm font-medium">{selectedEmployee.cnic || "—"}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Mobile Number</Label>
                  <p className="text-sm font-medium">{selectedEmployee.phone || "—"}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Email</Label>
                  <p className="text-sm font-medium">{selectedEmployee.email || "—"}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Date of Birth</Label>
                  <p className="text-sm font-medium">{selectedEmployee.date_of_birth || "—"}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Qualification</Label>
                  <p className="text-sm font-medium">{selectedEmployee.qualification || "—"}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">BPS</Label>
                  <p className="text-sm font-medium">{selectedEmployee.bps || "—"}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Current Place of Posting</Label>
                  <p className="text-sm font-medium">{selectedEmployee.current_posting || "—"}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Name of Collector</Label>
                  <p className="text-sm font-medium">{selectedEmployee.collector_name || "—"}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Joining Date</Label>
                  <p className="text-sm font-medium">{selectedEmployee.joining_date || "—"}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Emergency Contact</Label>
                  <p className="text-sm font-medium">{selectedEmployee.emergency_contact || "—"}</p>
                </div>
                <div className="col-span-2 space-y-1">
                  <Label className="text-xs text-muted-foreground">Address</Label>
                  <p className="text-sm font-medium">{selectedEmployee.address || "—"}</p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setViewOpen(false)}>
              Close
            </Button>
            <Button className="bg-[#3b82f6] hover:bg-[#2563eb] text-white">
              <Edit className="h-4 w-4 mr-2" />
              Edit Details
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ModulePageLayout>
  )
}