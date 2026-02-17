
import { LayoutDashboard, BarChart3, Activity } from "lucide-react"
import { ModulePageLayout } from "@/components/dashboard/module-page-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function OperationsDashboardPage() {
  return (
    <ModulePageLayout
      title="Operations Dashboard"
      description="Real-time view of day-to-day operations and key metrics."
      breadcrumbs={[{ label: "WMS" }, { label: "Operations Dashboard" }]}
    >
      <div className="grid gap-6">
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Operations</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24</div>
              <p className="text-xs text-muted-foreground mt-1">In progress</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending Tasks</CardTitle>
              <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground mt-1">Awaiting action</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Completed Today</CardTitle>
              <BarChart3 className="h-4 w-4 text-[#3b82f6]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">48</div>
              <p className="text-xs text-muted-foreground mt-1">Tasks completed</p>
            </CardContent>
          </Card>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Operations Overview</CardTitle>
            <CardDescription>Key operational metrics and status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center rounded-lg border border-dashed border-border bg-muted/30 text-muted-foreground text-sm">
              Operations metrics and charts — integrate with your data
            </div>
            <Button className="mt-4 bg-[#3b82f6] hover:bg-[#2563eb] text-white">Refresh</Button>
          </CardContent>
        </Card>
      </div>
    </ModulePageLayout>
  )
}
