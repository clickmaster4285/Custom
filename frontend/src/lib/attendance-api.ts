import { API_BASE_URL, getAuthHeaders, getAuthHeadersFormData } from "@/lib/api";

export type AttendanceRecord = {
  id: number;
  user: number;
  username: string;
  date: string;
  check_in: string | null;
  check_out: string | null;
  image: string | null;
};

const ATTENDANCE_ENDPOINT = `${API_BASE_URL}/api/attendance/`;

export async function fetchAttendance(): Promise<AttendanceRecord[]> {
  const response = await fetch(ATTENDANCE_ENDPOINT, {
    headers: getAuthHeaders(),
    cache: "no-store",
  });
  if (response.status === 401) throw new Error("Unauthorized");
  if (!response.ok) throw new Error(`Failed to load attendance (${response.status})`);
  return response.json();
}

/** Mark check-in with camera image. Creates a new attendance record with check_in=now and image. */
export async function markCheckIn(userId: number, imageFile: File): Promise<AttendanceRecord> {
  const form = new FormData();
  form.append("user", String(userId));
  form.append("image", imageFile);
  const response = await fetch(ATTENDANCE_ENDPOINT, {
    method: "POST",
    headers: getAuthHeadersFormData(),
    body: form,
  });
  if (response.status === 401) throw new Error("Unauthorized");
  if (response.status === 403) throw new Error("Only Admin or HR can mark attendance.");
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    const msg = typeof err === "object" && err !== null
      ? Object.entries(err).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(" ") : v}`).join("; ")
      : `Failed to mark check-in (${response.status})`;
    throw new Error(msg);
  }
  return response.json();
}

/** Mark check-out: update an existing attendance record with check_out=now and optional image. */
export async function markCheckOut(recordId: number, imageFile?: File): Promise<AttendanceRecord> {
  const url = `${ATTENDANCE_ENDPOINT}${recordId}/`;
  const checkOutIso = new Date().toISOString();
  if (imageFile) {
    const form = new FormData();
    form.append("check_out", checkOutIso);
    form.append("image", imageFile);
    const response = await fetch(url, {
      method: "PATCH",
      headers: getAuthHeadersFormData(),
      body: form,
    });
    if (response.status === 401) throw new Error("Unauthorized");
    if (!response.ok) throw new Error(`Failed to mark check-out (${response.status})`);
    return response.json();
  }
  const response = await fetch(url, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify({ check_out: checkOutIso }),
  });
  if (response.status === 401) throw new Error("Unauthorized");
  if (!response.ok) throw new Error(`Failed to mark check-out (${response.status})`);
  return response.json();
}

/** Get today's attendance record for a user (for check-out). */
export function getTodayRecordForUser(records: AttendanceRecord[], userId: number): AttendanceRecord | undefined {
  const today = new Date().toISOString().slice(0, 10);
  return records.find((r) => r.user === userId && r.date === today);
}
