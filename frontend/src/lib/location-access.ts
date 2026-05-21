import { getStoredUser } from "@/lib/auth";
import { normalizeRole } from "@/lib/role-access";

/** Roles that can view registrations from all locations. */
const UNRESTRICTED_ROLES = new Set([
  "ADMIN",
  "HR",
  "OPERATION_MANAGER",
  "INSPECTOR",
  "COLLECTOR",
  "DEPUTY_COLLECTOR",
  "ASSISTANT_COLLECTOR",
]);

export function canSeeAllLocations(role: string | undefined | null): boolean {
  const normalized = normalizeRole(role);
  if (!normalized) return false;
  return UNRESTRICTED_ROLES.has(normalized);
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
  const normalizedLoc = loc.trim().toUpperCase();
  return items.filter((item) => {
    const itemLoc = (item.location ?? "").trim().toUpperCase();
    // Records without a location are visible to location-scoped users too
    return !itemLoc || itemLoc === normalizedLoc;
  });
}
