import { useParams, Link, useNavigate } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { getVisitor } from "@/lib/visitor-api"
import { Button } from "@/components/ui/button"
import { ROUTES } from "@/routes/config"
import { ArrowLeft, User, FileText, Image as ImageIcon } from "lucide-react"

type VisitorRecordExtended = Record<string, unknown>

function isImageUrl(value: unknown): value is string {
  return typeof value === "string" && (value.startsWith("data:image/") || value.startsWith("blob:"))
}

function DocPreview({ label, src }: { label: string; src: string | undefined }) {
  if (!src || !isImageUrl(src)) return null
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <div className="rounded-lg border border-border bg-muted/20 overflow-hidden inline-block max-w-full">
        <img src={src} alt={label} className="max-h-64 w-auto object-contain" />
      </div>
    </div>
  )
}

export default function VisitorDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const visitorId = id ? parseInt(id, 10) : NaN

  const { data: visitor, isLoading, isError } = useQuery({
    queryKey: ["visitor", visitorId],
    queryFn: () => getVisitor(visitorId, "walk-in"),
    enabled: Number.isInteger(visitorId),
  })

  const v = visitor as VisitorRecordExtended | null | undefined

  if (isLoading || !id) {
    return (
      <div className="w-full px-4 sm:px-6 py-8">
        <div className="flex items-center justify-center min-h-[200px] text-muted-foreground">
          {!id ? "Invalid visitor" : "Loading…"}
        </div>
      </div>
    )
  }

  if (isError || !v) {
    return (
      <div className="w-full px-4 sm:px-6 py-8">
        <p className="text-destructive mb-4">Visitor not found.</p>
        <Button variant="outline" asChild>
          <Link to={ROUTES.WALK_IN_REGISTRATION}>Back to Walk-In Registration</Link>
        </Button>
      </div>
    )
  }

  const fullName = String(v.full_name ?? "Unknown")
  const cnic = String(v.cnic_number ?? "")
  const department = String(v.department_to_visit ?? "—")
  const created = v.created_at ? new Date(String(v.created_at)).toLocaleString() : "—"
  const capturedPhoto = v.captured_photo ?? v.photoCapture
  const frontImage = v.front_image ?? v.frontImage
  const backImage = v.back_image ?? v.backImage
  const applicationLetter = v.application_letter ?? v.applicationLetter
  const additionalDocument = v.additional_document ?? v.additionalDocument

  return (
    <div className="w-full px-4 sm:px-6 py-6">
      <nav className="text-sm text-muted-foreground mb-6 flex items-center gap-2">
        <Link to={ROUTES.DASHBOARD} className="hover:text-foreground">Home</Link>
        <span>/</span>
        <Link to={ROUTES.WALK_IN_REGISTRATION} className="hover:text-foreground">Walk-In Registration</Link>
        <span className="text-foreground">/ Visitor details</span>
      </nav>

      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">{fullName}</h1>
          <p className="text-sm text-muted-foreground">Registered {created}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Basic info */}
        <div className="space-y-6 rounded-xl border border-border bg-card p-6">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
            <User className="h-5 w-5" /> Basic information
          </h2>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <dt className="text-muted-foreground">Full name</dt>
            <dd className="font-medium">{fullName}</dd>
            <dt className="text-muted-foreground">CNIC / Passport</dt>
            <dd className="font-medium">{cnic || "—"}</dd>
            <dt className="text-muted-foreground">Department</dt>
            <dd className="font-medium">{department}</dd>
            <dt className="text-muted-foreground">Mobile</dt>
            <dd className="font-medium">{String(v.mobile_number ?? "—")}</dd>
            <dt className="text-muted-foreground">Email</dt>
            <dd className="font-medium">{String(v.email_address ?? "—")}</dd>
            <dt className="text-muted-foreground">Visit purpose</dt>
            <dd className="font-medium">{String(v.visit_purpose ?? "—")}</dd>
          </dl>
        </div>

        {/* Visitor photo */}
        <div className="space-y-6 rounded-xl border border-border bg-card p-6">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
            <ImageIcon className="h-5 w-5" /> Visitor photo
          </h2>
          {isImageUrl(capturedPhoto) ? (
            <div className="rounded-lg border border-border overflow-hidden inline-block">
              <img src={capturedPhoto} alt="Visitor" className="max-h-64 w-auto object-contain" />
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No photo captured.</p>
          )}
        </div>

        {/* Documents */}
        <div className="lg:col-span-2 space-y-6 rounded-xl border border-border bg-card p-6">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
            <FileText className="h-5 w-5" /> Documents (preview)
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <DocPreview label="Visitor photograph / ID front" src={frontImage as string} />
            <DocPreview label="ID back / Proof of identification" src={backImage as string} />
            <DocPreview label="Application letter" src={applicationLetter as string} />
            <DocPreview label="Additional document" src={additionalDocument as string} />
          </div>
        </div>
      </div>

      <div className="mt-6">
        <Button variant="outline" asChild>
          <Link to={ROUTES.WALK_IN_REGISTRATION}>Back to list</Link>
        </Button>
      </div>
    </div>
  )
}
