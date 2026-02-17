
import { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { WalkInStepIndicator } from "@/components/walk-in/step-indicator"
import { WalkInStep1BasicInfo } from "@/components/walk-in/step1-basic-info"
import { Step3DocumentUpload } from "@/components/registration/step3-document-upload"
import { Step5QRCodeGeneration } from "@/components/registration/step5-qr-code-generation"
import { WalkInStep4TimeSlot } from "@/components/walk-in/step4-time-slot"
import { WalkInStep5HostSelection } from "@/components/walk-in/step5-host-selection"
import { WalkInStep6VisitPurpose } from "@/components/walk-in/step6-visit-purpose"
import { WalkInStep2Security } from "@/components/walk-in/step2-security"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
import { createVisitor, fetchVisitors, type VisitorRecord } from "@/lib/visitor-api"
import { ChevronLeft, ChevronRight, MoreHorizontal, UserPlus } from "lucide-react"
import { Link } from "react-router-dom"
import { ROUTES } from "@/routes/config"

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
  registrationType: "",
  fullName: "",
  cnicPassport: "",
  nationality: "",
  mobileNumber: "",
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
    queryKey: ["visitors"],
    queryFn: fetchVisitors,
  })
  const registrations = (data ?? []).map(mapVisitorToRegistration)
  const [showForm, setShowForm] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    ...initialFormData,
  })

  const updateFormData = (data: Partial<typeof formData>) => {
    setFormData((prev) => ({ ...prev, ...data }))
  }

  const nextStep = () => {
    if (currentStep < 7) setCurrentStep(currentStep + 1)
  }

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1)
  }

  const createVisitorMutation = useMutation({
    mutationFn: createVisitor,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["visitors"] })
      toast({
        title: "Walk-In Registration saved",
        description: "Visitor has been added to the list.",
      })
      setShowForm(false)
      setCurrentStep(1)
      setFormData({ ...initialFormData })
    },
    onError: (mutationError) => {
      const message =
        mutationError instanceof Error
          ? mutationError.message
          : "Failed to save visitor."
      toast({
        title: "Save failed",
        description: message,
        variant: "destructive",
      })
    },
  })

  const handleSubmit = () => {
    const nationalityMap: Record<string, string> = {
      pakistani: "pakistan",
      american: "usa",
      british: "uk",
      indian: "other",
      other: "other",
    }
    const departmentMap: Record<string, string> = {
      hr: "hr",
      operations: "operations",
      finance: "finance",
      marketing: "marketing",
      engineering: "it",
      sales: "marketing",
    }
    const allowedVisitPurpose = new Set([
      "meeting",
      "interview",
      "delivery",
      "maintenance",
      "consultation",
      "other",
    ])
    const normalizedVisitPurpose = allowedVisitPurpose.has(formData.visitPurpose)
      ? formData.visitPurpose
      : "other"
    const departmentValue =
      departmentMap[formData.department] ||
      departmentMap[formData.departmentForSlot] ||
      "admin"

    const payload = {
      visitor_type: "individual",
      full_name: formData.fullName,
      gender: "",
      cnic_number: formData.cnicPassport,
      passport_number: "",
      nationality: nationalityMap[formData.nationality] || "other",
      date_of_birth: null,
      mobile_number: formData.mobileNumber,
      email_address: "",
      residential_address: "",
      visit_purpose: normalizedVisitPurpose,
      visit_description: formData.visitPurposeDescription || formData.visitPurpose || "",
      department_to_visit: departmentValue,
      host_officer_name: formData.hostFullName || formData.hostName || "",
      host_officer_designation: formData.hostDesignation || "",
      preferred_visit_date: formData.preferredDate || null,
      preferred_time_slot: "",
      expected_duration: "",
      preferred_view_visit: "",
      document_type: formData.documentType,
      document_no: formData.documentNo,
      issuing_authority: formData.issuingAuthority,
      expiry_date: formData.expiryDate || null,
      front_image: formData.frontImage,
      back_image: formData.backImage,
      support_doc_type: formData.supportDocType,
      application_letter: formData.applicationLetter,
      letter_ref_no: formData.letterRefNo,
      additional_document: formData.additionalDocument,
      upload_procedure: formData.uploadProcedure,
      disclaimer_accepted: false,
      terms_accepted: false,
      previous_visit_reference: formData.referenceNumber || "",
      qr_code_id: formData.qrCodeId,
      visitor_ref_number: formData.visitorRefNumber,
      visit_date: formData.visitDate || null,
      time_validity_start: formData.timeValidityStart,
      time_validity_end: formData.timeValidityEnd,
      access_zone: formData.accessZone,
      entry_gate: formData.entryGate,
      expiry_status: formData.expiryStatus,
      scan_count: formData.scanCount ? Number(formData.scanCount) : 0,
      generated_on: formData.generatedOn || null,
      generated_by: formData.generatedBy,
      registration_type: formData.registrationType,
      cnic_passport: formData.cnicPassport,
      visit_purpose_description: formData.visitPurposeDescription,
      visit_type: formData.visitType,
      reference_number: formData.referenceNumber,
      preferred_date: formData.preferredDate,
      preferred_time_slot_walkin: formData.preferredTimeSlot,
      department_for_slot: formData.departmentForSlot,
      slot_duration: formData.slotDuration,
      host_id: formData.hostId,
      host_full_name: formData.hostFullName,
      host_designation: formData.hostDesignation,
      host_department: formData.hostDepartment,
      watchlist_check_status: formData.watchlistCheckStatus,
      approver_required: formData.approverRequired,
      temporary_access_granted: formData.temporaryAccessGranted,
      guard_remarks: formData.guardRemarks,
      capture_date: "",
      capture_time: "",
      captured_by: "",
      camera_location: "",
      photo_quality_score: "",
      face_match_status: "",
      captured_photo: formData.photoCapture,
    }
    createVisitorMutation.mutate(payload)
  }

  const handleCancelForm = () => {
    setShowForm(false)
    setCurrentStep(1)
    setFormData({ ...initialFormData })
  }

  return (
    <>
      <div className="text-sm text-muted-foreground mb-4">
            <Link to={ROUTES.DASHBOARD} className="hover:text-foreground">Home</Link>
            <span className="mx-2">/</span>
            <Link to={ROUTES.DASHBOARD} className="hover:text-foreground">Visitor Registration</Link>
            <span className="mx-2">/</span>
            <span className="text-[#3b82f6]">
              {showForm ? "New Walk-In" : "Walk-In Registration"}
            </span>
          </div>

          {!showForm ? (
            <>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-xl font-semibold text-foreground">Walk-In Registration</h1>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    View and manage walk-in registrations. Add a new visitor to start.
                  </p>
                </div>
                <Button
                  onClick={() => {
                    setFormData({ ...initialFormData })
                    setCurrentStep(1)
                    setShowForm(true)
                  }}
                  className="bg-[#3b82f6] hover:bg-[#2563eb] text-white"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Walk-In Registration
                </Button>
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-semibold text-foreground">Recent Registrations</h2>
                  <button className="text-sm text-[#3b82f6] hover:underline">View All</button>
                </div>
                <div className="bg-background rounded-xl border border-border overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Visitor Name</th>
                        <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Type</th>
                        <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Department</th>
                        <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                        <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Time</th>
                        <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Action</th>
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
                          <tr key={reg.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={reg.avatar || "/placeholder.svg"} />
                                  <AvatarFallback className="text-xs">{reg.initials}</AvatarFallback>
                                </Avatar>
                                <span className="text-sm font-medium text-foreground">{reg.name}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-sm text-muted-foreground">{reg.type}</span>
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-sm text-muted-foreground">{reg.department || "—"}</span>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${getStatusStyle(reg.status)}`}>
                                {reg.status}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-sm text-muted-foreground">{reg.time}</span>
                            </td>
                            <td className="px-4 py-3">
                              <button className="p-1 rounded hover:bg-muted transition-colors">
                                <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="mb-6">
                <h1 className="text-xl font-semibold text-foreground">New Walk-In Registration</h1>
                <p className="text-sm text-muted-foreground">
                  Complete the walk-in registration fields to schedule a visit.
                </p>
              </div>

              <WalkInStepIndicator currentStep={currentStep} />

              <div className="bg-background rounded-lg border border-border p-6 mt-6">
                {currentStep === 1 && (
                  <WalkInStep1BasicInfo formData={formData} updateFormData={updateFormData} />
                )}
                {currentStep === 2 && (
                  <Step3DocumentUpload formData={formData} updateFormData={updateFormData} />
                )}
                {currentStep === 3 && (
                  <Step5QRCodeGeneration formData={formData} updateFormData={updateFormData} />
                )}
                {currentStep === 4 && (
                  <WalkInStep4TimeSlot formData={formData} updateFormData={updateFormData} />
                )}
                {currentStep === 5 && (
                  <WalkInStep5HostSelection formData={formData} updateFormData={updateFormData} />
                )}
                {currentStep === 6 && (
                  <WalkInStep6VisitPurpose formData={formData} updateFormData={updateFormData} />
                )}
                {currentStep === 7 && (
                  <WalkInStep2Security formData={formData} updateFormData={updateFormData} />
                )}
              </div>

              <div className="flex items-center justify-between mt-6">
                <div className="flex items-center gap-4">
                  <Button variant="outline" className="bg-transparent" onClick={handleCancelForm}>
                    Back to list
                  </Button>
                  <button className="text-[#3b82f6] text-sm font-medium hover:underline">
                    Save &amp; Continue
                  </button>
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    onClick={prevStep}
                    disabled={currentStep === 1}
                    className={`bg-transparent ${currentStep === 1 ? "opacity-50 cursor-not-allowed" : "border-[#3b82f6] text-[#3b82f6] hover:bg-[#3b82f6]/10"}`}
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Previous
                  </Button>
                  {currentStep < 7 ? (
                    <Button onClick={nextStep} className="bg-[#3b82f6] hover:bg-[#2563eb] text-white">
                      Next
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  ) : (
                    <Button
                      onClick={handleSubmit}
                      disabled={createVisitorMutation.isPending}
                      className="bg-[#3b82f6] hover:bg-[#2563eb] text-white"
                    >
                      {createVisitorMutation.isPending ? "Submitting..." : "Submit"}
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
