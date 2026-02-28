import { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { WalkInStepIndicator } from "@/components/walk-in/step-indicator"
import { WalkInStep1VisitorDetails } from "@/components/walk-in/step1-visitor-details"
import { WalkInStep2DocumentsUpload } from "@/components/walk-in/step2-documents-upload"
import { WalkInStep4QRCodeGeneration } from "@/components/walk-in/step4-qr-code-generation"
import { WalkInStep3VisitDetails } from "@/components/walk-in/step3-visit-details"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
import { createVisitor, fetchVisitors, getVisitor, deleteVisitor, getErrorToastMessage, type VisitorRecord } from "@/lib/visitor-api"
import { PrintQROnSave } from "@/components/visitor/print-qr-on-save"
import { ChevronLeft, ChevronRight, MoreHorizontal, Printer, UserPlus, Trash2 } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  if (parts[0]) return parts[0].slice(0, 2).toUpperCase()
  return "??"
}

type RegistrationEntry = {
  id: number;
  name: string;
  initials: string;
  avatar: string;
  type: "Walk-In";
  department: string;
  status: "Checked In" | "Approved" | "Pending Docs";
  time: string;
};

function formatTime(value: string) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function mapVisitorToRegistration(visitor: VisitorRecord): RegistrationEntry {
  const name = visitor.full_name || "Unknown Visitor";
  return {
    id: visitor.id,
    name,
    initials: getInitials(name),
    avatar: "",
    type: "Walk-In",
    department: visitor.department_to_visit || "—",
    status: "Approved",
    time: formatTime(visitor.created_at),
  };
}

function getStatusStyle(status: string) {
  switch (status) {
    case "Checked In": return "bg-[#dbeafe] text-[#3b82f6]"
    case "Approved": return "bg-[#dcfce7] text-[#22c55e]"
    case "Pending Docs": return "bg-[#fef9c3] text-[#ca8a04]"
    default: return "bg-muted text-muted-foreground"
  }
}

const initialFormData = {
  registrationType: "walk-in",
  visitorCategory: "new",
  visitorSearch: "",
  visitorType: "individual",
  fullName: "",
  cnicPassport: "",
  cnicNumber: "",
  gender: "",
  passportNumber: "",
  nationality: "",
  dateOfBirth: "",
  mobileNumber: "",
  emailAddress: "",
  residentialAddress: "",
  organizationName: "",
  organizationType: "",
  ntnRegistrationNo: "",
  designation: "",
  officeAddress: "",
  vehicleType: "",
  vehicleNumber: "",
  vehicleRegistrationNo: "",
  licenseNo: "",
  licenseIssueDate: "",
  licenseExpiryDate: "",
  photoCapture: "",
  visitPurpose: "",
  department: "",
  hostName: "",
  location: "",
  documentType: "",
  documentNo: "",
  issuingAuthority: "",
  expiryDate: "",
  frontImage: "",
  backImage: "",
  supportDocType: "",
  applicationLetter: "",
  letterRefNo: "",
  additionalDocument: "",
  uploadProcedure: "",
  qrCodeId: "",
  securityLevel: "",
  maxVisitDuration: "",
  allowedDepartments: "",
  allowedZones: "",
  additionalRemarks: "",
  escortMandatory: "yes",
  visitorRefNumber: "",
  visitDate: "",
  timeValidityStart: "",
  timeValidityEnd: "",
  accessZone: "",
  entryGate: "",
  expiryStatus: "",
  scanCount: "",
  generatedOn: "",
  generatedBy: "",
  preferredDate: "",
  preferredTimeSlot: "",
  departmentForSlot: "",
  slotDuration: "",
  hostId: "",
  hostFullName: "",
  hostDesignation: "",
  hostDepartment: "",
  hostEmail: "",
  hostContactNumber: "",
  priorityLevel: "normal",
  visitType: "",
  visitPurposeDescription: "",
  referenceNumber: "",
  watchlistCheckStatus: "",
  approverRequired: "",
  temporaryAccessGranted: "",
  guardRemarks: "",
}

export default function WalkInRegistrationPage() {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["visitors", "walk-in"],
    queryFn: () => fetchVisitors("walk-in"),
  })
  const registrations = (data ?? []).map(mapVisitorToRegistration)
  const [showForm, setShowForm] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const navigate = useNavigate()
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [printQRData, setPrintQRData] = useState<{
    qrPayload: string
    visitorName: string
    visitorCNIC?: string
    validFrom: string
    validTo: string
    qrCodeId?: string
  } | null>(null)
  const [formData, setFormData] = useState({
    ...initialFormData,
  })

  const updateFormData = (data: Partial<typeof formData>) => {
    setFormData((prev) => ({ ...prev, ...data }))
  }

  const validateStep = (step: number) => {
    switch (step) {
      case 1: {
        // Step 1 validation is now handled by Formik in the component
        // Only do basic checks here as fallback
        if (!formData.fullName.trim()) throw new Error("Full name is required")
        if (!formData.mobileNumber.trim()) throw new Error("Mobile number is required")
        if (!formData.cnicNumber.trim()) throw new Error("CNIC number is required")
        break
      }
      case 2: {
        // No strict validation for documents, optional
        break
      }
      case 3: {
        // detailed validation is handled by Formik/Yup in the step component
        break
      }
      case 4: {
        if (!formData.accessZone.trim()) throw new Error("Access zone is required")
        if (!formData.timeValidityStart.trim() || !formData.timeValidityEnd.trim())
          throw new Error("Time validity start and end are required")
        break
      }
    }
  }

  const nextStep = () => {
    try {
      validateStep(currentStep)
      console.log(`Step ${currentStep} validation passed, advancing to step ${currentStep + 1}`)
      if (currentStep < 4) setCurrentStep(currentStep + 1)
    } catch (e) {
      console.error("Step validation failed:", e)
      toast({
        title: "Validation failed",
        description: getErrorToastMessage(e),
        variant: "destructive",
      })
    }
  }

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1)
  }

  const createVisitorMutation = useMutation({
    mutationFn: (payload: Record<string, unknown>) => createVisitor(payload, "walk-in"),
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: ["visitors", "walk-in"] })
      toast({
        title: "Walk-In Registration saved",
        description: "Visitor has been added to the list.",
      })
      setShowForm(false)
      setCurrentStep(1)
      const validFrom = (formData.timeValidityStart || "00:00").trim() || "00:00"
      const validTo = (formData.timeValidityEnd || "23:59").trim() || "23:59"
      const qrPayload = JSON.stringify({
        name: data.full_name,
        cnic: data.cnic_number,
        id: data.id,
        validFrom,
        validTo,
        qrCodeId: formData.qrCodeId || "",
      })
      setPrintQRData({
        qrPayload,
        visitorName: formData.fullName || data.full_name || "Visitor",
        visitorCNIC: formData.cnicPassport || formData.cnicNumber || data.cnic_number || "",
        validFrom,
        validTo,
        qrCodeId: formData.qrCodeId || "",
      })
      setFormData({ ...initialFormData })
    },
    onError: (mutationError) => {
      toast({
        title: "Save failed",
        description: getErrorToastMessage(mutationError),
        variant: "destructive",
      })
    },
  })

  const handleSubmit = () => {
    try {
      const payload: Record<string, unknown> = {
        visitor_type: formData.visitorType || "individual",
        full_name: formData.fullName || "Unknown Visitor",
        gender: formData.gender,
        cnic_number: formData.cnicNumber || formData.cnicPassport,
        passport_number: formData.passportNumber,
        nationality: formData.nationality,
        mobile_number: formData.mobileNumber,
        email_address: formData.emailAddress,
        residential_address: formData.residentialAddress,
        visit_purpose: formData.visitPurpose,
        visit_description: formData.visitPurposeDescription,
        department_to_visit: formData.department || formData.departmentForSlot || "admin",
        host_officer_name: formData.hostFullName || formData.hostName,
        host_officer_designation: formData.hostDesignation,
        host_department: formData.hostDepartment,
        preferred_visit_date: formData.preferredDate,
        preferred_time_slot: formData.preferredTimeSlot,
        slot_duration: formData.slotDuration,
        document_type: formData.documentType,
        document_no: formData.documentNo,
        front_image: formData.frontImage,
        back_image: formData.backImage,
        application_letter: formData.applicationLetter,
        additional_document: formData.additionalDocument,
        captured_photo: formData.photoCapture,
        time_validity_start: formData.timeValidityStart,
        time_validity_end: formData.timeValidityEnd,
        access_zone: formData.accessZone,
        entry_gate: formData.entryGate,
        qr_code_id: formData.qrCodeId,
        visitor_ref_number: formData.visitorRefNumber,
        visit_date: formData.visitDate,
      }
      createVisitorMutation.mutate(payload)
    } catch (err) {
      toast({
        title: "Validation failed",
        description: getErrorToastMessage(err),
        variant: "destructive",
      })
    }
  }

  const handleCancelForm = () => {
    setShowForm(false)
    setCurrentStep(1)
    setFormData({ ...initialFormData })
  }

  const handlePrintQR = () => {
    const validFrom = (formData.timeValidityStart || "00:00").trim() || "00:00"
    const validTo = (formData.timeValidityEnd || "23:59").trim() || "23:59"
    const qrPayload = JSON.stringify({
      name: formData.fullName,
      cnic: formData.cnicNumber || formData.cnicPassport,
      validFrom,
      validTo,
      qrCodeId: formData.qrCodeId || "",
      visitorRefNumber: formData.visitorRefNumber,
      visitDate: formData.visitDate,
      accessZone: formData.accessZone,
      entryGate: formData.entryGate,
      visitPurpose: formData.visitPurpose,
      department: formData.department,
    })
    setPrintQRData({
      qrPayload,
      visitorName: formData.fullName || "Visitor",
      visitorCNIC: formData.cnicPassport || formData.cnicNumber || "",
      validFrom,
      validTo,
      qrCodeId: formData.qrCodeId || "",
    })
  }

  return (
    <div className="w-full px-4 sm:px-6">
      {/* Breadcrumb */}
      <nav className="text-base text-muted-foreground mb-6 flex flex-wrap items-center gap-x-2 gap-y-1" aria-label="Breadcrumb">
        <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
        <span aria-hidden className="text-muted-foreground/70">/</span>
        <Link to="/walk-in-registration" className="hover:text-foreground transition-colors">Visitor Registration</Link>
        <span aria-hidden className="text-muted-foreground/70">/</span>
        <span className="text-[#3b82f6] font-medium" aria-current="page">
          {showForm ? "New Walk-In" : "Walk-In Registration"}
        </span>
      </nav>

      {!showForm ? (
        <>
          {/* Page header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div className="min-w-0">
              <h1 className="text-[22px] font-bold tracking-tight text-foreground">Walk-In Registration</h1>
              <p className="text-base text-muted-foreground mt-1">
                View and manage walk-in registrations. Add a new visitor to start.
              </p>
            </div>
            <Button
              onClick={() => {
                setFormData({ ...initialFormData })
                setCurrentStep(1)
                setShowForm(true)
              }}
              className="bg-[#3b82f6] hover:bg-[#2563eb] text-white shrink-0 w-full sm:w-auto"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              New Walk-In Registration
            </Button>
          </div>

          {/* Recent registrations */}
          <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
            <div className="px-4 sm:px-6 py-4 border-b border-border bg-muted/30">
              <h2 className="text-[22px] font-bold text-foreground">Recent Registrations</h2>
              <p className="text-base text-muted-foreground mt-0.5">Click a row to view details or use the menu for actions.</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-160">
                    <thead>
                      <tr className="border-b border-border bg-muted/20">
                        <th className="text-left px-4 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Visitor Name</th>
                        <th className="text-left px-4 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">Type</th>
                        <th className="text-left px-4 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Department</th>
                        <th className="text-left px-4 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                        <th className="text-left px-4 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Time</th>
                        <th className="text-right px-4 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider w-18">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {isLoading ? (
                        <tr className="border-b border-border last:border-0">
                          <td colSpan={6} className="px-4 py-6 text-center text-sm text-muted-foreground">
                            Loading registrations…
                          </td>
                        </tr>
                      ) : isError ? (
                        <tr className="border-b border-border last:border-0">
                          <td colSpan={6} className="px-4 py-6 text-center text-sm text-destructive">
                            {error instanceof Error ? error.message : "Failed to load registrations."}
                          </td>
                        </tr>
                      ) : registrations.length === 0 ? (
                        <tr className="border-b border-border last:border-0">
                          <td colSpan={6} className="px-4 py-6 text-center text-sm text-muted-foreground">
                            No registrations found.
                          </td>
                        </tr>
                      ) : (
                        registrations.map((reg) => (
                          <tr
                            key={reg.id}
                            className="border-b border-border last:border-0 hover:bg-muted/30 cursor-pointer"
                            onClick={() => navigate(`/visitors/${reg.id}`)}
                          >
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={reg.avatar || "/placeholder.svg"} />
                                  <AvatarFallback className="text-xs">{reg.initials}</AvatarFallback>
                                </Avatar>
                                <span className="text-sm font-medium text-foreground">{reg.name}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 hidden md:table-cell">
                              <span className="text-sm text-muted-foreground">{reg.type}</span>
                            </td>
                            <td className="px-4 py-3 hidden lg:table-cell">
                              <span className="text-sm text-muted-foreground">{reg.department || "—"}</span>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${getStatusStyle(reg.status)}`}>
                                {reg.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 hidden sm:table-cell">
                              <span className="text-sm text-muted-foreground">{reg.time}</span>
                            </td>
                            <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <button
                                    type="button"
                                    className="p-1 rounded hover:bg-muted transition-colors"
                                    aria-label="Actions"
                                  >
                                    <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                                  </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => navigate(`/visitors/${reg.id}`)}>
                                    View details
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => setDeleteId(reg.id)}
                                    className="text-destructive focus:text-destructive"
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={async () => {
                                      try {
                                        const v = await getVisitor(reg.id, "walk-in")
                                        if (!v) {
                                          toast({ title: "Visitor not found", variant: "destructive" })
                                          return
                                        }
                                        const qrPayload = JSON.stringify({
                                          name: v.full_name,
                                          cnic: v.cnic_number,
                                          id: v.id,
                                          validFrom: "00:00",
                                          validTo: "23:59",
                                        })
                                        setPrintQRData({
                                          qrPayload,
                                          visitorName: v.full_name ?? reg.name,
                                          visitorCNIC: v.cnic_number ?? "",
                                          validFrom: "00:00",
                                          validTo: "23:59",
                                          qrCodeId: undefined,
                                        })
                                      } catch (e) {
                                        toast({
                                          title: "Failed to load visitor",
                                          description: getErrorToastMessage(e),
                                          variant: "destructive",
                                        })
                                      }
                                    }}
                                  >
                                    <Printer className="h-4 w-4 mr-2" />
                                    Print QR
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : null}
          <AlertDialog open={deleteId != null} onOpenChange={(open) => !open && setDeleteId(null)}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete visitor?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently remove this visitor record. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  disabled={isDeleting}
                  onClick={async (e) => {
                    e.preventDefault()
                    if (deleteId == null) return
                    setIsDeleting(true)
                    try {
                      await deleteVisitor(deleteId, "walk-in")
                      await queryClient.invalidateQueries({ queryKey: ["visitors", "walk-in"] })
                      toast({ title: "Visitor deleted", description: "The visitor has been removed." })
                      setDeleteId(null)
                    } catch (err) {
                      toast({
                        title: "Delete failed",
                        description: getErrorToastMessage(err),
                        variant: "destructive",
                      })
                    } finally {
                      setIsDeleting(false)
                    }
                  }}
                >
                  {isDeleting ? "Deleting…" : "Delete"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          {printQRData && (
            <PrintQROnSave
              qrPayload={printQRData.qrPayload}
              visitorName={printQRData.visitorName}
              visitorCNIC={printQRData.visitorCNIC}
              validFrom={printQRData.validFrom}
              validTo={printQRData.validTo}
              qrCodeId={printQRData.qrCodeId}
              onDone={() => setPrintQRData(null)}
            />
          )}
          {showForm ? (
            <>
              <div className="mb-6">
                <h1 className="text-[22px] font-bold tracking-tight text-foreground">Walk-in Registration</h1>
                <p className="text-base text-muted-foreground mt-1">
                  Complete the registration fields for a new visit.
                </p>
              </div>

              <WalkInStepIndicator currentStep={currentStep} />

              <div className="bg-card rounded-xl border border-border shadow-sm p-4 sm:p-6 mt-6">
                {currentStep === 1 && (
                  <WalkInStep1VisitorDetails
                    formData={{
                      visitorCategory: formData.visitorCategory,
                      visitorSearch: formData.visitorSearch,
                      visitorType: formData.visitorType,
                      fullName: formData.fullName,
                      gender: formData.gender,
                      cnicNumber: formData.cnicNumber || formData.cnicPassport,
                      passportNumber: formData.passportNumber,
                      nationality: formData.nationality,
                      dateOfBirth: formData.dateOfBirth,
                      mobileNumber: formData.mobileNumber,
                      emailAddress: formData.emailAddress,
                      residentialAddress: formData.residentialAddress,
                      organizationName: formData.organizationName,
                      organizationType: formData.organizationType,
                      ntnRegistrationNo: formData.ntnRegistrationNo,
                      designation: formData.designation,
                      officeAddress: formData.officeAddress,
                      vehicleType: formData.vehicleType,
                      vehicleNumber: formData.vehicleNumber,
                      vehicleRegistrationNo: formData.vehicleRegistrationNo,
                      licenseNo: formData.licenseNo,
                      licenseIssueDate: formData.licenseIssueDate,
                      licenseExpiryDate: formData.licenseExpiryDate,
                    }}
                    updateFormData={(data) => {
                      updateFormData({
                        ...data,
                        ...(data.cnicNumber !== undefined && { cnicPassport: data.cnicNumber }),
                      })
                    }}
                    onCancel={handleCancelForm}
                    onReset={() => setFormData({ ...initialFormData })}
                    onSaveAndContinue={nextStep}
                  />
                )}
                {currentStep === 2 && (
                  <WalkInStep2DocumentsUpload
                    formData={{
                      frontImage: formData.frontImage,
                      backImage: formData.backImage,
                      applicationLetter: formData.applicationLetter,
                      additionalDocument: formData.additionalDocument,
                    }}
                    updateFormData={(data) => updateFormData(data)}
                    onCancel={handleCancelForm}
                    onReset={() => setFormData({ ...initialFormData })}
                    onPrevious={prevStep}
                    onSaveAndContinue={nextStep}
                  />
                )}
                {currentStep === 3 && (
                  <WalkInStep3VisitDetails
                    formData={{
                      visitPurpose: formData.visitPurpose,
                      visitPurposeDescription: formData.visitPurposeDescription,
                      department: formData.department,
                      departmentForSlot: formData.departmentForSlot,
                      hostFullName: formData.hostFullName,
                      hostDesignation: formData.hostDesignation,
                      hostDepartment: formData.hostDepartment,
                      hostEmail: formData.hostEmail,
                      hostContactNumber: formData.hostContactNumber,
                      preferredDate: formData.preferredDate,
                      preferredTimeSlot: formData.preferredTimeSlot,
                      slotDuration: formData.slotDuration,
                      priorityLevel: formData.priorityLevel,
                    }}
                    updateFormData={(data) => updateFormData(data)}
                    onCancel={handleCancelForm}
                    onReset={() => setFormData({ ...initialFormData })}
                    onPrevious={prevStep}
                    onSaveAndContinue={nextStep}
                  />
                )}
                {currentStep === 4 && (
                  <WalkInStep4QRCodeGeneration
                    formData={{
                      ...formData,
                      cnicNumber: formData.cnicNumber || formData.cnicPassport,
                    }}
                    updateFormData={(data) => updateFormData(data)}
                    onCancel={handleCancelForm}
                    onReset={() => setFormData({ ...initialFormData })}
                    onPrevious={prevStep}
                    onPrint={handlePrintQR}
                    onFinish={handleSubmit}
                  />
                )}
              </div>

              {currentStep > 1 && currentStep !== 2 && currentStep !== 3 && currentStep !== 4 && (
                <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-4 mt-6 pt-6 border-t border-border">
                  <Button variant="outline" onClick={prevStep} className="border-border shrink-0">
                    <ChevronLeft className="w-4 h-4 sm:mr-1" />
                    Previous
                  </Button>
                  {currentStep < 4 ? (
                    <Button onClick={nextStep} className="bg-[#3b82f6] hover:bg-[#2563eb] text-white shrink-0">
                      Next
                      <ChevronRight className="w-4 h-4 sm:ml-1" />
                    </Button>
                  ) : (
                    <Button
                      onClick={handleSubmit}
                      disabled={createVisitorMutation.isPending}
                      className="bg-[#3b82f6] hover:bg-[#2563eb] text-white shrink-0"
                    >
                      {createVisitorMutation.isPending ? "Submitting…" : "Submit"}
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  )}
                </div>
              )}
            </>
          ) : null}
    </div>
  )
}