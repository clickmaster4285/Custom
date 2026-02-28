/**
 * Gate & Zone localStorage helpers for Gate Integration.
 */

import type { Gate, Zone } from "./gate-types"
import { GATE_STORAGE_KEYS } from "./gate-types"

function safeParse<T>(raw: string | null, fallback: T): T {
  if (raw == null) return fallback
  try {
    const parsed = JSON.parse(raw) as T
    return Array.isArray(parsed) ? parsed : fallback
  } catch {
    return fallback
  }
}

function safeSave(key: string, data: unknown): void {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(key, JSON.stringify(data))
  } catch {
    // quota
  }
}

export function getGates(): Gate[] {
  if (typeof window === "undefined") return []
  return safeParse<Gate[]>(window.localStorage.getItem(GATE_STORAGE_KEYS.GATES), [])
}

export function setGates(gates: Gate[]): void {
  safeSave(GATE_STORAGE_KEYS.GATES, gates)
}

export function getZones(): Zone[] {
  if (typeof window === "undefined") return []
  const raw = safeParse<Record<string, unknown>[]>(
    window.localStorage.getItem(GATE_STORAGE_KEYS.ZONES),
    []
  )
  return raw.map((z) => migrateZone(z as Partial<Zone>))
}

function migrateZone(z: Partial<Zone>): Zone {
  if (z.zone_code != null && typeof z.max_occupancy === "number")
    return z as Zone
  return {
    zone_id: z.zone_id ?? `zone-${Date.now()}`,
    zone_name: z.zone_name ?? "",
    zone_code: z.zone_code ?? ((z.zone_id ?? "").slice(0, 10).toUpperCase() || "Z"),
    zone_type: (z.zone_type as Zone["zone_type"]) ?? "Public",
    floor: z.floor ?? "",
    building: z.building ?? "",
    allowed_categories: Array.isArray(z.allowed_categories) ? z.allowed_categories : [],
    max_occupancy: typeof z.max_occupancy === "number" ? z.max_occupancy : 50,
    requires_escort: z.requires_escort ?? false,
    access_hours_start: z.access_hours_start ?? "06:00",
    access_hours_end: z.access_hours_end ?? "22:00",
    weekend_access: z.weekend_access ?? false,
    camera_ids: Array.isArray(z.camera_ids) ? z.camera_ids : [],
    gate_ids: Array.isArray(z.gate_ids) ? z.gate_ids : [],
    zone_active: z.zone_active ?? true,
  }
}

export function setZones(zones: Zone[]): void {
  safeSave(GATE_STORAGE_KEYS.ZONES, zones)
}

/** Ensure default zones exist so dropdown is usable (full schema) */
export function ensureDefaultZones(): void {
  const zones = getZones()
  if (zones.length > 0) return
  const defaults: Zone[] = [
    createDefaultZone("zone-main", "Main Entrance", "MAIN"),
    createDefaultZone("zone-warehouse", "Warehouse", "WH"),
    createDefaultZone("zone-admin", "Admin Block", "ADM"),
  ]
  setZones(defaults)
}

function createDefaultZone(zone_id: string, zone_name: string, zone_code: string): Zone {
  return {
    zone_id,
    zone_name,
    zone_code,
    zone_type: "Public",
    floor: "",
    building: "",
    allowed_categories: [],
    max_occupancy: 50,
    requires_escort: false,
    access_hours_start: "06:00",
    access_hours_end: "22:00",
    weekend_access: false,
    camera_ids: [],
    gate_ids: [],
    zone_active: true,
  }
}
