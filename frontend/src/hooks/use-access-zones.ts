import { useQuery } from "@tanstack/react-query"
import {
  setAccessZoneLabelCache,
  zonesToAccessZoneOptions,
  type AccessZoneOption,
} from "@/lib/access-zone"
import { ensureDefaultZones, loadZones } from "@/lib/gate-storage"
import type { Zone } from "@/lib/gate-types"

export function useAccessZones() {
  return useQuery({
    queryKey: ["vms", "zones"],
    queryFn: async (): Promise<{ zones: Zone[]; options: AccessZoneOption[] }> => {
      await ensureDefaultZones()
      const zones = await loadZones()
      const options = zonesToAccessZoneOptions(zones)
      setAccessZoneLabelCache(options)
      return { zones, options }
    },
    staleTime: 60_000,
  })
}
