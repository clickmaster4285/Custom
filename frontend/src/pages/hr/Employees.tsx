import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { useToast } from "@/hooks/use-toast"
import { Users, UserPlus, Building2, Mail, ChevronLeft, ChevronRight } from "lucide-react"
import { ModulePageLayout } from "@/components/dashboard/module-page-layout"
import { StepIndicator } from "@/components/registration/step-indicator"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Camera } from "lucide-react"
import { CameraCapture } from "@/components/camera-capture"
import { API_BASE_URL } from "@/lib/api"
import { fetchStaff, createStaff, type StaffRecord, type CreateStaffPayload } from "@/lib/staff-api"
import { Textarea } from "@/components/ui/textarea"
import { ROUTES, getEmployeeDetailPath } from "@/routes/config"

function staffImageUrl(profileImage: string | null | undefined): string | undefined {
  if (!profileImage) return undefined
  if (profileImage.startsWith("http")) return profileImage
  return `${API_BASE_URL}${profileImage.startsWith("/") ? "" : "/"}${profileImage}`
}

const emptyForm: CreateStaffPayload = {
  first_name: "",
  last_name: "",
  national_id: "",
  date_of_birth: "",
  gender: "",
  marital_status: "",
  blood_group: "",
  email: "",
  phone_primary: "",
  phone_alternate: "",
  street_address: "",
  city: "",
  state: "",
  country: "",
  postal_code: "",
  employee_id: "",
  designation: "",
  department: "",
  branch_location: "",
  manager: "",
  employment_type: "FULL_TIME",
  date_of_joining: new Date().toISOString().slice(0, 10),
  probation_end_date: "",
  work_shift_start: "",
  work_shift_end: "",
  job_status: "ACTIVE",
  salary: "",
  bank_account: "",
  iban: "",
  salary_type: "MONTHLY",
  tax_id: "",
  allowances: "",
  role_access_level: "",
  system_permissions: "",
  emergency_contact_name: "",
  emergency_contact_relationship: "",
  emergency_contact_phone: "",
  emergency_contact_address: "",
  background_check_status: "",
  skills_competencies: "",
  languages_known: "",
  performance_rating: "",
  last_appraisal_date: "",
  leave_balance: "",
  notes: "",
}

const ADD_EMPLOYEE_STEPS = [
  { id: 1, label: "Personal" },
  { id: 2, label: "Contact" },
  { id: 3, label: "Job" },
  { id: 4, label: "Salary" },
  { id: 5, label: "Access" },
  { id: 6, label: "Emergency" },
  { id: 7, label: "Documents" },
  { id: 8, label: "Optional" },
] as const
const TOTAL_STEPS = ADD_EMPLOYEE_STEPS.length
const EMPLOYEE_STEPS_FOR_INDICATOR = ADD_EMPLOYEE_STEPS.map((s) => ({ number: s.id, title: s.label }))

export default function EmployeesPage() {
  const [staff, setStaff] = useState<StaffRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [addOpen, setAddOpen] = useState(false)
  const [step, setStep] = useState(1)
  const [form, setForm] = useState<CreateStaffPayload>(emptyForm)
  const [profileImage, setProfileImage] = useState<File | null>(null)
  const [docFiles, setDocFiles] = useState<{
    resume_file?: File | null;
    joining_letter_file?: File | null;
    contract_file?: File | null;
    id_proof_file?: File | null;
    tax_form_file?: File | null;
    certificates_file?: File | null;
  }>({})
  const [cameraOpen, setCameraOpen] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const { toast } = useToast()

  const handleCancelForm = () => {
    setAddOpen(false)
    setSubmitError(null)
    setStep(1)
  }

  const loadStaff = () => {
    setLoading(true)
    setError(null)
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
        ...docFiles,
      })
      toast({ title: "Employee added", description: "The new staff record has been created." })
      setForm(emptyForm)
      setProfileImage(null)
      setDocFiles({})
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
      (s.user_details?.username ?? "").toLowerCase().includes(search.toLowerCase()) ||
      s.department?.toLowerCase().includes(search.toLowerCase()) ||
      s.designation?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <>
      {!addOpen ? (
        <ModulePageLayout
          title="Employees"
          description="Manage employee records, departments, and contact information. Add a new employee to start."
          breadcrumbs={[
            { label: "HR", href: ROUTES.EMPLOYEES },
            { label: "Employees" },
          ]}
        >
          <div className="flex items-center justify-between mb-6">
            <Button
              onClick={() => {
                setStep(1)
                setSubmitError(null)
                setAddOpen(true)
              }}
              className="bg-[#3b82f6] hover:bg-[#2563eb] text-white"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Add Staff
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-4 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Employees</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{staff.length}</div>
                <p className="text-xs text-muted-foreground mt-1">Active</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Departments</CardTitle>
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
                <CardTitle className="text-sm font-medium text-muted-foreground">Staff</CardTitle>
                <UserPlus className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{staff.length}</div>
                <p className="text-xs text-muted-foreground mt-1">Total</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">On Leave Today</CardTitle>
                <Mail className="h-4 w-4 text-amber-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">—</div>
                <p className="text-xs text-muted-foreground mt-1">N/A</p>
              </CardContent>
            </Card>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-foreground">Employee Directory</h2>
            </div>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardDescription>Search and manage employee records</CardDescription>
                <Input
                  placeholder="Search by name, department, designation..."
                  className="w-64"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </CardHeader>
              <CardContent>
                {error && <p className="text-sm text-destructive mb-4">{error}</p>}
                {loading ? (
                  <div className="py-6 space-y-3">
                    <div className="h-4 w-3/4 max-w-md rounded bg-muted animate-pulse" />
                    <div className="h-10 rounded bg-muted animate-pulse" />
                    <div className="h-10 rounded bg-muted animate-pulse" />
                    <div className="h-10 rounded bg-muted animate-pulse" />
                    <p className="text-sm text-muted-foreground pt-2">Loading staff…</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Employee</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Designation</TableHead>
                        <TableHead>Linked account</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filtered.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                            No staff found. Click &quot;Add Staff&quot; to create a record.
                          </TableCell>
                        </TableRow>
                      ) : (
                        filtered.map((row) => (
                          <TableRow key={row.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={staffImageUrl(row.profile_image)} alt="" />
                                  <AvatarFallback className="text-xs">
                                    {row.full_name?.split(" ").map((n) => n[0]).join("").slice(0, 2) ?? "—"}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="font-medium">{row.full_name ?? "—"}</span>
                              </div>
                            </TableCell>
                            <TableCell>{row.department ?? "—"}</TableCell>
                            <TableCell>{row.designation ?? "—"}</TableCell>
                            <TableCell>
                              {row.user != null ? <Badge variant="default">Linked</Badge> : <span className="text-muted-foreground">—</span>}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="sm" className="text-[#3b82f6]" asChild>
                                <Link to={getEmployeeDetailPath(row.id)}>View</Link>
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
      ) : (
        <>
          {/* Form view - same layout as PreRegistration: title, StepIndicator, one card, footer */}
          <div className="text-sm text-muted-foreground mb-4">
            <Link to={ROUTES.DASHBOARD} className="hover:text-foreground">Home</Link>
            <span className="mx-2">/</span>
            <Link to={ROUTES.EMPLOYEES} className="hover:text-foreground">HR</Link>
            <span className="mx-2">/</span>
            <span className="text-primary font-medium">New Employee</span>
          </div>
          <div className="mb-6">
            <h1 className="text-xl font-semibold text-foreground">New Employee</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Complete the employee fields step by step. Required fields are marked with *.
            </p>
          </div>

          <StepIndicator steps={EMPLOYEE_STEPS_FOR_INDICATOR} currentStep={step} />

          <form onSubmit={handleAddStaff}>
            {submitError && <p className="text-sm text-destructive mt-4">{submitError}</p>}
            <div className="bg-background rounded-lg border border-border p-6 mt-6">
                      <div className="w-full">
                        {step === 1 && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div className="space-y-2"><Label>First name *</Label><Input value={form.first_name} onChange={(e) => setForm((f) => ({ ...f, first_name: e.target.value }))} required /></div>
                            <div className="space-y-2"><Label>Last name *</Label><Input value={form.last_name} onChange={(e) => setForm((f) => ({ ...f, last_name: e.target.value }))} required /></div>
                            <div className="space-y-2"><Label>Date of birth</Label><Input type="date" value={form.date_of_birth ?? ""} onChange={(e) => setForm((f) => ({ ...f, date_of_birth: e.target.value }))} /></div>
                            <div className="space-y-2"><Label>Gender</Label>
                              <Select value={form.gender || ""} onValueChange={(v) => setForm((f) => ({ ...f, gender: v }))}>
                                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                                <SelectContent><SelectItem value="Male">Male</SelectItem><SelectItem value="Female">Female</SelectItem><SelectItem value="Other">Other</SelectItem></SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2 sm:col-span-2"><Label>National ID / Passport *</Label><Input value={form.national_id} onChange={(e) => setForm((f) => ({ ...f, national_id: e.target.value }))} placeholder="35202-1234567-8" required /></div>
                            <div className="space-y-2"><Label>Marital status</Label>
                              <Select value={form.marital_status || ""} onValueChange={(v) => setForm((f) => ({ ...f, marital_status: v }))}>
                                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                                <SelectContent><SelectItem value="Single">Single</SelectItem><SelectItem value="Married">Married</SelectItem><SelectItem value="Divorced">Divorced</SelectItem><SelectItem value="Widowed">Widowed</SelectItem></SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2"><Label>Blood group</Label>
                              <Select value={form.blood_group || ""} onValueChange={(v) => setForm((f) => ({ ...f, blood_group: v }))}>
                                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                                <SelectContent>{["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((bg) => <SelectItem key={bg} value={bg}>{bg}</SelectItem>)}</SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2 sm:col-span-2 lg:col-span-3"><Label>Profile picture</Label>
                              <div className="flex flex-wrap gap-2 items-center">
                                <Input type="file" accept="image/*" className="max-w-xs" onChange={(e) => setProfileImage(e.target.files?.[0] ?? null)} />
                                <Button type="button" variant="outline" size="sm" onClick={() => setCameraOpen(true)}><Camera className="h-4 w-4 mr-2" /> Capture</Button>
                                {profileImage && <span className="text-xs text-muted-foreground">{profileImage.name}</span>}
                              </div>
                              <Dialog open={cameraOpen} onOpenChange={setCameraOpen}>
                                <DialogContent className="max-w-md"><CameraCapture title="Capture staff photo" description="Position the staff member in frame and capture." onCapture={(file) => { setProfileImage(file); setCameraOpen(false); }} onCancel={() => setCameraOpen(false)} /></DialogContent>
                              </Dialog>
                            </div>
                          </div>
                        )}
                        {step === 2 && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div className="space-y-2"><Label>Email</Label><Input type="email" value={form.email ?? ""} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} /></div>
                            <div className="space-y-2"><Label>Phone (primary)</Label><Input value={form.phone_primary ?? ""} onChange={(e) => setForm((f) => ({ ...f, phone_primary: e.target.value }))} /></div>
                            <div className="space-y-2"><Label>Phone (alternate)</Label><Input value={form.phone_alternate ?? ""} onChange={(e) => setForm((f) => ({ ...f, phone_alternate: e.target.value }))} /></div>
                            <div className="space-y-2 sm:col-span-2 lg:col-span-3"><Label>Street address *</Label><Input value={form.street_address ?? ""} onChange={(e) => setForm((f) => ({ ...f, street_address: e.target.value }))} required /></div>
                            <div className="space-y-2"><Label>City</Label><Input value={form.city ?? ""} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} /></div>
                            <div className="space-y-2"><Label>State / Province</Label><Input value={form.state ?? ""} onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))} /></div>
                            <div className="space-y-2"><Label>Country</Label><Input value={form.country ?? ""} onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))} /></div>
                            <div className="space-y-2"><Label>Postal code</Label><Input value={form.postal_code ?? ""} onChange={(e) => setForm((f) => ({ ...f, postal_code: e.target.value }))} /></div>
                          </div>
                        )}
                        {step === 3 && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div className="space-y-2"><Label>Employee ID</Label><Input value={form.employee_id ?? ""} onChange={(e) => setForm((f) => ({ ...f, employee_id: e.target.value }))} /></div>
                            <div className="space-y-2"><Label>Designation *</Label><Input value={form.designation} onChange={(e) => setForm((f) => ({ ...f, designation: e.target.value }))} required /></div>
                            <div className="space-y-2"><Label>Department *</Label><Input value={form.department} onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))} required /></div>
                            <div className="space-y-2"><Label>Branch / Office</Label><Input value={form.branch_location ?? ""} onChange={(e) => setForm((f) => ({ ...f, branch_location: e.target.value }))} /></div>
                            <div className="space-y-2"><Label>Manager / Supervisor</Label><Input value={form.manager ?? ""} onChange={(e) => setForm((f) => ({ ...f, manager: e.target.value }))} /></div>
                            <div className="space-y-2"><Label>Employment type</Label>
                              <Select value={form.employment_type || ""} onValueChange={(v) => setForm((f) => ({ ...f, employment_type: v }))}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent><SelectItem value="FULL_TIME">Full-time</SelectItem><SelectItem value="PART_TIME">Part-time</SelectItem><SelectItem value="CONTRACT">Contract</SelectItem><SelectItem value="INTERN">Intern</SelectItem></SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2"><Label>Date of joining *</Label><Input type="date" value={form.date_of_joining ?? ""} onChange={(e) => setForm((f) => ({ ...f, date_of_joining: e.target.value }))} required /></div>
                            <div className="space-y-2"><Label>Probation end date</Label><Input type="date" value={form.probation_end_date ?? ""} onChange={(e) => setForm((f) => ({ ...f, probation_end_date: e.target.value }))} /></div>
                            <div className="space-y-2"><Label>Work shift start</Label><Input type="time" value={form.work_shift_start ?? ""} onChange={(e) => setForm((f) => ({ ...f, work_shift_start: e.target.value }))} /></div>
                            <div className="space-y-2"><Label>Work shift end</Label><Input type="time" value={form.work_shift_end ?? ""} onChange={(e) => setForm((f) => ({ ...f, work_shift_end: e.target.value }))} /></div>
                            <div className="space-y-2"><Label>Job status</Label>
                              <Select value={form.job_status || ""} onValueChange={(v) => setForm((f) => ({ ...f, job_status: v }))}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent><SelectItem value="ACTIVE">Active</SelectItem><SelectItem value="ON_LEAVE">On leave</SelectItem><SelectItem value="PROBATION">Probation</SelectItem><SelectItem value="RESIGNED">Resigned</SelectItem></SelectContent>
                              </Select>
                            </div>
                          </div>
                        )}
                        {step === 4 && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div className="space-y-2"><Label>Salary</Label><Input type="number" value={form.salary ?? ""} onChange={(e) => setForm((f) => ({ ...f, salary: e.target.value }))} /></div>
                            <div className="space-y-2"><Label>Bank account / IBAN</Label><Input value={form.iban ?? ""} onChange={(e) => setForm((f) => ({ ...f, iban: e.target.value }))} /></div>
                            <div className="space-y-2"><Label>Salary type</Label>
                              <Select value={form.salary_type || ""} onValueChange={(v) => setForm((f) => ({ ...f, salary_type: v }))}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent><SelectItem value="MONTHLY">Monthly</SelectItem><SelectItem value="HOURLY">Hourly</SelectItem><SelectItem value="WEEKLY">Weekly</SelectItem></SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2"><Label>Tax ID / SSN</Label><Input value={form.tax_id ?? ""} onChange={(e) => setForm((f) => ({ ...f, tax_id: e.target.value }))} /></div>
                            <div className="space-y-2 sm:col-span-2 lg:col-span-3"><Label>Allowances / Benefits</Label><Textarea value={form.allowances ?? ""} onChange={(e) => setForm((f) => ({ ...f, allowances: e.target.value }))} rows={2} /></div>
                          </div>
                        )}
                        {step === 5 && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div className="space-y-2"><Label>Role / Access level</Label><Input value={form.role_access_level ?? ""} onChange={(e) => setForm((f) => ({ ...f, role_access_level: e.target.value }))} /></div>
                            <div className="space-y-2 sm:col-span-2"><Label>System permissions</Label><Textarea value={form.system_permissions ?? ""} onChange={(e) => setForm((f) => ({ ...f, system_permissions: e.target.value }))} rows={2} /></div>
                          </div>
                        )}
                        {step === 6 && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div className="space-y-2"><Label>Emergency contact name *</Label><Input value={form.emergency_contact_name ?? ""} onChange={(e) => setForm((f) => ({ ...f, emergency_contact_name: e.target.value }))} /></div>
                            <div className="space-y-2"><Label>Relationship</Label><Input value={form.emergency_contact_relationship ?? ""} onChange={(e) => setForm((f) => ({ ...f, emergency_contact_relationship: e.target.value }))} /></div>
                            <div className="space-y-2"><Label>Emergency contact phone *</Label><Input value={form.emergency_contact_phone ?? ""} onChange={(e) => setForm((f) => ({ ...f, emergency_contact_phone: e.target.value }))} required /></div>
                            <div className="space-y-2 sm:col-span-2 lg:col-span-3"><Label>Emergency contact address</Label><Input value={form.emergency_contact_address ?? ""} onChange={(e) => setForm((f) => ({ ...f, emergency_contact_address: e.target.value }))} /></div>
                          </div>
                        )}
                        {step === 7 && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div className="space-y-2"><Label>Resume / CV</Label><Input type="file" accept=".pdf,.doc,.docx" onChange={(e) => setDocFiles((d) => ({ ...d, resume_file: e.target.files?.[0] ?? null }))} /></div>
                            <div className="space-y-2"><Label>Joining letter</Label><Input type="file" accept=".pdf,.doc,.docx,image/*" onChange={(e) => setDocFiles((d) => ({ ...d, joining_letter_file: e.target.files?.[0] ?? null }))} /></div>
                            <div className="space-y-2"><Label>Contract / Agreement</Label><Input type="file" accept=".pdf,.doc,.docx,image/*" onChange={(e) => setDocFiles((d) => ({ ...d, contract_file: e.target.files?.[0] ?? null }))} /></div>
                            <div className="space-y-2"><Label>ID proof</Label><Input type="file" accept=".pdf,image/*" onChange={(e) => setDocFiles((d) => ({ ...d, id_proof_file: e.target.files?.[0] ?? null }))} /></div>
                            <div className="space-y-2"><Label>Tax form</Label><Input type="file" accept=".pdf,image/*" onChange={(e) => setDocFiles((d) => ({ ...d, tax_form_file: e.target.files?.[0] ?? null }))} /></div>
                            <div className="space-y-2"><Label>Certificates</Label><Input type="file" accept=".pdf,.doc,.docx,image/*" onChange={(e) => setDocFiles((d) => ({ ...d, certificates_file: e.target.files?.[0] ?? null }))} /></div>
                            <div className="space-y-2"><Label>Background check status</Label><Input value={form.background_check_status ?? ""} onChange={(e) => setForm((f) => ({ ...f, background_check_status: e.target.value }))} placeholder="e.g. Cleared" /></div>
                          </div>
                        )}
                        {step === 8 && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div className="space-y-2 sm:col-span-2 lg:col-span-3"><Label>Skills &amp; competencies</Label><Textarea value={form.skills_competencies ?? ""} onChange={(e) => setForm((f) => ({ ...f, skills_competencies: e.target.value }))} rows={2} /></div>
                            <div className="space-y-2"><Label>Languages known</Label><Input value={form.languages_known ?? ""} onChange={(e) => setForm((f) => ({ ...f, languages_known: e.target.value }))} /></div>
                            <div className="space-y-2"><Label>Performance rating</Label><Input value={form.performance_rating ?? ""} onChange={(e) => setForm((f) => ({ ...f, performance_rating: e.target.value }))} /></div>
                            <div className="space-y-2"><Label>Last appraisal date</Label><Input type="date" value={form.last_appraisal_date ?? ""} onChange={(e) => setForm((f) => ({ ...f, last_appraisal_date: e.target.value }))} /></div>
                            <div className="space-y-2"><Label>Leave balance</Label><Input type="number" value={form.leave_balance ?? ""} onChange={(e) => setForm((f) => ({ ...f, leave_balance: e.target.value }))} /></div>
                            <div className="space-y-2 sm:col-span-2 lg:col-span-3"><Label>Notes / Remarks</Label><Textarea value={form.notes ?? ""} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} rows={3} /></div>
                          </div>
                        )}
                      </div>
                    </div>
          </form>

          {/* Footer - same as PreRegistration */}
          <div className="flex items-center justify-between mt-6">
            <div className="flex items-center gap-4">
              <Button variant="outline" className="bg-transparent" onClick={handleCancelForm}>
                Back to list
              </Button>
              <button
                type="button"
                className="text-[#3b82f6] text-sm font-medium hover:underline"
                onClick={() => setStep((s) => (s < TOTAL_STEPS ? s + 1 : s))}
              >
                Save &amp; Continue
              </button>
            </div>
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep((s) => s - 1)}
                disabled={step === 1}
                className={`bg-transparent ${step === 1 ? "opacity-50 cursor-not-allowed" : "border-[#3b82f6] text-[#3b82f6] hover:bg-[#3b82f6]/10"}`}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </Button>
              {step < TOTAL_STEPS ? (
                <Button
                  type="button"
                  onClick={() => setStep((s) => s + 1)}
                  className="bg-[#3b82f6] hover:bg-[#2563eb] text-white"
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={() => handleAddStaff({ preventDefault: () => {} } as React.FormEvent)}
                  disabled={submitting}
                  className="bg-[#3b82f6] hover:bg-[#2563eb] text-white"
                >
                  {submitting ? "Submitting…" : "Add Employee"}
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              )}
            </div>
          </div>
        </>
      )}
    </>
  )
}
