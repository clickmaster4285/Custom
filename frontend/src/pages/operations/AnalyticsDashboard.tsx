
import { BarChart3, TrendingUp, Activity, Target } from "lucide-react"
import { ModulePageLayout } from "@/components/dashboard/module-page-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function AnalyticsDashboardPage() {
  return (
    <ModulePageLayout
      title="Analytics Dashboard"
      description="World's Leading AI Analytic System — real-time insights and KPIs."
      breadcrumbs={[{ label: "AI Analytics" }, { label: "Analytics Dashboard" }]}
    >
      <div className="grid gap-6">
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Visitors (30d)
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">4,892</div>
              <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" /> +12% vs last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Inventory Value
              </CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">PKR 2.4B</div>
              <p className="text-xs text-muted-foreground mt-1">Across warehouses</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Active Alerts
              </CardTitle>
              <Activity className="h-4 w-4 text-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">7</div>
              <p className="text-xs text-muted-foreground mt-1">Requires attention</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                AI Predictions
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-[#3b82f6]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">98.2%</div>
              <p className="text-xs text-muted-foreground mt-1">Accuracy rate</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Visitor Trend</CardTitle>
              <CardDescription>Last 7 days — AI-powered trend analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center rounded-lg border border-dashed border-border bg-muted/30 text-muted-foreground text-sm">
                Chart placeholder — integrate with your chart library
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Warehouse Utilization</CardTitle>
              <CardDescription>Capacity vs usage by location</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center rounded-lg border border-dashed border-border bg-muted/30 text-muted-foreground text-sm">
                Chart placeholder — integrate with your chart library
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Generate reports or run AI insights</CardDescription>
            </div>
            <Button className="bg-[#3b82f6] hover:bg-[#2563eb] text-white">
              Run AI Analysis
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-3">
              <Button variant="outline" className="h-auto flex flex-col items-start gap-2 p-4 text-left">
                <span className="font-medium">Visitor Report</span>
                <span className="text-xs text-muted-foreground">Export last 30 days</span>
              </Button>
              <Button variant="outline" className="h-auto flex flex-col items-start gap-2 p-4 text-left">
                <span className="font-medium">Stock Forecast</span>
                <span className="text-xs text-muted-foreground">AI demand prediction</span>
              </Button>
              <Button variant="outline" className="h-auto flex flex-col items-start gap-2 p-4 text-left">
                <span className="font-medium">Anomaly Check</span>
                <span className="text-xs text-muted-foreground">Detect variances</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </ModulePageLayout>
  )
}
