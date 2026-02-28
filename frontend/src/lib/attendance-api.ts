export type AttendanceRecord = {
  id: number;
  user: number;
  username: string;
  date: string;
  check_in: string | null;
  check_out: string | null;
  image: string | null;
  /** How attendance was recorded: manual, face_recognition, office_zone */
  source?: string;
};

const ATTENDANCE_STORAGE_KEY = "hr_attendance_local";

function readAttendance(): AttendanceRecord[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(ATTENDANCE_STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as AttendanceRecord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAttendance(rows: AttendanceRecord[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ATTENDANCE_STORAGE_KEY, JSON.stringify(rows));
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(new Error("Failed to read attendance image."));
    reader.readAsDataURL(file);
  });
}

function getUsernameFromLocalStaff(userId: number): string {
  if (typeof window === "undefined") return `user-${userId}`;
  const raw = window.localStorage.getItem("hr_staff_local");
  if (!raw) return `user-${userId}`;
  try {
    const rows = JSON.parse(raw) as Array<{ id: number; user?: string; user_id?: number }>;
    const match = rows.find((r) => r.user_id === userId || r.id === userId);
    return match?.user || `user-${userId}`;
  } catch {
    return `user-${userId}`;
  }
}

export async function fetchAttendance(): Promise<AttendanceRecord[]> {
  return readAttendance();
}

/** Mark check-in with camera image. Creates a new attendance record with check_in=now and image. */
export async function markCheckIn(userId: number, imageFile: File): Promise<AttendanceRecord> {
  if (!userId) {
    throw new Error("Please select a staff member.");
  }

  const rows = readAttendance();
  const today = new Date().toISOString().slice(0, 10);
  const existingToday = rows.find((r) => r.user === userId && r.date === today);
  if (existingToday?.check_in) {
    throw new Error("Check-in already exists for today.");
  }

  const nowIso = new Date().toISOString();
  const image = await fileToDataUrl(imageFile);
  const nextId = rows.length === 0 ? 1 : Math.max(...rows.map((r) => r.id)) + 1;

  const created: AttendanceRecord = existingToday
    ? {
        ...existingToday,
        check_in: nowIso,
        image,
        source: "manual",
      }
    : {
        id: nextId,
        user: userId,
        username: getUsernameFromLocalStaff(userId),
        date: today,
        check_in: nowIso,
        check_out: null,
        image,
        source: "manual",
      };

  const updated = existingToday
    ? rows.map((r) => (r.id === existingToday.id ? created : r))
    : [created, ...rows];
  writeAttendance(updated);
  return created;
}

/** Mark check-out: update an existing attendance record with check_out=now and optional image. */
export async function markCheckOut(recordId: number, imageFile?: File): Promise<AttendanceRecord> {
  const rows = readAttendance();
  const target = rows.find((r) => r.id === recordId);
  if (!target) {
    throw new Error("Attendance record not found.");
  }

  const updatedTarget: AttendanceRecord = {
    ...target,
    check_out: new Date().toISOString(),
    image: imageFile ? await fileToDataUrl(imageFile) : target.image,
    source: target.source ?? "manual",
  };
  const updatedRows = rows.map((r) => (r.id === recordId ? updatedTarget : r));
  writeAttendance(updatedRows);
  return updatedTarget;
}

/** Get today's attendance record for a user (for check-out). */
export function getTodayRecordForUser(records: AttendanceRecord[], userId: number): AttendanceRecord | undefined {
  const today = new Date().toISOString().slice(0, 10);
  return records.find((r) => r.user === userId && r.date === today);
}

/** Response from face recognition (camera auto-attendance). */
export type RecognizeResponse =
  | { recognized: false; message: string }
  | {
      recognized: true;
      user_id: number;
      username?: string;
      similarity: number;
      attendance?: "already_checked_in" | "already_has_record" | "check_in_marked";
      record_id?: number;
    };

/**
 * Send captured image to recognize face and optionally auto-mark check-in.
 * Requires trained face embeddings (backend: python manage.py train_attendance_faces).
 */
export async function recognizeAndMarkAttendance(
  imageFile: File,
  options?: { autoMark?: boolean; threshold?: number }
): Promise<RecognizeResponse> {
  await imageFile.arrayBuffer();
  if (options?.autoMark === false) {
    return { recognized: false, message: "Frontend mode: face recognition is disabled." };
  }
  return { recognized: false, message: "Frontend mode: no backend recognition service configured." };
}
