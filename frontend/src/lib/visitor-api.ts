import { API_BASE_URL, getAuthHeaders } from "@/lib/api"

const VISITOR_WALKIN_KEY = "vms_visitors_walkin"
const VISITOR_PREREG_KEY = "vms_visitors_prereg"

export type RegistrationSource = "walk-in" | "pre-registration"

export type RegistrationStatus = "draft" | "approved" | "sent"

export type VisitorRecord = {
  id: number
  full_name: string
  visitor_type: string
  department_to_visit: string
  cnic_number: string
  passport_number: string
  created_at: string
  registration_source?: RegistrationSource
  registration_status?: RegistrationStatus
  profile_image?: string
  watchlist_check_status?: string
  email?: string
  phone?: string
  [key: string]: unknown
}

function getStorageKey(source: RegistrationSource): string {
  return source === "walk-in" ? VISITOR_WALKIN_KEY : VISITOR_PREREG_KEY
}

function readVisitors(source: RegistrationSource): VisitorRecord[] {
  if (typeof window === "undefined") return []
  const key = getStorageKey(source)
  const raw = window.localStorage.getItem(key)
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw) as VisitorRecord[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function getVisitorApiUrl(path: string): string {
  const base = (typeof API_BASE_URL === "string" ? API_BASE_URL : "").replace(/\/$/, "")
  return `${base}/api/visitors${path}`
}

async function fetchFromBackend<T>(path: string, options?: RequestInit): Promise<T | null> {
  try {
    const url = getVisitorApiUrl(path)
    const res = await fetch(url, {
      ...options,
      headers: { ...getAuthHeaders(), ...options?.headers },
    })
    if (!res.ok) return null
    return (await res.json()) as T
  } catch {
    return null
  }
}

/** User-facing message when localStorage is full and there are existing entries. */
export const STORAGE_QUOTA_MESSAGE =
  "Storage full. Please delete some old entries from the list and try again.";

/** When list is empty (0 registrations), the single payload is too large. */
export const STORAGE_QUOTA_SINGLE_MESSAGE =
  "Registration is too large for storage (too many or large photos/documents). Try using fewer or smaller images and try again.";

function writeVisitors(source: RegistrationSource, rows: VisitorRecord[], previousCount?: number) {
  if (typeof window === "undefined") return;
  const key = getStorageKey(source);
  try {
    window.localStorage.setItem(key, JSON.stringify(rows));
  } catch (err) {
    const isQuota = err instanceof DOMException && (err.name === "QuotaExceededError" || err.code === 22);
    if (isQuota) {
      const noExisting = previousCount === 0;
      throw new Error(noExisting ? STORAGE_QUOTA_SINGLE_MESSAGE : STORAGE_QUOTA_MESSAGE);
    }
    throw err;
  }
}

/** Fetch visitors for a specific source (backend or localStorage). */
export async function fetchVisitors(source: RegistrationSource = "pre-registration"): Promise<VisitorRecord[]> {
  const list = await fetchFromBackend<VisitorRecord[]>(
    `/list/?registration_source=${encodeURIComponent(source)}`
  )
  if (Array.isArray(list)) return list
  return readVisitors(source)
}

/** Create a visitor (submitted). Uses backend if available, else localStorage. */
export async function createVisitor(
  payload: Record<string, unknown>,
  source: RegistrationSource = "pre-registration"
): Promise<VisitorRecord> {
  const body = { ...payload, registration_source: source, registration_status: "approved" }
  const created = await fetchFromBackend<VisitorRecord>("/create/", {
    method: "POST",
    body: JSON.stringify(body),
  })
  if (created && typeof created.id === "number") return created as VisitorRecord

  const rows = readVisitors(source)
  const nextId = rows.length === 0 ? 1 : Math.max(...rows.map((r) => r.id)) + 1
  const fullName = String(payload.full_name ?? payload.fullName ?? "Unknown Visitor")
  const visitorType = String(payload.visitor_type ?? payload.registration_type ?? "individual")
  const department = String(payload.department_to_visit ?? payload.department ?? "admin")
  const cnic = String(payload.cnic_number ?? payload.cnic_passport ?? "")
  const passport = String(payload.passport_number ?? "")
  const createdAt = new Date().toISOString()
  const base: VisitorRecord = {
    id: nextId,
    full_name: fullName,
    visitor_type: visitorType,
    department_to_visit: department,
    cnic_number: cnic,
    passport_number: passport,
    created_at: createdAt,
    registration_source: source,
  }
  const newRow: VisitorRecord = { ...payload, ...base, registration_status: "approved" } as VisitorRecord
  writeVisitors(source, [newRow, ...rows], rows.length)
  return newRow
}

/** Save a draft. Uses backend if available, else localStorage. */
export async function saveDraftToStore(
  payload: Record<string, unknown>,
  source: RegistrationSource = "pre-registration"
): Promise<VisitorRecord> {
  const body = { ...payload, registration_source: source, registration_status: "draft" }
  const created = await fetchFromBackend<VisitorRecord>("/create/", {
    method: "POST",
    body: JSON.stringify(body),
  })
  if (created && typeof created.id === "number") return created as VisitorRecord

  const rows = readVisitors(source)
  const nextId = rows.length === 0 ? 1 : Math.max(...rows.map((r) => r.id)) + 1
  const fullName = String(payload.full_name ?? payload.fullName ?? "Unknown Visitor")
  const visitorType = String(payload.visitor_type ?? payload.registration_type ?? "individual")
  const department = String(payload.department_to_visit ?? payload.department ?? "admin")
  const cnic = String(payload.cnic_number ?? payload.cnic_passport ?? "")
  const passport = String(payload.passport_number ?? "")
  const createdAt = new Date().toISOString()
  const base: VisitorRecord = {
    id: nextId,
    full_name: fullName,
    visitor_type: visitorType,
    department_to_visit: department,
    cnic_number: cnic,
    passport_number: passport,
    created_at: createdAt,
    registration_source: source,
    registration_status: "draft",
  }
  const newRow: VisitorRecord = { ...payload, ...base, registration_status: "draft" } as VisitorRecord
  writeVisitors(source, [newRow, ...rows], rows.length)
  return newRow
}

export type UpdateVisitorOptions = {
  /** When submitting a draft use "sent"; when re-saving a draft use "draft". Omitted = "sent". */
  registrationStatus?: RegistrationStatus;
};

/** Update an existing visitor (backend or localStorage). */
export async function updateVisitor(
  id: number,
  payload: Record<string, unknown>,
  source: RegistrationSource = "walk-in",
  options?: UpdateVisitorOptions
): Promise<VisitorRecord | null> {
  const status = options?.registrationStatus ?? "sent"
  const body = { ...payload, registration_source: source, registration_status: status }
  const updated = await fetchFromBackend<VisitorRecord>(`/${id}/update/`, {
    method: "PATCH",
    body: JSON.stringify(body),
  })
  if (updated && typeof updated.id === "number") return updated as VisitorRecord

  const rows = readVisitors(source)
  const index = rows.findIndex((r) => r.id === id)
  if (index === -1) return null
  const existing = rows[index] as Record<string, unknown>
  const fullName = String(payload.full_name ?? payload.fullName ?? existing.full_name ?? "Unknown Visitor")
  const visitorType = String(payload.visitor_type ?? payload.registration_type ?? existing.visitor_type ?? "individual")
  const department = String(payload.department_to_visit ?? payload.department ?? existing.department_to_visit ?? "admin")
  const cnic = String(payload.cnic_number ?? payload.cnic_passport ?? existing.cnic_number ?? "")
  const passport = String(payload.passport_number ?? existing.passport_number ?? "")
  const newStatus: RegistrationStatus = status
  const updatedLocal: VisitorRecord = {
    ...existing,
    ...payload,
    id,
    full_name: fullName,
    visitor_type: visitorType,
    department_to_visit: department,
    cnic_number: cnic,
    passport_number: passport,
    created_at: String(existing.created_at ?? new Date().toISOString()),
    registration_source: (existing.registration_source as RegistrationSource) ?? source,
    registration_status: newStatus,
  } as VisitorRecord
  const next = [...rows]
  next[index] = updatedLocal
  writeVisitors(source, next, rows.length)
  return updatedLocal
}

/** Get a single visitor by id (backend or localStorage). */
export async function getVisitor(
  id: number,
  source: RegistrationSource = "walk-in"
): Promise<VisitorRecord | null> {
  const one = await fetchFromBackend<VisitorRecord>(`/${id}/read/`)
  if (one && (one as VisitorRecord).id === id) return one as VisitorRecord
  const rows = readVisitors(source)
  return rows.find((r) => r.id === id) ?? null
}

/** Delete a visitor by id (backend or localStorage). */
export async function deleteVisitor(
  id: number,
  source: RegistrationSource = "walk-in"
): Promise<void> {
  try {
    const url = getVisitorApiUrl(`/${id}/delete/`)
    const res = await fetch(url, { method: "DELETE", headers: getAuthHeaders() })
    if (res.ok) return
  } catch {
    /* fall through to local */
  }
  const rows = readVisitors(source).filter((r) => r.id !== id)
  writeVisitors(source, rows, undefined)
}

/** Check if a CNIC already exists (backend: both sources; else localStorage). */
export async function isCnicExists(cnic: string): Promise<boolean> {
  const normalized = String(cnic || "").trim().replace(/\D/g, "")
  if (!normalized) return false
  const walkIn = await fetchVisitors("walk-in")
  const preReg = await fetchVisitors("pre-registration")
  const all = [...walkIn, ...preReg]
  return all.some((r) => String(r.cnic_number || "").replace(/\D/g, "") === normalized)
}

/** User-friendly message for toast from any error (no backend). */
export function getErrorToastMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;
  const s = String(err);
  if (/quota|exceeded|setItem.*Storage/i.test(s)) return STORAGE_QUOTA_MESSAGE;
  return "Something went wrong. Please try again.";
}
