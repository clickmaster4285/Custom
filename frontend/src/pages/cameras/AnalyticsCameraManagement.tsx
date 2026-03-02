import { ModulePageLayout } from "@/components/dashboard/module-page-layout"
import { CameraManagementContent } from "./CameraManagement"

export default function AnalyticsCameraManagementPage() {
  return (
    <ModulePageLayout
      title="Camera Management — Add, configure, group, and monitor cameras"
      description="AI Analytics cameras. * Required = Yes. + Field Type defines input."
      breadcrumbs={[{ label: "AI Analytics" }, { label: "Camera Management" }]}
    >
      <CameraManagementContent />
    </ModulePageLayout>
  )
}
