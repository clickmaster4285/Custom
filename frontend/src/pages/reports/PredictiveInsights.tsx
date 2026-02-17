
import { Brain, TrendingUp, AlertTriangle, Lightbulb } from "lucide-react"
import { ModulePageLayout } from "@/components/dashboard/module-page-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default function PredictiveInsightsPage() {
  return (
    <ModulePageLayout
      title="Predictive Insights"
      description="AI-driven forecasts for demand, stock levels, and visitor patterns."
      breadcrumbs={[{ label: "AI Analytics" }, { label: "Predictive Insights" }]}
    >
      <div className="grid gap-6">
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Demand Forecast (7d)
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+8.4%</div>
              <p className="text-xs text-muted-foreground mt-1">Expected visitor increase</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Stock-Out Risk
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12 SKUs</div>
              <p className="text-xs text-muted-foreground mt-1">Next 14 days</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Model Confidence
              </CardTitle>
              <Brain className="h-4 w-4 text-[#3b82f6]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">94%</div>
              <p className="text-xs text-muted-foreground mt-1">Average accuracy</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-[#3b82f6]" />
              AI-Generated Insights
            </CardTitle>
            <CardDescription>Recommendations based on current data and trends</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { title: "Reorder suggested for SKU-4452 (Pharma)", type: "Stock", priority: "High" },
              { title: "Peak visitor hours next week: Tue–Thu 10:00–12:00", type: "VMS", priority: "Info" },
              { title: "Zone Z-B02 utilization will exceed 90% by month end", type: "WMS", priority: "Medium" },
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-start justify-between rounded-lg border border-border p-4"
              >
                <div>
                  <p className="font-medium text-foreground">{item.title}</p>
                  <Badge variant="outline" className="mt-2">
                    {item.type}
                  </Badge>
                </div>
                <Badge
                  variant={
                    item.priority === "High"
                      ? "destructive"
                      : item.priority === "Medium"
                        ? "secondary"
                        : "default"
                  }
                >
                  {item.priority}
                </Badge>
              </div>
            ))}
            <Button variant="outline" className="w-full">
              Load more insights
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Run New Prediction</CardTitle>
              <CardDescription>Select module and time horizon for AI forecast</CardDescription>
            </div>
            <Button className="bg-[#3b82f6] hover:bg-[#2563eb] text-white">
              Generate Forecast
            </Button>
          </CardHeader>
        </Card>
      </div>
    </ModulePageLayout>
  )
}
