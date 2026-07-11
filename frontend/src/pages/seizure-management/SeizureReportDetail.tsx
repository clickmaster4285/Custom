import { useEffect, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { ArrowLeft, Loader2 } from "lucide-react"
import { ModulePageLayout } from "@/components/dashboard/module-page-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ROUTES, getDetentionMemoDetailPath } from "@/routes/config"
import { fetchSeizureReportById, type SeizureReportRecord } from "@/lib/seizure-management-api"

export default function SeizureReportDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [row, setRow] = useState<SeizureReportRecord | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    fetchSeizureReportById(id)
      .then(setRow)
      .catch(() => setRow(null))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <ModulePageLayout title="Seizure Report" description="Loading..." breadcrumbs={[]}>
        <p className="text-muted-foreground flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading...
        </p>
      </ModulePageLayout>
    )
  }

  if (!row) {
    return (
      <ModulePageLayout
        title="Seizure Report"
        description="Not found"
        breadcrumbs={[
          { label: "Seizure Management", href: ROUTES.SEIZURE_MANAGEMENT },
          { label: "Seizure Report", href: ROUTES.SEIZURE_MGMT_SEIZURE_REPORT },
        ]}
      >
        <p className="text-muted-foreground">Seizure report not found.</p>
        <Button className="mt-4" variant="outline" onClick={() => navigate(ROUTES.SEIZURE_MGMT_SEIZURE_REPORT)}>
          Back to list
        </Button>
      </ModulePageLayout>
    )
  }

  return (
    <ModulePageLayout
      title={`Seizure Report — ${row.caseNo}`}
      description={`${row.reportDate} · ${row.status}`}
      breadcrumbs={[
        { label: "Seizure Management", href: ROUTES.SEIZURE_MANAGEMENT },
        { label: "Seizure Report", href: ROUTES.SEIZURE_MGMT_SEIZURE_REPORT },
        { label: row.caseNo },
      ]}
    >
      <div className="mb-4 flex gap-2 items-center">
        <Button variant="ghost" size="sm" asChild>
          <Link to={ROUTES.SEIZURE_MGMT_SEIZURE_REPORT}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Link>
        </Button>
        <Badge variant={row.status === "Submitted" ? "default" : "secondary"}>{row.status}</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="rounded-[10px] border-gray-200">
          <CardContent className="p-6 space-y-4">
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-muted-foreground">Case No</dt>
                <dd className="font-medium">{row.caseNo}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Report Date</dt>
                <dd>{row.reportDate}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Prepared By</dt>
                <dd>{row.preparedBy}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Detention Memo</dt>
                <dd>
                  <Link
                    to={getDetentionMemoDetailPath(row.detentionMemoId)}
                    className="text-primary hover:underline"
                  >
                    View memo
                  </Link>
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Summary</dt>
                <dd className="whitespace-pre-wrap">{row.summary || "—"}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card className="rounded-[10px] border-gray-200">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-3">Recovery + Assessment Sheet</h3>
            <pre className="whitespace-pre-wrap text-sm text-muted-foreground bg-muted/50 p-4 rounded-md">
              {row.recoveryAssessmentNotes || "—"}
            </pre>
          </CardContent>
        </Card>
      </div>
    </ModulePageLayout>
  )
}
