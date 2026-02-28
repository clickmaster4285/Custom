import { ROUTES } from "@/routes/config"
import { VmsListPage } from "@/components/vms/vms-list-page"

export default function BlacklistManagementPage() {
  return (
    <VmsListPage
      title="Blacklist Management"
      description="Add or restrict visitors permanently or temporarily."
      storageKey="vms_blacklist_management_rows"
      breadcrumbs={[
        { label: "Home", href: ROUTES.DASHBOARD },
        { label: "Visitor Management System" },
        { label: "Security & Screening" },
        { label: "Blacklist Management" },
      ]}
      columns={[
        { key: "name", label: "Visitor Name" },
        { key: "restriction", label: "Restriction Type" },
        { key: "duration", label: "Duration" },
        { key: "reason", label: "Reason" },
      ]}
      formFields={[
        { key: "name", label: "Visitor Name" },
        { key: "restriction", label: "Restriction Type (Permanent/Temporary)" },
        { key: "duration", label: "Duration" },
        { key: "reason", label: "Reason" },
      ]}
      filterField="restriction"
      initialRows={[
        { name: "Imran Yousaf", restriction: "Permanent", duration: "N/A", reason: "Security violation" },
        { name: "Samina Irfan", restriction: "Temporary", duration: "7 days", reason: "Invalid documents" },
        { name: "Robert Kim", restriction: "Temporary", duration: "30 days", reason: "Unauthorized area access" },
      ]}
    />
  )
}
