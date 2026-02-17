const DEFAULT_API_BASE_URL = "http://127.0.0.1:8000";

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL;

const VISITOR_ENDPOINT = `${API_BASE_URL}/api/visitors/`;

export type VisitorRecord = {
  id: number;
  full_name: string;
  visitor_type: string;
  department_to_visit: string;
  cnic_number: string;
  passport_number: string;
  created_at: string;
};

export async function fetchVisitors(): Promise<VisitorRecord[]> {
  const response = await fetch(VISITOR_ENDPOINT, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Failed to load visitors (${response.status})`);
  }
  return response.json();
}

export async function createVisitor(payload: Record<string, unknown>) {
  const response = await fetch(VISITOR_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    let errorMessage = `Failed to save visitor (${response.status})`;
    try {
      const data = await response.json();
      errorMessage = JSON.stringify(data);
    } catch {
      // ignore parsing errors
    }
    throw new Error(errorMessage);
  }
  return response.json();
}
