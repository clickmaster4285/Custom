import { useEffect, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import {
  ArrowLeft,
  CheckCircle,
  FileText,
  Send,
  XCircle,
} from "lucide-react"
import { ModulePageLayout } from "@/components/dashboard/module-page-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ROUTES, getSeizureMgmtAssessmentDetailPath } from "@/routes/config"
import {
  fetchRecoveryMemoById,
  recoveryMemoApproval,
  type RecoveryMemoRecord,
} from "@/lib/seizure-management-api"
import { fetchDetentionMemoById, type DetentionMemoApiRecord } from "@/lib/detention-memo-api"
import { getStoredUser } from "@/lib/auth"
import { toast } from "@/hooks/use-toast"
import { DetentionMemoReadOnlyView } from "@/pages/seizure-management/DetentionMemoReadOnlyView"

function DetailRow({ label, value }: { label: string; value: string | undefined }) {
  return (
    <div className="grid grid-cols-1 gap-1 border-b border-border/50 py-2 sm:grid-cols-[180px_1fr] sm:gap-2">
      <span className="text-sm text-muted-foreground break-words">{label}</span>
      <span className="text-sm font-medium break-words">{value?.trim() ? value : "—"}</span>
    </div>
  )
}

function statusBadge(status: RecoveryMemoRecord["approvalStatus"]) {
  if (status === "Approved") return <Badge>Approved</Badge>
  if (status === "Pending Approval") return <Badge variant="secondary">Pending Approval</Badge>
  if (status === "Rejected") return <Badge variant="destructive">Rejected</Badge>
  return <Badge variant="outline">Draft</Badge>
}

export default function RecoveryMemoDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [row, setRow] = useState<RecoveryMemoRecord | null>(null)
  const [memo, setMemo] = useState<DetentionMemoApiRecord | null>(null)
  const [loading, setLoading] = useState(true)
  const [acting, setActing] = useState(false)
  const [approver, setApprover] = useState(
    () => getStoredUser()?.full_name || getStoredUser()?.username || ""
  )
  const [rejectionReason, setRejectionReason] = useState("")

  useEffect(() => {
    if (!id) return
    setLoading(true)
    fetchRecoveryMemoById(id)
      .then(async (recovery) => {
        setRow(recovery)
        try {
          setMemo(await fetchDetentionMemoById(recovery.detentionMemoId))
        } catch {
          setMemo(null)
        }
      })
      .catch(() => {
        setRow(null)
        setMemo(null)
      })
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <ModulePageLayout
        title="Recovery Memo"
        description="Loading…"
        breadcrumbs={[
          { label: "Seizure Management", href: ROUTES.SEIZURE_MANAGEMENT },
          { label: "Recovery Memo", href: ROUTES.SEIZURE_MGMT_RECOVERY_MEMO },
        ]}
      >
        <p className="text-muted-foreground">Loading recovery memo…</p>
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
        <p className="text-muted-foreground mb-4">Recovery memo not found.</p>
        <Button variant="outline" onClick={() => navigate(ROUTES.SEIZURE_MGMT_RECOVERY_MEMO)}>
          Back to list
        </Button>
      </ModulePageLayout>
    )
  }

  const runApproval = async (action: "submit" | "approve" | "reject") => {
    if (action === "reject" && !rejectionReason.trim()) {
      toast({
        title: "Rejection reason required",
        description: "Enter a reason before rejecting.",
        variant: "destructive",
      })
      return
    }
    setActing(true)
    try {
      const updated = await recoveryMemoApproval(row.id, action, {
        approvedBy: approver,
        rejectionReason,
      })
      setRow(updated)
      toast({
        title:
          action === "submit"
            ? "Recovery memo sent for approval"
            : action === "approve"
              ? "Recovery memo approved"
              : "Recovery memo rejected",
      })
    } catch (e) {
      toast({
        title: e instanceof Error ? e.message : "Action failed",
        variant: "destructive",
      })
    } finally {
      setActing(false)
    }
  }

  const canSubmit = row.approvalStatus === "Draft" || row.approvalStatus === "Rejected"
  const canDecide = row.approvalStatus === "Pending Approval"

  return (
    <ModulePageLayout
      title={memo ? `Detention Memo: ${memo.caseNo}` : `Recovery Memo — ${row.caseNo}`}
      description={
        memo?.referenceNumber
          ? `Memo No. ${memo.referenceNumber} · Recovery ${row.approvalStatus}`
          : `Recovery memo · ${row.approvalStatus}`
      }
      breadcrumbs={[
        { label: "Seizure Management", href: ROUTES.SEIZURE_MANAGEMENT },
        { label: "Recovery Memo", href: ROUTES.SEIZURE_MGMT_RECOVERY_MEMO },
        { label: row.caseNo || "Detail" },
      ]}
    >
      <div className="mb-4">
        <Button variant="outline" size="sm" asChild>
          <Link to={ROUTES.SEIZURE_MGMT_RECOVERY_MEMO}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to list
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:gap-6">
        <Card className="border-0 shadow-sm">
          <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between px-4 sm:px-6">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <FileText className="h-5 w-5 flex-shrink-0" />
                <span className="break-words">{memo?.caseNo || row.caseNo}</span>
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {memo?.referenceNumber ? (
                  <>
                    Detention Memo No.{" "}
                    <span className="font-semibold text-foreground">{memo.referenceNumber}</span>
                  </>
                ) : (
                  "Detention memo details for recovery."
                )}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {statusBadge(row.approvalStatus)}
              {memo?.verificationStatus && (
                <Badge
                  variant={memo.verificationStatus === "Verified" ? "default" : "secondary"}
                >
                  {memo.verificationStatus}
                </Badge>
              )}
            </div>
          </CardHeader>

          <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6">
            {memo ? (
              <DetentionMemoReadOnlyView memo={memo} />
            ) : (
              <p className="text-sm text-muted-foreground">Detention memo could not be loaded.</p>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Recovery Memo</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 gap-x-5 md:grid-cols-2">
                <DetailRow label="Case No." value={row.caseNo} />
                <DetailRow label="Reference No." value={row.referenceNumber} />
                <DetailRow label="Category" value={row.category} />
                <DetailRow label="Recovery Date" value={row.recoveryDate} />
                <DetailRow label="Recovery Officer" value={row.recoveryOfficer} />
                <DetailRow label="Quantity" value={row.quantity} />
                <div className="md:col-span-2">
                  <DetailRow label="Goods Description" value={row.goodsDescription} />
                </div>
                <div className="md:col-span-2">
                  <DetailRow label="Remarks" value={row.remarks} />
                </div>
                {row.depositAccountId && (
                  <DetailRow label="Deposit Account" value={row.depositAccountId} />
                )}
                {row.assessmentId && (
                  <div className="md:col-span-2 py-2">
                    <span className="text-sm text-muted-foreground">Linked Assessment</span>
                    <div className="mt-1">
                      <Button variant="link" className="h-auto p-0" asChild>
                        <Link to={getSeizureMgmtAssessmentDetailPath(row.assessmentId)}>
                          View assessment
                        </Link>
                      </Button>
                    </div>
                  </div>
                )}
                {row.rejectionReason && (
                  <div className="md:col-span-2">
                    <DetailRow label="Rejection Reason" value={row.rejectionReason} />
                  </div>
                )}
              </CardContent>
            </Card>

            {canSubmit && (
              <div className="flex flex-wrap gap-2">
                <Button onClick={() => void runApproval("submit")} disabled={acting}>
                  <Send className="h-4 w-4 mr-2" />
                  Send for Approval
                </Button>
              </div>
            )}

            {canDecide && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Decision</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-2 max-w-md">
                    <Label>Approver name</Label>
                    <Input value={approver} onChange={(e) => setApprover(e.target.value)} />
                  </div>
                  <div className="grid gap-2">
                    <Label>Rejection reason (if rejecting)</Label>
                    <Textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      rows={2}
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button onClick={() => void runApproval("approve")} disabled={acting}>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => void runApproval("reject")}
                      disabled={acting}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="rounded-[10px] border-gray-200">
              <CardHeader>
                <CardTitle className="text-base">Audit Log</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <dt className="text-muted-foreground text-sm">Created By</dt>
                    <dd className="font-medium text-sm whitespace-pre-wrap">
                      {row.recoveryOfficer?.trim() || "—"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground text-sm">Created On</dt>
                    <dd className="font-medium text-sm whitespace-pre-wrap">
                      {row.createdAt?.trim() || "—"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground text-sm">Updated By</dt>
                    <dd className="font-medium text-sm whitespace-pre-wrap">—</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground text-sm">Updated On</dt>
                    <dd className="font-medium text-sm whitespace-pre-wrap">
                      {row.updatedAt?.trim() || "—"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground text-sm">Approved By</dt>
                    <dd className="font-medium text-sm whitespace-pre-wrap">
                      {row.approvedBy?.trim() || "—"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground text-sm">Approval Time</dt>
                    <dd className="font-medium text-sm whitespace-pre-wrap">
                      {row.approvedAt?.trim() || "—"}
                    </dd>
                  </div>
                </dl>
              </CardContent>
            </Card>

            {row.approvalStatus === "Approved" && (
              <div className="flex flex-wrap gap-2">
                <Button asChild>
                  <Link
                    to={`${ROUTES.SEIZURE_MGMT_SEIZURE_REPORT_CREATE}?detentionMemoId=${encodeURIComponent(row.detentionMemoId)}&recoveryMemoId=${encodeURIComponent(row.id)}`}
                  >
                    Create Seizure Report
                  </Link>
                </Button>
              </div>
            )}

            <Button asChild variant="outline" className="w-full sm:w-auto">
              <Link to={ROUTES.SEIZURE_MGMT_RECOVERY_MEMO}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to list
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </ModulePageLayout>
  )
}
