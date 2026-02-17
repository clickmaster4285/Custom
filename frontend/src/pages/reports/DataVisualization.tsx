
import { BarChart3, PieChart, LineChart } from "lucide-react"
import { ModulePageLayout } from "@/components/dashboard/module-page-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function DataVisualizationPage() {
  return (
    <ModulePageLayout
      title="Data Visualization"
      description="Interactive charts and dashboards for analytics and reporting."
      breadcrumbs={[{ label: "AI Analytics" }, { label: "Data Visualization" }]}
    >
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Visualization Studio</CardTitle>
            <CardDescription>Build and view custom charts from your data</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="visitors" className="w-full">
              <TabsList className="grid w-full max-w-md grid-cols-3">
                <TabsTrigger value="visitors">Visitors</TabsTrigger>
                <TabsTrigger value="inventory">Inventory</TabsTrigger>
                <TabsTrigger value="hr">HR</TabsTrigger>
              </TabsList>
              <TabsContent value="visitors" className="mt-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="rounded-lg border border-dashed border-border bg-muted/20 p-8 flex flex-col items-center justify-center gap-2 min-h-[280px]">
                    <BarChart3 className="h-10 w-10 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Visitor volume by day</span>
                  </div>
                  <div className="rounded-lg border border-dashed border-border bg-muted/20 p-8 flex flex-col items-center justify-center gap-2 min-h-[280px]">
                    <PieChart className="h-10 w-10 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Visit purpose breakdown</span>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="inventory" className="mt-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="rounded-lg border border-dashed border-border bg-muted/20 p-8 flex flex-col items-center justify-center gap-2 min-h-[280px]">
                    <LineChart className="h-10 w-10 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Stock level trends</span>
                  </div>
                  <div className="rounded-lg border border-dashed border-border bg-muted/20 p-8 flex flex-col items-center justify-center gap-2 min-h-[280px]">
                    <BarChart3 className="h-10 w-10 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Warehouse utilization</span>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="hr" className="mt-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="rounded-lg border border-dashed border-border bg-muted/20 p-8 flex flex-col items-center justify-center gap-2 min-h-[280px]">
                    <BarChart3 className="h-10 w-10 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Attendance by department</span>
                  </div>
                  <div className="rounded-lg border border-dashed border-border bg-muted/20 p-8 flex flex-col items-center justify-center gap-2 min-h-[280px]">
                    <PieChart className="h-10 w-10 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Leave balance distribution</span>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Saved Views</CardTitle>
              <CardDescription>Your saved chart configurations</CardDescription>
            </div>
            <Button className="bg-[#3b82f6] hover:bg-[#2563eb] text-white">
              New View
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {["Visitor Dashboard", "Stock Overview", "HR Summary"].map((name) => (
                <div
                  key={name}
                  className="rounded-lg border border-border p-4 flex items-center justify-between hover:bg-muted/50 transition-colors cursor-pointer"
                >
                  <span className="font-medium">{name}</span>
                  <Button variant="ghost" size="sm">Open</Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </ModulePageLayout>
  )
}
