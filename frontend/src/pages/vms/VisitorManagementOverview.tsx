import { Link } from "react-router-dom"
import {
  Calendar,
  ClipboardCheck,
  FileQuestion,
  UserCheck,
  Ban,
  Car,
  XCircle,
  Ticket,
  ChevronRight,
  FileEdit,
  UserPlus,
  Eye,
  Pencil,
  Copy,
  Trash2,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ROUTES } from "@/routes/config"

export function VisitorManagementOverview() {
  const registeredVisitors = [
    {
      regId: "1234",
      date: "13-02-2026",
      visitorName: "Ali Hassan",
      organization: "Private Company",
      vehicleId: "LZS-1234",
      status: "Cleared",
      statusClass: "bg-green-100 text-[#008235]",
    },
    {
      regId: "1235",
      date: "08-02-2026",
      visitorName: "Majid Hussain",
      organization: "Private Company",
      vehicleId: "-",
      status: "Blacklisted",
      statusClass: "bg-[#FFE2E2] text-[#C10007]",
    },
    {
      regId: "1236",
      date: "01-02-2026",
      visitorName: "Ch. Ehtesham",
      organization: "-",
      vehicleId: "ABS-1234",
      status: "Cleared",
      statusClass: "bg-green-100 text-[#008235]",
    },
  ]

  const recentRegistrations = [
    {
      regId: "1234",
      visitorName: "Ali Hassan",
      hostName: "Mir Hamza",
      dateTime: "13-02-2026 | 10:00AM-11:00AM",
      priority: "Normal",
      priorityClass: "bg-green-100 text-[#008235]",
      status: "Approved",
      statusClass: "bg-green-100 text-[#008235]",
    },
    {
      regId: "1235",
      visitorName: "Sana Khan",
      hostName: "Jahandad Khan",
      dateTime: "13-02-2026 | 10:00AM-11:00AM",
      priority: "Urgent",
      priorityClass: "bg-[#FFE2E2] text-[#C10007]",
      status: "Pending Docs",
      statusClass: "bg-[#FCEDD7] text-[#BB411E]",
    },
    {
      regId: "1236",
      visitorName: "Muhammad Zaid",
      hostName: "Mirza Baig",
      dateTime: "13-02-2026 | 10:00AM-11:00AM",
      priority: "High",
      priorityClass: "bg-[#DEEAFC] text-[#1D4CDD]",
      status: "Rejected",
      statusClass: "bg-[#FFE2E2] text-[#C10007]",
    },
  ]

  return (
    <div className="flex flex-col">
      <div className="flex flex-col self-stretch gap-9">
        <div className="flex flex-col gap-2">
          <h1 className="text-[#101727] text-3xl font-bold">Visitor Management Overview</h1>
          <p className="text-[#697282] text-base">
            Manage your data, appointments, warehouse, resources efficiently.
          </p>
        </div>

        {/* Stat cards row 1 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: "Expected Today", value: "42", icon: Calendar, color: "text-[#155DFC]", bg: "bg-blue-50" },
            { label: "Checked In", value: "18", icon: ClipboardCheck, color: "text-green-600", bg: "bg-green-50" },
            { label: "Pending Docs", value: "5", icon: FileQuestion, color: "text-amber-600", bg: "bg-amber-50" },
            { label: "Pending Approval", value: "156", icon: UserCheck, color: "text-violet-600", bg: "bg-violet-50" },
          ].map((stat) => (
            <Card key={stat.label} className="rounded-[10px] border-gray-200 py-6 px-6">
              <CardContent className="p-0 flex justify-between items-start">
                <div>
                  <p className="text-[#697282] text-base">{stat.label}</p>
                  <p className="text-[#101727] text-[32px] font-bold">{stat.value}</p>
                </div>
                <div className={`w-11 h-11 rounded-lg ${stat.bg} flex items-center justify-center ${stat.color}`}>
                  <stat.icon className="w-5 h-5" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Stat cards row 2 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: "Blacklisted Visitors", value: "54", icon: Ban, color: "text-red-600", bg: "bg-red-50" },
            { label: "Blacklisted Vehicles", value: "35", icon: Car, color: "text-orange-600", bg: "bg-orange-50" },
            { label: "Rejected Requests", value: "45", icon: XCircle, color: "text-rose-600", bg: "bg-rose-50" },
            { label: "Active Passes", value: "156", icon: Ticket, color: "text-[#155DFC]", bg: "bg-blue-50" },
          ].map((stat) => (
            <Card key={stat.label} className="rounded-[10px] border-gray-200 py-6 px-6">
              <CardContent className="p-0 flex justify-between items-start">
                <div>
                  <p className="text-[#697282] text-base">{stat.label}</p>
                  <p className="text-[#101727] text-[32px] font-bold">{stat.value}</p>
                </div>
                <div className={`w-11 h-11 rounded-lg ${stat.bg} flex items-center justify-center ${stat.color}`}>
                  <stat.icon className="w-5 h-5" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Registration Modules */}
        <div className="flex flex-col gap-7">
          <h2 className="text-[#101727] text-2xl font-bold">Registration Modules</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link to={ROUTES.PRE_REGISTRATION}>
              <Card className="rounded-[10px] border-2 border-[#77A2FF] h-full shadow-[2px_3px_14px_#155DFC40] hover:shadow-md transition-shadow">
                <CardContent className="py-7 px-6">
                  <FileEdit className="w-12 h-12 text-[#155DFC] mb-5" />
                  <h3 className="text-[#101727] text-[22px] font-medium mb-2">Pre-Registration</h3>
                  <p className="text-[#697282] text-lg mb-4">
                    Online visitor registration before arrival with visit purpose and department selection.
                  </p>
                  <span className="text-[#155CFB] text-lg inline-flex items-center gap-1">
                    New Request <ChevronRight className="w-4 h-4" />
                  </span>
                </CardContent>
              </Card>
            </Link>
            <Link to={ROUTES.WALK_IN_REGISTRATION}>
              <Card className="rounded-[10px] border-gray-200 h-full hover:border-[#77A2FF]/50 transition-colors">
                <CardContent className="py-7 px-6">
                  <UserPlus className="w-12 h-12 text-[#155DFC] mb-5" />
                  <h3 className="text-[#101727] text-[22px] font-medium mb-2">Walk-In Registration</h3>
                  <p className="text-[#697282] text-lg mb-4">
                    On-site registration by receptionist or self-service kiosk processing.
                  </p>
                  <span className="text-[#155CFB] text-lg">Start Check-In</span>
                </CardContent>
              </Card>
            </Link>
            <Link to={ROUTES.PRE_REGISTRATION}>
              <Card className="rounded-[10px] border-gray-200 h-full hover:border-[#77A2FF]/50 transition-colors">
                <CardContent className="py-7 px-6">
                  <ClipboardCheck className="w-12 h-12 text-[#155DFC] mb-5" />
                  <h3 className="text-[#101727] text-[22px] font-medium mb-2">Pending Approval</h3>
                  <p className="text-[#697282] text-lg mb-4">
                    View all on-site pending approvals for scheduled or walk-in visits.
                  </p>
                  <span className="text-[#155CFB] text-lg">Start Check-In</span>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>

        {/* Registered Visitors table */}
        <Card className="rounded-[10px] border-gray-200 overflow-hidden">
          <div className="pt-4 pl-6 pb-1">
            <h2 className="text-[#101727] text-xl font-bold">Registered Visitors</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-7 text-[#697282] text-sm font-bold">Reg ID</th>
                  <th className="text-left py-3 px-4 text-[#697282] text-sm font-bold">Date</th>
                  <th className="text-left py-3 px-4 text-[#697282] text-sm font-bold">Visitor Name</th>
                  <th className="text-left py-3 px-4 text-[#697282] text-sm font-bold">Organization</th>
                  <th className="text-left py-3 px-4 text-[#697282] text-sm font-bold">Vehicle ID</th>
                  <th className="text-left py-3 px-4 text-[#697282] text-sm font-bold">Status</th>
                  <th className="text-left py-3 px-4 text-[#697282] text-sm font-bold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {registeredVisitors.map((row) => (
                  <tr key={row.regId} className="border-b border-gray-100 hover:bg-gray-50/50">
                    <td className="py-5 px-7 text-[#495565] text-xs">{row.regId}</td>
                    <td className="py-5 px-4 text-[#495565] text-xs">{row.date}</td>
                    <td className="py-5 px-4 text-[#495565] text-xs">{row.visitorName}</td>
                    <td className="py-5 px-4 text-[#495565] text-xs">{row.organization}</td>
                    <td className="py-5 px-4 text-[#495565] text-xs">{row.vehicleId}</td>
                    <td className="py-5 px-4">
                      <span className={`inline-block py-1 px-3 rounded-[21px] text-sm font-medium ${row.statusClass}`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="py-5 px-4">
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-[#4A5565]">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-[#4A5565]">
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-[#4A5565]">
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-[#4A5565]">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Recent Registrations table */}
        <Card className="rounded-[10px] border-gray-200 overflow-hidden">
          <div className="pt-4 pl-6 pb-1">
            <h2 className="text-[#101727] text-xl font-bold">Recent Registrations</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-7 text-[#697282] text-sm font-bold">Reg ID</th>
                  <th className="text-left py-3 px-5 text-[#697282] text-sm font-bold">Visitor Name</th>
                  <th className="text-left py-3 px-5 text-[#697282] text-sm font-bold">Host Name</th>
                  <th className="text-left py-3 px-5 text-[#697282] text-sm font-bold">Date & Time</th>
                  <th className="text-left py-3 px-5 text-[#697282] text-sm font-bold">Priority Level</th>
                  <th className="text-left py-3 px-5 text-[#697282] text-sm font-bold">Status</th>
                  <th className="text-left py-3 px-5 text-[#697282] text-sm font-bold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentRegistrations.map((row) => (
                  <tr key={row.regId} className="border-b border-gray-100 hover:bg-gray-50/50">
                    <td className="py-5 px-7 text-[#495565] text-xs">{row.regId}</td>
                    <td className="py-5 px-5 text-[#495565] text-xs">{row.visitorName}</td>
                    <td className="py-5 px-5 text-[#495565] text-xs">{row.hostName}</td>
                    <td className="py-5 px-5 text-[#495565] text-xs">{row.dateTime}</td>
                    <td className="py-5 px-5">
                      <span className={`inline-block py-1 px-3 rounded-[21px] text-sm font-medium ${row.priorityClass}`}>
                        {row.priority}
                      </span>
                    </td>
                    <td className="py-5 px-5">
                      <span className={`inline-block py-1 px-3 rounded-[21px] text-sm font-medium ${row.statusClass}`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="py-5 px-5">
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-[#4A5565]">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-[#4A5565]">
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-[#4A5565]">
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-[#4A5565]">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  )
}
