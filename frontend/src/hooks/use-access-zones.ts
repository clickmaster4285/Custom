import { useQuery } from "@tanstack/react-query"
import {
  setAccessZoneLabelCache,
  zonesToAccessZoneOptions,
  type AccessZoneOption,
} from "@/lib/access-zone"
import { getUserLocationFilter } from "@/lib/location-access"
import { fetchZones, type SiteZoneRecord } from "@/lib/warehouse-zones-api"
import type { Zone } from "@/lib/gate-types"

function mapSiteZoneToZone(zone: SiteZoneRecord): Zone {
  return {
    zone_id: zone.id,
    zone_name: zone.name,
    zone_code: zone.code,
    zone_type: zone.vms_zone_type || "Public",
    floor: "",
    building: "",
    allowed_categories: zone.allowed_visitor_categories ?? [],
    max_occupancy: zone.max_occupancy ?? 0,
    requires_escort: zone.requires_escort ?? false,
    access_hours_start: zone.access_hours_start || "06:00",
    access_hours_end: zone.access_hours_end || "22:00",
    weekend_access: zone.weekend_access ?? false,
    camera_ids: zone.camera_ids ?? [],
    gate_ids: zone.gate_ids ?? [],
    zone_active: zone.is_active,
  }
}

export function useAccessZones() {
  return useQuery({
    queryKey: ["vms", "zones", getUserLocationFilter()],
    queryFn: async (): Promise<{ zones: Zone[]; options: AccessZoneOption[] }> => {
      const location = getUserLocationFilter() || undefined
      const siteZones = await fetchZones(location ? { location } : undefined)
      const zones = siteZones.map(mapSiteZoneToZone)
      const options = zonesToAccessZoneOptions(zones)
      setAccessZoneLabelCache(options)
      return { zones, options }
    },
    staleTime: 60_000,
  })
}
