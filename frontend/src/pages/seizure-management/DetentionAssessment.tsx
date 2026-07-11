import { useEffect, useMemo, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { ClipboardCheck, Eye, Loader2, Package, Plus, Search, Trash2 } from "lucide-react"
import { ModulePageLayout } from "@/components/dashboard/module-page-layout"
import { Card, CardContent } from "@/components/ui/card"
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ToastAction } from "@/components/ui/toast"
import { ROUTES, getDetentionMemoDetailPath } from "@/routes/config"
import { fetchDetentionMemos, type DetentionMemoApiRecord } from "@/lib/detention-memo-api"
import {
  createAssessment,
  deleteAssessment,
  fetchAssessments,
  updateAssessment,
  type DetentionAssessmentRecord,
  type DocumentRelevance,
} from "@/lib/seizure-management-api"
import { toast } from "@/components/ui/use-toast"

const emptyForm = {
  detentionMemoId: "",
  caseNo: "",
  assessmentDate: new Date().toISOString().slice(0, 10),
  examiningOfficer: "",
  goodsCondition: "",
  valuationNotes: "",
  findings: "",
  documentRelevance: "Pending" as DocumentRelevance,
  status: "In Progress" as const,
}

function goodsSummary(memo: DetentionMemoApiRecord): string {
  const items = memo.goodsItems ?? []
  if (items.length === 0) return "—"
  if (items.length === 1) return items[0].description || "1 item"
  return `${items.length} items`
}

function goodsValue(memo: DetentionMemoApiRecord): string {
  const items = memo.goodsItems ?? []
  if (items.length === 0) return "—"
  const total = items.reduce((sum, g) => {
    const n = parseFloat(String(g.assessableValuePkr ?? "").replace(/,/g, ""))
    return sum + (Number.isFinite(n) ? n : 0)
  }, 0)
  return total > 0 ? `PKR ${total.toLocaleString()}` : "—"
}

function recoveryMemoCreateHref(detentionMemoId: string, assessmentId: string) {
  return `${ROUTES.SEIZURE_MGMT_RECOVERY_MEMO_CREATE}?detentionMemoId=${encodeURIComponent(detentionMemoId)}&assessmentId=${encodeURIComponent(assessmentId)}`
}

export default function DetentionAssessmentPage() {
  const navigate = useNavigate()
  const [memos, setMemos] = useState<DetentionMemoApiRecord[]>([])
  const [assessments, setAssessments] = useState<DetentionAssessmentRecord[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [selectedMemo, setSelectedMemo] = useState<DetentionMemoApiRecord | null>(null)

  const load = () => {
    setLoading(true)
    Promise.all([
      fetchDetentionMemos(),
      fetchAssessments(),
    ])
      .then(([m, a]) => {
        setMemos(m)
        setAssessments(a)
      })
      .catch((e) => {
        setMemos([])
        setAssessments([])
        toast({
          title: "Failed to load assessments",
          description: e instanceof Error ? e.message : "Could not load data",
          variant: "destructive",
        })
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

  const assessmentByMemoId = useMemo(() => {
    const map = new Map<string, DetentionAssessmentRecord>()
    for (const a of assessments) map.set(a.detentionMemoId, a)
    return map
  }, [assessments])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return memos
    return memos.filter((m) => {
      const assessment = assessmentByMemoId.get(m.id)
      return (
        m.caseNo.toLowerCase().includes(q) ||
        (m.referenceNumber ?? "").toLowerCase().includes(q) ||
        m.placeOfDetention.toLowerCase().includes(q) ||
        m.detentionType.toLowerCase().includes(q) ||
        (m.owner?.name ?? "").toLowerCase().includes(q) ||
        (m.verificationStatus ?? "").toLowerCase().includes(q) ||
        (assessment?.examiningOfficer ?? "").toLowerCase().includes(q) ||
        (assessment?.findings ?? "").toLowerCase().includes(q) ||
        (assessment?.documentRelevance ?? "").toLowerCase().includes(q)
      )
    })
  }, [memos, search, assessmentByMemoId])

  const stats = useMemo(() => {
    const assessed = memos.filter((m) => assessmentByMemoId.has(m.id)).length
    const completed = memos.filter((m) => assessmentByMemoId.get(m.id)?.status === "Completed").length
    return {
      total: memos.length,
      pending: memos.length - assessed,
      inProgress: assessed - completed,
      completed,
    }
  }, [memos, assessmentByMemoId])

  const openCreate = (memo?: DetentionMemoApiRecord) => {
    setEditingId(null)
    if (memo) {
      setSelectedMemo(memo)
      setForm({
        ...emptyForm,
        detentionMemoId: memo.id,
        caseNo: memo.caseNo,
        assessmentDate: new Date().toISOString().slice(0, 10),
      })
    } else {
      setSelectedMemo(null)
      setForm(emptyForm)
    }
    setShowForm(true)
  }

  const openEdit = (memo: DetentionMemoApiRecord, assessment: DetentionAssessmentRecord) => {
    setEditingId(assessment.id)
    setSelectedMemo(memo)
    setForm({
      detentionMemoId: assessment.detentionMemoId,
      caseNo: assessment.caseNo,
      assessmentDate: assessment.assessmentDate,
      examiningOfficer: assessment.examiningOfficer,
      goodsCondition: assessment.goodsCondition,
      valuationNotes: assessment.valuationNotes,
      findings: assessment.findings,
      documentRelevance: assessment.documentRelevance || "Pending",
      status: assessment.status,
    })
    setShowForm(true)
  }

  const onMemoSelect = (memoId: string) => {
    const memo = memos.find((m) => m.id === memoId)
    setSelectedMemo(memo ?? null)
    setForm((f) => ({
      ...f,
      detentionMemoId: memoId,
      caseNo: memo?.caseNo ?? "",
    }))
  }

  const notifyNextStep = (saved: DetentionAssessmentRecord) => {
    if (saved.status !== "Completed") return
    if (saved.documentRelevance === "Relevant") {
      toast({
        title: "Assessment completed — documents relevant",
        description: "Proceed to Release Inventory.",
        action: (
          <ToastAction altText="Open Release Inventory" onClick={() => navigate(ROUTES.RELEASE_INVENTORY)}>
            Release Inventory
          </ToastAction>
        ),
      })
    } else if (saved.documentRelevance === "Not Relevant") {
      const href = recoveryMemoCreateHref(saved.detentionMemoId, saved.id)
      toast({
        title: "Assessment completed — not relevant",
        description: "Create a recovery memo for this detention.",
        action: (
          <ToastAction altText="Create recovery memo" onClick={() => navigate(href)}>
            Recovery Memo
          </ToastAction>
        ),
      })
    }
  }

  const handleSave = async () => {
    if (!form.detentionMemoId || !form.examiningOfficer.trim()) {
      toast({ title: "Detention memo and examining officer are required", variant: "destructive" })
      return
    }
    const existing = assessmentByMemoId.get(form.detentionMemoId)
    if (!editingId && existing) {
      toast({
        title: "Assessment already exists for this memo",
        description: "Edit the existing assessment instead.",
        variant: "destructive",
      })
      return
    }
    setSaving(true)
    try {
      const payload = {
        detentionMemoId: form.detentionMemoId,
        caseNo: form.caseNo,
        assessmentDate: form.assessmentDate,
        examiningOfficer: form.examiningOfficer,
        goodsCondition: form.goodsCondition,
        valuationNotes: form.valuationNotes,
        findings: form.findings,
        documentRelevance: form.documentRelevance,
        status: form.status,
      }
      const saved = editingId
        ? await updateAssessment(editingId, payload)
        : await createAssessment(payload)
      toast({ title: editingId ? "Assessment updated" : "Assessment created" })
      notifyNextStep(saved)
      setShowForm(false)
      load()
    } catch (e) {
      toast({
        title: e instanceof Error ? e.message : "Failed to save assessment",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteAssessment(id)
      toast({ title: "Assessment deleted" })
      load()
    } catch (e) {
      toast({
        title: e instanceof Error ? e.message : "Failed to delete",
        variant: "destructive",
      })
    }
  }

  return (
    <ModulePageLayout
      title="Detention Assessment"
      description="Record examination findings for detained goods. Feeds into Recovery + Assessment Sheet for seizure reports."
      breadcrumbs={[
        { label: "Seizure Management", href: ROUTES.SEIZURE_MANAGEMENT },
        { label: "Detention" },
        { label: "Assessment" },
      ]}
    >
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <Card className="rounded-[10px]">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Detention Memos</p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </CardContent>
        </Card>
        <Card className="rounded-[10px]">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Pending Assessment</p>
            <p className="text-2xl font-bold text-amber-700">{stats.pending}</p>
          </CardContent>
        </Card>
        <Card className="rounded-[10px]">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">In Progress</p>
            <p className="text-2xl font-bold text-blue-700">{stats.inProgress}</p>
          </CardContent>
        </Card>
        <Card className="rounded-[10px]">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Completed</p>
            <p className="text-2xl font-bold text-green-700">{stats.completed}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-[10px] border-gray-200">
        <CardContent className="p-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder="Search case no, memo no, place, owner..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button onClick={() => openCreate()}>
              <Plus className="h-4 w-4 mr-2" />
              New Assessment
            </Button>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Case No</TableHead>
                  <TableHead>Detention Memo No</TableHead>
                  <TableHead>Detention Date</TableHead>
                  <TableHead>Place</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Goods</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Verification</TableHead>
                  <TableHead>Assessment</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center py-10 text-muted-foreground">
                      <Loader2 className="h-5 w-5 animate-spin inline mr-2" />
                      Loading detention memos...
                    </TableCell>
                  </TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center text-muted-foreground py-8">
                      No detention memos found. Create a detention memo first.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((memo) => {
                    const assessment = assessmentByMemoId.get(memo.id)
                    return (
                      <TableRow key={memo.id}>
                        <TableCell className="font-medium whitespace-nowrap">
                          <Link
                            to={getDetentionMemoDetailPath(memo.id)}
                            className="text-primary hover:underline"
                          >
                            {memo.caseNo}
                          </Link>
                        </TableCell>
                        <TableCell className="font-mono text-sm whitespace-nowrap">
                          {memo.referenceNumber || "—"}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          {memo.dateTimeDetention?.slice(0, 10) || "—"}
                        </TableCell>
                        <TableCell className="max-w-[140px] truncate" title={memo.placeOfDetention}>
                          {memo.placeOfDetention || "—"}
                        </TableCell>
                        <TableCell>{memo.detentionType || "—"}</TableCell>
                        <TableCell className="max-w-[120px] truncate" title={memo.owner?.name}>
                          {memo.owner?.name || "—"}
                        </TableCell>
                        <TableCell className="max-w-[140px] truncate" title={goodsSummary(memo)}>
                          {goodsSummary(memo)}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">{goodsValue(memo)}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{memo.verificationStatus || "—"}</Badge>
                        </TableCell>
                        <TableCell>
                          {assessment ? (
                            <div className="space-y-0.5">
                              <Badge variant={assessment.status === "Completed" ? "default" : "secondary"}>
                                {assessment.status}
                              </Badge>
                              {assessment.documentRelevance && assessment.documentRelevance !== "Pending" && (
                                <p className="text-xs text-muted-foreground">
                                  {assessment.documentRelevance}
                                </p>
                              )}
                              {assessment.examiningOfficer && (
                                <p className="text-xs text-muted-foreground truncate max-w-[120px]">
                                  {assessment.examiningOfficer}
                                </p>
                              )}
                            </div>
                          ) : (
                            <Badge variant="outline" className="text-amber-700 border-amber-300">
                              Pending
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1 flex-wrap">
                            <Button variant="ghost" size="sm" asChild title="View memo">
                              <Link to={getDetentionMemoDetailPath(memo.id)}>
                                <Eye className="h-4 w-4" />
                              </Link>
                            </Button>
                            {assessment ? (
                              <>
                                {assessment.status === "Completed" &&
                                  assessment.documentRelevance === "Relevant" && (
                                    <Button variant="outline" size="sm" asChild>
                                      <Link to={ROUTES.RELEASE_INVENTORY}>Release</Link>
                                    </Button>
                                  )}
                                {assessment.status === "Completed" &&
                                  assessment.documentRelevance === "Not Relevant" && (
                                    <Button variant="outline" size="sm" asChild>
                                      <Link
                                        to={recoveryMemoCreateHref(assessment.detentionMemoId, assessment.id)}
                                      >
                                        <Package className="h-4 w-4 mr-1" />
                                        Recovery
                                      </Link>
                                    </Button>
                                  )}
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => openEdit(memo, assessment)}
                                >
                                  Edit
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDelete(assessment.id)}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </>
                            ) : (
                              <Button size="sm" onClick={() => openCreate(memo)}>
                                <ClipboardCheck className="h-4 w-4 mr-1" />
                                Assess
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Assessment" : "New Assessment"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Detention Memo *</Label>
              <Select
                value={form.detentionMemoId}
                onValueChange={onMemoSelect}
                disabled={!!editingId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select detention memo" />
                </SelectTrigger>
                <SelectContent>
                  {memos.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.caseNo} — {m.placeOfDetention}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedMemo && (
              <Card className="rounded-lg border-blue-100 bg-blue-50/50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-semibold text-[#101727]">Detention Memo Details</p>
                    <Link
                      to={getDetentionMemoDetailPath(selectedMemo.id)}
                      className="text-xs text-primary hover:underline"
                    >
                      Open full memo
                    </Link>
                  </div>
                  <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                    <div>
                      <dt className="text-muted-foreground text-xs">Case No</dt>
                      <dd className="font-medium">{selectedMemo.caseNo}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground text-xs">Detention Memo No</dt>
                      <dd className="font-medium font-mono">{selectedMemo.referenceNumber || "—"}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground text-xs">FIR Number</dt>
                      <dd>{selectedMemo.firNumber || "—"}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground text-xs">Detention Date</dt>
                      <dd>{selectedMemo.dateTimeDetention || "—"}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground text-xs">Place</dt>
                      <dd>{selectedMemo.placeOfDetention || "—"}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground text-xs">Type</dt>
                      <dd>{selectedMemo.detentionType || "—"}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground text-xs">Directorate</dt>
                      <dd>{selectedMemo.directorate || "—"}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground text-xs">Owner</dt>
                      <dd>{selectedMemo.owner?.name || "—"}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground text-xs">Where Deposited</dt>
                      <dd>{selectedMemo.whereDeposited || "—"}</dd>
                    </div>
                    <div className="col-span-2">
                      <dt className="text-muted-foreground text-xs">Reason</dt>
                      <dd className="line-clamp-2">{selectedMemo.reasonForDetention || "—"}</dd>
                    </div>
                    <div className="col-span-2">
                      <dt className="text-muted-foreground text-xs mb-1">
                        Goods ({selectedMemo.goodsItems?.length ?? 0})
                      </dt>
                      <dd>
                        {(selectedMemo.goodsItems?.length ?? 0) === 0 ? (
                          <span className="text-muted-foreground">No goods lines</span>
                        ) : (
                          <ul className="space-y-1 max-h-28 overflow-y-auto">
                            {selectedMemo.goodsItems!.map((g) => (
                              <li key={g.id} className="text-xs bg-white/70 rounded px-2 py-1 border border-blue-100">
                                {g.description || "Item"} · Qty {g.quantity} {g.unit}
                                {g.assessableValuePkr ? ` · PKR ${g.assessableValuePkr}` : ""}
                                {g.perishable ? " · Perishable" : ""}
                              </li>
                            ))}
                          </ul>
                        )}
                      </dd>
                    </div>
                  </dl>
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Assessment Date</Label>
                <Input
                  type="date"
                  value={form.assessmentDate}
                  onChange={(e) => setForm((f) => ({ ...f, assessmentDate: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={form.status}
                  onValueChange={(v) =>
                    setForm((f) => ({ ...f, status: v as "In Progress" | "Completed" }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Document Relevance</Label>
              <Select
                value={form.documentRelevance}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, documentRelevance: v as DocumentRelevance }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Relevant">Relevant</SelectItem>
                  <SelectItem value="Not Relevant">Not Relevant</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Examining Officer *</Label>
              <Input
                value={form.examiningOfficer}
                onChange={(e) => setForm((f) => ({ ...f, examiningOfficer: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Goods Condition</Label>
              <Input
                value={form.goodsCondition}
                onChange={(e) => setForm((f) => ({ ...f, goodsCondition: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Valuation Notes</Label>
              <Textarea
                value={form.valuationNotes}
                onChange={(e) => setForm((f) => ({ ...f, valuationNotes: e.target.value }))}
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label>Findings</Label>
              <Textarea
                value={form.findings}
                onChange={(e) => setForm((f) => ({ ...f, findings: e.target.value }))}
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowForm(false)} disabled={saving}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Save Assessment
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </ModulePageLayout>
  )
}
