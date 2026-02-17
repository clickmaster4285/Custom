import { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { StepIndicator } from "@/components/registration/step-indicator"
import { Step1PersonalInfo } from "@/components/registration/step1-personal-info";
import { Step2VisitDetails } from "@/components/registration/step2-visit-details";
import { Step3DocumentUpload } from "@/components/registration/step3-document-upload";
import { Step4PhotoCapture } from "@/components/registration/step4-photo-capture";
import { Step5QRCodeGeneration } from "@/components/registration/step5-qr-code-generation";
import { Step3Organization } from "@/components/registration/step3-organization";
import { Step4Consent } from "@/components/registration/step4-consent";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { createVisitor, fetchVisitors, type VisitorRecord } from "@/lib/visitor-api";
import { ChevronLeft, ChevronRight, MoreHorizontal, UserPlus } from "lucide-react";
import { Link } from "react-router-dom"
import { ROUTES } from "@/routes/config"

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
  { number: 5, title: "QR Code Generation" },
  { number: 6, title: "Organization & Information" },
  { number: 7, title: "Security & Consent" },
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
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["visitors"] });
      toast({
        title: "Pre-Registration saved",
        description: "Visitor has been added to the list.",
      });
      setShowForm(false);
      setCurrentStep(1);
      setFormData(initialPreRegFormData);
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
    const payload = {
      visitor_type: formData.visitorType,
      full_name: formData.fullName || "Unknown Visitor",
      gender: formData.gender,
      cnic_number: formData.cnicNumber,
      passport_number: formData.passportNumber,
      nationality: formData.nationality || "other",
      date_of_birth: formData.dateOfBirth || null,
      mobile_number: formData.mobileNumber || "N/A",
      email_address: formData.emailAddress,
      residential_address: formData.residentialAddress,
      visit_purpose: formData.visitPurpose || "other",
      visit_description: formData.visitDescription,
      department_to_visit: formData.departmentToVisit || "admin",
      host_officer_name: formData.hostOfficerName,
      host_officer_designation: formData.hostOfficerDesignation,
      preferred_visit_date: formData.preferredVisitDate || null,
      preferred_time_slot: formData.preferredTimeSlot,
      expected_duration: formData.expectedDuration,
      preferred_view_visit: formData.preferredViewVisit,
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
      organization_name: formData.organizationName,
      organization_type: formData.organizationType,
      ntn_registration_no: formData.ntnRegistrationNo,
      designation: formData.designation,
      office_address: formData.officeAddress,
      capture_date: formData.captureDate,
      capture_time: formData.captureTime,
      captured_by: formData.capturedBy,
      camera_location: formData.cameraLocation,
      photo_quality_score: formData.photoQualityScore,
      face_match_status: formData.faceMatchStatus,
      captured_photo: formData.capturedPhoto,
      disclaimer_accepted: formData.disclaimerAccepted,
      terms_accepted: formData.termsAccepted,
      previous_visit_reference: formData.previousVisitReference,
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
      registration_type: "pre-registration",
      cnic_passport: formData.cnicNumber || formData.passportNumber,
      visit_purpose_description: formData.visitDescription,
      visit_type: "",
      reference_number: formData.previousVisitReference,
      preferred_date: formData.preferredVisitDate,
      preferred_time_slot_walkin: "",
      department_for_slot: "",
      slot_duration: "",
      host_id: "",
      host_full_name: formData.hostOfficerName,
      host_designation: formData.hostOfficerDesignation,
      host_department: formData.departmentToVisit,
      watchlist_check_status: "",
      approver_required: "",
      temporary_access_granted: "",
      guard_remarks: "",
    };
    createVisitorMutation.mutate(payload);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setCurrentStep(1);
    setFormData(initialPreRegFormData);
  };

  return (
    <>
      {/* Breadcrumb */}
      <div className="text-sm text-muted-foreground mb-4">
            <Link to={ROUTES.DASHBOARD} className="hover:text-foreground">
              Home
            </Link>
            <span className="mx-2">/</span>
            <Link to={ROUTES.DASHBOARD} className="hover:text-foreground">
              Visitor Registration
            </Link>
            <span className="mx-2">/</span>
            <span className="text-[#3b82f6]">
              {showForm ? "New Pre-Registration" : "Pre-Registration"}
            </span>
          </div>

          {!showForm ? (
            <>
              {/* Page Title + Pre-Registration Button */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-xl font-semibold text-foreground">
                    Pre-Registration
                  </h1>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    View and manage pre-registrations. Add a new visitor to start.
                  </p>
                </div>
                <Button
                  onClick={() => {
                    setFormData(initialPreRegFormData);
                    setCurrentStep(1);
                    setShowForm(true);
                  }}
                  className="bg-[#3b82f6] hover:bg-[#2563eb] text-white"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Pre-Registration
                </Button>
              </div>

              {/* Recent Registrations Table */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-semibold text-foreground">
                    Recent Registrations
                  </h2>
                  <button className="text-sm text-[#3b82f6] hover:underline">
                    View All
                  </button>
                </div>
                <div className="bg-background rounded-xl border border-border overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Visitor Name
                        </th>
                        <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Type
                        </th>
                        <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Department
                        </th>
                        <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Status
                        </th>
                        <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Time
                        </th>
                        <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Action
                        </th>
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
                              <span
                                className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${getStatusStyle(reg.status)}`}
                              >
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
              {/* Page Title when in form */}
              <div className="mb-6">
                <h1 className="text-xl font-semibold text-foreground">
                  New Visitor Pre-Registration
                </h1>
                <p className="text-sm text-muted-foreground">
                  Complete the pre-registration fields to schedule a new visit
                </p>
              </div>

              {/* Step Indicator */}
              <StepIndicator steps={steps} currentStep={currentStep} />

              {/* Form Content */}
              <div className="bg-background rounded-lg border border-border p-6 mt-6">
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
              <Step5QRCodeGeneration
                formData={formData}
                updateFormData={updateFormData}
              />
            )}
            {currentStep === 6 && (
              <Step3Organization
                formData={formData}
                updateFormData={updateFormData}
              />
            )}
            {currentStep === 7 && (
              <Step4Consent
                formData={formData}
                updateFormData={updateFormData}
              />
            )}
              </div>

              {/* Footer Buttons */}
              <div className="flex items-center justify-between mt-6">
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    className="bg-transparent"
                    onClick={handleCancelForm}
                  >
                    Back to list
                  </Button>
              <button className="text-[#3b82f6] text-sm font-medium hover:underline">
                Save &amp; Continue
              </button>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 1}
                className={`bg-transparent ${currentStep === 1 ? "opacity-50 cursor-not-allowed" : "border-[#3b82f6] text-[#3b82f6] hover:bg-[#3b82f6]/10"}`}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </Button>
              {currentStep < 7 ? (
                <Button
                  onClick={handleNext}
                  className="bg-[#3b82f6] hover:bg-[#2563eb] text-white"
                >
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
