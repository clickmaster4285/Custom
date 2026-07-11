import { useEffect, useMemo, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { ArrowLeft, Loader2, Send } from "lucide-react"
import { ModulePageLayout } from "@/components/dashboard/module-page-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ROUTES, getSeizureMgmtSeizureReportDetailPath } from "@/routes/config"
import { fetchDetentionMemos, type DetentionMemoApiRecord } from "@/lib/detention-memo-api"
import {
  createSeizureReport,
  fetchAssessments,
  fetchRecoveryMemos,
  type DetentionAssessmentRecord,
  type RecoveryMemoRecord,
} from "@/lib/seizure-management-api"
import { toast } from "@/components/ui/use-toast"

export default function SeizureReportCreatePage() {
  const navigate = useNavigate()
  const [memos, setMemos] = useState<DetentionMemoApiRecord[]>([])
  const [assessments, setAssessments] = useState<DetentionAssessmentRecord[]>([])
  const [recoveryMemos, setRecoveryMemos] = useState<RecoveryMemoRecord[]>([])
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    detentionMemoId: "",
    caseNo: "",
    assessmentId: "",
    recoveryMemoId: "",
    reportDate: new Date().toISOString().slice(0, 10),
    preparedBy: "",
    summary: "",
    recoveryAssessmentNotes: "",
    status: "Draft" as const,
  })

  useEffect(() => {
    Promise.all([
      fetchDetentionMemos().catch(() => [] as DetentionMemoApiRecord[]),
      fetchAssessments().catch(() => [] as DetentionAssessmentRecord[]),
      fetchRecoveryMemos().catch(() => [] as RecoveryMemoRecord[]),
    ]).then(([m, a, r]) => {
      setMemos(m)
      setAssessments(a)
      setRecoveryMemos(r)
    })
  }, [])

  const recoveryOptions = useMemo(
    () =>
      recoveryMemos.filter(
        (r) => r.detentionMemoId === form.detentionMemoId && r.approvalStatus === "Approved"
      ),
    [form.detentionMemoId, recoveryMemos]
  )

  const assessment = useMemo(
    () => assessments.find((a) => a.detentionMemoId === form.detentionMemoId),
    [assessments, form.detentionMemoId]
  )

  const selectedRecovery = recoveryOptions.find((r) => r.id === form.recoveryMemoId)

  const onMemoSelect = (memoId: string) => {
    const memo = memos.find((m) => m.id === memoId)
    const assess = assessments.find((a) => a.detentionMemoId === memoId)
    const approvedRecovery = recoveryMemos.find(
      (r) => r.detentionMemoId === memoId && r.approvalStatus === "Approved"
    )
    const sheetNotes = [
      assess
        ? `Assessment: ${assess.findings || assess.goodsCondition} (${assess.status})`
        : "Assessment: not recorded",
      approvedRecovery
        ? `Recovery: ${approvedRecovery.category} — ${approvedRecovery.goodsDescription}`
        : "Recovery: no approved memo",
    ].join("\n")

    setForm((f) => ({
      ...f,
      detentionMemoId: memoId,
      caseNo: memo?.caseNo ?? "",
      assessmentId: assess?.id ?? "",
      recoveryMemoId: approvedRecovery?.id ?? "",
      recoveryAssessmentNotes: sheetNotes,
    }))
  }

  const handleSave = async (submit: boolean) => {
    if (!form.detentionMemoId || !form.preparedBy.trim()) {
      toast({ title: "Detention memo and prepared by are required", variant: "destructive" })
      return
    }
    if (submit && (!form.assessmentId || !form.recoveryMemoId)) {
      toast({
        title: "Completed assessment and approved recovery memo required to submit",
        variant: "destructive",
      })
      return
    }
    setSaving(true)
    try {
      const saved = await createSeizureReport({
        detentionMemoId: form.detentionMemoId,
        caseNo: form.caseNo,
        assessmentId: form.assessmentId || undefined,
        recoveryMemoId: form.recoveryMemoId || undefined,
        reportDate: form.reportDate,
        preparedBy: form.preparedBy,
        summary: form.summary,
        recoveryAssessmentNotes: form.recoveryAssessmentNotes,
        status: submit ? "Submitted" : "Draft",
      })
      toast({ title: submit ? "Seizure report submitted" : "Draft saved" })
      navigate(getSeizureMgmtSeizureReportDetailPath(saved.id))
    } catch (e) {
      toast({
        title: e instanceof Error ? e.message : "Failed to save",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <ModulePageLayout
      title="Create Seizure Report"
      description="Consolidates Recovery + Assessment Sheet data for final submission."
      breadcrumbs={[
        { label: "Seizure Management", href: ROUTES.SEIZURE_MANAGEMENT },
        { label: "Seizure Report", href: ROUTES.SEIZURE_MGMT_SEIZURE_REPORT },
        { label: "Create" },
      ]}
    >
      <div className="mb-4">
        <Button variant="ghost" size="sm" asChild>
          <Link to={ROUTES.SEIZURE_MGMT_SEIZURE_REPORT}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to list
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="rounded-[10px] border-gray-200 lg:col-span-2">
          <CardContent className="p-6 space-y-4">
            <div className="space-y-2">
              <Label>Detention Memo / Case *</Label>
              <Select value={form.detentionMemoId} onValueChange={onMemoSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Select case" />
                </SelectTrigger>
                <SelectContent>
                  {memos.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.caseNo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Report Date</Label>
                <Input
                  type="date"
                  value={form.reportDate}
                  onChange={(e) => setForm((f) => ({ ...f, reportDate: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Prepared By *</Label>
                <Input
                  value={form.preparedBy}
                  onChange={(e) => setForm((f) => ({ ...f, preparedBy: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Approved Recovery Memo</Label>
              <Select
                value={form.recoveryMemoId}
                onValueChange={(v) => setForm((f) => ({ ...f, recoveryMemoId: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder={recoveryOptions.length ? "Select recovery memo" : "None approved"} />
                </SelectTrigger>
                <SelectContent>
                  {recoveryOptions.map((r) => (
                    <SelectItem key={r.id} value={r.id}>
                      {r.category} — {r.recoveryDate}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Summary</Label>
              <Textarea
                value={form.summary}
                onChange={(e) => setForm((f) => ({ ...f, summary: e.target.value }))}
                rows={4}
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => handleSave(false)} disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Save Draft
              </Button>
              <Button onClick={() => handleSave(true)} disabled={saving}>
                <Send className="h-4 w-4 mr-2" />
                Submit Report
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[10px] border-gray-200">
          <CardHeader>
            <CardTitle className="text-base">Recovery + Assessment Sheet</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <pre className="whitespace-pre-wrap text-muted-foreground bg-muted/50 p-3 rounded-md text-xs">
              {form.recoveryAssessmentNotes || "Select a detention memo to load sheet data."}
            </pre>
            {assessment && (
              <p>
                <span className="font-medium">Assessment officer:</span> {assessment.examiningOfficer}
              </p>
            )}
            {selectedRecovery && (
              <p>
                <span className="font-medium">Recovery:</span> {selectedRecovery.category} /{" "}
                {selectedRecovery.recoveryOfficer}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </ModulePageLayout>
  )
}
