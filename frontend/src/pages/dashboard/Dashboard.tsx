import { Calendar } from "lucide-react"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { RegistrationModules } from "@/components/dashboard/registration-modules"
import { RecentRegistrations } from "@/components/dashboard/recent-registrations"

export function Dashboard() {
  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Visitor Registration Overview</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage visitor registrations, check-ins, and documentation efficiently
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>Today, January 22, 2024</span>
        </div>
      </div>
      <StatsCards />
      <RegistrationModules />
      <RecentRegistrations />
    </>
  )
}
