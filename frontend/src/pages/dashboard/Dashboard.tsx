import { Link } from "react-router-dom"
import {
  Calendar,
  Users,
  ClipboardCheck,
  AlertCircle,
  Package,
  BarChart3,
  UsersRound,
  CalendarDays,
  Eye,
  Pencil,
  Trash2,
  Copy,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ROUTES } from "@/routes/config"
import { getStoredUser } from "@/lib/auth"

export function Dashboard() {
  const welcomeName = getStoredUser()?.username?.trim() || "User"
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
    <div className="flex min-h-full w-full min-w-0 max-w-full flex-col">
      <div className="flex min-w-0 flex-1 flex-col gap-8 sm:gap-11">
        <div className="flex min-w-0 flex-col gap-7 self-stretch sm:gap-9">
          {/* Welcome */}
          <div className="flex min-w-0 flex-col gap-2">
            <h1 className="break-words text-2xl font-bold tracking-tight text-[#101727] sm:text-3xl">
              Welcome Back {welcomeName}!
            </h1>
            <p className="text-sm text-[#697282] sm:text-base">
              Manage your data, appointments, warehouse and resources efficiently.
            </p>
          </div>

          {/* Stat cards */}
          <div className="grid min-w-0 grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="rounded-[10px] border-gray-200 pt-[22px] pb-[23px] px-6 gap-2">
              <CardContent className="p-0">
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <p className="text-[#4A5565] text-base">Total Visitors Today</p>
                    <p className="text-[#101727] text-[32px] font-bold">12</p>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center">
                    <Users className="w-6 h-6 text-[#155DFC]" />
                  </div>
                </div>
                <p className="text-[#00A63E] text-xs mt-2">+12% from yesterday</p>
              </CardContent>
            </Card>
            <Card className="rounded-[10px] border-gray-200 pt-[22px] pb-[23px] px-6 gap-2">
              <CardContent className="p-0">
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <p className="text-[#4A5565] text-base">Active Check-ins</p>
                    <p className="text-[#101727] text-[32px] font-bold">12</p>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-green-50 flex items-center justify-center">
                    <ClipboardCheck className="w-6 h-6 text-[#00A63E]" />
                  </div>
                </div>
                <p className="text-[#4A5565] text-xs mt-2">Currently on premises</p>
              </CardContent>
            </Card>
            <Card className="rounded-[10px] border-gray-200 pt-[22px] pb-[23px] px-6 gap-2">
              <CardContent className="p-0">
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <p className="text-[#4A5565] text-base">Pending Approvals</p>
                    <p className="text-[#101727] text-[32px] font-bold">12</p>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-orange-50 flex items-center justify-center">
                    <AlertCircle className="w-6 h-6 text-[#F54900]" />
                  </div>
                </div>
                <p className="text-[#F54900] text-xs mt-2">Requires Attention</p>
              </CardContent>
            </Card>
            <Card className="rounded-[10px] border-gray-200 pt-[22px] pb-[23px] px-6 gap-2">
              <CardContent className="p-0">
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <p className="text-[#4A5565] text-base">Warehouse Activities</p>
                    <p className="text-[#101727] text-[32px] font-bold">43</p>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-violet-50 flex items-center justify-center">
                    <Package className="w-6 h-6 text-[#9810FA]" />
                  </div>
                </div>
                <p className="text-[#9810FA] text-xs mt-2">Active operations</p>
              </CardContent>
            </Card>
          </div>

          {/* Calendar View banner */}
          <div
            className="flex flex-col gap-4 rounded-[10px] p-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-4 sm:p-6"
            style={{ background: "linear-gradient(180deg, #155DFC, #1447E6)" }}
          >
            <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-white/20 sm:h-16 sm:w-16">
                <Calendar className="h-7 w-7 text-white sm:h-8 sm:w-8" />
              </div>
              <div className="min-w-0">
                <h2 className="text-lg font-bold text-white sm:text-xl">Calendar View</h2>
                <p className="text-sm text-blue-100">
                  View and manage all appointments, bookings, and scheduled visits.
                </p>
              </div>
            </div>
            <Link to={ROUTES.CALENDAR_VIEW} className="w-full shrink-0 sm:w-auto">
              <Button className="w-full gap-2 rounded-[10px] bg-white px-6 py-[11px] text-[#155DFC] hover:bg-white/90 sm:w-auto">
                <CalendarDays className="h-5 w-5" />
                <span className="text-base font-medium">View Calendar</span>
              </Button>
            </Link>
          </div>

          {/* At a Glance */}
          <div className="flex min-w-0 flex-col gap-6 sm:gap-8">
            <h2 className="text-xl font-bold text-[#101727] sm:text-2xl">At a Glance</h2>
            <div className="grid min-w-0 grid-cols-1 gap-6 sm:gap-8 lg:grid-cols-2 lg:gap-10">
              {/* Visitor Management */}
              <Card className="min-w-0 overflow-hidden rounded-[10px] border-gray-200">
                <CardContent className="p-0">
                  <div className="flex h-12 items-center bg-blue-50 px-4 sm:px-6">
                    <Users className="h-6 w-6 text-[#155DFC]" />
                  </div>
                  <div className="flex flex-col gap-3.5 px-4 py-5 sm:px-6 sm:py-6">
                    <h3 className="text-lg font-bold text-[#101828] sm:text-[22px]">Visitor Management</h3>
                    <p className="text-sm text-[#6A7282] sm:text-lg">
                      Manage visitor registrations, check-ins, check-outs, and access control.
                    </p>
                    <div className="flex flex-wrap gap-4">
                      <div className="flex flex-col bg-blue-50 p-3 gap-1 rounded-[10px] min-w-[140px]">
                        <span className="text-[#155DFC] text-sm">Today&apos;s Visits</span>
                        <span className="text-[#1C398E] text-xl font-bold">142</span>
                      </div>
                      <div className="flex flex-col bg-green-50 p-3 gap-1 rounded-[10px] min-w-[140px]">
                        <span className="text-[#00A63E] text-sm">Checked In</span>
                        <span className="text-[#0D542B] text-xl font-bold">38</span>
                      </div>
                    </div>
                    <Link to={ROUTES.PRE_REGISTRATION}>
                      <Button className="w-full bg-[#155DFC] hover:bg-[#155DFC]/90 text-white rounded-lg py-2.5">
                        <span className="text-sm font-medium">View Details</span>
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              {/* Warehouse Management */}
              <Card className="min-w-0 overflow-hidden rounded-[10px] border-gray-200">
                <CardContent className="p-0">
                  <div className="flex h-12 items-center bg-violet-50 px-4 sm:px-6">
                    <Package className="h-6 w-6 text-[#9810FA]" />
                  </div>
                  <div className="flex flex-col gap-3.5 px-4 py-5 sm:px-6 sm:py-6">
                    <h3 className="text-lg font-bold text-[#101828] sm:text-[22px]">Warehouse Management</h3>
                    <p className="text-sm text-[#6A7282] sm:text-lg">
                      Track inventory, collections, kept items and warehouse operations in real-time.
                    </p>
                    <div className="flex flex-wrap gap-4">
                      <div className="flex flex-col bg-blue-50 p-3 gap-1 rounded-[10px] min-w-[140px]">
                        <span className="text-[#155DFC] text-sm">Active Operations</span>
                        <span className="text-[#1C398E] text-xl font-bold">142</span>
                      </div>
                      <div className="flex flex-col bg-orange-50 p-3 gap-1 rounded-[10px] min-w-[140px]">
                        <span className="text-[#F54900] text-sm">Pending Items</span>
                        <span className="text-[#7E2A0C] text-xl font-bold">38</span>
                      </div>
                    </div>
                    <Link to={ROUTES.OPERATIONS_DASHBOARD}>
                      <Button className="w-full bg-[#9810FA] hover:bg-[#9810FA]/90 text-white rounded-lg py-2.5">
                        <span className="text-sm font-medium">View Details</span>
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              {/* AI Analytics */}
              <Card className="min-w-0 overflow-hidden rounded-[10px] border-gray-200">
                <CardContent className="p-0">
                  <div className="flex h-12 items-center bg-cyan-50 px-4 sm:px-6">
                    <BarChart3 className="h-6 w-6 text-[#0092B8]" />
                  </div>
                  <div className="flex flex-col gap-3.5 px-4 py-5 sm:px-6 sm:py-6">
                    <h3 className="text-lg font-bold text-[#101828] sm:text-[22px]">AI Analytics</h3>
                    <p className="text-sm text-[#6A7282] sm:text-lg">
                      Advanced insights and predictive analytics for visits and operations.
                    </p>
                    <div className="flex flex-wrap gap-4">
                      <div className="flex flex-col bg-[#FDF8F0] p-3 gap-1 rounded-[10px] min-w-[140px]">
                        <span className="text-[#FC7115] text-sm">Peak Hours</span>
                        <span className="text-[#8E4B1C] text-xl font-bold">10AM - 2PM</span>
                      </div>
                      <div className="flex flex-col bg-green-50 p-3 gap-1 rounded-[10px] min-w-[140px]">
                        <span className="text-[#00A63E] text-sm">Efficiency</span>
                        <span className="text-[#0D542B] text-xl font-bold">93%</span>
                      </div>
                    </div>
                    <Link to={ROUTES.ANALYTICS_DASHBOARD}>
                      <Button className="w-full bg-[#0092B8] hover:bg-[#0092B8]/90 text-white rounded-lg py-2.5">
                        <span className="text-sm font-medium">View Details</span>
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              {/* Human Resources */}
              <Card className="min-w-0 overflow-hidden rounded-[10px] border-gray-200">
                <CardContent className="p-0">
                  <div className="flex h-12 items-center bg-emerald-50 px-4 sm:px-6">
                    <UsersRound className="h-6 w-6 text-[#009966]" />
                  </div>
                  <div className="flex flex-col gap-3.5 px-4 py-5 sm:px-6 sm:py-6">
                    <h3 className="text-lg font-bold text-[#101828] sm:text-[22px]">Human Resources</h3>
                    <p className="text-sm text-[#6A7282] sm:text-lg">
                      Employee management, attendance and performance tracking, and HR process
                      automation.
                    </p>
                    <div className="flex flex-wrap gap-4">
                      <div className="flex flex-col bg-[#F1FFEF] p-3 gap-1 rounded-[10px] min-w-[140px]">
                        <span className="text-[#019639] text-sm">Employees</span>
                        <span className="text-[#1C620C] text-xl font-bold">142</span>
                      </div>
                      <div className="flex flex-col bg-green-50 p-3 gap-1 rounded-[10px] min-w-[140px]">
                        <span className="text-[#00A63E] text-sm">Present Today</span>
                        <span className="text-[#0D542B] text-xl font-bold">131</span>
                      </div>
                    </div>
                    <Link to={ROUTES.EMPLOYEES}>
                      <Button className="w-full bg-[#009966] hover:bg-[#009966]/90 text-white rounded-lg py-2.5">
                        <span className="text-sm font-medium">View Details</span>
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Recent Registrations */}
          <Card className="min-w-0 max-w-full overflow-hidden rounded-[10px] border border-gray-200">
            <div className="pb-1 pl-4 pt-4 sm:pl-6">
              <h2 className="text-lg font-bold text-[#101727] sm:text-xl">Recent Registrations</h2>
            </div>
            <div className="max-w-full overflow-x-auto overscroll-x-contain [-webkit-overflow-scrolling:touch]">
              <table className="w-full min-w-[640px] sm:min-w-[800px]">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-7 text-[#697282] text-sm font-bold">Reg ID</th>
                    <th className="text-left py-3 px-6 text-[#697282] text-sm font-bold">
                      Visitor Name
                    </th>
                    <th className="text-left py-3 px-6 text-[#697282] text-sm font-bold">Host Name</th>
                    <th className="text-left py-3 px-6 text-[#697282] text-sm font-bold">
                      Date & Time
                    </th>
                    <th className="text-left py-3 px-5 text-[#697282] text-sm font-bold">
                      Priority Level
                    </th>
                    <th className="text-left py-3 px-6 text-[#697282] text-sm font-bold">Status</th>
                    <th className="text-left py-3 px-5 text-[#697282] text-sm font-bold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {recentRegistrations.map((row) => (
                    <tr key={row.regId} className="border-b border-gray-100 hover:bg-gray-50/50">
                      <td className="py-5 px-7 text-[#495565] text-xs">{row.regId}</td>
                      <td className="py-5 px-6 text-[#495565] text-xs">{row.visitorName}</td>
                      <td className="py-5 px-6 text-[#495565] text-xs">{row.hostName}</td>
                      <td className="py-5 px-6 text-[#495565] text-xs">{row.dateTime}</td>
                      <td className="py-5 px-6">
                        <span
                          className={`inline-block py-1 px-3 rounded-[21px] text-sm font-medium ${row.priorityClass}`}
                        >
                          {row.priority}
                        </span>
                      </td>
                      <td className="py-5 px-6">
                        <span
                          className={`inline-block py-1 px-3 rounded-[21px] text-sm font-medium ${row.statusClass}`}
                        >
                          {row.status}
                        </span>
                      </td>
                      <td className="py-5 px-5">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            className="p-1.5 rounded hover:bg-gray-100 text-[#4A5565]"
                            aria-label="View"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                          <button
                            type="button"
                            className="p-1.5 rounded hover:bg-gray-100 text-[#4A5565]"
                            aria-label="Edit"
                          >
                            <Pencil className="w-5 h-5" />
                          </button>
                          <button
                            type="button"
                            className="p-1.5 rounded hover:bg-gray-100 text-[#4A5565]"
                            aria-label="Copy"
                          >
                            <Copy className="w-5 h-5" />
                          </button>
                          <button
                            type="button"
                            className="p-1.5 rounded hover:bg-gray-100 text-[#4A5565]"
                            aria-label="Delete"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
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
    </div>
  )
}
