/**
 * VMS API client: approval, zone scan, vehicles, notifications, analytics, security.
 */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000"
const API = `${API_BASE_URL}/api`

function getErrorMessage(response: Response, body: unknown): string {
  if (response.status === 400 && body && typeof body === "object" && !Array.isArray(body)) {
    const err = body as Record<string, unknown>
    const parts = Object.entries(err).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`)
    if (parts.length) return parts.join("; ")
  }
  if (body && typeof body === "object" && "detail" in body) return String((body as { detail: unknown }).detail)
  return `Request failed (${response.status})`
}

// ----- Active Visitors (in building) -----
export type ActiveVisitor = {
  id: number
  full_name: string
  flow_stage?: string
  host_full_name?: string
  host_department?: string
  access_zone?: string
  updated_at?: string
  created_at: string
  [key: string]: unknown
}

export async function fetchActiveVisitors(): Promise<ActiveVisitor[]> {
  const res = await fetch(`${API}/visitors/active/`, { cache: "no-store" })
  if (!res.ok) {
    let msg = `Failed to load active visitors (${res.status})`
    try {
      const data = await res.json()
      msg = getErrorMessage(res, data)
    } catch {
      // ignore
    }
    throw new Error(msg)
  }
  return res.json()
}

// ----- Approval Workflow -----
export type PendingVisitor = {
  id: number
  full_name: string
  approval_status: string
  flow_stage?: string
  host_full_name?: string
  host_department?: string
  created_at: string
  [key: string]: unknown
}

export async function fetchPendingApprovals(): Promise<PendingVisitor[]> {
  const res = await fetch(`${API}/approval/pending/`, { cache: "no-store" })
  if (!res.ok) {
    let msg = `Failed to load pending approvals (${res.status})`
    try {
      const data = await res.json()
      msg = getErrorMessage(res, data)
    } catch {
      // ignore
    }
    throw new Error(msg)
  }
  return res.json()
}

export async function approveVisitor(id: number, approvedBy: string): Promise<PendingVisitor> {
  const res = await fetch(`${API}/visitors/${id}/approve/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ approved_by: approvedBy }),
  })
  if (!res.ok) {
    let msg = `Failed to approve (${res.status})`
    try {
      const data = await res.json()
      msg = getErrorMessage(res, data)
    } catch {
      // ignore
    }
    throw new Error(msg)
  }
  return res.json()
}

export async function denyVisitor(
  id: number,
  payload: { rejection_reason: string; denied_by?: string }
): Promise<PendingVisitor> {
  const res = await fetch(`${API}/visitors/${id}/deny/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    let msg = `Failed to deny (${res.status})`
    try {
      const data = await res.json()
      msg = getErrorMessage(res, data)
    } catch {
      // ignore
    }
    throw new Error(msg)
  }
  return res.json()
}

// ----- Zone scan (Check-in / Check-out) -----
export type ZoneScanPayload = {
  qr_code_id: string
  zone: string
  gate?: string
  scan_type?: "entry" | "exit"
  scanner_id?: string
}

export type ZoneScanResult = {
  allowed: boolean
  message: string
  visitor_id?: number
  visitor_name?: string
  flow_stage?: string
}

export async function zoneScan(payload: ZoneScanPayload): Promise<ZoneScanResult> {
  const res = await fetch(`${API}/zone-access/scan/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    let msg = `Scan failed (${res.status})`
    try {
      const data = await res.json()
      msg = getErrorMessage(res, data)
    } catch {
      // ignore
    }
    throw new Error(msg)
  }
  return res.json()
}

// ----- Vehicles -----
export type VehicleRecord = {
  id: number
  visitor: number
  visitor_name?: string
  plate_number: string
  vehicle_type: string
  contractor_company?: string
  driver_name?: string
  remarks?: string
  created_at: string
}

export async function fetchVehicles(visitorId?: number): Promise<VehicleRecord[]> {
  const url = visitorId ? `${API}/vehicles/?visitor_id=${visitorId}` : `${API}/vehicles/`
  const res = await fetch(url, { cache: "no-store" })
  if (!res.ok) throw new Error(`Failed to load vehicles (${res.status})`)
  return res.json()
}

export async function createVehicle(payload: {
  visitor: number
  plate_number: string
  vehicle_type: string
  contractor_company?: string
  driver_name?: string
  remarks?: string
}): Promise<VehicleRecord> {
  const res = await fetch(`${API}/vehicles/create/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    let msg = `Failed to add vehicle (${res.status})`
    try {
      const data = await res.json()
      msg = getErrorMessage(res, data)
    } catch {
      // ignore
    }
    throw new Error(msg)
  }
  return res.json()
}

// ----- Notifications / Communication -----
export type NotificationRecord = {
  id: number
  visitor: number
  visitor_name?: string
  notification_type: string
  recipient: string
  sent_at: string
  success: boolean
  message?: string
}

export async function fetchNotifications(visitorId?: number): Promise<NotificationRecord[]> {
  const url = visitorId ? `${API}/notifications/?visitor_id=${visitorId}` : `${API}/notifications/`
  const res = await fetch(url, { cache: "no-store" })
  if (!res.ok) throw new Error(`Failed to load notifications (${res.status})`)
  return res.json()
}

export async function notifyHost(visitorId: number, recipient?: string): Promise<{ host_notified_at: string; recipient: string }> {
  const res = await fetch(`${API}/visitors/${visitorId}/notify-host/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ recipient: recipient || "" }),
  })
  if (!res.ok) {
    let msg = `Failed to notify host (${res.status})`
    try {
      const data = await res.json()
      msg = getErrorMessage(res, data)
    } catch {
      // ignore
    }
    throw new Error(msg)
  }
  return res.json()
}

// ----- Security alerts -----
export type SecurityAlertRecord = {
  id: number
  visitor?: number | null
  visitor_name?: string | null
  alert_type: string
  severity: string
  message: string
  zone?: string
  gate?: string
  created_at: string
  acknowledged: boolean
  acknowledged_at?: string | null
  acknowledged_by?: string
}

export async function fetchSecurityAlerts(params?: {
  acknowledged?: boolean
  severity?: string
}): Promise<SecurityAlertRecord[]> {
  const sp = new URLSearchParams()
  if (params?.acknowledged !== undefined) sp.set("acknowledged", String(params.acknowledged))
  if (params?.severity) sp.set("severity", params.severity)
  const finalUrl = sp.toString() ? `${API}/security/alerts/?${sp.toString()}` : `${API}/security/alerts/`
  const res = await fetch(finalUrl, { cache: "no-store" })
  if (!res.ok) throw new Error(`Failed to load alerts (${res.status})`)
  return res.json()
}

export type SecurityDashboard = {
  visitors_today: number
  in_building: number
  alerts_unacknowledged: number
  alerts_today: number
  recent_alerts: SecurityAlertRecord[]
}

export async function fetchSecurityDashboard(): Promise<SecurityDashboard> {
  const res = await fetch(`${API}/security/dashboard/`, { cache: "no-store" })
  if (!res.ok) throw new Error(`Failed to load dashboard (${res.status})`)
  return res.json()
}

// ----- VMS Analytics -----
export type VmsAnalytics = {
  from_date: string
  to_date: string
  visitors_registered: number
  in_building_now: number
  zone_scans_in_range: number
  alerts_in_range: number
  alerts_unacknowledged: number
  pending_approvals: number
  approved_in_range: number
  denied_in_range: number
}

export async function fetchVmsAnalytics(fromDate?: string, toDate?: string): Promise<VmsAnalytics> {
  const sp = new URLSearchParams()
  if (fromDate) sp.set("from", fromDate)
  if (toDate) sp.set("to", toDate)
  const finalUrl = sp.toString() ? `${API}/vms/analytics/?${sp.toString()}` : `${API}/vms/analytics/`
  const res = await fetch(finalUrl, { cache: "no-store" })
  if (!res.ok) throw new Error(`Failed to load analytics (${res.status})`)
  return res.json()
}
