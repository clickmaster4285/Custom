import { useState, useEffect } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { fetchStaffById, updateStaff, type StaffRecord } from "@/lib/staff-api"
import { ROUTES } from "@/routes/config"
import { useToast } from "@/hooks/use-toast"
import { ModulePageLayout } from "@/components/dashboard/module-page-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function EmployeeEditPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const staffId = id ? parseInt(id, 10) : NaN

  const { data: staff, isLoading, isError } = useQuery({
    queryKey: ["staff", staffId],
    queryFn: () => fetchStaffById(staffId),
    enabled: Number.isInteger(staffId),
  })

  const [saving, setSaving] = useState(false)
  const [fullName, setFullName] = useState("")
  const [designation, setDesignation] = useState("")
  const [department, setDepartment] = useState("")
  const [email, setEmail] = useState("")
  const [phonePrimary, setPhonePrimary] = useState("")
  const [jobStatus, setJobStatus] = useState("")
  const [notes, setNotes] = useState("")

  useEffect(() => {
    if (staff) {
      const s = staff as StaffRecord
      setFullName(s.full_name ?? "")
      setDesignation(s.designation ?? "")
      setDepartment(s.department ?? "")
      setEmail(s.email ?? "")
      setPhonePrimary(s.phone_primary ?? "")
      setJobStatus(s.job_status ?? "")
      setNotes(s.notes ?? "")
    }
  }, [staff])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!Number.isInteger(staffId)) return
    setSaving(true)
    try {
      await updateStaff(staffId, {
        full_name: fullName,
        designation,
        department,
        email: email || undefined,
        phone_primary: phonePrimary || undefined,
        job_status: jobStatus || undefined,
        notes: notes || undefined,
      })
      toast({ title: "Employee updated", description: "Changes have been saved." })
      queryClient.invalidateQueries({ queryKey: ["staff", staffId] })
      queryClient.invalidateQueries({ queryKey: ["staff"] })
      navigate(`/employees/${staffId}`)
    } catch (err) {
      toast({
        title: "Update failed",
        description: err instanceof Error ? err.message : "Could not update employee",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (isLoading || !id) {
    return (
      <div className="w-full px-4 sm:px-6 py-8">
        <div className="flex items-center justify-center min-h-[200px] text-muted-foreground">
          {!id ? "Invalid employee" : "Loading…"}
        </div>
      </div>
    )
  }

  if (isError || !staff) {
    return (
      <div className="w-full px-4 sm:px-6 py-8">
        <p className="text-destructive mb-4">Employee not found.</p>
        <Button variant="outline" asChild>
          <Link to={ROUTES.EMPLOYEES}>Back to Employees</Link>
        </Button>
      </div>
    )
  }

  const s = staff as StaffRecord

  return (
    <ModulePageLayout
      title="Edit employee"
      description={`Update details for ${s.full_name ?? "employee"}.`}
      breadcrumbs={[
        { label: "HR", href: ROUTES.EMPLOYEES },
        { label: "Employees", href: ROUTES.EMPLOYEES },
        { label: s.full_name ?? "Detail", href: `/employees/${s.id}` },
        { label: "Edit" },
      ]}
    >
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Basic information</CardTitle>
          <CardDescription>Edit key fields. For full profile use the detail page.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full name *</Label>
                <Input
                  id="full_name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="designation">Designation *</Label>
                <Input
                  id="designation"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">Department *</Label>
                <Input
                  id="department"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone (primary)</Label>
                <Input
                  id="phone"
                  value={phonePrimary}
                  onChange={(e) => setPhonePrimary(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Job status</Label>
                <Select value={jobStatus || "ACTIVE"} onValueChange={setJobStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="ON_LEAVE">On leave</SelectItem>
                    <SelectItem value="PROBATION">Probation</SelectItem>
                    <SelectItem value="RESIGNED">Resigned</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={saving} className="bg-primary text-primary-foreground hover:bg-primary/90">
                {saving ? "Saving…" : "Save changes"}
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link to={`/employees/${s.id}`}>Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </ModulePageLayout>
  )
}
