import { API_BASE_URL } from "@/lib/api";
import type { AuthUser } from "@/lib/auth";

export type LoginResponse = {
  token: string;
  user: AuthUser;
};

export async function login(username: string, password: string): Promise<LoginResponse> {
  const response = await fetch(`${API_BASE_URL}/api/auth/login/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  if (!response.ok) {
    let message = "Invalid username or password.";
    try {
      const data = await response.json();
      if (data.username) message = data.username.join(" ");
      else if (data.password) message = data.password.join(" ");
      else if (data.non_field_errors) message = data.non_field_errors.join(" ");
    } catch {
      // ignore
    }
    throw new Error(message);
  }

  return response.json();
}
