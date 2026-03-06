import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog"
import { CameraCapture } from "@/components/camera-capture"
import { createStaff, type CreateStaffPayload } from "@/lib/staff-api"
import { ROUTES } from "@/routes/config"
import { StaffStepIndicator } from "@/components/hr/add-staff/staff-step-indicator"
import { AddStaffStep1PersonalInfo } from "@/components/hr/add-staff/step1-personal-info"
import { AddStaffStep2DocumentsUpload, type UploadValue } from "@/components/hr/add-staff/step2-documents-upload"
import { AddStaffStep3LoginAccess } from "@/components/hr/add-staff/step3-login-access"
import { Input } from "@/components/ui/input"

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

const DEPARTMENT_OPTIONS = [
  { value: "HR", label: "Human Resources" },
  { value: "FINANCE", label: "Finance" },
  { value: "OPERATIONS", label: "Operations" },
  { value: "IT", label: "Information Technology" },
  { value: "SECURITY", label: "Security" },
  { value: "ADMIN", label: "Administration" },
  { value: "LEGAL", label: "Legal" },
  { value: "PROCUREMENT", label: "Procurement" },
  { value: "ENFORCEMENT", label: "Enforcement" },
  { value: "CUSTOMS", label: "Customs" },
]

const EMPLOYMENT_TYPES = [
  { value: "full-time", label: "Full Time" },
  { value: "part-time", label: "Part Time" },
  { value: "contract", label: "Contract" },
  { value: "intern", label: "Intern" },
  { value: "probation", label: "Probation" },
]

const BPS_OPTIONS = [
  { value: "1", label: "BPS-1" },
  { value: "2", label: "BPS-2" },
  { value: "3", label: "BPS-3" },
  { value: "4", label: "BPS-4" },
  { value: "5", label: "BPS-5" },
  { value: "6", label: "BPS-6" },
  { value: "7", label: "BPS-7" },
  { value: "8", label: "BPS-8" },
  { value: "9", label: "BPS-9" },
  { value: "10", label: "BPS-10" },
  { value: "11", label: "BPS-11" },
  { value: "12", label: "BPS-12" },
  { value: "13", label: "BPS-13" },
  { value: "14", label: "BPS-14" },
  { value: "15", label: "BPS-15" },
  { value: "16", label: "BPS-16" },
  { value: "17", label: "BPS-17" },
  { value: "18", label: "BPS-18" },
  { value: "19", label: "BPS-19" },
  { value: "20", label: "BPS-20" },
  { value: "21", label: "BPS-21" },
  { value: "22", label: "BPS-22" },
]

const QUALIFICATION_OPTIONS = [
  { value: "matric", label: "Matric" },
  { value: "intermediate", label: "Intermediate" },
  { value: "bachelors", label: "Bachelor's Degree" },
  { value: "masters", label: "Master's Degree" },
  { value: "mphil", label: "M.Phil" },
  { value: "phd", label: "PhD" },
  { value: "others", label: "Others" },
]

const emptyForm: CreateStaffPayload = {
  personal_number: "",
  has_login: false,
  login_username: "",
  password: "",
  email: "",
  role: "RECEPTIONIST",
  phone: "",
  full_name: "",
  father_name: "",
  gender: "",
  cnic: "",
  address: "",
  date_of_birth: "",
  joining_date: new Date().toISOString().slice(0, 10),
  department: "",
  designation: "",
  employment_type: "",
  emergency_contact: "",
  bps: "",
  qualification: "",
  current_posting: "",
  collector_name: "",
}

export default function AddStaffPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState<CreateStaffPayload>(emptyForm)
  const [staffPhotos, setStaffPhotos] = useState<UploadValue[]>([])
  const [cameraOpen, setCameraOpen] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [employeeCategory, setEmployeeCategory] = useState<"new" | "existing">("new")
  const [currentStep, setCurrentStep] = useState(1)

  const [cnicFront, setCnicFront] = useState<UploadValue>({ file: null, previewUrl: null })
  const [cnicBack, setCnicBack] = useState<UploadValue>({ file: null, previewUrl: null })
  const [appointmentLetter, setAppointmentLetter] = useState<UploadValue>({ file: null, previewUrl: null })
  const [additionalDocument, setAdditionalDocument] = useState<UploadValue>({ file: null, previewUrl: null })

  useEffect(() => {
    return () => {
      for (const p of staffPhotos) {
        if (p.previewUrl) URL.revokeObjectURL(p.previewUrl)
      }
      if (cnicFront.previewUrl) URL.revokeObjectURL(cnicFront.previewUrl)
      if (cnicBack.previewUrl) URL.revokeObjectURL(cnicBack.previewUrl)
      if (appointmentLetter.previewUrl) URL.revokeObjectURL(appointmentLetter.previewUrl)
      if (additionalDocument.previewUrl) URL.revokeObjectURL(additionalDocument.previewUrl)
    }
  }, [staffPhotos, cnicFront.previewUrl, cnicBack.previewUrl, appointmentLetter.previewUrl, additionalDocument.previewUrl])

  const addPhotos = (files: File[]) => {
    const max = 5
    setStaffPhotos((prev) => {
      const remaining = Math.max(0, max - prev.length)
      if (remaining <= 0) return prev
      const take = files.slice(0, remaining)
      const added: UploadValue[] = take.map((file) => ({
        file,
        previewUrl: URL.createObjectURL(file),
      }))
      return [...prev, ...added]
    })
  }

  const handleImageCapture = (file: File) => {
    addPhotos([file])
    setCameraOpen(false)
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []).filter((f) => f.type.startsWith("image/"))
    if (files.length) addPhotos(files)
    e.target.value = ""
  }

  const handleRemovePhotoAt = (index: number) => {
    setStaffPhotos((prev) => {
      const item = prev[index]
      if (item?.previewUrl) URL.revokeObjectURL(item.previewUrl)
      return prev.filter((_, i) => i !== index)
    })
  }

  const updateUploadValue = (
    setter: React.Dispatch<React.SetStateAction<UploadValue>>,
    file: File | null
  ) => {
    setter((prev) => {
      if (prev.previewUrl) URL.revokeObjectURL(prev.previewUrl)
      if (!file) return { file: null, previewUrl: null }
      const previewUrl = file.type.startsWith("image/") ? URL.createObjectURL(file) : null
      return { file, previewUrl }
    })
  }

  const nextStep = () => setCurrentStep((s) => Math.min(3, s + 1))
  const prevStep = () => setCurrentStep((s) => Math.max(1, s - 1))

  const resetAll = () => {
    setForm(emptyForm)
    setEmployeeCategory("new")
    setCurrentStep(1)
    setSubmitError(null)
    setStaffPhotos((prev) => {
      for (const p of prev) {
        if (p.previewUrl) URL.revokeObjectURL(p.previewUrl)
      }
      return []
    })
    updateUploadValue(setCnicFront, null)
    updateUploadValue(setCnicBack, null)
    updateUploadValue(setAppointmentLetter, null)
    updateUploadValue(setAdditionalDocument, null)
  }

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError(null)
    setSubmitting(true)
    try {
      await createStaff({
        ...form,
        profile_image: staffPhotos[0]?.file ?? undefined,
        staff_photos: staffPhotos.map((p) => p.file).filter((f): f is File => f instanceof File),
        cnic_front: cnicFront.file ?? undefined,
        cnic_back: cnicBack.file ?? undefined,
        appointment_letter: appointmentLetter.file ?? undefined,
        additional_document: additionalDocument.file ?? undefined,
      })
      navigate(ROUTES.EMPLOYEES)
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Failed to add staff")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="w-full px-4">
      <nav className="text-base text-muted-foreground mb-6 flex flex-wrap items-center gap-x-2 gap-y-1" aria-label="Breadcrumb">
        <Link to={ROUTES.DASHBOARD} className="hover:text-foreground transition-colors">Home</Link>
        <span aria-hidden className="text-muted-foreground/70">/</span>
        <span className="text-muted-foreground">HR</span>
        <span aria-hidden className="text-muted-foreground/70">/</span>
        <Link to={ROUTES.EMPLOYEES} className="hover:text-foreground transition-colors">Employees</Link>
        <span aria-hidden className="text-muted-foreground/70">/</span>
        <span className="text-[#3b82f6] font-medium" aria-current="page">
          Add Staff
        </span>
      </nav>
        <div className="mb-6">
        <h1 className="text-[22px] font-bold tracking-tight text-foreground">Add Staff</h1>
        <p className="text-base text-muted-foreground mt-1">
          Add a new employee record.
        </p>
        </div>

      <StaffStepIndicator currentStep={currentStep} />

      <form id="add-staff-form" onSubmit={handleAddStaff} className="mt-6">
                            <Input
                              id="profile_image"
                              type="file"
                              accept="image/*"
          multiple
                              className="hidden"
                              onChange={handleImageUpload}
                            />
        {submitError && (
          <div className="p-4 bg-destructive/10 border border-destructive text-destructive rounded-md text-sm mb-6">
            {submitError}
                        </div>
                      )}

        <div className="bg-card rounded-xl border border-border shadow-sm p-4 sm:p-6 mt-6">
          {currentStep === 1 && (
            <AddStaffStep1PersonalInfo
              employeeCategory={employeeCategory}
              onEmployeeCategoryChange={setEmployeeCategory}
              form={form}
              updateForm={(patch) => setForm((f) => ({ ...f, ...patch }))}
              staffPhotos={staffPhotos}
              onOpenCamera={() => setCameraOpen(true)}
              onUploadPhotoClick={() => document.getElementById("profile_image")?.click()}
              onRemovePhoto={handleRemovePhotoAt}
              onCancel={() => navigate(ROUTES.EMPLOYEES)}
              onReset={resetAll}
              onSaveAndContinue={nextStep}
              roleOptions={ROLE_OPTIONS}
              departmentOptions={DEPARTMENT_OPTIONS}
              employmentTypeOptions={EMPLOYMENT_TYPES}
              bpsOptions={BPS_OPTIONS}
              qualificationOptions={QUALIFICATION_OPTIONS}
            />
          )}

          {currentStep === 2 && (
            <AddStaffStep2DocumentsUpload
              cnicFront={cnicFront}
              cnicBack={cnicBack}
              appointmentLetter={appointmentLetter}
              additionalDocument={additionalDocument}
              onPickCnicFront={(file) => updateUploadValue(setCnicFront, file)}
              onPickCnicBack={(file) => updateUploadValue(setCnicBack, file)}
              onPickAppointmentLetter={(file) => updateUploadValue(setAppointmentLetter, file)}
              onPickAdditionalDocument={(file) => updateUploadValue(setAdditionalDocument, file)}
              onRemoveCnicFront={() => updateUploadValue(setCnicFront, null)}
              onRemoveCnicBack={() => updateUploadValue(setCnicBack, null)}
              onRemoveAppointmentLetter={() => updateUploadValue(setAppointmentLetter, null)}
              onRemoveAdditionalDocument={() => updateUploadValue(setAdditionalDocument, null)}
              onCancel={() => navigate(ROUTES.EMPLOYEES)}
              onReset={resetAll}
              onPrevious={prevStep}
              onSaveAndContinue={nextStep}
            />
          )}

          {currentStep === 3 && (
            <AddStaffStep3LoginAccess
              form={form}
              updateForm={(patch) => setForm((f) => ({ ...f, ...patch }))}
              onCancel={() => navigate(ROUTES.EMPLOYEES)}
              onReset={resetAll}
              onPrevious={prevStep}
              onFinish={() => {
                const formEl = document.getElementById("add-staff-form") as HTMLFormElement | null
                formEl?.requestSubmit()
              }}
              submitting={submitting}
            />
          )}
              </div>

              <Dialog open={cameraOpen} onOpenChange={setCameraOpen}>
                <DialogContent className="max-w-md">
                  <CameraCapture
                    title="Capture staff photo"
                    description="Position the staff member in frame and capture. This will be used as their profile image."
                    onCapture={handleImageCapture}
                    onCancel={() => setCameraOpen(false)}
                  />
                </DialogContent>
              </Dialog>

            </form>
      </div>
  )
}
