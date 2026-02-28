import { ROUTES } from "@/routes/config"
import { VmsListPage } from "@/components/vms/vms-list-page"

export default function WatchlistScreeningPage() {
  return (
    <VmsListPage
      title="Watchlist Screening"
      description="Match visitor data against internal security watchlists."
      storageKey="vms_watchlist_screening_rows"
      breadcrumbs={[
        { label: "Home", href: ROUTES.DASHBOARD },
        { label: "Visitor Management System" },
        { label: "Security & Screening" },
        { label: "Watchlist Screening" },
      ]}
      columns={[
        { key: "visitor", label: "Visitor" },
        { key: "document", label: "Document" },
        { key: "match", label: "Match Status" },
        { key: "score", label: "Match Score" },
      ]}
      formFields={[
        { key: "visitor", label: "Visitor Name" },
        { key: "document", label: "CNIC / Passport" },
        { key: "match", label: "Match Status (No/Potential/Yes)" },
        { key: "score", label: "Match Score" },
      ]}
      filterField="match"
      initialRows={[
        { visitor: "Ali Hassan", document: "35202-1234567-1", match: "No", score: "0%" },
        { visitor: "John Lee", document: "AB123456", match: "Potential", score: "82%" },
        { visitor: "Ayesha Malik", document: "35201-9876543-2", match: "No", score: "0%" },
      ]}
    />
  )
}
