import { useEffect, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { ArrowLeft, CheckCircle, Loader2, XCircle } from "lucide-react"
import { ModulePageLayout } from "@/components/dashboard/module-page-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ROUTES, getDetentionMemoDetailPath } from "@/routes/config"
import {
  fetchRecoveryMemoById,
  recoveryMemoApproval,
  type RecoveryMemoRecord,
} from "@/lib/seizure-management-api"
import { toast } from "@/components/ui/use-toast"

export default function RecoveryMemoDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [row, setRow] = useState<RecoveryMemoRecord | null>(null)
  const [loading, setLoading] = useState(true)
  const [acting, setActing] = useState(false)
  const [approver, setApprover] = useState("")
  const [rejectionReason, setRejectionReason] = useState("")

  const load = () => {
    if (!id) return
    setLoading(true)
    fetchRecoveryMemoById(id)
      .then(setRow)
      .catch(() => setRow(null))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [id])

  if (loading) {
    return (
      <ModulePageLayout title="Recovery Memo" description="Loading..." breadcrumbs={[]}>
        <p className="text-muted-foreground flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading...
        </p>
      </ModulePageLayout>
    )
  }

  if (!row) {
    return (
      <ModulePageLayout
        title="Recovery Memo"
        description="Not found"
        breadcrumbs={[
          { label: "Seizure Management", href: ROUTES.SEIZURE_MANAGEMENT },
          { label: "Recovery Memo", href: ROUTES.SEIZURE_MGMT_RECOVERY_MEMO },
        ]}
      >
        <p className="text-muted-foreground">Recovery memo not found.</p>
        <Button className="mt-4" variant="outline" onClick={() => navigate(ROUTES.SEIZURE_MGMT_RECOVERY_MEMO)}>
          Back to list
        </Button>
      </ModulePageLayout>
    )
  }

  const runApproval = async (action: "approve" | "reject") => {
    setActing(true)
    try {
      const updated = await recoveryMemoApproval(row.id, action, {
        approvedBy: approver,
        rejectionReason,
      })
      setRow(updated)
      toast({ title: `Status updated to ${updated.approvalStatus}` })
    } catch (e) {
      toast({
        title: e instanceof Error ? e.message : "Action failed",
        variant: "destructive",
      })
    } finally {
      setActing(false)
    }
  }

  return (
    <ModulePageLayout
      title={`Recovery Memo — ${row.caseNo}`}
      description={`${row.category} · ${row.recoveryDate}`}
      breadcrumbs={[
        { label: "Seizure Management", href: ROUTES.SEIZURE_MANAGEMENT },
        { label: "Recovery Memo", href: ROUTES.SEIZURE_MGMT_RECOVERY_MEMO },
        { label: row.caseNo },
      ]}
    >
      <div className="mb-4 flex flex-wrap gap-2 items-center">
        <Button variant="ghost" size="sm" asChild>
          <Link to={ROUTES.SEIZURE_MGMT_RECOVERY_MEMO}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Link>
        </Button>
        <Badge>{row.approvalStatus}</Badge>
      </div>

      <Card className="rounded-[10px] border-gray-200 mb-4">
        <CardContent className="p-6 space-y-4">
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-muted-foreground">Case No</dt>
              <dd className="font-medium">{row.caseNo}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Category</dt>
              <dd className="font-medium">{row.category}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Recovery Officer</dt>
              <dd className="font-medium">{row.recoveryOfficer}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Recovery Date</dt>
              <dd className="font-medium">{row.recoveryDate}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-muted-foreground">Goods Description</dt>
              <dd>{row.goodsDescription || "—"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Quantity</dt>
              <dd>{row.quantity || "—"}</dd>
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
            {row.depositAccountId && (
              <div>
                <dt className="text-muted-foreground">Deposit Account</dt>
                <dd className="font-mono text-xs">{row.depositAccountId}</dd>
              </div>
            )}
            <div className="sm:col-span-2">
              <dt className="text-muted-foreground">Remarks</dt>
              <dd>{row.remarks || "—"}</dd>
            </div>
            {row.rejectionReason && (
              <div className="sm:col-span-2">
                <dt className="text-muted-foreground">Rejection Reason</dt>
                <dd className="text-destructive">{row.rejectionReason}</dd>
              </div>
            )}
          </dl>
        </CardContent>
      </Card>

      {row.approvalStatus === "Pending Approval" && (
        <Card className="rounded-[10px] border-gray-200">
          <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Approver name</Label>
                <Input value={approver} onChange={(e) => setApprover(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Rejection reason (if rejecting)</Label>
                <Textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={2}
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => runApproval("approve")} disabled={acting}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve
              </Button>
              <Button variant="destructive" onClick={() => runApproval("reject")} disabled={acting}>
                <XCircle className="h-4 w-4 mr-2" />
                Reject
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </ModulePageLayout>
  )
}
