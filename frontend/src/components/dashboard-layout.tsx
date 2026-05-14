import { useState } from "react"
import { Outlet } from "react-router-dom"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { ActivityLogger } from "@/components/activity-logger"

export function DashboardLayout() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <ActivityLogger />
      <Sidebar mobileOpen={mobileSidebarOpen} onMobileOpenChange={setMobileSidebarOpen} />
      <div className="flex min-w-0 flex-1 flex-col md:ml-[333px]">
        <Header onMenuClick={() => setMobileSidebarOpen(true)} />
        <main className="flex-1 px-4 pt-20 pb-4 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
