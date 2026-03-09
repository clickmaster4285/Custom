import { API_BASE_URL } from "@/lib/api";

/** Staff record as returned by the backend (list/detail). */
export type StaffRecord = {
  id: number;
  user: number | string | null;
  user_id?: number | string | null;
  full_name: string;
  first_name?: string | null;
  last_name?: string | null;
  father_name?: string | null;
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
  phone?: string | null; // Aliased for backward compatibility
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
  // Custom fields from HEAD
  personal_number?: string | null;
  bps?: string | null;
  qualification?: string | null;
  current_posting?: string | null;
  collector_name?: string | null;
  role?: string | null;
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

// Local-only storage key (used when backend is not connected).
const LOCAL_STAFF_STORE_KEY = "tekeye.hr.staff.local.v1";

type LocalStaffRecord = {
  id: number;
  savedAt: string;
  payload: Record<string, unknown>;
  draft: string | null;
};

type StoredFile = {
  name: string;
  type: string;
  dataUrl: string;
};

type AddStaffDraft = {
  v: 1;
  savedAt: string;
  employeeCategory: "new" | "existing";
  currentStep: number;
  form: Record<string, unknown>;
  staffPhotos: (StoredFile | null)[];
  cnicFront: StoredFile | null;
  cnicBack: StoredFile | null;
  appointmentLetter: StoredFile | null;
  additionalDocument: StoredFile | null;
};

function getDraftProfileImageDataUrl(item: LocalStaffRecord): string | null {
  if (!item.draft) return null;
  try {
    const parsed = JSON.parse(item.draft) as AddStaffDraft;
    const first = parsed?.staffPhotos?.find((x) => x && typeof x.dataUrl === "string") as StoredFile | undefined;
    if (first?.dataUrl && first.dataUrl.startsWith("data:image/")) return first.dataUrl;
  } catch {
    // ignore
  }
  return null;
}

function readLocalStaffStore(): LocalStaffRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(LOCAL_STAFF_STORE_KEY);
    const parsed = raw ? (JSON.parse(raw) as LocalStaffRecord[]) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeLocalStaffStore(items: LocalStaffRecord[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(LOCAL_STAFF_STORE_KEY, JSON.stringify(items));
  } catch {
    // ignore
  }
}

function localToStaffRecord(item: LocalStaffRecord): StaffRecord {
  const p = item.payload ?? {};
  const s = p as unknown as Partial<CreateStaffPayload> & Record<string, unknown>;
  const profileFromDraft = getDraftProfileImageDataUrl(item);

  return {
    id: item.id,
    user: (s.login_username as string) ?? (s.username as string) ?? (s.personal_number as string) ?? null,
    full_name: String(s.full_name ?? ""),
    father_name: (s.father_name as string) ?? null,
    cnic: String(s.cnic ?? ""),
    date_of_birth: (s.date_of_birth as string) ?? null,
    gender: (s.gender as string) ?? null,
    // In local-only mode, we store the image inside the saved draft as a data URL.
    profile_image: profileFromDraft || (() => {
      // if draft didn't have an image, generate a random avatar
      // use full_name to create simple initials avatar if available
      if (profileFromDraft) return profileFromDraft;
      if (s.full_name) {
        const name = String(s.full_name).trim().replace(/ /g, "+");
        return `https://ui-avatars.com/api/?name=${name}&background=random`;
      }
      // fallback to pravatar
      const rand = Math.floor(Math.random() * 70) + 1;
      return `https://i.pravatar.cc/150?img=${rand}`;
    })(),
    email: (s.email as string) ?? null,
    phone: (s.phone as string) ?? null,
    address: (s.address as string) ?? null,
    designation: String(s.designation ?? ""),
    department: String(s.department ?? ""),
    employment_type: (s.employment_type as string) ?? null,
    joining_date: (s.joining_date as string) ?? undefined,
    personal_number: (s.personal_number as string) ?? `PN${Math.floor(100000 + Math.random() * 900000)}`,
    bps: (s.bps as string) ?? null,
    qualification: (s.qualification as string) ?? null,
    current_posting: (s.current_posting as string) ?? null,
    collector_name: (s.collector_name as string) ?? null,
    role: (s.role as string) ?? null,
    emergency_contact: (s.emergency_contact as string) ?? null,
    emergency_contact_name: (s.emergency_contact_name as string) ?? null,
    emergency_contact_relationship: (s.emergency_contact_relationship as string) ?? null,
    emergency_contact_phone: (s.emergency_contact_phone as string) ?? (s.emergency_contact as string) ?? null,
    emergency_contact_address: (s.emergency_contact_address as string) ?? null,
    created_at: item.savedAt,
  } as StaffRecord;
}

// sample data used when there are no staff records in localStorage
const DEFAULT_STAFF: StaffRecord[] = [
  { id: 1, user: "PN499948", personal_number: "PN499948", full_name: "Ali Khan", cnic: "12345-6789012-3", profile_image: `https://i.pravatar.cc/150?img=11`, designation: "Inspector", department: "Enforcement", phone: "0301-1234567", bank_account: null, employment_type: null, joining_date: null, bps: "16", qualification: null, current_posting: "Peshawar", collector_name: null, role: null, emergency_contact: null, emergency_contact_name: null, emergency_contact_relationship: null, emergency_contact_phone: null, emergency_contact_address: null, transferred_from: "HQ (Peshawar)", transferred_to: "AC ASD, Nowshera", created_at: new Date().toISOString() } as any,
  { id: 2, user: "PN285591", personal_number: "PN285591", full_name: "Sara Ahmed", cnic: "23456-7890123-4", profile_image: `https://i.pravatar.cc/150?img=12`, designation: "Assistant Collector", department: "Intelligence", phone: "0302-2345678", bank_account: null, employment_type: null, joining_date: null, bps: "17", qualification: null, current_posting: "Lahore", collector_name: null, role: null, emergency_contact: null, emergency_contact_name: null, emergency_contact_relationship: null, emergency_contact_phone: null, emergency_contact_address: null, transferred_from: "AC (HQ-I)", transferred_to: "ASD, Kohat", created_at: new Date().toISOString() } as any,
  { id: 3, user: "PN707664", personal_number: "PN707664", full_name: "Mustafa Ali", cnic: "34567-8901234-5", profile_image: `https://i.pravatar.cc/150?img=13`, designation: "Deputy Collector", department: "Legal", phone: "0303-3456789", bank_account: null, employment_type: null, joining_date: null, bps: "18", qualification: null, current_posting: "Karachi", collector_name: null, role: null, emergency_contact: null, emergency_contact_name: null, emergency_contact_relationship: null, emergency_contact_phone: null, emergency_contact_address: null, transferred_from: "SWH, Peshawar (HQ)", transferred_to: "AC ASD, D.I. Khan-I", created_at: new Date().toISOString() } as any,
  { id: 4, user: "PN878685", personal_number: "PN878685", full_name: "Fatima Noor", cnic: "45678-9012345-6", profile_image: `https://i.pravatar.cc/150?img=14`, designation: "Inspector", department: "Human Resources", phone: "0304-4567890", bank_account: null, employment_type: null, joining_date: null, bps: "16", qualification: null, current_posting: "Islamabad", collector_name: null, role: null, emergency_contact: null, emergency_contact_name: null, emergency_contact_relationship: null, emergency_contact_phone: null, emergency_contact_address: null, transferred_from: "DC ASD, Peshawar/Kohat & Bannu", transferred_to: "AC ASD, Hazara", created_at: new Date().toISOString() } as any,
  { id: 5, user: "PN691102", personal_number: "PN691102", full_name: "Rao Sheikh", cnic: "56789-0123456-7", profile_image: `https://i.pravatar.cc/150?img=15`, designation: "Assistant Inspector", department: "Operations", phone: "0305-5678901", bank_account: null, employment_type: null, joining_date: null, bps: "15", qualification: null, current_posting: "Multan", collector_name: null, role: null, emergency_contact: null, emergency_contact_name: null, emergency_contact_relationship: null, emergency_contact_phone: null, emergency_contact_address: null, transferred_from: "ASD, Hazara", transferred_to: "ASD, D.I. Khan", created_at: new Date().toISOString() } as any,
];

const LOCAL_STAFF_STORE_VERSION = 2; // bump when default data format changes

export async function fetchStaff(): Promise<StaffRecord[]> {
  // Local-only mode: pull from localStorage and convert
  let storedItems = readLocalStaffStore();

  // if there are no items at all, or they look very old, rebuild entirely
  const initialCheck = storedItems.length === 0 ||
    storedItems.some((it) => {
      try {
        const p = it.payload as any;
        return !p.personal_number || (typeof p.personal_number === "string" && !p.personal_number.startsWith("PN"));
      } catch {
        return true;
      }
    });

  if (initialCheck) {
    const items = DEFAULT_STAFF.map((s) => ({
      id: s.id,
      savedAt: s.created_at || new Date().toISOString(),
      payload: s,
      draft: null,
      v: LOCAL_STAFF_STORE_VERSION,
    }));
    writeLocalStaffStore(items as LocalStaffRecord[]);
    return DEFAULT_STAFF;
  }

  // merge defaults for any record that is missing phone/transfer info
  let updated = false;
  storedItems = storedItems.map((it) => {
    const rec = localToStaffRecord(it);
    const def = DEFAULT_STAFF.find((d) => d.id === rec.id);
    if (!def) return it;

    const needsMerge =
      (!rec.phone || rec.phone === "—") ||
      (!rec.transferred_from || rec.transferred_from === "—") ||
      (!rec.transferred_to || rec.transferred_to === "—");
    if (!needsMerge) return it;

    updated = true;
    const mergedPayload = { ...(it.payload ?? {}),
      phone: def.phone,
      transferred_from: def.transferred_from,
      transferred_to: def.transferred_to,
    } as Record<string, unknown>;
    return { ...it, payload: mergedPayload };
  });

  if (updated) {
    writeLocalStaffStore(storedItems);
  }

  return storedItems.map(localToStaffRecord);
}

export async function fetchStaffById(id: number): Promise<StaffRecord> {
  const items = readLocalStaffStore();
  const found = items.find((x) => x.id === id);
  if (!found) throw new Error("Staff not found");
  return localToStaffRecord(found);
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
  void staffId;
  void field;
  void fileName;
  throw new Error("Document download is not available in local-only mode.");
}

/** Full HR template payload accepted by backend. */
export type CreateStaffPayload = {
  // Common fields
  full_name: string;
  first_name?: string;
  last_name?: string;
  father_name?: string;
  email?: string;
  phone?: string;
  phone_primary?: string;
  phone_alternate?: string;
  cnic: string;
  national_id?: string;
  address: string;
  street_address?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  date_of_birth: string;
  gender?: string;
  marital_status?: string;
  blood_group?: string;
  
  // Employment
  employee_id?: string;
  personal_number?: string;
  designation: string;
  department: string;
  joining_date: string;
  date_of_joining?: string;
  employment_type?: string;
  job_status?: string;
  branch_location?: string;
  manager?: string;
  bps?: string;
  qualification?: string;
  current_posting?: string;
  collector_name?: string;
  
  // Account/Auth
  username?: string;
  login_username?: string;
  password?: string;
  role: string;
  role_access_level?: string;
  system_permissions?: string;
  has_login?: boolean;

  // Financial
  salary?: string;
  salary_type?: string;
  bank_account?: string;
  iban?: string;
  tax_id?: string;
  allowances?: string;

  // Emergency & Misc
  emergency_contact: string;
  emergency_contact_name?: string;
  emergency_contact_relationship?: string;
  emergency_contact_phone?: string;
  emergency_contact_address?: string;
  notes?: string;
  leave_balance?: number | string;
  performance_rating?: string;
  last_appraisal_date?: string;
  probation_end_date?: string;
  work_shift_start?: string;
  work_shift_end?: string;
  background_check_status?: string;
  skills_competencies?: string;
  languages_known?: string;

  // Files
  profile_image?: File | null;
  staff_photos?: File[] | null;
  resume_file?: File | null;
  joining_letter_file?: File | null;
  contract_file?: File | null;
  id_proof_file?: File | null;
  tax_form_file?: File | null;
  certificates_file?: File | null;
  cnic_front?: File | null;
  cnic_back?: File | null;
  appointment_letter?: File | null;
  additional_document?: File | null;
};

export async function createStaff(payload: CreateStaffPayload): Promise<StaffRecord> {
  // Local-only mode: persist to localStorage and return mapped record.
  const items = readLocalStaffStore();
  const item: LocalStaffRecord = {
    id: Date.now(),
    savedAt: new Date().toISOString(),
    payload: payload as unknown as Record<string, unknown>,
    draft: null,
  };
  writeLocalStaffStore([item, ...items]);
  return localToStaffRecord(item);
}

/** Update staff (PATCH). Supports partial payload and file fields via FormData. */
export async function updateStaff(
  id: number,
  payload: Partial<CreateStaffPayload>
): Promise<StaffRecord> {
  const items = readLocalStaffStore();
  const idx = items.findIndex((x) => x.id === id);
  if (idx < 0) throw new Error("Staff not found");
  const prev = items[idx];
  const next: LocalStaffRecord = {
    ...prev,
    payload: { ...(prev.payload ?? {}), ...(payload as unknown as Record<string, unknown>) },
  };
  const updated = [...items];
  updated[idx] = next;
  writeLocalStaffStore(updated);
  return localToStaffRecord(next);
}

/** Delete staff (hard delete). */
export async function deleteStaff(id: number): Promise<void> {
  const items = readLocalStaffStore();
  const next = items.filter((x) => x.id !== id);
  if (next.length === items.length) throw new Error("Staff not found");
  writeLocalStaffStore(next);
}
