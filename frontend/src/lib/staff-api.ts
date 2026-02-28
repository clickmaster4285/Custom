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

const STAFF_STORAGE_KEY = "hr_staff_local";

const INITIAL_STAFF: StaffRecord[] = [
  {
    id: 1,
    user: "admin",
    user_id: 1,
    role: "ADMIN",
    email: "admin@tekeye.local",
    phone: "0300-0000001",
    full_name: "System Admin",
    cnic: "35202-1234567-1",
    address: "Islamabad",
    date_of_birth: "1990-01-01",
    joining_date: "2023-01-01",
    department: "Administration",
    designation: "Administrator",
    profile_image: null,
    emergency_contact: "0300-0000010",
    created_at: new Date().toISOString(),
  },
  {
    id: 2,
    user: "hr",
    user_id: 2,
    role: "HR",
    email: "hr@tekeye.local",
    phone: "0300-0000002",
    full_name: "HR Manager",
    cnic: "35202-7654321-1",
    address: "Lahore",
    date_of_birth: "1992-06-15",
    joining_date: "2023-03-10",
    department: "Human Resources",
    designation: "Manager HR",
    profile_image: null,
    emergency_contact: "0300-0000020",
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
  const rows = ensureSeedData();
  const nextId = rows.length === 0 ? 1 : Math.max(...rows.map((r) => r.id)) + 1;
  const profileImage =
    payload.profile_image instanceof File ? await fileToDataUrl(payload.profile_image) : null;

  const newRow: StaffRecord = {
    id: nextId,
    user: payload.username,
    user_id: nextId,
    role: payload.role,
    email: payload.email,
    phone: payload.phone,
    full_name: payload.full_name,
    cnic: payload.cnic,
    address: payload.address,
    date_of_birth: payload.date_of_birth,
    joining_date: payload.joining_date,
    department: payload.department,
    designation: payload.designation,
    profile_image: profileImage,
    emergency_contact: payload.emergency_contact,
    created_at: new Date().toISOString(),
  };

  writeStaff([newRow, ...rows]);
  return newRow;
}
