import { Camera, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { cn } from "@/lib/utils"
import type { UploadValue } from "@/components/hr/add-staff/step2-documents-upload"
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
  full_name: string
  father_name?: string
  gender?: string
  cnic: string
  date_of_birth: string
  phone: string
  email: string
  qualification?: string
  address: string
  bps?: string
  department: string
  designation: string
  role: string
  employment_type?: string
  joining_date: string
  current_posting?: string
  collector_name?: string
  emergency_contact: string
}

export function AddStaffStep1PersonalInfo({
  employeeCategory,
  onEmployeeCategoryChange,
  form,
  updateForm,
  staffPhotos,
  onOpenCamera,
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
  onOpenCamera: () => void
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

  const handleSubmit = () => {
    if (onSaveAndContinue) {
      onSaveAndContinue()
    }
  }

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
            <Label className="text-base text-foreground">Personal Number</Label>
            <Input
              placeholder="e.g. 12345"
              value={form.personal_number || ""}
              onChange={(e) => updateForm({ personal_number: e.target.value })}
              className="h-10 text-base bg-background border-border"
            />
            <p className="text-sm text-muted-foreground">(Employee ID)</p>
          </div>

          <div className="space-y-2">
            <Label className="text-base text-foreground">Full Name (As per CNIC/Passport)</Label>
            <Input
              placeholder="e.g. Mohammad Ali Hassan"
              value={form.full_name}
              onChange={(e) => updateForm({ full_name: e.target.value })}
              className="h-10 text-base bg-background border-border"
            />
            <p className="text-sm text-muted-foreground">(As per CNIC/Passport)</p>
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
            <Label className="text-base text-foreground">Gender</Label>
            <Select value={form.gender || undefined} onValueChange={(value) => updateForm({ gender: value })}>
              <SelectTrigger className="w-full h-10 bg-background border-border">
                <SelectValue placeholder="Male/Female/Other" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-base text-foreground">CNIC Number</Label>
            <Input
              placeholder="00000-0000000-0"
              value={form.cnic}
              onChange={(e) => updateForm({ cnic: e.target.value })}
              className="h-10 text-base bg-background border-border"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-base text-foreground">Date of Birth</Label>
            <Input
              type="date"
              value={form.date_of_birth}
              onChange={(e) => updateForm({ date_of_birth: e.target.value })}
              className="h-10 text-base bg-background border-border"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-base text-foreground">Mobile Number</Label>
            <Input
              placeholder="0000-0000000"
              value={form.phone}
              onChange={(e) => updateForm({ phone: e.target.value })}
              className="h-10 text-base bg-background border-border"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-base text-foreground">Email Address</Label>
            <Input
              type="email"
              placeholder="emailaddress@email.com"
              value={form.email}
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
            <Label className="text-base text-foreground">Residential Address</Label>
            <Textarea
              placeholder="e.g. House #, Street Name, City"
              value={form.address}
              onChange={(e) => updateForm({ address: e.target.value })}
              className="min-h-20 text-base bg-background border-border resize-none"
            />
            <p className="text-sm text-muted-foreground">(Employee Address)</p>
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
            <Label className="text-base text-foreground">Department</Label>
            <Select
              value={form.department || undefined}
              onValueChange={(value) => updateForm({ department: value })}
            >
              <SelectTrigger className="w-full h-10 bg-background border-border">
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
          </div>

          <div className="space-y-2">
            <Label className="text-base text-foreground">Designation</Label>
            <Input
              placeholder="Enter designation"
              value={form.designation}
              onChange={(e) => updateForm({ designation: e.target.value })}
              className="h-10 text-base bg-background border-border"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-base text-foreground">Role</Label>
            <Select value={form.role} onValueChange={(value) => updateForm({ role: value })}>
              <SelectTrigger className="w-full h-10 bg-background border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {roleOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
              value={form.joining_date}
              onChange={(e) => updateForm({ joining_date: e.target.value })}
              className="h-10 text-base bg-background border-border"
            />
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

          <div className="space-y-2">
            <Label className="text-base text-foreground">Emergency Contact</Label>
            <Input
              placeholder="0000-0000000"
              value={form.emergency_contact}
              onChange={(e) => updateForm({ emergency_contact: e.target.value })}
              className="h-10 text-base bg-background border-border"
            />
            <p className="text-sm text-muted-foreground">(Emergency Contact Number)</p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 border-t border-border">
        <div className="flex items-center gap-3">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="rounded-md border border-[#CCCCCC] bg-white px-4 py-2.5 text-base font-normal text-[#3366CC] transition-colors hover:bg-gray-50"
            >
              Cancel
            </Button>
          )}
          {onReset && (
            <Button
              type="button"
              variant="outline"
              onClick={onReset}
              className="rounded-md border border-[#CCCCCC] bg-white px-4 py-2.5 text-base font-normal text-[#3366CC] transition-colors hover:bg-gray-50"
            >
              Reset Form
            </Button>
          )}
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
        {onSaveAndContinue && (
          <Button
            type="button"
            onClick={handleSubmit}
            className="shrink-0 rounded-md bg-[#3366FF] px-5 py-2.5 text-base font-normal text-white transition-colors hover:bg-[#2952CC]"
          >
            Save & Continue
          </Button>
        )}
      </div>
    </div>
  )
}