import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Users, UserPlus, Building2, Mail, Search, Eye, Edit, Trash2 } from "lucide-react"
import { ModulePageLayout } from "@/components/dashboard/module-page-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { API_BASE_URL } from "@/lib/api"
import { fetchStaff, deleteStaff, type StaffRecord } from "@/lib/staff-api"
import { ROUTES, getEmployeeDetailPath } from "@/routes/config"
import { useToast } from "@/hooks/use-toast"

function staffImageUrl(profileImage: string | null | undefined, id?: number): string {
  if (profileImage) {
    if (profileImage.startsWith("data:")) return profileImage
    if (profileImage.startsWith("http")) return profileImage
    return `${API_BASE_URL}${profileImage.startsWith("/") ? "" : "/"}${profileImage}`
  }
  const seed = id ?? Math.floor(Math.random() * 1000)
  return `https://i.pravatar.cc/150?u=${seed}`
}

export default function EmployeesPage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [staff, setStaff] = useState<StaffRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")

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
    navigate(getEmployeeDetailPath(employee.id))
  }

  const handleDeleteEmployee = async (id: number) => {
    if (!confirm("Are you sure you want to delete this employee?")) return
    try {
      await deleteStaff(id)
      toast({ title: "Employee deleted", description: "The record has been removed." })
      loadStaff()
    } catch (err) {
      toast({ 
        title: "Delete failed", 
        description: err instanceof Error ? err.message : "Failed to delete employee",
        variant: "destructive"
      })
    }
  }

  const filtered = staff.filter(
    (s) =>
      s.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      (s.personal_number?.toString() || "").toLowerCase().includes(search.toLowerCase()) ||
      (s.user?.toString() || "").toLowerCase().includes(search.toLowerCase()) ||
      s.department?.toLowerCase().includes(search.toLowerCase()) ||
      s.designation?.toLowerCase().includes(search.toLowerCase()) ||
      s.cnic?.includes(search) ||
      s.phone?.includes(search) ||
      s.transferred_from?.toLowerCase().includes(search.toLowerCase()) ||
      s.transferred_to?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <ModulePageLayout
      title="Employees"
      description="Disposition list of Assistant/Deputy Collectors of respect of Collectorate of Customs (Enforcement), Peshawar."
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
              <CardTitle className="text-xl font-semibold">Employee Directory</CardTitle>
              <CardDescription>Search and manage employee records</CardDescription>
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
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="w-12 text-center">S.No.</TableHead>
                    <TableHead>Personal No.</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Designation</TableHead>
                    <TableHead className="text-center">BPS</TableHead>
                    <TableHead>CNIC</TableHead>
                    <TableHead>Mobile No.</TableHead>
                    <TableHead>Current place of Posting</TableHead>
                    <TableHead>Transferred From</TableHead>
                    <TableHead>Transferred To</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={11} className="text-center text-muted-foreground py-8">
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
                        <TableCell>{row.personal_number || row.user || row.employee_id || "—"}</TableCell>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                             <Avatar className="h-6 w-6">
                                <AvatarImage src={staffImageUrl(row.profile_image, row.id)} alt="" />
                                <AvatarFallback className="text-[10px]">
                                  {row.full_name?.split(" ").map((n) => n[0]).join("").slice(0, 2) ?? "—"}
                                </AvatarFallback>
                              </Avatar>
                              <span className="truncate max-w-[150px]">{row.full_name || row.user}</span>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-[150px] truncate">{row.designation || "—"}</TableCell>
                        <TableCell className="text-center">{row.bps || "—"}</TableCell>
                        <TableCell className="whitespace-nowrap">{row.cnic || "—"}</TableCell>
                        <TableCell className="whitespace-nowrap">{row.phone || row.phone_primary || "—"}</TableCell>
                        <TableCell className="max-w-[200px] truncate">{row.current_posting || row.branch_location || "—"}</TableCell>
                        <TableCell className="max-w-[150px] truncate">{row.transferred_from || "—"}</TableCell>
                        <TableCell className="max-w-[150px] truncate">{row.transferred_to || "—"}</TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center gap-1">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-blue-600"
                              onClick={(e) => {
                                e.stopPropagation()
                                navigate(getEmployeeDetailPath(row.id))
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-green-600"
                              onClick={(e) => {
                                e.stopPropagation()
                                navigate(`/employees/${row.id}/edit`)
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-red-600"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDeleteEmployee(row.id)
                              }}
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
    </ModulePageLayout>
  )
}