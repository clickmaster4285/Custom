import { ROUTES } from "@/routes/config"
import { VmsListPage } from "@/components/vms/vms-list-page"

export default function FlaggedVisitorAlertsPage() {
  return (
    <VmsListPage
      title="Flagged Visitor Alerts"
      description="Instant alerts to security for suspicious visitors."
      storageKey="vms_flagged_visitor_alerts_rows"
      breadcrumbs={[
        { label: "Home", href: ROUTES.DASHBOARD },
        { label: "Visitor Management System" },
        { label: "Security & Screening" },
        { label: "Flagged Visitor Alerts" },
      ]}
      columns={[
        { key: "alertId", label: "Alert ID" },
        { key: "priority", label: "Priority" },
        { key: "summary", label: "Summary" },
        { key: "time", label: "Time" },
      ]}
      formFields={[
        { key: "alertId", label: "Alert ID" },
        { key: "priority", label: "Priority (High/Medium/Low)" },
        { key: "summary", label: "Summary" },
        { key: "time", label: "Time" },
      ]}
      filterField="priority"
      initialRows={[
        { alertId: "AL-2401", priority: "High", summary: "Flagged profile match at Gate 2", time: "09:14 AM" },
        { alertId: "AL-2402", priority: "Medium", summary: "Repeated access attempts with incomplete details", time: "10:40 AM" },
        { alertId: "AL-2403", priority: "High", summary: "Blacklist hit during walk-in registration", time: "12:05 PM" },
      ]}
    />
  )
}
