import { API_BASE_URL, getAuthHeaders, getAuthHeadersFormData } from "@/lib/api";

/** Staff record as returned by the backend (list/detail). */
export type StaffRecord = {
  id: number;
  user: number | null;
  full_name: string;
  first_name?: string | null;
  last_name?: string | null;
  cnic: string;
  national_id?: string;
  date_of_birth?: string | null;
  gender?: string | null;
  marital_status?: string | null;
  blood_group?: string | null;
  profile_image: string | null;
  email?: string | null;
  phone_primary?: string | null;
  phone_alternate?: string | null;
  address?: string | null;
  street_address?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  postal_code?: string | null;
  employee_id?: string | null;
  designation: string;
  department: string;
  branch_location?: string | null;
  manager?: string | null;
  employment_type?: string | null;
  joining_date?: string;
  probation_end_date?: string | null;
  work_shift_start?: string | null;
  work_shift_end?: string | null;
  job_status?: string | null;
  salary?: string | null;
  bank_account?: string | null;
  iban?: string | null;
  salary_type?: string | null;
  tax_id?: string | null;
  allowances?: string | null;
  role_access_level?: string | null;
  system_permissions?: string | null;
  emergency_contact?: string | null;
  emergency_contact_name?: string | null;
  emergency_contact_relationship?: string | null;
  emergency_contact_phone?: string | null;
  emergency_contact_address?: string | null;
  resume_file?: string | null;
  joining_letter_file?: string | null;
  contract_file?: string | null;
  id_proof_file?: string | null;
  tax_form_file?: string | null;
  certificates_file?: string | null;
  background_check_status?: string | null;
  skills_competencies?: string | null;
  languages_known?: string | null;
  performance_rating?: string | null;
  last_appraisal_date?: string | null;
  leave_balance?: number | null;
  notes?: string | null;
  created_at?: string;
  user_details?: {
    id: number;
    username: string;
    email: string;
    role: string;
    phone: string;
    is_active: boolean;
  } | null;
};

const STAFF_ENDPOINT = `${API_BASE_URL}/api/staff/`;

export async function fetchStaff(): Promise<StaffRecord[]> {
  const response = await fetch(STAFF_ENDPOINT, {
    headers: getAuthHeaders(),
    cache: "no-store",
  });
  if (response.status === 401) {
    throw new Error("Unauthorized");
  }
  if (!response.ok) {
    throw new Error(`Failed to load staff (${response.status})`);
  }
  const data = await response.json();
  if (Array.isArray(data)) return data;
  if (data && Array.isArray((data as { results?: StaffRecord[] }).results))
    return (data as { results: StaffRecord[] }).results;
  return [];
}

export async function fetchStaffById(id: number): Promise<StaffRecord> {
  const response = await fetch(`${STAFF_ENDPOINT}${id}/`, {
    headers: getAuthHeaders(),
    cache: "no-store",
  });
  if (response.status === 401) throw new Error("Unauthorized");
  if (response.status === 404) throw new Error("Staff not found");
  if (!response.ok) throw new Error(`Failed to load staff (${response.status})`);
  return response.json();
}

/** URL for downloading a staff document (requires auth when used via fetch). */
export function getStaffDocumentDownloadUrl(staffId: number, field: string): string {
  return `${STAFF_ENDPOINT}${staffId}/document/${field}/`;
}

/** Trigger download of a staff document (uses auth). */
export async function downloadStaffDocument(
  staffId: number,
  field: string,
  fileName: string
): Promise<void> {
  const url = getStaffDocumentDownloadUrl(staffId, field);
  const response = await fetch(url, { headers: getAuthHeaders() });
  if (!response.ok) throw new Error("Download failed");
  const blob = await response.blob();
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = fileName || "document";
  a.click();
  URL.revokeObjectURL(a.href);
}

const FILE_KEYS = [
  "profile_image",
  "resume_file",
  "joining_letter_file",
  "contract_file",
  "id_proof_file",
  "tax_form_file",
  "certificates_file",
] as const;

/** Full HR template payload accepted by backend. */
export type CreateStaffPayload = {
  first_name: string;
  last_name: string;
  national_id: string;
  date_of_birth?: string;
  gender?: string;
  marital_status?: string;
  blood_group?: string;
  email?: string;
  phone_primary?: string;
  phone_alternate?: string;
  street_address?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  employee_id?: string;
  designation: string;
  department: string;
  branch_location?: string;
  manager?: string;
  employment_type?: string;
  date_of_joining?: string;
  probation_end_date?: string;
  work_shift_start?: string;
  work_shift_end?: string;
  job_status?: string;
  salary?: string;
  bank_account?: string;
  iban?: string;
  salary_type?: string;
  tax_id?: string;
  allowances?: string;
  role_access_level?: string;
  system_permissions?: string;
  emergency_contact_name?: string;
  emergency_contact_relationship?: string;
  emergency_contact_phone?: string;
  emergency_contact_address?: string;
  resume_file?: File | null;
  joining_letter_file?: File | null;
  contract_file?: File | null;
  id_proof_file?: File | null;
  tax_form_file?: File | null;
  certificates_file?: File | null;
  background_check_status?: string;
  skills_competencies?: string;
  languages_known?: string;
  performance_rating?: string;
  last_appraisal_date?: string;
  leave_balance?: number | string;
  notes?: string;
  profile_image?: File | null;
};

function buildBody(payload: CreateStaffPayload): { body: string | FormData; useFormData: boolean } {
  const hasFile = FILE_KEYS.some((k) => payload[k as keyof CreateStaffPayload] instanceof File);
  if (hasFile) {
    const form = new FormData();
    Object.entries(payload).forEach(([k, v]) => {
      if (v === undefined || v === null || v === "") return;
      if (v instanceof File) form.append(k, v);
      else form.append(k, String(v));
    });
    return { body: form, useFormData: true };
  }
  const obj: Record<string, unknown> = {};
  Object.entries(payload).forEach(([k, v]) => {
    if (v === undefined || v === null || v === "") return;
    if (!(v instanceof File)) obj[k] = v;
  });
  return { body: JSON.stringify(obj), useFormData: false };
}

export async function createStaff(payload: CreateStaffPayload): Promise<StaffRecord> {
  const { body, useFormData } = buildBody(payload);
  const headers = useFormData ? getAuthHeadersFormData() : getAuthHeaders();
  const response = await fetch(STAFF_ENDPOINT, {
    method: "POST",
    headers,
    body,
  });
  if (response.status === 401) throw new Error("Unauthorized");
  if (response.status === 403) throw new Error("Only Admin or HR can add staff.");
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    const msg =
      typeof data === "object" && data !== null
        ? Object.entries(data)
            .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(" ") : v}`)
            .join("; ")
        : `Failed to create staff (${response.status})`;
    throw new Error(msg);
  }
  return response.json();
}

/** Update staff (PATCH). Supports partial payload and file fields via FormData. */
export async function updateStaff(
  id: number,
  payload: Partial<CreateStaffPayload>
): Promise<StaffRecord> {
  const hasFile = FILE_KEYS.some((k) => payload[k as keyof CreateStaffPayload] instanceof File);
  const url = `${STAFF_ENDPOINT}${id}/`;
  if (hasFile) {
    const form = new FormData();
    Object.entries(payload).forEach(([k, v]) => {
      if (v === undefined || v === null) return;
      if (v instanceof File) form.append(k, v);
      else form.append(k, String(v));
    });
    const response = await fetch(url, {
      method: "PATCH",
      headers: getAuthHeadersFormData(),
      body: form,
    });
    if (response.status === 401) throw new Error("Unauthorized");
    if (response.status === 404) throw new Error("Staff not found");
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      const msg =
        typeof data === "object" && data !== null
          ? Object.entries(data)
              .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(" ") : v}`)
              .join("; ")
          : `Failed to update staff (${response.status})`;
      throw new Error(msg);
    }
    return response.json();
  }
  const obj: Record<string, unknown> = {};
  Object.entries(payload).forEach(([k, v]) => {
    if (v === undefined || v === null) return;
    if (!(v instanceof File)) obj[k] = v;
  });
  const response = await fetch(url, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify(obj),
  });
  if (response.status === 401) throw new Error("Unauthorized");
  if (response.status === 404) throw new Error("Staff not found");
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    const msg =
      typeof data === "object" && data !== null
        ? Object.entries(data)
            .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(" ") : v}`)
            .join("; ")
        : `Failed to update staff (${response.status})`;
    throw new Error(msg);
  }
  return response.json();
}

/** Delete staff (hard delete). */
export async function deleteStaff(id: number): Promise<void> {
  const response = await fetch(`${STAFF_ENDPOINT}${id}/`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  if (response.status === 401) throw new Error("Unauthorized");
  if (response.status === 404) throw new Error("Staff not found");
  if (!response.ok) throw new Error(`Failed to delete staff (${response.status})`);
}
