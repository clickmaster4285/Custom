
import { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { WalkInStepIndicator } from "@/components/walk-in/step-indicator"
import { WalkInStep1BasicInfo } from "@/components/walk-in/step1-basic-info"
import { Step3DocumentUpload } from "@/components/registration/step3-document-upload"
import { Step5QRCodeGeneration, buildQRPayload, buildQRPayloadFromVisitor } from "@/components/registration/step5-qr-code-generation"
import { WalkInStep4TimeSlot } from "@/components/walk-in/step4-time-slot"
import { WalkInStep5HostSelection } from "@/components/walk-in/step5-host-selection"
import { WalkInStep6VisitPurpose } from "@/components/walk-in/step6-visit-purpose"
import { WalkInStep2Security } from "@/components/walk-in/step2-security"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
import { createVisitor, fetchVisitors, getVisitor, deleteVisitor, type VisitorRecord } from "@/lib/visitor-api"
import { buildWalkInPayload } from "@/lib/visitor-payload"
import { PrintQROnSave } from "@/components/visitor/print-qr-on-save"
import { z } from "zod"
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

  const nextStep = () => {
    if (currentStep < 7) setCurrentStep(currentStep + 1)
  }

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1)
  }

  const createVisitorMutation = useMutation({
    mutationFn: createVisitor,
    onSuccess: async (data, variables) => {
      await queryClient.invalidateQueries({ queryKey: ["visitors"] })
      toast({
        title: "Walk-In Registration saved",
        description: "Visitor has been added to the list.",
      })
      setShowForm(false)
      setCurrentStep(1)
      setFormData({ ...initialFormData })
      const step5Data = { ...formData, cnicNumber: formData.cnicPassport }
      const qrPayload = buildQRPayload(step5Data)
      if (qrPayload && qrPayload !== "{}") {
        const validFrom = (data?.time_validity_start ?? variables?.time_validity_start ?? (formData.timeValidityStart || "00:00")).trim() || "00:00"
        const validTo = (data?.time_validity_end ?? variables?.time_validity_end ?? (formData.timeValidityEnd || "23:59")).trim() || "23:59"
        setPrintQRData({
          qrPayload,
          visitorName: formData.fullName || data?.full_name || "Visitor",
          visitorCNIC: formData.cnicPassport || data?.cnic_number || "CNIC Number",
          validFrom,
          validTo,
          qrCodeId: data?.qr_code_id || formData.qrCodeId,
        })
      }
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
    try {
      const payload = buildWalkInPayload(formData as Record<string, unknown>)
      createVisitorMutation.mutate(payload)
    } catch (err) {
      const message =
        err instanceof z.ZodError
          ? err.errors[0]?.message ?? "Please fix the form errors."
          : err instanceof Error
            ? err.message
            : "Validation failed."
      toast({
        title: "Validation failed",
        description: message,
        variant: "destructive",
      })
    }
  }

  const handleCancelForm = () => {
    setShowForm(false)
    setCurrentStep(1)
    setFormData({ ...initialFormData })
  }

  return (
    <div className="w-full max-w-[1400px] mx-auto">
      {/* Breadcrumb */}
      <nav className="text-sm text-muted-foreground mb-6 flex flex-wrap items-center gap-x-2 gap-y-1" aria-label="Breadcrumb">
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
              <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-2xl">Walk-In Registration</h1>
              <p className="text-sm text-muted-foreground mt-1">
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
              <h2 className="text-base font-semibold text-foreground">Recent Registrations</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Click a row to view details or use the menu for actions.</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px]">
                    <thead>
                      <tr className="border-b border-border bg-muted/20">
                        <th className="text-left px-4 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Visitor Name</th>
                        <th className="text-left px-4 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">Type</th>
                        <th className="text-left px-4 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Department</th>
                        <th className="text-left px-4 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                        <th className="text-left px-4 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Time</th>
                        <th className="text-right px-4 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider w-[72px]">Action</th>
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
                                        const v = await getVisitor(reg.id);
                                        setPrintQRData({
                                          qrPayload: buildQRPayloadFromVisitor(v),
                                          visitorName: v.full_name ?? reg.name,
                                          visitorCNIC: v.cnic_number ?? "CNIC Number",
                                          validFrom: v.time_validity_start ?? "00:00",
                                          validTo: v.time_validity_end ?? "23:59",
                                          qrCodeId: v.qr_code_id ?? undefined,
                                        });
                                      } catch (e) {
                                        toast({
                                          title: "Failed to load visitor",
                                          description: e instanceof Error ? e.message : "Could not print QR.",
                                          variant: "destructive",
                                        });
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
                      await deleteVisitor(deleteId)
                      queryClient.invalidateQueries({ queryKey: ["visitors"] })
                      toast({ title: "Visitor deleted", description: "The visitor has been removed." })
                      setDeleteId(null)
                    } catch (err) {
                      toast({
                        title: "Delete failed",
                        description: err instanceof Error ? err.message : "Could not delete visitor.",
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
                <h1 className="text-2xl font-semibold tracking-tight text-foreground">New Walk-In Registration</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Complete the walk-in registration fields to schedule a visit.
                </p>
              </div>

              <WalkInStepIndicator currentStep={currentStep} />

              <div className="bg-card rounded-xl border border-border shadow-sm p-4 sm:p-6 mt-6">
                {currentStep === 1 && (
                  <WalkInStep1BasicInfo formData={formData} updateFormData={updateFormData} />
                )}
                {currentStep === 2 && (
                  <Step3DocumentUpload formData={formData} updateFormData={updateFormData} />
                )}
                {currentStep === 3 && (
                  <WalkInStep4TimeSlot formData={formData} updateFormData={updateFormData} />
                )}
                {currentStep === 4 && (
                  <WalkInStep5HostSelection formData={formData} updateFormData={updateFormData} />
                )}
                {currentStep === 5 && (
                  <WalkInStep6VisitPurpose formData={formData} updateFormData={updateFormData} />
                )}
                {currentStep === 6 && (
                  <WalkInStep2Security formData={formData} updateFormData={updateFormData} />
                )}
                {currentStep === 7 && (
                  <Step5QRCodeGeneration formData={formData} updateFormData={updateFormData} />
                )}
              </div>

              <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-4 mt-6 pt-6 border-t border-border">
                <div className="flex items-center gap-3">
                  <Button variant="outline" className="border-border" onClick={handleCancelForm}>
                    Back to list
                  </Button>
                  <button className="text-[#3b82f6] text-sm font-medium hover:underline hidden sm:inline">
                    Save &amp; Continue
                  </button>
                </div>
                <div className="flex items-center justify-end gap-2 sm:gap-3">
                  <Button
                    variant="outline"
                    onClick={prevStep}
                    disabled={currentStep === 1}
                    className={`shrink-0 ${currentStep === 1 ? "opacity-50 cursor-not-allowed" : "border-[#3b82f6] text-[#3b82f6] hover:bg-[#3b82f6]/10"}`}
                  >
                    <ChevronLeft className="w-4 h-4 sm:mr-1" />
                    <span className="hidden sm:inline">Previous</span>
                  </Button>
                  {currentStep < 7 ? (
                    <Button onClick={nextStep} className="bg-[#3b82f6] hover:bg-[#2563eb] text-white shrink-0">
                      <span className="hidden sm:inline">Next</span>
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
              </div>
            </>
          ) : null}
    </div>
  )
}
