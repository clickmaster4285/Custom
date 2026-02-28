/**
 * VMS localStorage – Vehicle Registration & Vehicle Tracking.
 */

import type { VehicleEntry, VehicleTrackingRecord } from "./vms-types"
import { VMS_STORAGE_KEYS } from "./vms-types"
import { getGates } from "./gate-storage"

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

export function getVehicleEntries(): VehicleEntry[] {
  if (typeof window === "undefined") return []
  return safeParse<VehicleEntry[]>(
    window.localStorage.getItem(VMS_STORAGE_KEYS.VEHICLE_ENTRIES),
    []
  )
}

export function setVehicleEntries(entries: VehicleEntry[]): void {
  safeSave(VMS_STORAGE_KEYS.VEHICLE_ENTRIES, entries)
}

export function getVehicleTracking(): VehicleTrackingRecord[] {
  if (typeof window === "undefined") return []
  return safeParse<VehicleTrackingRecord[]>(
    window.localStorage.getItem(VMS_STORAGE_KEYS.VEHICLE_TRACKING),
    []
  )
}

export function setVehicleTracking(records: VehicleTrackingRecord[]): void {
  safeSave(VMS_STORAGE_KEYS.VEHICLE_TRACKING, records)
}

/** Gate IDs for entry/exit gate dropdowns (from Gate Integration) */
export function getGateIdsForVehicle(): string[] {
  const gates = getGates()
  return gates.filter((g) => g.gate_active).map((g) => g.gate_id)
}

export function getGateName(gateId: string): string {
  const gates = getGates()
  return gates.find((g) => g.gate_id === gateId)?.gate_name ?? gateId
}
