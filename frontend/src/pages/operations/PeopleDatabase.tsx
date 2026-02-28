import { ModulePageLayout } from "@/components/dashboard/module-page-layout"

export default function PeopleDatabasePage() {
  return (
    <ModulePageLayout
      title="People Database"
      description="Face recognition, enrollment, attendance."
      breadcrumbs={[{ label: "AI Analytics" }, { label: "People Database" }]}
    >
      <div className="rounded-lg border border-dashed border-border bg-muted/30 p-8 text-center text-muted-foreground">
        People Database — face recognition, enrollment, and attendance. Content coming soon.
      </div>
    </ModulePageLayout>
  )
}
