import { Eye, MoreVertical } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

type CityRow = {
  city: string
  status: "Online" | "Critical" | "Attention"
  visitors: number
  vehicles: number
  cases: number
  alerts: number
}

const CITIES_DATA: CityRow[] = [
  { city: "Peshawar (Head Office)", status: "Online", visitors: 214, vehicles: 1342, cases: 78, alerts: 3 },
  { city: "Kohat", status: "Online", visitors: 182, vehicles: 1110, cases: 64, alerts: 1 },
  { city: "Nowshera", status: "Online", visitors: 305, vehicles: 1980, cases: 143, alerts: 9 },
  { city: "Mardan", status: "Online", visitors: 156, vehicles: 892, cases: 45, alerts: 2 },
  { city: "DI Khan", status: "Online", visitors: 89, vehicles: 567, cases: 34, alerts: 0 },
]

const getStatusColor = (status: string) => {
  switch (status) {
    case "Online":
      return "text-green-400"
    case "Critical":
      return "text-red-400"
    case "Attention":
      return "text-yellow-400"
    default:
      return "text-gray-400"
  }
}

const getStatusBgColor = (status: string) => {
  switch (status) {
    case "Online":
      return "bg-green-400"
    case "Critical":
      return "bg-red-400"
    case "Attention":
      return "bg-yellow-400"
    default:
      return "bg-gray-400"
  }
}

const getAlertBgColor = (alerts: number) => {
  if (alerts >= 5) return "bg-red-500"
  if (alerts >= 3) return "bg-orange-500"
  return "bg-yellow-500"
}

export function CityControlGrid() {
  return (
    <Card className="min-w-0 overflow-hidden rounded-[10px] border-gray-200 bg-white">
      <CardContent className="p-0">
        <div className="px-4 py-5 sm:px-6 sm:py-6">
          <h2 className="text-xl font-bold text-black sm:text-2xl">City Control Grid</h2>
          <p className="mt-1 text-sm text-gray-600">Real-time status of all connected cities</p>
        </div>
        <div className="border-t border-gray-200">
          <div className="overflow-x-auto min-h-[360px]">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-4 py-3 text-left font-semibold text-black sm:px-6">CITY</th>
                  <th className="px-4 py-3 text-left font-semibold text-black sm:px-6">STATUS</th>
                  <th className="px-4 py-3 text-right font-semibold text-black sm:px-6">VISITORS</th>
                  <th className="px-4 py-3 text-right font-semibold text-black sm:px-6">VEHICLES</th>
                  <th className="px-4 py-3 text-right font-semibold text-black sm:px-6">GOODS CASES</th>
                  <th className="px-4 py-3 text-center font-semibold text-black sm:px-6">ALERTS</th>
                  <th className="px-4 py-3 text-center font-semibold text-black sm:px-6">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {CITIES_DATA.map((row) => (
                  <tr key={row.city} className="hover:bg-gray-50 transition-colors border-0">
                    <td className="px-4 py-3 font-medium text-black sm:px-6">{row.city}</td>
                    <td className="px-4 py-3 sm:px-6">
                      <span className={`inline-flex items-center gap-2 ${getStatusColor(row.status)}`}>
                        <span className={`h-2 w-2 rounded-full ${getStatusBgColor(row.status)}`}></span>
                        {row.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-black sm:px-6">
                      {row.visitors.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right text-black sm:px-6">
                      {row.vehicles.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right text-black sm:px-6">
                      {row.cases.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-center sm:px-6">
                      <span
                        className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-white ${getAlertBgColor(row.alerts)}`}
                      >
                        {row.alerts}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center sm:px-6">
                      <div className="flex items-center justify-center gap-2">
                        <button className="text-blue-500 hover:text-blue-600 transition-colors">
                          <Eye className="h-5 w-5" />
                        </button>
                        <button className="text-gray-400 hover:text-gray-600 transition-colors">
                          <MoreVertical className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
