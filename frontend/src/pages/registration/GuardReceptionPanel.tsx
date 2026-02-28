import { ROUTES } from "@/routes/config"
import { VmsListPage } from "@/components/vms/vms-list-page"

export default function GuardReceptionPanelPage() {
  return (
    <VmsListPage
      title="Guard & Reception Panel"
      description="List of today’s expected and walk-in visitors, quick lookup, and instant approvals."
      storageKey="vms_guard_reception_panel_rows"
      breadcrumbs={[
        { label: "Home", href: ROUTES.DASHBOARD },
        { label: "Visitor Management System" },
        { label: "Guard & Reception Panel" },
      ]}
      columns={[
        { key: "feature", label: "Feature" },
        { key: "record", label: "Record" },
        { key: "details", label: "Details" },
        { key: "status", label: "Status" },
      ]}
      formFields={[
        { key: "feature", label: "Feature (Daily Visitor List / Quick Search / Instant Approval)" },
        { key: "record", label: "Record" },
        { key: "details", label: "Details" },
        { key: "status", label: "Status" },
      ]}
      filterField="feature"
      initialRows={[
        {
          feature: "Daily Visitor List",
          record: "Expected — Ali Hassan",
          details: "10:00 AM • Host: Syed Muhammad Ali",
          status: "Expected",
        },
        {
          feature: "Quick Search",
          record: "REF-2026-0012",
          details: "Matched visitor John Lee by reference ID",
          status: "Matched",
        },
        {
          feature: "Instant Approval",
          record: "IA-2001",
          details: "Emergency approval granted by reception supervisor",
          status: "Approved",
        },
      ]}
    />
  )
}
