import { useState } from "react"
import { Link, useParams, useNavigate } from "react-router-dom"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getVisitor, deleteVisitor } from "@/lib/visitor-api"
import { Spinner } from "@/components/ui/spinner"
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
import {
  User,
  Calendar,
  FileCheck,
  FileText,
  Building2,
  Camera,
  ShieldCheck,
  QrCode,
  Hash,
  ImageIcon,
  ArrowLeft,
  Pencil,
  Trash2,
} from "lucide-react"
import { cn } from "@/lib/utils"

function getInitials(name: string) {
  const parts = String(name).trim().split(/\s+/).filter(Boolean)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  if (parts[0]) return parts[0].slice(0, 2).toUpperCase()
  return "??"
}

function formatDate(v: string | null | undefined): string {
  if (v == null || v === "") return "—"
  return String(v)
}

function formatBool(v: boolean | undefined): string {
  return v ? "Yes" : "No"
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  if (value == null || value === "" || (typeof value === "string" && value.trim() === "")) return null
  return (
    <div className="flex flex-col gap-1 py-2">
      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</span>
      <span className="text-sm text-foreground break-words font-medium">{value}</span>
    </div>
  )
}

function isDataUrl(s: string | undefined): boolean {
  return Boolean(s && s.startsWith("data:"))
}

function ImageBlock({ src, alt, label }: { src?: string; alt: string; label: string }) {
  if (!src || !isDataUrl(src)) {
    return (
      <div className="flex flex-col gap-2">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</span>
        <div className="rounded-xl border border-dashed border-border bg-muted/30 flex flex-col items-center justify-center py-10 px-4 min-h-[140px]">
          <ImageIcon className="h-10 w-10 text-muted-foreground/60 mb-2" strokeWidth={1.5} />
          <span className="text-sm text-muted-foreground">No image uploaded</span>
        </div>
      </div>
    )
  }
  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</span>
      <div className="rounded-xl border border-border bg-muted/10 overflow-hidden shadow-sm">
        <img src={src} alt={alt} className="w-full max-h-[280px] object-contain" />
      </div>
    </div>
  )
}

function DocumentBlock({ content, label }: { content?: string; label: string }) {
  if (!content || !content.trim()) {
    return (
      <div className="flex flex-col gap-2">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</span>
        <div className="rounded-xl border border-dashed border-border bg-muted/30 flex flex-col items-center justify-center py-8 px-4 min-h-[120px]">
          <FileText className="h-9 w-9 text-muted-foreground/60 mb-2" strokeWidth={1.5} />
          <span className="text-sm text-muted-foreground text-center">No document</span>
        </div>
      </div>
    )
  }
  if (isDataUrl(content)) {
    return (
      <div className="flex flex-col gap-2">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</span>
        <div className="rounded-xl border border-border bg-muted/10 overflow-hidden shadow-sm">
          <img src={content} alt={label} className="w-full max-h-[320px] object-contain" />
        </div>
      </div>
    )
  }
  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</span>
      <div className="rounded-xl border border-border bg-muted/10 p-4">
        <p className="text-sm text-foreground break-words whitespace-pre-wrap leading-relaxed">{content}</p>
      </div>
    </div>
  )
}

function Section({
  title,
  icon: Icon,
  children,
  className,
}: {
  title: string
  icon: React.ElementType
  children: React.ReactNode
  className?: string
}) {
  return (
    <section className={cn("rounded-xl border border-border bg-card p-5 shadow-sm", className)}>
      <div className="flex items-center gap-2.5 mb-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#3b82f6]/10 text-[#3b82f6]">
          <Icon className="h-4 w-4" strokeWidth={2} />
        </div>
        <h3 className="text-sm font-semibold text-foreground tracking-tight">{title}</h3>
      </div>
      <div className="grid gap-0.5 text-sm">{children}</div>
    </section>
  )
}

export default function VisitorDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const visitorId = id != null ? Number(id) : NaN
  const isValidId = !Number.isNaN(visitorId) && visitorId > 0

  const { data: visitor, isLoading, isError, error } = useQuery({
    queryKey: ["visitor", visitorId],
    queryFn: () => getVisitor(visitorId),
    enabled: isValidId,
  })

  const handleDelete = async () => {
    if (!isValidId) return
    setIsDeleting(true)
    try {
      await deleteVisitor(visitorId)
      queryClient.invalidateQueries({ queryKey: ["visitors"] })
      queryClient.removeQueries({ queryKey: ["visitor", visitorId] })
      setDeleteDialogOpen(false)
      navigate("/pre-registration", { replace: true })
    } catch (err) {
      console.error(err)
      setIsDeleting(false)
    }
  }

  if (!isValidId) {
    return (
      <div className="w-full max-w-[1200px] mx-auto space-y-6">
        <Button variant="outline" size="sm" onClick={() => navigate(-1)} className="border-border">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="rounded-xl border border-destructive/40 bg-destructive/5 px-5 py-8 text-sm text-destructive shadow-sm">
          <p className="font-medium">Invalid visitor ID.</p>
          <p className="mt-1 text-destructive/90">Please check the link or go back to the list.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-0 flex flex-col w-full max-w-[1200px] mx-auto">
      {/* Breadcrumb + Back */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
        <nav className="text-sm text-muted-foreground flex flex-wrap items-center gap-x-2 gap-y-1" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
          <span aria-hidden className="text-muted-foreground/70">/</span>
          <Link to="/pre-registration" className="hover:text-foreground transition-colors">Visitor Registration</Link>
          <span aria-hidden className="text-muted-foreground/70">/</span>
          <span className="text-[#3b82f6] font-medium" aria-current="page">Visitor details</span>
        </nav>
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <Button variant="outline" size="sm" onClick={() => navigate(-1)} className="border-border shrink-0 flex-1 sm:flex-none">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          {visitor && (
            <>
              <Button variant="outline" size="sm" asChild className="border-[#3b82f6] text-[#3b82f6] hover:bg-[#3b82f6]/10 shrink-0">
                <Link to={`/visitors/${visitorId}/edit`}>
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit
                </Link>
              </Button>
              <Button variant="outline" size="sm" onClick={() => setDeleteDialogOpen(true)} className="border-destructive/50 text-destructive hover:bg-destructive/10 shrink-0">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </>
          )}
        </div>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
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
              onClick={(e) => { e.preventDefault(); handleDelete(); }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {isLoading && (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <Spinner className="h-10 w-10 text-[#3b82f6]" />
          <p className="text-sm text-muted-foreground">Loading visitor details…</p>
        </div>
      )}

      {isError && (
        <div className="rounded-xl border border-destructive/40 bg-destructive/5 px-5 py-8 text-sm text-destructive shadow-sm">
          <p className="font-medium">Failed to load visitor</p>
          <p className="mt-1 text-destructive/90">{error instanceof Error ? error.message : "Something went wrong."}</p>
          <Button variant="outline" size="sm" className="mt-4 border-destructive/50 text-destructive" onClick={() => navigate(-1)}>
            Go back
          </Button>
        </div>
      )}

      {visitor && !isLoading && (
        <>
          {/* Header card */}
          <div className="rounded-xl border border-border bg-card p-5 sm:p-6 shadow-sm mb-6">
            <div className="flex flex-col sm:flex-row sm:items-start gap-5">
              <Avatar className="h-20 w-20 shrink-0 ring-2 ring-border shadow-md">
                {visitor.captured_photo?.startsWith("data:") ? (
                  <img
                    src={visitor.captured_photo}
                    alt=""
                    className="h-full w-full object-cover rounded-full"
                  />
                ) : (
                  <AvatarImage src={visitor.captured_photo} />
                )}
                <AvatarFallback className="text-xl bg-[#3b82f6]/10 text-[#3b82f6] font-semibold">
                  {getInitials(visitor.full_name ?? "")}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <h1 className="text-xl font-semibold text-foreground">{visitor.full_name ?? "Visitor"}</h1>
                {(visitor.registration_type || visitor.visitor_type) && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {[visitor.registration_type, visitor.visitor_type].filter(Boolean).map((t) => (
                      <span
                        key={t}
                        className="inline-flex items-center rounded-md bg-[#3b82f6]/10 px-2 py-0.5 text-xs font-medium text-[#3b82f6]"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}
                {visitor.created_at && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Registered {new Date(visitor.created_at).toLocaleDateString(undefined, { dateStyle: "medium" })}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Sections */}
          <div className="space-y-5 pb-10">
            <Section title="Personal information" icon={User}>
              <DetailRow label="Full name" value={visitor.full_name} />
              <DetailRow label="Gender" value={visitor.gender} />
              <DetailRow label="CNIC" value={visitor.cnic_number} />
              <DetailRow label="Passport" value={visitor.passport_number} />
              <DetailRow label="Nationality" value={visitor.nationality} />
              <DetailRow label="Date of birth" value={formatDate(visitor.date_of_birth)} />
              <DetailRow label="Mobile" value={visitor.mobile_number} />
              <DetailRow label="Email" value={visitor.email_address} />
              <DetailRow label="Residential address" value={visitor.residential_address} />
            </Section>

            <Section title="Visit details" icon={Calendar}>
              <DetailRow label="Purpose" value={visitor.visit_purpose} />
              <DetailRow label="Description" value={visitor.visit_description} />
              <DetailRow label="Department to visit" value={visitor.department_to_visit} />
              <DetailRow label="Host officer" value={visitor.host_officer_name} />
              <DetailRow label="Host designation" value={visitor.host_officer_designation} />
              <DetailRow label="Preferred visit date" value={formatDate(visitor.preferred_visit_date)} />
              <DetailRow label="Preferred time slot" value={visitor.preferred_time_slot} />
              <DetailRow label="Expected duration" value={visitor.expected_duration} />
              <DetailRow label="Preferred view/visit" value={visitor.preferred_view_visit} />
            </Section>

            <Section title="Identity document" icon={FileCheck}>
              <DetailRow label="Document type" value={visitor.document_type} />
              <DetailRow label="Document number" value={visitor.document_no} />
              <DetailRow label="Issuing authority" value={visitor.issuing_authority} />
              <DetailRow label="Expiry date" value={formatDate(visitor.expiry_date)} />
              <DetailRow label="Support doc type" value={visitor.support_doc_type} />
              <DetailRow label="Letter ref no" value={visitor.letter_ref_no} />
              <DetailRow label="Upload procedure" value={visitor.upload_procedure} />
              <div className="grid grid-cols-1 gap-4 pt-2">
                <ImageBlock src={visitor.front_image} alt="Document front" label="Document front" />
                <ImageBlock src={visitor.back_image} alt="Document back" label="Document back" />
              </div>
            </Section>

            <Section title="Supporting documents" icon={FileText}>
              <DocumentBlock content={visitor.application_letter} label="Application letter" />
              <DocumentBlock content={visitor.additional_document} label="Additional document" />
            </Section>

            <Section title="Organization" icon={Building2}>
              <DetailRow label="Organization name" value={visitor.organization_name} />
              <DetailRow label="Organization type" value={visitor.organization_type} />
              <DetailRow label="NTN registration no" value={visitor.ntn_registration_no} />
              <DetailRow label="Designation" value={visitor.designation} />
              <DetailRow label="Office address" value={visitor.office_address} />
            </Section>

            <Section title="Photo capture" icon={Camera}>
              <DetailRow label="Capture date" value={visitor.capture_date} />
              <DetailRow label="Capture time" value={visitor.capture_time} />
              <DetailRow label="Captured by" value={visitor.captured_by} />
              <DetailRow label="Camera location" value={visitor.camera_location} />
              <DetailRow label="Photo quality score" value={visitor.photo_quality_score} />
              <DetailRow label="Face match status" value={visitor.face_match_status} />
              <ImageBlock src={visitor.captured_photo} alt="Captured photo" label="Captured photo" />
            </Section>

            <Section title="Consent & reference" icon={ShieldCheck}>
              <DetailRow label="Disclaimer accepted" value={formatBool(visitor.disclaimer_accepted)} />
              <DetailRow label="Terms accepted" value={formatBool(visitor.terms_accepted)} />
              <DetailRow label="Previous visit reference" value={visitor.previous_visit_reference} />
            </Section>

            <Section title="Walk-in / security" icon={ShieldCheck}>
              <DetailRow label="Registration type" value={visitor.registration_type} />
              <DetailRow label="Visit type" value={visitor.visit_type} />
              <DetailRow label="Reference number" value={visitor.reference_number} />
              <DetailRow label="Preferred date" value={visitor.preferred_date} />
              <DetailRow label="Preferred time slot (walk-in)" value={visitor.preferred_time_slot_walkin} />
              <DetailRow label="Department for slot" value={visitor.department_for_slot} />
              <DetailRow label="Slot duration" value={visitor.slot_duration} />
              <DetailRow label="Host ID" value={visitor.host_id} />
              <DetailRow label="Host full name" value={visitor.host_full_name} />
              <DetailRow label="Host designation" value={visitor.host_designation} />
              <DetailRow label="Host department" value={visitor.host_department} />
              <DetailRow label="Watchlist check status" value={visitor.watchlist_check_status} />
              <DetailRow label="Approver required" value={visitor.approver_required} />
              <DetailRow label="Temporary access granted" value={visitor.temporary_access_granted} />
              <DetailRow label="Guard remarks" value={visitor.guard_remarks} />
            </Section>

            <Section title="QR & access" icon={QrCode}>
              <DetailRow label="QR code ID" value={visitor.qr_code_id} />
              <DetailRow label="Visitor ref number" value={visitor.visitor_ref_number} />
              <DetailRow label="Visit date" value={formatDate(visitor.visit_date)} />
              <DetailRow label="Time validity start" value={visitor.time_validity_start} />
              <DetailRow label="Time validity end" value={visitor.time_validity_end} />
              <DetailRow label="Access zone" value={visitor.access_zone} />
              <DetailRow label="Entry gate" value={visitor.entry_gate} />
              <DetailRow label="Expiry status" value={visitor.expiry_status} />
              <DetailRow
                label="Scan count"
                value={visitor.scan_count != null ? String(visitor.scan_count) : undefined}
              />
              <DetailRow label="Generated on" value={formatDate(visitor.generated_on)} />
              <DetailRow label="Generated by" value={visitor.generated_by} />
            </Section>

            <Section title="Record" icon={Hash}>
              <DetailRow label="ID" value={visitor.id} />
              <DetailRow
                label="Created at"
                value={
                  visitor.created_at ? new Date(visitor.created_at).toLocaleString() : undefined
                }
              />
            </Section>
          </div>
        </>
      )}
    </div>
  )
}
