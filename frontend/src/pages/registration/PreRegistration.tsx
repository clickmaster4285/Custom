import { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { StepIndicator } from "@/components/registration/step-indicator"
import { Step1PersonalInfo } from "@/components/registration/step1-personal-info";
import { Step2VisitDetails } from "@/components/registration/step2-visit-details";
import { Step3DocumentUpload } from "@/components/registration/step3-document-upload";
import { Step4PhotoCapture } from "@/components/registration/step4-photo-capture";
import { Step5QRCodeGeneration, buildQRPayload, buildQRPayloadFromVisitor } from "@/components/registration/step5-qr-code-generation";
import { Step3Organization } from "@/components/registration/step3-organization";
import { Step4Consent } from "@/components/registration/step4-consent";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { createVisitor, fetchVisitors, getVisitor, deleteVisitor, type VisitorRecord } from "@/lib/visitor-api";
import { buildPreRegistrationPayload } from "@/lib/visitor-payload";
import { PrintQROnSave } from "@/components/visitor/print-qr-on-save";
import { z } from "zod";
import { ChevronLeft, ChevronRight, MoreHorizontal, Printer, UserPlus, Trash2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  if (parts[0]) return parts[0].slice(0, 2).toUpperCase();
  return "??";
}

const steps = [
  { number: 1, title: "Visitor Personal Information" },
  { number: 2, title: "Visit Details" },
  { number: 3, title: "Document Upload" },
  { number: 4, title: "Photo Capture" },
  { number: 5, title: "Organization & Information" },
  { number: 6, title: "Security & Consent" },
  { number: 7, title: "QR Code Generation" },
];

type RegistrationEntry = {
  id: number;
  name: string;
  initials: string;
  avatar: string;
  type: "Pre-Registration";
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
    type: "Pre-Registration",
    department: visitor.department_to_visit || "—",
    status: "Approved",
    time: formatTime(visitor.created_at),
  };
}

function getStatusStyle(status: string) {
  switch (status) {
    case "Checked In": return "bg-[#dbeafe] text-[#3b82f6]";
    case "Approved": return "bg-[#dcfce7] text-[#22c55e]";
    case "Pending Docs": return "bg-[#fef9c3] text-[#ca8a04]";
    default: return "bg-muted text-muted-foreground";
  }
}

const initialPreRegFormData = {
  visitorType: "individual",
  fullName: "",
  gender: "",
  cnicNumber: "",
  passportNumber: "",
  nationality: "",
  dateOfBirth: "",
  mobileNumber: "",
  emailAddress: "",
  residentialAddress: "",
  visitPurpose: "",
  visitDescription: "",
  departmentToVisit: "",
  hostOfficerName: "",
  hostOfficerDesignation: "",
  preferredVisitDate: "",
  preferredTimeSlot: "",
  expectedDuration: "",
  preferredViewVisit: "in-host",
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
  captureDate: "",
  captureTime: "",
  capturedBy: "",
  cameraLocation: "",
  photoQualityScore: "",
  faceMatchStatus: "",
  capturedPhoto: "",
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
  organizationName: "",
  organizationType: "",
  ntnRegistrationNo: "",
  designation: "",
  officeAddress: "",
  disclaimerAccepted: false,
  termsAccepted: false,
  previousVisitReference: "",
};

export default function PreRegistrationPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["visitors"],
    queryFn: fetchVisitors,
  });
  const registrations = (data ?? []).map(mapVisitorToRegistration);
  const [showForm, setShowForm] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState(initialPreRegFormData);
  const navigate = useNavigate();
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [printQRData, setPrintQRData] = useState<{
    qrPayload: string;
    visitorName: string;
    visitorCNIC: string;
    validFrom: string;
    validTo: string;
    qrCodeId?: string;
  } | null>(null);

  const updateFormData = (data: Partial<typeof formData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const handleNext = () => {
    if (currentStep < 7) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const createVisitorMutation = useMutation({
    mutationFn: createVisitor,
    onSuccess: async (data, variables) => {
      await queryClient.invalidateQueries({ queryKey: ["visitors"] });
      toast({
        title: "Pre-Registration saved",
        description: "Visitor has been added to the list.",
      });
      setShowForm(false);
      setCurrentStep(1);
      setFormData(initialPreRegFormData);
      const qrPayload = buildQRPayload(formData);
      if (qrPayload && qrPayload !== "{}") {
        // Debug: log sources to verify format of time validity data
        console.log("[Print QR] API response (data):", data);
        console.log("[Print QR] Payload sent (variables):", variables);
        console.log("[Print QR] variables?.time_validity_start:", variables?.time_validity_start, "variables?.time_validity_end:", variables?.time_validity_end);
        console.log("[Print QR] data?.time_validity_start:", data?.time_validity_start, "data?.time_validity_end:", data?.time_validity_end);
        console.log("[Print QR] formData.timeValidityStart:", formData.timeValidityStart, "formData.timeValidityEnd:", formData.timeValidityEnd);

        const validFrom = (data?.time_validity_start ?? variables?.time_validity_start ?? (formData.timeValidityStart || "00:00")).trim();
        const validTo = (data?.time_validity_end ?? variables?.time_validity_end ?? (formData.timeValidityEnd || "23:59")).trim();

        const printData = {
          qrPayload,
          visitorName: formData.fullName || data?.full_name || "Visitor",
          visitorCNIC: formData.cnicNumber || data?.cnic_number || "CNIC Number",
          validFrom: validFrom || "00:00",
          validTo: validTo || "23:59",
          qrCodeId: data?.qr_code_id || formData.qrCodeId,
        };
        console.log("[Print QR] Final data sent to PrintQROnSave:", printData);
        setPrintQRData(printData);
      }
    },
    onError: (mutationError) => {
      const message =
        mutationError instanceof Error
          ? mutationError.message
          : "Failed to save visitor.";
      toast({
        title: "Save failed",
        description: message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    try {
      const payload = buildPreRegistrationPayload(formData as Record<string, unknown>);
      createVisitorMutation.mutate(payload);
    } catch (err) {
      const message =
        err instanceof z.ZodError
          ? err.errors[0]?.message ?? "Please fix the form errors."
          : err instanceof Error
            ? err.message
            : "Validation failed.";
      toast({
        title: "Validation failed",
        description: message,
        variant: "destructive",
      });
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setCurrentStep(1);
    setFormData(initialPreRegFormData);
  };

  return (
    <div className="w-full max-w-350 mx-auto">
      {/* Breadcrumb */}
      <nav className="text-sm text-muted-foreground mb-6 flex flex-wrap items-center gap-x-2 gap-y-1" aria-label="Breadcrumb">
        <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
        <span aria-hidden className="text-muted-foreground/70">/</span>
        <Link to="/pre-registration" className="hover:text-foreground transition-colors">Visitor Registration</Link>
        <span aria-hidden className="text-muted-foreground/70">/</span>
        <span className="text-[#3b82f6] font-medium" aria-current="page">
          {showForm ? "New Pre-Registration" : "Pre-Registration"}
        </span>
      </nav>

      {!showForm ? (
        <>
          {/* Page header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div className="min-w-0">
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                Pre-Registration
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                View and manage pre-registrations. Add a new visitor to start.
              </p>
            </div>
            <Button
              onClick={() => {
                setFormData(initialPreRegFormData);
                setCurrentStep(1);
                setShowForm(true);
              }}
              className="bg-[#3b82f6] hover:bg-[#2563eb] text-white shrink-0 w-full sm:w-auto"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              New Pre-Registration
            </Button>
          </div>

          {/* Recent registrations */}
          <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
            <div className="px-4 sm:px-6 py-4 border-b border-border bg-muted/30">
              <h2 className="text-base font-semibold text-foreground">Recent Registrations</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Click a row to view details or use the menu for actions.</p>
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
                          <span
                            className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${getStatusStyle(reg.status)}`}
                          >
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
                e.preventDefault();
                if (deleteId == null) return;
                setIsDeleting(true);
                try {
                  await deleteVisitor(deleteId);
                  queryClient.invalidateQueries({ queryKey: ["visitors"] });
                  toast({ title: "Visitor deleted", description: "The visitor has been removed." });
                  setDeleteId(null);
                } catch (err) {
                  toast({
                    title: "Delete failed",
                    description: err instanceof Error ? err.message : "Could not delete visitor.",
                    variant: "destructive",
                  });
                } finally {
                  setIsDeleting(false);
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
          qrCodeId={printQRData.qrCodeId}
          visitorName={printQRData.visitorName}
          visitorCNIC={printQRData.visitorCNIC}
          validFrom={printQRData.validFrom}
          validTo={printQRData.validTo}
          onDone={() => setPrintQRData(null)}
        />
      )}

      {showForm ? (
        <>
          {/* Page Title + Step progress */}
          <div className="mb-6">
            <h1 className="text-xl font-semibold text-foreground">
              New Visitor Pre-Registration
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Complete all steps to register a visitor. Step {currentStep} of 7 — {steps[currentStep - 1]?.title}
            </p>
          </div>

          {/* Step Indicator */}
          <StepIndicator steps={steps} currentStep={currentStep} />

          {/* Form Content - card */}
          <div className="mt-6 rounded-xl border border-border bg-card shadow-sm overflow-hidden">
            <div className="bg-muted/40 px-6 py-3 border-b border-border">
              <span className="text-sm font-medium text-foreground">
                {steps[currentStep - 1]?.title}
              </span>
            </div>
            <div className="p-6 md:p-8">
              {currentStep === 1 && (
                <Step1PersonalInfo
                  formData={formData}
                  updateFormData={updateFormData}
                />
              )}
              {currentStep === 2 && (
                <Step2VisitDetails
                  formData={formData}
                  updateFormData={updateFormData}
                />
              )}
              {currentStep === 3 && (
                <Step3DocumentUpload
                  formData={formData}
                  updateFormData={updateFormData}
                />
              )}
              {currentStep === 4 && (
                <Step4PhotoCapture
                  formData={formData}
                  updateFormData={updateFormData}
                />
              )}
              {currentStep === 5 && (
                <Step3Organization
                  formData={formData}
                  updateFormData={updateFormData}
                />
              )}
              {currentStep === 6 && (
                <Step4Consent
                  formData={formData}
                  updateFormData={updateFormData}
                />
              )}
              {currentStep === 7 && (
                <Step5QRCodeGeneration
                  formData={formData}
                  updateFormData={updateFormData}
                />
              )}
            </div>
          </div>

          {/* Footer: Back to list (left) | Previous / Next or Submit (right) */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mt-6 pt-4 border-t border-border">
            <Button
              variant="outline"
              onClick={handleCancelForm}
              className="order-2 sm:order-1 border-border text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              Back to list
            </Button>
            <div className="flex items-center gap-3 order-1 sm:order-2">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 1}
                className="min-w-25 border-[#3b82f6] text-[#3b82f6] hover:bg-[#3b82f6]/10 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </Button>
              {currentStep < 7 ? (
                <Button
                  onClick={handleNext}
                  className="min-w-25 bg-[#3b82f6] hover:bg-[#2563eb] text-white"
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={createVisitorMutation.isPending}
                  className="min-w-30 bg-[#3b82f6] hover:bg-[#2563eb] text-white"
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
