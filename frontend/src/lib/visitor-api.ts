const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API = `${API_BASE_URL}/api`;
const VISITOR_LIST = `${API}/visitors/list/`;
const VISITOR_CREATE = `${API}/visitors/create/`;
const visitorRead = (id: number) => `${API}/visitors/${id}/read/`;
const visitorUpdate = (id: number) => `${API}/visitors/${id}/update/`;
const visitorDelete = (id: number) => `${API}/visitors/${id}/delete/`;

export type VisitorRecord = {
  id: number;
  full_name: string;
  visitor_type: string;
  department_to_visit: string;
  cnic_number: string;
  passport_number: string;
  created_at: string;
  flow_stage?: string;
  approval_status?: string;
};

/** Full visitor detail as returned by GET /api/visitors/:id/read/ */
export type VisitorDetail = VisitorRecord & {
  gender?: string;
  nationality?: string;
  date_of_birth?: string | null;
  mobile_number?: string;
  email_address?: string;
  residential_address?: string;
  visit_purpose?: string;
  visit_description?: string;
  host_officer_name?: string;
  host_officer_designation?: string;
  preferred_visit_date?: string | null;
  preferred_time_slot?: string;
  expected_duration?: string;
  preferred_view_visit?: string;
  document_type?: string;
  document_no?: string;
  issuing_authority?: string;
  expiry_date?: string | null;
  front_image?: string;
  back_image?: string;
  support_doc_type?: string;
  application_letter?: string;
  letter_ref_no?: string;
  additional_document?: string;
  upload_procedure?: string;
  organization_name?: string;
  organization_type?: string;
  ntn_registration_no?: string;
  designation?: string;
  office_address?: string;
  capture_date?: string;
  capture_time?: string;
  captured_by?: string;
  camera_location?: string;
  photo_quality_score?: string;
  face_match_status?: string;
  captured_photo?: string;
  disclaimer_accepted?: boolean;
  terms_accepted?: boolean;
  previous_visit_reference?: string;
  registration_type?: string;
  cnic_passport?: string;
  visit_purpose_description?: string;
  visit_type?: string;
  reference_number?: string;
  preferred_date?: string;
  preferred_time_slot_walkin?: string;
  department_for_slot?: string;
  slot_duration?: string;
  host_id?: string;
  host_full_name?: string;
  host_designation?: string;
  host_department?: string;
  watchlist_check_status?: string;
  approver_required?: string;
  temporary_access_granted?: string;
  guard_remarks?: string;
  qr_code_id?: string;
  visitor_ref_number?: string;
  visit_date?: string | null;
  time_validity_start?: string;
  time_validity_end?: string;
  access_zone?: string;
  entry_gate?: string;
  expiry_status?: string;
  scan_count?: number;
  generated_on?: string | null;
  generated_by?: string;
  approval_status?: string;
  approved_at?: string | null;
  approved_by?: string;
  rejection_reason?: string;
  host_notified_at?: string | null;
  host_notification_sent?: boolean;
};

function getErrorMessage(response: Response, body: unknown): string {
  if (response.status === 400 && body && typeof body === "object" && !Array.isArray(body)) {
    const err = body as Record<string, unknown>;
    const parts = Object.entries(err).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`);
    if (parts.length) return parts.join("; ");
  }
  if (body && typeof body === "object" && "detail" in body) return String((body as { detail: unknown }).detail);
  return `Request failed (${response.status})`;
}

export async function fetchVisitors(): Promise<VisitorRecord[]> {
  const response = await fetch(VISITOR_LIST, { cache: "no-store" });
  if (!response.ok) {
    let msg = `Failed to load visitors (${response.status})`;
    try {
      const data = await response.json();
      msg = getErrorMessage(response, data);
    } catch {
      // ignore
    }
    throw new Error(msg);
  }
  return response.json();
}

export async function createVisitor(payload: Record<string, unknown>) {
  const response = await fetch(VISITOR_CREATE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    let errorMessage = `Failed to save visitor (${response.status})`;
    try {
      const data = await response.json();
      errorMessage = getErrorMessage(response, data);
    } catch {
      // ignore
    }
    throw new Error(errorMessage);
  }
  return response.json();
}

export async function getVisitor(id: number): Promise<VisitorDetail> {
  const response = await fetch(visitorRead(id), { cache: "no-store" });
  if (!response.ok) {
    let msg = `Failed to load visitor (${response.status})`;
    try {
      const data = await response.json();
      msg = getErrorMessage(response, data);
    } catch {
      // ignore
    }
    throw new Error(msg);
  }
  return response.json();
}

export async function updateVisitor(
  id: number,
  payload: Record<string, unknown>,
  partial = false
): Promise<VisitorRecord> {
  const response = await fetch(visitorUpdate(id), {
    method: partial ? "PATCH" : "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    let errorMessage = `Failed to update visitor (${response.status})`;
    try {
      const data = await response.json();
      errorMessage = getErrorMessage(response, data);
    } catch {
      // ignore
    }
    throw new Error(errorMessage);
  }
  return response.json();
}

export async function deleteVisitor(id: number): Promise<void> {
  const response = await fetch(visitorDelete(id), { method: "DELETE" });
  if (!response.ok) {
    let msg = `Failed to delete visitor (${response.status})`;
    try {
      const data = await response.json();
      msg = getErrorMessage(response, data);
    } catch {
      // ignore
    }
    throw new Error(msg);
  }
}
