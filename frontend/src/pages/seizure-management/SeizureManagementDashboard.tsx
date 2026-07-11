import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import {
  AlertTriangle,
  ClipboardCheck,
  FileText,
  Package,
  Clock,
  ChevronRight,
  Loader2,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ROUTES } from "@/routes/config"
import { fetchDetentionMemos } from "@/lib/detention-memo-api"
import {
  listAssessments,
  listRecoveryMemos,
  listSeizureReports,
  DETENTION_WINDOW_DAYS,
  daysSinceDetention,
} from "@/lib/seizure-management-storage"

const quickLinks = [
  { label: "New Detention Memo", href: ROUTES.DETENTION_MEMO, description: "Create after approval" },
  { label: "Assessment", href: ROUTES.SEIZURE_MGMT_ASSESSMENT, description: "Record examination findings" },
  { label: "Recovery Memo", href: ROUTES.SEIZURE_MGMT_RECOVERY_MEMO, description: "Submit for approval" },
  { label: "Seizure Report", href: ROUTES.SEIZURE_MGMT_SEIZURE_REPORT, description: "Final submission" },
]

export default function SeizureManagementDashboardPage() {
  const [loading, setLoading] = useState(true)
  const [detentionCount, setDetentionCount] = useState(0)
  const [overdueCount, setOverdueCount] = useState(0)

  const assessments = listAssessments()
  const recoveryMemos = listRecoveryMemos()
  const seizureReports = listSeizureReports()

  useEffect(() => {
    let cancelled = false
    fetchDetentionMemos()
      .then((memos) => {
        if (cancelled) return
        setDetentionCount(memos.length)
        setOverdueCount(
          memos.filter((m) => {
            const days = daysSinceDetention(m.dateTimeDetention)
            return days !== null && days > DETENTION_WINDOW_DAYS
          }).length
        )
      })
      .catch(() => {
        if (!cancelled) setDetentionCount(0)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const stats = useMemo(
    () => [
      {
        label: "Detention Memos",
        value: loading ? "—" : String(detentionCount),
        icon: FileText,
        color: "text-blue-600",
        bg: "bg-blue-50",
      },
      {
        label: "Assessments",
        value: String(assessments.length),
        icon: ClipboardCheck,
        color: "text-green-600",
        bg: "bg-green-50",
      },
      {
        label: "Recovery Memos",
        value: String(recoveryMemos.length),
        icon: Package,
        color: "text-violet-600",
        bg: "bg-violet-50",
      },
      {
        label: "Seizure Reports",
        value: String(seizureReports.filter((r) => r.status === "Submitted").length),
        icon: FileText,
        color: "text-amber-600",
        bg: "bg-amber-50",
      },
    ],
    [assessments.length, detentionCount, loading, recoveryMemos.length, seizureReports]
  )

  const pendingRecovery = recoveryMemos.filter((r) => r.approvalStatus === "Pending Approval").length
  const pendingAssessment = assessments.filter((a) => a.status === "In Progress").length

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-[#101727] text-3xl font-bold">Seizure Management</h1>
        <p className="text-[#697282] text-base mt-1">
          Detention → Assessment → Recovery Memo → Seizure Report lifecycle.
        </p>
      </div>

      {overdueCount > 0 && (
        <Card className="rounded-[10px] border-amber-200 bg-amber-50">
          <CardContent className="py-4 flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
            <div className="flex-1 text-sm text-amber-900">
              <span className="font-semibold">{overdueCount}</span> detention case(s) exceed the{" "}
              {DETENTION_WINDOW_DAYS}-day recovery window.
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link to={ROUTES.SEIZURE_MGMT_DETENTION_REPORTING}>View</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.label} className="rounded-[10px] border-gray-200 py-6 px-6">
            <CardContent className="p-0 flex items-center gap-4">
              <div className={`rounded-lg p-3 ${stat.bg}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-[#697282] text-sm">{stat.label}</p>
                <p className="text-2xl font-bold text-[#101727]">
                  {loading && stat.label === "Detention Memos" ? (
                    <Loader2 className="h-5 w-5 animate-spin inline" />
                  ) : (
                    stat.value
                  )}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="rounded-[10px] border-gray-200">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-[#101727] mb-4">Pending Actions</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-[#697282]">Assessments in progress</span>
                <Badge variant="secondary">{pendingAssessment}</Badge>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-[#697282]">Recovery memos pending approval</span>
                <Badge variant="secondary">{pendingRecovery}</Badge>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-[#697282] flex items-center gap-1">
                  <Clock className="h-4 w-4" /> {DETENTION_WINDOW_DAYS}-day window alerts
                </span>
                <Badge variant={overdueCount > 0 ? "destructive" : "outline"}>{overdueCount}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[10px] border-gray-200">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-[#101727] mb-4">Quick Links</h2>
            <div className="space-y-2">
              {quickLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                >
                  <div>
                    <p className="text-sm font-medium text-[#101727] group-hover:text-primary">{link.label}</p>
                    <p className="text-xs text-[#697282]">{link.description}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-primary" />
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
