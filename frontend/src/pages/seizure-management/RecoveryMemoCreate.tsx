import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { ArrowLeft, Send } from "lucide-react"
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
import { ROUTES, getSeizureMgmtRecoveryMemoDetailPath } from "@/routes/config"
import { fetchDetentionMemos, type DetentionMemoApiRecord } from "@/lib/detention-memo-api"
import {
  RECOVERY_CATEGORIES,
  isWithinDetentionWindow,
  saveRecoveryMemo,
} from "@/lib/seizure-management-storage"
import { toast } from "@/components/ui/use-toast"

export default function RecoveryMemoCreatePage() {
  const navigate = useNavigate()
  const [memos, setMemos] = useState<DetentionMemoApiRecord[]>([])
  const [form, setForm] = useState({
    detentionMemoId: "",
    caseNo: "",
    category: RECOVERY_CATEGORIES[0],
    recoveryDate: new Date().toISOString().slice(0, 10),
    recoveryOfficer: "",
    goodsDescription: "",
    quantity: "",
    remarks: "",
    approvalStatus: "Draft" as const,
  })

  useEffect(() => {
    fetchDetentionMemos().then(setMemos).catch(() => setMemos([]))
  }, [])

  const selectedMemo = memos.find((m) => m.id === form.detentionMemoId)
  const withinWindow = selectedMemo ? isWithinDetentionWindow(selectedMemo.dateTimeDetention) : true

  const onMemoSelect = (memoId: string) => {
    const memo = memos.find((m) => m.id === memoId)
    setForm((f) => ({
      ...f,
      detentionMemoId: memoId,
      caseNo: memo?.caseNo ?? "",
    }))
  }

  const handleSave = (submitForApproval: boolean) => {
    if (!form.detentionMemoId || !form.recoveryOfficer.trim()) {
      toast({ title: "Detention memo and recovery officer are required", variant: "destructive" })
      return
    }
    const saved = saveRecoveryMemo({
      ...form,
      approvalStatus: submitForApproval ? "Pending Approval" : "Draft",
    })
    toast({
      title: submitForApproval ? "Recovery memo sent for approval" : "Recovery memo saved as draft",
    })
    navigate(getSeizureMgmtRecoveryMemoDetailPath(saved.id))
  }

  return (
    <ModulePageLayout
      title="Create Recovery Memo"
      description="Recovery memos are created by a separate recovery officer and sent for approval."
      breadcrumbs={[
        { label: "Seizure Management", href: ROUTES.SEIZURE_MANAGEMENT },
        { label: "Recovery Memo", href: ROUTES.SEIZURE_MGMT_RECOVERY_MEMO },
        { label: "Create" },
      ]}
    >
      <div className="mb-4">
        <Button variant="ghost" size="sm" asChild>
          <Link to={ROUTES.SEIZURE_MGMT_RECOVERY_MEMO}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to list
          </Link>
        </Button>
      </div>

      {!withinWindow && selectedMemo && (
        <Card className="rounded-[10px] border-amber-200 bg-amber-50 mb-4">
          <CardContent className="py-3 text-sm text-amber-900">
            This detention exceeds the 60-day recovery window. You may still create a recovery memo.
          </CardContent>
        </Card>
      )}

      <Card className="rounded-[10px] border-gray-200">
        <CardContent className="p-6 space-y-4 max-w-2xl">
          <div className="space-y-2">
            <Label>Detention Memo *</Label>
            <Select value={form.detentionMemoId} onValueChange={onMemoSelect}>
              <SelectTrigger>
                <SelectValue placeholder="Select approved detention memo" />
              </SelectTrigger>
              <SelectContent>
                {memos.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.caseNo} — {m.verificationStatus ?? "—"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Category *</Label>
              <Select
                value={form.category}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, category: v as (typeof RECOVERY_CATEGORIES)[number] }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RECOVERY_CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Recovery Date</Label>
              <Input
                type="date"
                value={form.recoveryDate}
                onChange={(e) => setForm((f) => ({ ...f, recoveryDate: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Recovery Officer *</Label>
            <Input
              placeholder="Separate recovery officer"
              value={form.recoveryOfficer}
              onChange={(e) => setForm((f) => ({ ...f, recoveryOfficer: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label>Goods Description</Label>
            <Textarea
              value={form.goodsDescription}
              onChange={(e) => setForm((f) => ({ ...f, goodsDescription: e.target.value }))}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Quantity</Label>
            <Input
              value={form.quantity}
              onChange={(e) => setForm((f) => ({ ...f, quantity: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label>Remarks</Label>
            <Textarea
              value={form.remarks}
              onChange={(e) => setForm((f) => ({ ...f, remarks: e.target.value }))}
              rows={2}
            />
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            <Button variant="outline" onClick={() => handleSave(false)}>
              Save Draft
            </Button>
            <Button onClick={() => handleSave(true)}>
              <Send className="h-4 w-4 mr-2" />
              Send for Approval
            </Button>
          </div>
        </CardContent>
      </Card>
    </ModulePageLayout>
  )
}
