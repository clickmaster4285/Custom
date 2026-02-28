import type { AuthUser } from "@/lib/auth";

export type LoginResponse = {
  token: string;
  user: AuthUser;
};

type DummyCredential = {
  username: string;
  password: string;
  user: AuthUser;
};

const DUMMY_CREDENTIALS: DummyCredential[] = [
  {
    username: "admin",
    password: "admin123",
    user: {
      id: 1,
      username: "admin",
      email: "admin@tekeye.local",
      role: "ADMIN",
      phone: "0300-0000001",
    },
  },
  {
    username: "hr",
    password: "hr123",
    user: {
      id: 2,
      username: "hr",
      email: "hr@tekeye.local",
      role: "HR",
      phone: "0300-0000002",
    },
  },
  {
    username: "reception",
    password: "reception123",
    user: {
      id: 3,
      username: "reception",
      email: "reception@tekeye.local",
      role: "RECEPTIONIST",
      phone: "0300-0000003",
    },
  },
];

export async function login(username: string, password: string): Promise<LoginResponse> {
  const normalizedUsername = username.trim().toLowerCase();
  const match = DUMMY_CREDENTIALS.find(
    (c) => c.username.toLowerCase() === normalizedUsername && c.password === password
  );

  if (!match) {
    throw new Error(
      "Invalid username or password. Use dummy credentials: admin/admin123 or hr/hr123."
    );
  }

  const token = `local-token-${match.user.id}-${Date.now()}`;
  return {
    token,
    user: match.user,
  };
}
