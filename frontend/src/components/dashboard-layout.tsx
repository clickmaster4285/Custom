import { Outlet } from "react-router-dom"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { ActivityLogger } from "@/components/activity-logger"

export function DashboardLayout() {
  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <ActivityLogger />
      <Sidebar />
      <div className="flex-1 flex flex-col ml-[333px] min-w-0">
        <Header />
        <main className="flex-1 pt-4 pb-4 mx-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
