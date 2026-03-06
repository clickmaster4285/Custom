import { Camera, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import type { UploadValue } from "@/components/hr/add-staff/step2-documents-upload"
import { CameraCapture } from "@/components/camera-capture"
import { useFormik } from "formik"
import * as Yup from "yup"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type EmployeeCategory = "new" | "existing"

export type AddStaffStep1Form = {
  personal_number?: string
  full_name?: string
  father_name?: string
  gender?: string
  cnic?: string
  date_of_birth?: string
  phone?: string
  email?: string
  qualification?: string
  address?: string
  bps?: string
  department?: string
  designation?: string
  role?: string
  employment_type?: string
  joining_date?: string
  current_posting?: string
  collector_name?: string
  emergency_contact?: string
  emergency_contact_name?: string
  emergency_contact_relationship?: string
  emergency_contact_phone?: string
  emergency_contact_address?: string
}

export function AddStaffStep1PersonalInfo({
  employeeCategory: _employeeCategory,
  onEmployeeCategoryChange: _onEmployeeCategoryChange,
  form,
  updateForm,
  staffPhotos,
  cameraOpen,
  onOpenCamera,
  onCaptureFromCamera,
  onCloseCamera,
  onUploadPhotoClick,
  onRemovePhoto,
  onCancel,
  onReset,
  onSaveAndContinue,
  onSaveToDraft,
  roleOptions,
  departmentOptions,
  employmentTypeOptions,
  bpsOptions,
  qualificationOptions,
}: {
  employeeCategory: EmployeeCategory
  onEmployeeCategoryChange: (value: EmployeeCategory) => void
  form: AddStaffStep1Form
  updateForm: (patch: Partial<AddStaffStep1Form>) => void
  staffPhotos: UploadValue[]
  cameraOpen?: boolean
  onOpenCamera: () => void
  onCaptureFromCamera?: (file: File) => void
  onCloseCamera?: () => void
  onUploadPhotoClick: () => void
  onRemovePhoto: (index: number) => void
  onCancel: () => void
  onReset: () => void
  onSaveAndContinue: () => void
  onSaveToDraft?: () => void
  roleOptions: { value: string; label: string }[]
  departmentOptions: { value: string; label: string }[]
  employmentTypeOptions: { value: string; label: string }[]
  bpsOptions: { value: string; label: string }[]
  qualificationOptions: { value: string; label: string }[]
}) {
  const maxPhotos = 5
  const filled = staffPhotos.slice(0, maxPhotos)
  const emptySlots = Math.max(0, maxPhotos - filled.length)

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      personal_number: form.personal_number ?? "",
      full_name: form.full_name ?? "",
      gender: form.gender ?? "",
      cnic: form.cnic ?? "",
      date_of_birth: form.date_of_birth ?? "",
      phone: form.phone ?? "",
      address: form.address ?? "",
      department: form.department ?? "",
      designation: form.designation ?? "",
      role: form.role ?? "",
      joining_date: form.joining_date ?? "",
      emergency_contact_name: form.emergency_contact_name ?? "",
      emergency_contact_relationship: form.emergency_contact_relationship ?? "",
      emergency_contact_phone: form.emergency_contact_phone ?? form.emergency_contact ?? "",
      emergency_contact_address: form.emergency_contact_address ?? "",
    },
    validationSchema: Yup.object({
      personal_number: Yup.string().trim().required("Personal number is required"),
      full_name: Yup.string().trim().required("Full name is required"),
      gender: Yup.string().trim().required("Gender is required"),
      cnic: Yup.string().trim().required("CNIC is required"),
      phone: Yup.string().trim().required("Mobile number is required"),
      department: Yup.string().trim().required("Department is required"),
      designation: Yup.string().trim().required("Designation is required"),
      role: Yup.string().trim().required("Role is required"),
      date_of_birth: Yup.string().trim(),
      joining_date: Yup.string().trim(),
      address: Yup.string().trim(),
      emergency_contact_name: Yup.string().trim(),
      emergency_contact_relationship: Yup.string().trim(),
      emergency_contact_phone: Yup.string().trim(),
      emergency_contact_address: Yup.string().trim(),
    }),
    onSubmit: () => {},
  })

  const handleSubmit = () => {
    const keys = Object.keys(formik.initialValues) as (keyof typeof formik.initialValues)[]
    const touched = keys.reduce((acc, k) => {
      acc[k] = true
      return acc
    }, {} as Record<string, boolean>)
    formik.setTouched(touched, true)
    formik.validateForm().then((errs) => {
      if (Object.keys(errs).length === 0 && onSaveAndContinue) onSaveAndContinue()
    })
  }

  // Helper function to render label with asterisk for required fields
  const RequiredLabel = ({ children, required = true }: { children: React.ReactNode; required?: boolean }) => (
    <Label className="text-base text-foreground">
      {children}
      {required && <span className="text-destructive ml-1">*</span>}
    </Label>
  )

  return (
    <div className="space-y-8">
      {/* Personal Details */}
      <div className="space-y-4">
        <Label className="text-[22px] font-bold text-foreground">Personal Details</Label>

        {/* Photograph Upload */}
        <div className="space-y-2">
          <Label className="text-base font-medium text-foreground">Photograph Upload</Label>
          <div className="flex flex-col sm:flex-row gap-4 items-start">
            {/* Capture/Upload Box */}
            <div
              className={cn(
                "flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed bg-muted/20 py-6 px-3 transition-colors min-w-0 shrink-0",
                "border-muted-foreground/30 hover:border-primary/40 hover:bg-muted/30 w-[280px]"
              )}
            >
              {cameraOpen && onCaptureFromCamera ? (
                <div className="w-full">
                  <CameraCapture
                    title="Capture staff photo"
                    description="Capture a photo to add into staff images."
                    onCapture={(file) => onCaptureFromCamera(file)}
                    onCancel={onCloseCamera}
                  />
                </div>
              ) : (
                <>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <Camera className="h-6 w-6 text-primary" />
                  </div>
                  <p className="text-sm font-medium text-muted-foreground text-center">
                    Upload a Staff Photograph
                  </p>
                  <p className="text-xs text-muted-foreground text-center">
                    Image size: Max 2MB, Format JPG/PNG. Up to 5 images for recognition.
                  </p>
                  <div className="flex flex-col gap-2 w-full">
                    <Button
                      type="button"
                      onClick={onOpenCamera}
                      disabled={filled.length >= maxPhotos}
                      className="rounded-md bg-[#3366FF] hover:bg-[#2952CC] px-4 py-2 text-sm font-semibold text-white w-full"
                    >
                      Capture from camera
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={onUploadPhotoClick}
                      disabled={filled.length >= maxPhotos}
                      className="w-full"
                    >
                      Upload Photo
                    </Button>
                  </div>
                </>
              )}
            </div>

            {/* Captured Images Grid */}
            <div className="flex flex-col gap-3 min-w-0 flex-1">
              <p className="text-sm font-medium text-muted-foreground">Captured images</p>
              <div className="overflow-x-auto overflow-y-hidden pb-2">
                <div className="grid grid-cols-5 gap-3 min-w-[calc(12rem*5+0.75rem*4)] w-max">
                  {filled.map((img, idx) => (
                    <div key={idx} className="relative h-[14.5rem] w-48 shrink-0">
                      {img.previewUrl ? (
                        <>
                          <img
                            src={img.previewUrl}
                            alt={`Staff ${idx + 1}`}
                            className="h-full w-full rounded-md border border-border object-cover bg-muted"
                          />
                          <button
                            type="button"
                            onClick={() => onRemovePhoto(idx)}
                            className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow"
                            aria-label="Remove photo"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </>
                      ) : (
                        <div className="h-full w-full rounded-md border-2 border-dashed border-muted-foreground/40 bg-white flex items-center justify-center">
                          <span className="text-sm text-muted-foreground">{idx + 1}</span>
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {Array.from({ length: emptySlots }).map((_, i) => {
                    const slotNumber = filled.length + i + 1
                    return (
                      <div
                        key={`empty-${slotNumber}`}
                        className="relative h-[14.5rem] w-48 shrink-0 rounded-md border-2 border-dashed border-muted-foreground/40 bg-white flex items-center justify-center"
                      >
                        <span className="text-sm text-muted-foreground">{slotNumber}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
              <p className="text-xs text-muted-foreground">{filled.length} / {maxPhotos} images</p>
            </div>
          </div>
        </div>

        {/* Personal Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <RequiredLabel>Personal Number</RequiredLabel>
            <Input
              placeholder="e.g. 12345"
              name="personal_number"
              value={formik.values.personal_number}
              onChange={(e) => {
                formik.handleChange(e)
                updateForm({ personal_number: e.target.value })
              }}
              onBlur={formik.handleBlur}
              className={cn(
                "h-10 text-base bg-background border-border",
                formik.touched.personal_number && formik.errors.personal_number ? "border-destructive" : ""
              )}
            />
            {formik.touched.personal_number && formik.errors.personal_number ? (
              <p className="text-sm text-destructive">{formik.errors.personal_number}</p>
            ) : (
              <p className="text-sm text-muted-foreground">(Employee ID)</p>
            )}
          </div>

          <div className="space-y-2">
            <RequiredLabel>Full Name (As per CNIC/Passport)</RequiredLabel>
            <Input
              placeholder="e.g. Mohammad Ali Hassan"
              name="full_name"
              value={formik.values.full_name}
              onChange={(e) => {
                formik.handleChange(e)
                updateForm({ full_name: e.target.value })
              }}
              onBlur={formik.handleBlur}
              className={cn(
                "h-10 text-base bg-background border-border",
                formik.touched.full_name && formik.errors.full_name ? "border-destructive" : ""
              )}
            />
            {formik.touched.full_name && formik.errors.full_name ? (
              <p className="text-sm text-destructive">{formik.errors.full_name}</p>
            ) : (
              <p className="text-sm text-muted-foreground">(As per CNIC/Passport)</p>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-base text-foreground">Father's Name</Label>
            <Input
              placeholder="e.g. Ahmed Hassan"
              value={form.father_name || ""}
              onChange={(e) => updateForm({ father_name: e.target.value })}
              className="h-10 text-base bg-background border-border"
            />
          </div>

          <div className="space-y-2">
            <RequiredLabel>Gender</RequiredLabel>
            <Select
              value={formik.values.gender || undefined}
              onValueChange={(value) => {
                formik.setFieldValue("gender", value, true)
                updateForm({ gender: value })
              }}
              onOpenChange={(open) => {
                if (!open) formik.setFieldTouched("gender", true, true)
              }}
            >
              <SelectTrigger
                className={cn(
                  "w-full h-10 bg-background border-border",
                  formik.touched.gender && formik.errors.gender ? "border-destructive" : ""
                )}
              >
                <SelectValue placeholder="Male/Female/Other" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            {formik.touched.gender && formik.errors.gender ? (
              <p className="text-sm text-destructive">{formik.errors.gender}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <RequiredLabel>CNIC Number</RequiredLabel>
            <Input
              placeholder="00000-0000000-0"
              name="cnic"
              value={formik.values.cnic}
              onChange={(e) => {
                formik.handleChange(e)
                updateForm({ cnic: e.target.value })
              }}
              onBlur={formik.handleBlur}
              className={cn(
                "h-10 text-base bg-background border-border",
                formik.touched.cnic && formik.errors.cnic ? "border-destructive" : ""
              )}
            />
            {formik.touched.cnic && formik.errors.cnic ? (
              <p className="text-sm text-destructive">{formik.errors.cnic}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label className="text-base text-foreground">Date of Birth</Label>
            <Input
              type="date"
              name="date_of_birth"
              value={formik.values.date_of_birth}
              onChange={(e) => {
                formik.handleChange(e)
                updateForm({ date_of_birth: e.target.value })
              }}
              onBlur={formik.handleBlur}
              className={cn(
                "h-10 text-base bg-background border-border",
                formik.touched.date_of_birth && formik.errors.date_of_birth ? "border-destructive" : ""
              )}
            />
            {formik.touched.date_of_birth && formik.errors.date_of_birth ? (
              <p className="text-sm text-destructive">{formik.errors.date_of_birth}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <RequiredLabel>Mobile Number</RequiredLabel>
            <Input
              placeholder="0000-0000000"
              name="phone"
              value={formik.values.phone}
              onChange={(e) => {
                formik.handleChange(e)
                updateForm({ phone: e.target.value })
              }}
              onBlur={formik.handleBlur}
              className={cn(
                "h-10 text-base bg-background border-border",
                formik.touched.phone && formik.errors.phone ? "border-destructive" : ""
              )}
            />
            {formik.touched.phone && formik.errors.phone ? (
              <p className="text-sm text-destructive">{formik.errors.phone}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label className="text-base text-foreground">Email Address</Label>
            <Input
              type="email"
              placeholder="emailaddress@email.com"
              value={form.email || ""}
              onChange={(e) => updateForm({ email: e.target.value })}
              className="h-10 text-base bg-background border-border"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-base text-foreground">Qualification</Label>
            <Select
              value={form.qualification || undefined}
              onValueChange={(value) => updateForm({ qualification: value })}
            >
              <SelectTrigger className="w-full h-10 bg-background border-border">
                <SelectValue placeholder="Select qualification" />
              </SelectTrigger>
              <SelectContent>
                {qualificationOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 md:col-span-2">
            <RequiredLabel required={false}>Residential Address</RequiredLabel>
            <Textarea
              placeholder="e.g. House #, Street Name, City"
              name="address"
              value={formik.values.address}
              onChange={(e) => {
                formik.handleChange(e)
                updateForm({ address: e.target.value })
              }}
              onBlur={formik.handleBlur}
              className={cn(
                "min-h-20 text-base bg-background border-border resize-none",
                formik.touched.address && formik.errors.address ? "border-destructive" : ""
              )}
            />
            {formik.touched.address && formik.errors.address ? (
              <p className="text-sm text-destructive">{formik.errors.address}</p>
            ) : (
              <p className="text-sm text-muted-foreground">(Employee Address)</p>
            )}
          </div>
        </div>
      </div>

      {/* Employment Information */}
      <div className="space-y-4">
        <Label className="text-[22px] font-bold text-foreground">Employment Information</Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label className="text-base text-foreground">BPS</Label>
            <Select value={form.bps || undefined} onValueChange={(value) => updateForm({ bps: value })}>
              <SelectTrigger className="w-full h-10 bg-background border-border">
                <SelectValue placeholder="Select BPS" />
              </SelectTrigger>
              <SelectContent>
                {bpsOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <RequiredLabel>Department</RequiredLabel>
            <Select
              value={formik.values.department || undefined}
              onValueChange={(value) => {
                formik.setFieldValue("department", value, true)
                updateForm({ department: value })
              }}
              onOpenChange={(open) => {
                if (!open) formik.setFieldTouched("department", true, true)
              }}
            >
              <SelectTrigger
                className={cn(
                  "w-full h-10 bg-background border-border",
                  formik.touched.department && formik.errors.department ? "border-destructive" : ""
                )}
              >
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                {departmentOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {formik.touched.department && formik.errors.department ? (
              <p className="text-sm text-destructive">{formik.errors.department}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <RequiredLabel>Designation</RequiredLabel>
            <Input
              placeholder="Enter designation"
              name="designation"
              value={formik.values.designation}
              onChange={(e) => {
                formik.handleChange(e)
                updateForm({ designation: e.target.value })
              }}
              onBlur={formik.handleBlur}
              className={cn(
                "h-10 text-base bg-background border-border",
                formik.touched.designation && formik.errors.designation ? "border-destructive" : ""
              )}
            />
            {formik.touched.designation && formik.errors.designation ? (
              <p className="text-sm text-destructive">{formik.errors.designation}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <RequiredLabel>Role</RequiredLabel>
            <Select
              value={formik.values.role || ""}
              onValueChange={(value) => {
                formik.setFieldValue("role", value, true)
                updateForm({ role: value })
              }}
              onOpenChange={(open) => {
                if (!open) formik.setFieldTouched("role", true, true)
              }}
            >
              <SelectTrigger
                className={cn(
                  "w-full h-10 bg-background border-border",
                  formik.touched.role && formik.errors.role ? "border-destructive" : ""
                )}
              >
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                {roleOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {formik.touched.role && formik.errors.role ? (
              <p className="text-sm text-destructive">{formik.errors.role}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label className="text-base text-foreground">Employment Type</Label>
            <Select
              value={form.employment_type || undefined}
              onValueChange={(value) => updateForm({ employment_type: value })}
            >
              <SelectTrigger className="w-full h-10 bg-background border-border">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {employmentTypeOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-base text-foreground">Joining Date</Label>
            <Input
              type="date"
              name="joining_date"
              value={formik.values.joining_date}
              onChange={(e) => {
                formik.handleChange(e)
                updateForm({ joining_date: e.target.value })
              }}
              onBlur={formik.handleBlur}
              className={cn(
                "h-10 text-base bg-background border-border",
                formik.touched.joining_date && formik.errors.joining_date ? "border-destructive" : ""
              )}
            />
            {formik.touched.joining_date && formik.errors.joining_date ? (
              <p className="text-sm text-destructive">{formik.errors.joining_date}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label className="text-base text-foreground">Current Place of Posting</Label>
            <Input
              placeholder="Enter current posting location"
              value={form.current_posting || ""}
              onChange={(e) => updateForm({ current_posting: e.target.value })}
              className="h-10 text-base bg-background border-border"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-base text-foreground">Name of Collector</Label>
            <Input
              placeholder="Enter collector name"
              value={form.collector_name || ""}
              onChange={(e) => updateForm({ collector_name: e.target.value })}
              className="h-10 text-base bg-background border-border"
            />
          </div>
        </div>
      </div>

      {/* Emergency Contact */}
      <div className="space-y-4">
        <Label className="text-[22px] font-bold text-foreground">Emergency Contact</Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <RequiredLabel required={false}>Name</RequiredLabel>
            <Input
              placeholder="e.g. Ali Raza"
              name="emergency_contact_name"
              value={formik.values.emergency_contact_name}
              onChange={(e) => {
                formik.handleChange(e)
                updateForm({ emergency_contact_name: e.target.value })
              }}
              onBlur={formik.handleBlur}
              className={cn(
                "h-10 text-base bg-background border-border",
                formik.touched.emergency_contact_name && formik.errors.emergency_contact_name ? "border-destructive" : ""
              )}
            />
            {formik.touched.emergency_contact_name && formik.errors.emergency_contact_name ? (
              <p className="text-sm text-destructive">{formik.errors.emergency_contact_name}</p>
            ) : (
              <p className="text-sm text-muted-foreground">(Emergency Contact Person)</p>
            )}
          </div>

          <div className="space-y-2">
            <RequiredLabel required={false}>Relationship</RequiredLabel>
            <Input
              placeholder="e.g. Brother, Spouse"
              name="emergency_contact_relationship"
              value={formik.values.emergency_contact_relationship}
              onChange={(e) => {
                formik.handleChange(e)
                updateForm({ emergency_contact_relationship: e.target.value })
              }}
              onBlur={formik.handleBlur}
              className={cn(
                "h-10 text-base bg-background border-border",
                formik.touched.emergency_contact_relationship && formik.errors.emergency_contact_relationship ? "border-destructive" : ""
              )}
            />
            {formik.touched.emergency_contact_relationship && formik.errors.emergency_contact_relationship ? (
              <p className="text-sm text-destructive">{formik.errors.emergency_contact_relationship}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <RequiredLabel required={false}>Phone</RequiredLabel>
            <Input
              placeholder="0000-0000000"
              name="emergency_contact_phone"
              value={formik.values.emergency_contact_phone}
              onChange={(e) => {
                formik.handleChange(e)
                updateForm({ emergency_contact_phone: e.target.value, emergency_contact: e.target.value })
              }}
              onBlur={formik.handleBlur}
              className={cn(
                "h-10 text-base bg-background border-border",
                formik.touched.emergency_contact_phone && formik.errors.emergency_contact_phone ? "border-destructive" : ""
              )}
            />
            {formik.touched.emergency_contact_phone && formik.errors.emergency_contact_phone ? (
              <p className="text-sm text-destructive">{formik.errors.emergency_contact_phone}</p>
            ) : (
              <p className="text-sm text-muted-foreground">(Emergency Contact Number)</p>
            )}
          </div>

          <div className="space-y-2 md:col-span-2">
            <RequiredLabel required={false}>Address</RequiredLabel>
            <Textarea
              placeholder="Emergency contact address"
              name="emergency_contact_address"
              value={formik.values.emergency_contact_address}
              onChange={(e) => {
                formik.handleChange(e)
                updateForm({ emergency_contact_address: e.target.value })
              }}
              onBlur={formik.handleBlur}
              className={cn(
                "min-h-20 text-base bg-background border-border resize-none",
                formik.touched.emergency_contact_address && formik.errors.emergency_contact_address ? "border-destructive" : ""
              )}
            />
            {formik.touched.emergency_contact_address && formik.errors.emergency_contact_address ? (
              <p className="text-sm text-destructive">{formik.errors.emergency_contact_address}</p>
            ) : null}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 border-t border-border">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="rounded-md border border-[#CCCCCC] bg-white px-4 py-2.5 text-base font-normal text-[#3366CC] transition-colors hover:bg-gray-50"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onReset}
            className="rounded-md border border-[#CCCCCC] bg-white px-4 py-2.5 text-base font-normal text-[#3366CC] transition-colors hover:bg-gray-50"
          >
            Reset Form
          </Button>
          {onSaveToDraft && (
            <Button
              type="button"
              variant="outline"
              onClick={onSaveToDraft}
              className="rounded-md border border-[#CCCCCC] bg-white px-4 py-2.5 text-base font-normal text-[#3366CC] transition-colors hover:bg-gray-50"
            >
              Save to draft
            </Button>
          )}
        </div>
        <Button
          type="button"
          onClick={handleSubmit}
          className="shrink-0 rounded-md bg-[#3366FF] px-5 py-2.5 text-base font-normal text-white transition-colors hover:bg-[#2952CC]"
        >
          Save & Continue
        </Button>
      </div>
    </div>
  )
}