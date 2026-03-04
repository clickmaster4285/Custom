import { useParams, Link, useNavigate } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { getVisitor } from "@/lib/visitor-api"
import { getVisitorPhotoUrl } from "@/lib/image-match"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ROUTES } from "@/routes/config"
import {
  ArrowLeft,
  User,
  FileText,
  Image as ImageIcon,
  Mail,
  Building2,
  Car,
  Calendar,
  Shield,
  QrCode,
  Users,
  ListChecks,
} from "lucide-react"
import type { RegistrationSource } from "@/lib/visitor-api"

type VisitorRecordExtended = Record<string, unknown>

function isImageUrl(value: unknown): value is string {
  return typeof value === "string" && (value.startsWith("data:image/") || value.startsWith("blob:"))
}

/** Get value from visitor with optional snake_case and camelCase keys. */
function val(
  v: VisitorRecordExtended,
  snake: string,
  camel?: string
): string {
  const a = v[snake]
  if (a != null && String(a).trim() !== "") return String(a).trim()
  if (camel) {
    const b = v[camel]
    if (b != null && String(b).trim() !== "") return String(b).trim()
  }
  return "—"
}

function DocPreview({ label, src, alwaysShow = false }: { label: string; src: string | undefined; alwaysShow?: boolean }) {
  const hasImage = src && isImageUrl(src)
  if (!alwaysShow && !hasImage) return null
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      {hasImage ? (
        <div className="rounded-lg border border-border bg-muted/20 overflow-hidden inline-block max-w-full">
          <img src={src} alt={label} className="max-h-64 w-auto object-contain" />
        </div>
      ) : (
        <p className="text-sm text-muted-foreground italic">No document uploaded</p>
      )}
    </div>
  )
}

function SectionCard({
  title,
  description,
  icon: Icon,
  children,
  className,
}: {
  title: string
  description?: string
  icon: React.ElementType
  children: React.ReactNode
  className?: string
}) {
  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-[18px] font-semibold">
          <Icon className="h-5 w-5 text-[#3b82f6]" /> {title}
        </CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="space-y-4">{children}</CardContent>
    </Card>
  )
}

function InfoGrid({ entries, showAll = true }: { entries: { label: string; value: string }[]; showAll?: boolean }) {
  const list = showAll ? entries : entries.filter((e) => e.value !== "—")
  if (list.length === 0) return <p className="text-sm text-muted-foreground">No information provided.</p>
  return (
    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
      {list.map(({ label, value }) => (
        <div key={label}>
          <dt className="text-muted-foreground">{label}</dt>
          <dd className="font-medium text-foreground">{value}</dd>
        </div>
      ))}
    </dl>
  )
}

export default function VisitorDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const visitorId = id ? parseInt(id, 10) : NaN

  const { data: visitor, isLoading, isError } = useQuery({
    queryKey: ["visitor", visitorId],
    queryFn: async () => {
      const [walkIn, preReg] = await Promise.all([
        getVisitor(visitorId, "walk-in"),
        getVisitor(visitorId, "pre-registration"),
      ])
      return walkIn ?? preReg ?? null
    },
    enabled: Number.isInteger(visitorId),
  })

  const v = visitor as VisitorRecordExtended | null | undefined

  if (isLoading || !id) {
    return (
      <div className="w-full px-4">
        <div className="flex items-center justify-center min-h-[200px] text-muted-foreground">
          {!id ? "Invalid visitor" : "Loading…"}
        </div>
      </div>
    )
  }

  if (isError || !v) {
    return (
      <div className="w-full px-4">
        <nav className="text-base text-muted-foreground mb-6 flex flex-wrap items-center gap-x-2 gap-y-1" aria-label="Breadcrumb">
          <Link to={ROUTES.DASHBOARD} className="hover:text-foreground transition-colors">Home</Link>
          <span aria-hidden className="text-muted-foreground/70">/</span>
          <span className="text-foreground" aria-current="page">Visitor details</span>
        </nav>
        <Card>
          <CardContent className="pt-6">
            <p className="text-destructive mb-4">Visitor not found.</p>
            <Button variant="outline" size="default" asChild>
              <Link to={ROUTES.DASHBOARD}>Back to Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const fullName = String(v.full_name ?? "Unknown")
  const created = v.created_at ? new Date(String(v.created_at)).toLocaleString() : "—"
  const source = (v.registration_source as RegistrationSource) ?? "walk-in"
  const mainPhoto = getVisitorPhotoUrl(v)
  const capturedPhoto = v.captured_photo ?? v.photoCapture
  const visitorPhotos = Array.isArray(v.visitor_photos)
    ? (v.visitor_photos as string[])
    : Array.isArray(v.visitorPhotos)
      ? (v.visitorPhotos as string[])
      : []
  const minors = Array.isArray(v.visitor_minors)
    ? (v.visitor_minors as VisitorRecordExtended[])
    : Array.isArray(v.visitorMinors)
      ? (v.visitorMinors as VisitorRecordExtended[])
      : []

  const basicEntries = [
    { label: "Visitor category", value: val(v, "visitor_category", "visitorCategory") },
    { label: "Visitor search", value: val(v, "visitor_search", "visitorSearch") },
    { label: "Full name", value: fullName },
    { label: "Visitor type", value: val(v, "visitor_type", "visitorType") },
    { label: "Gender", value: val(v, "gender") },
    { label: "CNIC / ID number", value: val(v, "cnic_number", "cnicNumber") },
    { label: "Passport number", value: val(v, "passport_number", "passportNumber") },
    { label: "Nationality", value: val(v, "nationality") },
    { label: "Date of birth", value: val(v, "date_of_birth", "dateOfBirth") },
  ]

  const contactEntries = [
    { label: "Mobile number", value: val(v, "mobile_number", "mobileNumber") },
    { label: "Email address", value: val(v, "email_address", "emailAddress") },
    { label: "Residential address", value: val(v, "residential_address", "residentialAddress") },
  ]

  const orgEntries = [
    { label: "Organization name", value: val(v, "organization_name", "organizationName") },
    { label: "Organization type", value: val(v, "organization_type", "organizationType") },
    { label: "NTN / Registration no.", value: val(v, "ntn_registration_no", "ntnRegistrationNo") },
    { label: "Designation", value: val(v, "designation") },
    { label: "Office address", value: val(v, "office_address", "officeAddress") },
  ]

  const vehicleEntries = [
    { label: "Vehicle type", value: val(v, "vehicle_type", "vehicleType") },
    { label: "Vehicle number", value: val(v, "vehicle_number", "vehicleNumber") },
    { label: "Registration no.", value: val(v, "vehicle_registration_no", "vehicleRegistrationNo") },
    { label: "License number", value: val(v, "license_no", "licenseNo") },
    { label: "License issue date", value: val(v, "license_issue_date", "licenseIssueDate") },
    { label: "License expiry date", value: val(v, "license_expiry_date", "licenseExpiryDate") },
  ]

  const visitEntries = [
    { label: "Visit purpose", value: val(v, "visit_purpose", "visitPurpose") },
    { label: "Visit description", value: val(v, "visit_purpose_description", "visitPurposeDescription") },
    { label: "Visit type", value: val(v, "visit_type", "visitType") },
    { label: "Department to visit", value: val(v, "department_to_visit", "department") },
    { label: "Department (slot)", value: val(v, "department_for_slot", "departmentForSlot") },
    {
      label: "Host name",
      value: [val(v, "host_officer_name", "hostFullName"), val(v, "host_name", "hostName")].find((x) => x !== "—") ?? "—",
    },
    { label: "Host ID", value: val(v, "host_id", "hostId") },
    { label: "Host designation", value: val(v, "host_officer_designation", "hostDesignation") },
    { label: "Host department", value: val(v, "host_department", "hostDepartment") },
    { label: "Host email", value: val(v, "host_email", "hostEmail") },
    { label: "Host contact", value: val(v, "host_contact_number", "hostContactNumber") },
    { label: "Preferred date", value: val(v, "preferred_visit_date", "preferredDate") },
    { label: "Time slot", value: val(v, "preferred_time_slot", "preferredTimeSlot") },
    { label: "Slot duration", value: val(v, "slot_duration", "slotDuration") },
    { label: "Priority level", value: val(v, "priority_level", "priorityLevel") },
    { label: "Visit date", value: val(v, "visit_date", "visitDate") },
    { label: "Location", value: val(v, "location") },
  ]

  const accessEntries = [
    { label: "Access zone", value: val(v, "access_zone", "accessZone") },
    { label: "Entry gate", value: val(v, "entry_gate", "entryGate") },
    { label: "Time validity start", value: val(v, "time_validity_start", "timeValidityStart") },
    { label: "Time validity end", value: val(v, "time_validity_end", "timeValidityEnd") },
    { label: "QR / Pass ID", value: val(v, "qr_code_id", "qrCodeId") },
    { label: "Visitor reference no.", value: val(v, "visitor_ref_number", "visitorRefNumber") },
    { label: "Reference number", value: val(v, "reference_number", "referenceNumber") },
    { label: "Document type", value: val(v, "document_type", "documentType") },
    { label: "Document number", value: val(v, "document_no", "documentNo") },
    { label: "Issuing authority", value: val(v, "issuing_authority", "issuingAuthority") },
    { label: "Expiry date", value: val(v, "expiry_date", "expiryDate") },
    { label: "Letter ref no.", value: val(v, "letter_ref_no", "letterRefNo") },
    { label: "Support doc type", value: val(v, "support_doc_type", "supportDocType") },
    { label: "Upload procedure", value: val(v, "upload_procedure", "uploadProcedure") },
  ]

  const screeningEntries = [
    { label: "Watchlist check", value: val(v, "watchlist_check_status", "watchlistCheckStatus") },
    { label: "Security level", value: val(v, "security_level", "securityLevel") },
    { label: "Escort required", value: val(v, "escort_mandatory", "escortMandatory") },
    { label: "Guard remarks", value: val(v, "guard_remarks", "guardRemarks") },
    { label: "Max visit duration", value: val(v, "max_visit_duration", "maxVisitDuration") },
    { label: "Allowed departments", value: val(v, "allowed_departments", "allowedDepartments") },
    { label: "Allowed zones", value: val(v, "allowed_zones", "allowedZones") },
    { label: "Additional remarks", value: val(v, "additional_remarks", "additionalRemarks") },
    { label: "Approver required", value: val(v, "approver_required", "approverRequired") },
    { label: "Temporary access granted", value: val(v, "temporary_access_granted", "temporaryAccessGranted") },
  ]

  const metadataEntries = [
    { label: "Expiry status", value: val(v, "expiry_status", "expiryStatus") },
    { label: "Scan count", value: val(v, "scan_count", "scanCount") },
    { label: "Generated on", value: val(v, "generated_on", "generatedOn") },
    { label: "Generated by", value: val(v, "generated_by", "generatedBy") },
  ]

  const listBackHref = source === "pre-registration" ? ROUTES.PRE_REGISTRATION : ROUTES.WALK_IN_REGISTRATION
  const listBackLabel = source === "pre-registration" ? "Pre-Registration" : "Walk-In Registration"
  const vehicleImagesList = Array.isArray(v.vehicle_images) ? (v.vehicle_images as string[]) : []
  const vehicleImageSingle = v.vehicle_image ?? v.vehicleImage

  return (
    <div className="w-full px-4">
      <nav className="text-base text-muted-foreground mb-6 flex flex-wrap items-center gap-x-2 gap-y-1" aria-label="Breadcrumb">
        <Link to={ROUTES.DASHBOARD} className="hover:text-foreground transition-colors">Home</Link>
        <span aria-hidden className="text-muted-foreground/70">/</span>
        <Link to={listBackHref} className="hover:text-foreground transition-colors">{listBackLabel}</Link>
        <span aria-hidden className="text-muted-foreground/70">/</span>
        <span className="text-[#3b82f6] font-medium" aria-current="page">Visitor details</span>
      </nav>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div className="min-w-0 flex items-center gap-3">
          <Button variant="outline" size="default" onClick={() => navigate(-1)} aria-label="Go back" className="shrink-0">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="min-w-0">
            <h1 className="text-[22px] font-bold tracking-tight text-foreground truncate">{fullName}</h1>
            <p className="text-base text-muted-foreground mt-1">
              Registered {created}
              {source && (
                <span className="ml-2 inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                  {source === "pre-registration" ? "Pre-Registration" : "Walk-In"}
                </span>
              )}
            </p>
          </div>
        </div>
 
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SectionCard title="Basic information" icon={User}>
          <InfoGrid entries={basicEntries} showAll />
        </SectionCard>

        <SectionCard title="Contact & address" icon={Mail}>
          <InfoGrid entries={contactEntries} showAll />
        </SectionCard>

        <SectionCard title="Visitor photos (all)" icon={ImageIcon}>
          {(() => {
            const allPhotos = visitorPhotos.length > 0
              ? visitorPhotos.filter((url) => isImageUrl(url))
              : mainPhoto && isImageUrl(mainPhoto)
                ? [mainPhoto]
                : capturedPhoto && isImageUrl(capturedPhoto)
                  ? [capturedPhoto]
                  : []
            if (allPhotos.length === 0) {
              return <p className="text-sm text-muted-foreground">No photo captured.</p>
            }
            return (
              <div className="space-y-4">
                <p className="text-sm font-medium text-muted-foreground">{allPhotos.length} photo(s)</p>
                <div className="flex flex-wrap gap-3">
                  {allPhotos.map((url, i) => (
                    <div key={i} className="rounded-lg border border-border overflow-hidden bg-muted/20">
                      <img src={url} alt={`Visitor photo ${i + 1}`} className="max-h-64 w-auto object-contain" />
                      <p className="text-xs text-center py-1 text-muted-foreground">Photo {i + 1}</p>
                    </div>
                  ))}
                </div>
              </div>
            )
          })()}
        </SectionCard>

        <SectionCard title="Organization" icon={Building2}>
          <InfoGrid entries={orgEntries} showAll />
        </SectionCard>

        <SectionCard title="Vehicle & license" icon={Car}>
          <InfoGrid entries={vehicleEntries} showAll />
          <div className="space-y-2 pt-2 border-t border-border mt-2">
            <p className="text-sm font-medium text-muted-foreground">Vehicle images (all)</p>
            {(() => {
              const allVehicleImgs =
                vehicleImagesList.length > 0
                  ? vehicleImagesList.filter((url) => isImageUrl(url))
                  : typeof vehicleImageSingle === "string" && isImageUrl(vehicleImageSingle)
                    ? [vehicleImageSingle]
                    : []
              if (allVehicleImgs.length === 0) {
                return <p className="text-sm text-muted-foreground italic">No vehicle image uploaded.</p>
              }
              return (
                <div className="flex flex-wrap gap-3">
                  {allVehicleImgs.map((url, i) => (
                    <div key={i} className="rounded-lg border border-border overflow-hidden bg-muted/20">
                      <img src={url} alt={`Vehicle ${i + 1}`} className="max-h-48 w-auto object-contain" />
                      <p className="text-xs text-center py-1 text-muted-foreground">Vehicle image {i + 1}</p>
                    </div>
                  ))}
                </div>
              )
            })()}
          </div>
        </SectionCard>

        <SectionCard title="Visit & host details" icon={Calendar}>
          <InfoGrid entries={visitEntries} showAll />
        </SectionCard>

        <SectionCard title="Access & pass" icon={QrCode}>
          <InfoGrid entries={accessEntries} showAll />
        </SectionCard>

        <SectionCard title="Screening & status" icon={Shield}>
          <InfoGrid entries={screeningEntries} showAll />
        </SectionCard>

        <SectionCard title="Document & visit metadata" icon={ListChecks}>
          <InfoGrid entries={metadataEntries} showAll />
        </SectionCard>
      </div>

      {minors.length > 0 && (
        <Card className="mt-6">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-[18px] font-semibold">
              <Users className="h-5 w-5 text-[#3b82f6]" /> Accompanying minors (all details)
            </CardTitle>
            <CardDescription>{minors.length} minor(s) registered with this visitor. Every field and photo shown below.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {minors.map((m, i) => {
              const minorPhotos = Array.isArray(m.photos) ? (m.photos as string[]).filter((url) => typeof url === "string" && isImageUrl(url)) : []
              return (
                <div key={i} className="rounded-lg border border-border bg-muted/20 p-4 space-y-3">
                  <p className="font-medium text-foreground text-lg">
                    {val(m, "name") !== "—" ? val(m, "name") : `Minor ${i + 1}`}
                  </p>
                  <dl className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                    <div><dt className="text-muted-foreground">Relation</dt><dd className="font-medium">{val(m, "relation")}</dd></div>
                    <div><dt className="text-muted-foreground">Gender</dt><dd className="font-medium">{val(m, "gender")}</dd></div>
                    <div><dt className="text-muted-foreground">CNIC / B-form</dt><dd className="font-medium">{val(m, "cnic_or_b_form", "cnicOrBForm")}</dd></div>
                    <div><dt className="text-muted-foreground">Passport</dt><dd className="font-medium">{val(m, "passport_number", "passportNumber")}</dd></div>
                    <div><dt className="text-muted-foreground">Nationality</dt><dd className="font-medium">{val(m, "nationality")}</dd></div>
                    <div><dt className="text-muted-foreground">DOB</dt><dd className="font-medium">{val(m, "date_of_birth", "dateOfBirth")}</dd></div>
                    <div><dt className="text-muted-foreground">Mobile</dt><dd className="font-medium">{val(m, "mobile_number", "mobileNumber")}</dd></div>
                    <div><dt className="text-muted-foreground">Email</dt><dd className="font-medium">{val(m, "email_address", "emailAddress")}</dd></div>
                    <div className="sm:col-span-2"><dt className="text-muted-foreground">Residential address</dt><dd className="font-medium">{val(m, "residential_address", "residentialAddress")}</dd></div>
                  </dl>
                  <div className="pt-2 border-t border-border space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Photographs ({minorPhotos.length})</p>
                    {minorPhotos.length === 0 ? (
                      <p className="text-sm text-muted-foreground italic">No photo uploaded.</p>
                    ) : (
                      <div className="flex flex-wrap gap-3">
                        {minorPhotos.map((url, j) => (
                          <div key={j} className="rounded-lg border border-border overflow-hidden bg-muted/20">
                            <img src={url} alt={`Minor ${i + 1} – photo ${j + 1}`} className="max-h-48 w-auto object-contain" />
                            <p className="text-xs text-center py-1 text-muted-foreground">Photo {j + 1}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      )}

      <Card className="mt-6">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-[18px] font-semibold">
            <FileText className="h-5 w-5 text-[#3b82f6]" /> Documents
          </CardTitle>
          <CardDescription>Uploaded ID, application letter, and other documents.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <DocPreview label="ID front / Visitor photograph" src={(v.front_image ?? v.frontImage) as string} alwaysShow />
            <DocPreview label="ID back / Proof of identification" src={(v.back_image ?? v.backImage) as string} alwaysShow />
            <DocPreview label="Application letter" src={(v.application_letter ?? v.applicationLetter) as string} alwaysShow />
            <DocPreview label="Additional document" src={(v.additional_document ?? v.additionalDocument) as string} alwaysShow />
            <DocPreview label="Authorization letter" src={(v.authorization_letter ?? v.authorizationLetter) as string} alwaysShow />
            <DocPreview label="NOC document" src={(v.noc_document ?? v.nocDocument) as string} alwaysShow />
          </div>
          {(() => {
            const backFiles = (v.back_image_files ?? v.backImageFiles) as { dataUrl?: string; name?: string }[] | undefined
            const authFiles = (v.authorization_letter_files ?? v.authorizationLetterFiles) as { dataUrl?: string; name?: string }[] | undefined
            const nocFiles = (v.noc_document_files ?? v.nocDocumentFiles) as { dataUrl?: string; name?: string }[] | undefined
            const docImages = (v.document_images ?? v.documentImages) as string[] | undefined
            const hasExtra = (Array.isArray(backFiles) && backFiles.length > 1) || (Array.isArray(authFiles) && authFiles.length > 1) || (Array.isArray(nocFiles) && nocFiles.length > 1) || (Array.isArray(docImages) && docImages.length > 0)
            if (!hasExtra) return null
            return (
              <div className="mt-6 pt-6 border-t border-border space-y-4">
                {Array.isArray(backFiles) && backFiles.length > 1 && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Proof of identification (all pages)</p>
                    <div className="flex flex-wrap gap-3">
                      {backFiles.map((f, i) => f?.dataUrl && isImageUrl(f.dataUrl) && (
                        <div key={i} className="rounded-lg border border-border overflow-hidden bg-muted/20">
                          <img src={f.dataUrl} alt={f.name ?? `ID back ${i + 1}`} className="max-h-64 w-auto object-contain" />
                          <p className="text-xs text-center py-1 text-muted-foreground">{f.name ?? `Page ${i + 1}`}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {Array.isArray(authFiles) && authFiles.length > 1 && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Authorization letter (all pages)</p>
                    <div className="flex flex-wrap gap-3">
                      {authFiles.map((f, i) => f?.dataUrl && isImageUrl(f.dataUrl) && (
                        <div key={i} className="rounded-lg border border-border overflow-hidden bg-muted/20">
                          <img src={f.dataUrl} alt={f.name ?? `Auth ${i + 1}`} className="max-h-64 w-auto object-contain" />
                          <p className="text-xs text-center py-1 text-muted-foreground">{f.name ?? `Page ${i + 1}`}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {Array.isArray(nocFiles) && nocFiles.length > 1 && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">NOC document (all pages)</p>
                    <div className="flex flex-wrap gap-3">
                      {nocFiles.map((f, i) => f?.dataUrl && isImageUrl(f.dataUrl) && (
                        <div key={i} className="rounded-lg border border-border overflow-hidden bg-muted/20">
                          <img src={f.dataUrl} alt={f.name ?? `NOC ${i + 1}`} className="max-h-64 w-auto object-contain" />
                          <p className="text-xs text-center py-1 text-muted-foreground">{f.name ?? `Page ${i + 1}`}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {Array.isArray(docImages) && docImages.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Other document images</p>
                    <div className="flex flex-wrap gap-3">
                      {docImages.map((url, i) => isImageUrl(url) && (
                        <div key={i} className="rounded-lg border border-border overflow-hidden bg-muted/20">
                          <img src={url} alt={`Document ${i + 1}`} className="max-h-64 w-auto object-contain" />
                          <p className="text-xs text-center py-1 text-muted-foreground">Document {i + 1}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })()}
        </CardContent>
      </Card>

      <div className="mt-6 flex flex-wrap gap-3">
        <Button variant="outline" size="default" asChild>
          <Link to={listBackHref}>Back to list</Link>
        </Button>
      </div>
    </div>
  )
}
