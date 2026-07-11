/**
 * Client-side storage for Seizure Management pages (no backend models).
 * Assessment, Recovery Memo, and Seizure Report records.
 */

const ASSESSMENT_KEY = "seizureMgmtAssessments"
const RECOVERY_MEMO_KEY = "seizureMgmtRecoveryMemos"
const SEIZURE_REPORT_KEY = "seizureMgmtSeizureReports"

export const RECOVERY_CATEGORIES = ["Dangerous/Chemical", "Perishable", "Other"] as const
export type RecoveryCategory = (typeof RECOVERY_CATEGORIES)[number]

export type AssessmentStatus = "In Progress" | "Completed"
export type ApprovalStatus = "Draft" | "Pending Approval" | "Approved" | "Rejected"
export type SeizureReportStatus = "Draft" | "Submitted"

export type DetentionAssessmentRecord = {
  id: string
  detentionMemoId: string
  caseNo: string
  assessmentDate: string
  examiningOfficer: string
  goodsCondition: string
  valuationNotes: string
  findings: string
  status: AssessmentStatus
  createdAt: string
  updatedAt: string
}

export type RecoveryMemoRecord = {
  id: string
  detentionMemoId: string
  caseNo: string
  category: RecoveryCategory
  recoveryDate: string
  recoveryOfficer: string
  goodsDescription: string
  quantity: string
  remarks: string
  approvalStatus: ApprovalStatus
  createdAt: string
  updatedAt: string
}

export type SeizureReportRecord = {
  id: string
  detentionMemoId: string
  caseNo: string
  assessmentId?: string
  recoveryMemoId?: string
  reportDate: string
  preparedBy: string
  summary: string
  recoveryAssessmentNotes: string
  status: SeizureReportStatus
  createdAt: string
  updatedAt: string
}

function readJson<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as T[]) : []
  } catch {
    return []
  }
}

function writeJson<T>(key: string, items: T[]): void {
  localStorage.setItem(key, JSON.stringify(items))
}

function newId(): string {
  return `sm-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

// ——— Assessments ———

export function listAssessments(): DetentionAssessmentRecord[] {
  return readJson<DetentionAssessmentRecord>(ASSESSMENT_KEY)
}

export function getAssessmentById(id: string): DetentionAssessmentRecord | undefined {
  return listAssessments().find((a) => a.id === id)
}

export function getAssessmentByDetentionMemoId(detentionMemoId: string): DetentionAssessmentRecord | undefined {
  return listAssessments().find((a) => a.detentionMemoId === detentionMemoId)
}

export function saveAssessment(
  input: Omit<DetentionAssessmentRecord, "id" | "createdAt" | "updatedAt"> & { id?: string }
): DetentionAssessmentRecord {
  const now = new Date().toISOString()
  const items = listAssessments()
  if (input.id) {
    const idx = items.findIndex((a) => a.id === input.id)
    if (idx >= 0) {
      const updated: DetentionAssessmentRecord = { ...items[idx], ...input, id: input.id, updatedAt: now }
      items[idx] = updated
      writeJson(ASSESSMENT_KEY, items)
      return updated
    }
  }
  const created: DetentionAssessmentRecord = {
    ...input,
    id: newId(),
    createdAt: now,
    updatedAt: now,
  }
  items.unshift(created)
  writeJson(ASSESSMENT_KEY, items)
  return created
}

export function deleteAssessment(id: string): void {
  writeJson(
    ASSESSMENT_KEY,
    listAssessments().filter((a) => a.id !== id)
  )
}

// ——— Recovery Memos ———

export function listRecoveryMemos(): RecoveryMemoRecord[] {
  return readJson<RecoveryMemoRecord>(RECOVERY_MEMO_KEY)
}

export function getRecoveryMemoById(id: string): RecoveryMemoRecord | undefined {
  return listRecoveryMemos().find((r) => r.id === id)
}

export function saveRecoveryMemo(
  input: Omit<RecoveryMemoRecord, "id" | "createdAt" | "updatedAt"> & { id?: string }
): RecoveryMemoRecord {
  const now = new Date().toISOString()
  const items = listRecoveryMemos()
  if (input.id) {
    const idx = items.findIndex((r) => r.id === input.id)
    if (idx >= 0) {
      const updated: RecoveryMemoRecord = { ...items[idx], ...input, id: input.id, updatedAt: now }
      items[idx] = updated
      writeJson(RECOVERY_MEMO_KEY, items)
      return updated
    }
  }
  const created: RecoveryMemoRecord = {
    ...input,
    id: newId(),
    createdAt: now,
    updatedAt: now,
  }
  items.unshift(created)
  writeJson(RECOVERY_MEMO_KEY, items)
  return created
}

export function deleteRecoveryMemo(id: string): void {
  writeJson(
    RECOVERY_MEMO_KEY,
    listRecoveryMemos().filter((r) => r.id !== id)
  )
}

// ——— Seizure Reports ———

export function listSeizureReports(): SeizureReportRecord[] {
  return readJson<SeizureReportRecord>(SEIZURE_REPORT_KEY)
}

export function getSeizureReportById(id: string): SeizureReportRecord | undefined {
  return listSeizureReports().find((r) => r.id === id)
}

export function saveSeizureReport(
  input: Omit<SeizureReportRecord, "id" | "createdAt" | "updatedAt"> & { id?: string }
): SeizureReportRecord {
  const now = new Date().toISOString()
  const items = listSeizureReports()
  if (input.id) {
    const idx = items.findIndex((r) => r.id === input.id)
    if (idx >= 0) {
      const updated: SeizureReportRecord = { ...items[idx], ...input, id: input.id, updatedAt: now }
      items[idx] = updated
      writeJson(SEIZURE_REPORT_KEY, items)
      return updated
    }
  }
  const created: SeizureReportRecord = {
    ...input,
    id: newId(),
    createdAt: now,
    updatedAt: now,
  }
  items.unshift(created)
  writeJson(SEIZURE_REPORT_KEY, items)
  return created
}

export function deleteSeizureReport(id: string): void {
  writeJson(
    SEIZURE_REPORT_KEY,
    listSeizureReports().filter((r) => r.id !== id)
  )
}

export const DETENTION_WINDOW_DAYS = 60

export function daysSinceDetention(dateTimeDetention: string): number | null {
  if (!dateTimeDetention?.trim()) return null
  try {
    const det = new Date(dateTimeDetention.replace(" ", "T"))
    return Math.floor((Date.now() - det.getTime()) / (1000 * 60 * 60 * 24))
  } catch {
    return null
  }
}

export function isWithinDetentionWindow(dateTimeDetention: string): boolean {
  const days = daysSinceDetention(dateTimeDetention)
  if (days === null) return true
  return days <= DETENTION_WINDOW_DAYS
}
