import { API_BASE_URL, getAuthHeaders, getStoredToken } from "@/lib/api";
import { locationLabel, LOCATION_OPTIONS } from "@/lib/locations";

export type ApiUser = {
  id: number;
  username: string;
  email: string;
  role: string;
  phone: string;
  location?: string;
  is_active: boolean;
};

export type CreateUserPayload = {
  username: string;
  email: string;
  password: string;
  role: string;
  phone?: string;
  location?: string;
};

export type UpdateUserPayload = {
  username?: string;
  email?: string;
  password?: string;
  role?: string;
  phone?: string;
  location?: string;
  is_active?: boolean;
};

export { LOCATION_OPTIONS, locationLabel };

const USERS_ENDPOINT = `${API_BASE_URL}/api/users/`;

async function parseApiError(res: Response): Promise<string> {
  try {
    const j: unknown = await res.json();
    if (typeof j === "string") return j;
    if (j && typeof j === "object") {
      const obj = j as Record<string, unknown>;
      if ("detail" in obj) return String(obj.detail);
      return Object.entries(obj)
        .map(([k, v]) => {
          if (Array.isArray(v)) return `${k}: ${v.join(", ")}`;
          return `${k}: ${String(v)}`;
        })
        .join("; ");
    }
    return res.statusText;
  } catch {
    return res.statusText;
  }
}

export function roleLabel(role: string): string {
  const found = ROLE_OPTIONS.find((r) => r.value === role);
  return found?.label ?? role.replace(/_/g, " ");
}

export const ROLE_OPTIONS = [
  { value: "ADMIN", label: "Admin" },
  { value: "OPERATION_MANAGER", label: "Operation Manager" },
  { value: "INSPECTOR", label: "Inspector" },
  { value: "COLLECTOR", label: "Collector" },
  { value: "DEPUTY_COLLECTOR", label: "Deputy Collector" },
  { value: "ASSISTANT_COLLECTOR", label: "Assistant Collector" },
  { value: "RECEPTIONIST", label: "Receptionist" },
  { value: "HR", label: "Human Resource" },
  { value: "WAREHOUSE_OFFICER", label: "Warehouse Officer" },
  { value: "DETECTION_OFFICER", label: "Detection Officer" },
  { value: "FIR_OFFICER", label: "FIR Officer" },
  { value: "INVESTIGATION_OFFICER", label: "Investigation Officer" },
  { value: "SEIZING_OFFICER", label: "Seizing Officer" },
] as const;

export async function fetchUsers(): Promise<ApiUser[]> {
  if (!getStoredToken()) return [];

  const res = await fetch(USERS_ENDPOINT, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error(await parseApiError(res));
  const data: unknown = await res.json();
  const rows = Array.isArray(data) ? data : (data as { results?: unknown[] }).results;
  if (!Array.isArray(rows)) return [];
  return rows as ApiUser[];
}

export async function createUser(payload: CreateUserPayload): Promise<ApiUser> {
  const res = await fetch(USERS_ENDPOINT, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({
      username: payload.username.trim(),
      email: payload.email.trim(),
      password: payload.password,
      role: payload.role,
      phone: (payload.phone || "0000000000").trim(),
      location: payload.location || "",
    }),
  });
  if (!res.ok) throw new Error(await parseApiError(res));
  return (await res.json()) as ApiUser;
}

export async function updateUser(id: number, payload: UpdateUserPayload): Promise<ApiUser> {
  const body: Record<string, unknown> = {};
  if (payload.username !== undefined) body.username = payload.username.trim();
  if (payload.email !== undefined) body.email = payload.email.trim();
  if (payload.role !== undefined) body.role = payload.role;
  if (payload.phone !== undefined) body.phone = payload.phone.trim() || "0000000000";
  if (payload.location !== undefined) body.location = payload.location;
  if (payload.is_active !== undefined) body.is_active = payload.is_active;
  if (payload.password && payload.password.length >= 6) {
    body.password = payload.password;
  }

  const res = await fetch(`${USERS_ENDPOINT}${id}/`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await parseApiError(res));
  return (await res.json()) as ApiUser;
}
