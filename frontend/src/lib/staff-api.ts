export type StaffRecord = {
  id: number;
  user: string;
  user_id?: number;  // User id (for attendance marking)
  role: string;
  email: string;
  phone: string;
  full_name: string;
  father_name?: string;
  gender?: string;
  cnic: string;
  address: string;
  date_of_birth: string;
  joining_date: string;
  department: string;
  designation: string;
  employment_type?: string;
  personal_number?: string;
  bps?: string;
  qualification?: string;
  current_posting?: string;
  collector_name?: string;
  profile_image: string | null;
  staff_photos?: string[];
  emergency_contact: string;
  has_login?: boolean;
  login_username?: string;
  cnic_front_image?: string | null;
  cnic_back_image?: string | null;
  appointment_letter?: string | null;
  additional_document?: string | null;
  created_at: string;
};

const STAFF_STORAGE_KEY = "hr_staff_local";

const INITIAL_STAFF: StaffRecord[] = [
  {
    id: 1,
    user: "0001",
    user_id: 1,
    role: "ADMIN",
    email: "admin@tekeye.local",
    phone: "0300-0000001",
    full_name: "System Admin",
    father_name: "",
    cnic: "35202-1234567-1",
    address: "Islamabad",
    date_of_birth: "1990-01-01",
    joining_date: "2023-01-01",
    department: "Administration",
    designation: "Administrator",
    employment_type: "full-time",
    personal_number: "0001",
    bps: "20",
    qualification: "masters",
    current_posting: "Islamabad",
    collector_name: "",
    profile_image: null,
    emergency_contact: "0300-0000010",
    has_login: true,
    login_username: "admin",
    created_at: new Date().toISOString(),
  },
  {
    id: 2,
    user: "0002",
    user_id: 2,
    role: "HR",
    email: "hr@tekeye.local",
    phone: "0300-0000002",
    full_name: "HR Manager",
    father_name: "",
    cnic: "35202-7654321-1",
    address: "Lahore",
    date_of_birth: "1992-06-15",
    joining_date: "2023-03-10",
    department: "Human Resources",
    designation: "Manager HR",
    employment_type: "full-time",
    personal_number: "0002",
    bps: "18",
    qualification: "bachelors",
    current_posting: "Lahore",
    collector_name: "",
    profile_image: null,
    emergency_contact: "0300-0000020",
    has_login: true,
    login_username: "hr",
    created_at: new Date().toISOString(),
  },
];

function readStaff(): StaffRecord[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(STAFF_STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as StaffRecord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeStaff(rows: StaffRecord[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STAFF_STORAGE_KEY, JSON.stringify(rows));
}

function ensureSeedData(): StaffRecord[] {
  const rows = readStaff();
  if (rows.length > 0) return rows;
  writeStaff(INITIAL_STAFF);
  return INITIAL_STAFF;
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(new Error("Failed to read image file."));
    reader.readAsDataURL(file);
  });
}

export async function fetchStaff(): Promise<StaffRecord[]> {
  return ensureSeedData();
}

export type CreateStaffPayload = {
  personal_number?: string;
  has_login?: boolean;
  login_username?: string;
  password?: string;
  email: string;
  role: string;
  phone: string;
  full_name: string;
  father_name?: string;
  gender?: string;
  cnic: string;
  address: string;
  date_of_birth: string;
  joining_date: string;
  department: string;
  designation: string;
  employment_type?: string;
  emergency_contact: string;
  bps?: string;
  qualification?: string;
  current_posting?: string;
  collector_name?: string;
  profile_image?: File | null;
  staff_photos?: File[] | null;
  cnic_front?: File | null;
  cnic_back?: File | null;
  appointment_letter?: File | null;
  additional_document?: File | null;
};

export async function createStaff(payload: CreateStaffPayload): Promise<StaffRecord> {
  const rows = ensureSeedData();
  const nextId = rows.length === 0 ? 1 : Math.max(...rows.map((r) => r.id)) + 1;
  const staffPhotosFiles = (payload.staff_photos ?? []).filter((f): f is File => f instanceof File).slice(0, 5);
  const staffPhotos =
    staffPhotosFiles.length > 0 ? await Promise.all(staffPhotosFiles.map(fileToDataUrl)) : [];
  const profileImage =
    payload.profile_image instanceof File
      ? await fileToDataUrl(payload.profile_image)
      : staffPhotos.length > 0
        ? staffPhotos[0]
        : null;
  const cnicFront =
    payload.cnic_front instanceof File ? await fileToDataUrl(payload.cnic_front) : null;
  const cnicBack =
    payload.cnic_back instanceof File ? await fileToDataUrl(payload.cnic_back) : null;
  const appointmentLetter =
    payload.appointment_letter instanceof File ? await fileToDataUrl(payload.appointment_letter) : null;
  const additionalDocument =
    payload.additional_document instanceof File ? await fileToDataUrl(payload.additional_document) : null;

  const newRow: StaffRecord = {
    id: nextId,
    user: String(payload.personal_number || payload.login_username || nextId),
    user_id: nextId,
    role: payload.role,
    email: payload.email,
    phone: payload.phone,
    full_name: payload.full_name,
    father_name: payload.father_name,
    gender: payload.gender,
    cnic: payload.cnic,
    address: payload.address,
    date_of_birth: payload.date_of_birth,
    joining_date: payload.joining_date,
    department: payload.department,
    designation: payload.designation,
    employment_type: payload.employment_type,
    personal_number: payload.personal_number,
    bps: payload.bps,
    qualification: payload.qualification,
    current_posting: payload.current_posting,
    collector_name: payload.collector_name,
    profile_image: profileImage,
    staff_photos: staffPhotos,
    emergency_contact: payload.emergency_contact,
    has_login: Boolean(payload.has_login),
    login_username: payload.has_login ? (payload.login_username || "") : "",
    cnic_front_image: cnicFront,
    cnic_back_image: cnicBack,
    appointment_letter: appointmentLetter,
    additional_document: additionalDocument,
    created_at: new Date().toISOString(),
  };

  writeStaff([newRow, ...rows]);
  return newRow;
}
