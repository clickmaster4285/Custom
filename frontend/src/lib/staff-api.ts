import { API_BASE_URL, getAuthHeaders, getAuthHeadersFormData } from "@/lib/api";

export type StaffRecord = {
  id: number;
  user: string;
  user_id?: number;  // User id (for attendance marking)
  role: string;
  email: string;
  phone: string;
  full_name: string;
  cnic: string;
  address: string;
  date_of_birth: string;
  joining_date: string;
  department: string;
  designation: string;
  profile_image: string | null;
  emergency_contact: string;
  created_at: string;
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
  return response.json();
}

export type CreateStaffPayload = {
  username: string;
  password: string;
  email: string;
  role: string;
  phone: string;
  full_name: string;
  cnic: string;
  address: string;
  date_of_birth: string;
  joining_date: string;
  department: string;
  designation: string;
  emergency_contact: string;
  profile_image?: File | null;
};

export async function createStaff(payload: CreateStaffPayload): Promise<StaffRecord> {
  const isFormData = payload.profile_image instanceof File;
  let body: string | FormData;
  const headers = isFormData ? getAuthHeadersFormData() : getAuthHeaders();

  if (isFormData) {
    const form = new FormData();
    const { profile_image, ...rest } = payload;
    Object.entries(rest).forEach(([k, v]) => form.append(k, String(v)));
    if (profile_image) form.append("profile_image", profile_image);
    body = form;
  } else {
    const { profile_image: _, ...rest } = payload;
    body = JSON.stringify(rest);
  }

  const response = await fetch(STAFF_ENDPOINT, {
    method: "POST",
    headers,
    body,
  });

  if (response.status === 401) throw new Error("Unauthorized");
  if (response.status === 403) throw new Error("Only Admin or HR can add staff.");
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    const msg = typeof data === "object" && data !== null
      ? Object.entries(data)
          .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(" ") : v}`)
          .join("; ")
      : `Failed to create staff (${response.status})`;
    throw new Error(msg);
  }
  return response.json();
}
