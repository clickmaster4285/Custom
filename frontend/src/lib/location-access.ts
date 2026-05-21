import { getStoredUser } from "@/lib/auth";

/** Roles that can view registrations from all locations. */
const UNRESTRICTED_ROLES = new Set(["ADMIN", "HR", "OPERATION_MANAGER"]);

export function canSeeAllLocations(role: string | undefined): boolean {
  if (!role) return false;
  return UNRESTRICTED_ROLES.has(role);
}

/** Returns the user's location code when listings should be scoped; null = no filter. */
export function getUserLocationFilter(): string | null {
  const user = getStoredUser();
  if (!user?.location) return null;
  if (canSeeAllLocations(user.role)) return null;
  return user.location;
}

export function filterByUserLocation<T extends { location?: string }>(items: T[]): T[] {
  const loc = getUserLocationFilter();
  if (!loc) return items;
  return items.filter((item) => item.location === loc);
}
