const VISITOR_WALKIN_KEY = "vms_visitors_walkin";
const VISITOR_PREREG_KEY = "vms_visitors_prereg";

export type RegistrationSource = "walk-in" | "pre-registration";

export type VisitorRecord = {
  id: number;
  full_name: string;
  visitor_type: string;
  department_to_visit: string;
  cnic_number: string;
  passport_number: string;
  created_at: string;
  registration_source?: RegistrationSource;
};

function getStorageKey(source: RegistrationSource): string {
  return source === "walk-in" ? VISITOR_WALKIN_KEY : VISITOR_PREREG_KEY;
}

function readVisitors(source: RegistrationSource): VisitorRecord[] {
  if (typeof window === "undefined") return [];
  const key = getStorageKey(source);
  const raw = window.localStorage.getItem(key);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as VisitorRecord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeVisitors(source: RegistrationSource, rows: VisitorRecord[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(getStorageKey(source), JSON.stringify(rows));
}

/** Fetch visitors for a specific source. Use "walk-in" or "pre-registration" so lists stay separate. */
export async function fetchVisitors(source: RegistrationSource = "pre-registration"): Promise<VisitorRecord[]> {
  return readVisitors(source);
}

/** Create a visitor for a specific source. Walk-in and pre-registration are stored separately. */
/** For walk-in, the full payload (photos, documents, vehicle, etc.) is stored in localStorage. */
export async function createVisitor(
  payload: Record<string, unknown>,
  source: RegistrationSource = "pre-registration"
): Promise<VisitorRecord> {
  const rows = readVisitors(source);
  const nextId =
    rows.length === 0 ? 1 : Math.max(...rows.map((r) => r.id)) + 1;

  const fullName = String(payload.full_name ?? payload.fullName ?? "Unknown Visitor");
  const visitorType = String(payload.visitor_type ?? payload.registration_type ?? "individual");
  const department = String(payload.department_to_visit ?? payload.department ?? "admin");
  const cnic = String(payload.cnic_number ?? payload.cnic_passport ?? "");
  const passport = String(payload.passport_number ?? "");

  const createdAt = new Date().toISOString();
  const base: VisitorRecord = {
    id: nextId,
    full_name: fullName,
    visitor_type: visitorType,
    department_to_visit: department,
    cnic_number: cnic,
    passport_number: passport,
    created_at: createdAt,
    registration_source: source,
  };

  const newRow: VisitorRecord =
    source === "walk-in"
      ? ({ ...payload, ...base } as VisitorRecord)
      : base;

  writeVisitors(source, [newRow, ...rows]);
  return newRow;
}

/** Get a single visitor by id from the given source (local only). */
export async function getVisitor(
  id: number,
  source: RegistrationSource = "walk-in"
): Promise<VisitorRecord | null> {
  const rows = readVisitors(source);
  return rows.find((r) => r.id === id) ?? null;
}

/** Delete a visitor by id from the given source (local only). */
export async function deleteVisitor(
  id: number,
  source: RegistrationSource = "walk-in"
): Promise<void> {
  const rows = readVisitors(source).filter((r) => r.id !== id);
  writeVisitors(source, rows);
}

/** Check if a CNIC already exists in walk-in or pre-registration lists (local only). */
export async function isCnicExists(cnic: string): Promise<boolean> {
  const normalized = String(cnic || "").trim().replace(/\D/g, "");
  if (!normalized) return false;
  const walkIn = readVisitors("walk-in");
  const preReg = readVisitors("pre-registration");
  const all = [...walkIn, ...preReg];
  return all.some((r) => String(r.cnic_number || "").replace(/\D/g, "") === normalized);
}

/** User-friendly message for toast from any error (no backend). */
export function getErrorToastMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;
  return "Something went wrong. Please try again.";
}
