import { ModulePageLayout } from "@/components/dashboard/module-page-layout"

export default function VehicleDatabasePage() {
  return (
    <ModulePageLayout
      title="Vehicle Database"
      description="LPR/ANPR, vehicle lists, tracking."
      breadcrumbs={[{ label: "AI Analytics" }, { label: "Vehicle Database" }]}
    >
      <div className="rounded-lg border border-dashed border-border bg-muted/30 p-8 text-center text-muted-foreground">
        Vehicle Database — LPR/ANPR, vehicle lists, and tracking. Content coming soon.
      </div>
    </ModulePageLayout>
  )
}
