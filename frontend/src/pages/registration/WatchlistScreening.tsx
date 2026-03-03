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
        { key: "id", label: "ID" },
        { key: "profile_image", label: "Profile Image" },
        { key: "visitor", label: "Visitor Name" },
        { key: "email", label: "Email" },          // new
        { key: "phone", label: "Phone" },          // new
        { key: "company", label: "Company" },      // new
        { key: "location", label: "Location" },    // new
        { key: "last_visit", label: "Last Visit" },// new
        { key: "document", label: "Document" },
        { key: "match", label: "Match Status" },
        { key: "score", label: "Match Score" },
        { key: "remarks", label: "Remarks" },      // new
      ]}
      formFields={[
        { key: "visitor", label: "Visitor Name" },
        { key: "document", label: "CNIC / Passport" },
        { key: "match", label: "Match Status (No/Potential/Yes)" },
        { key: "score", label: "Match Score" },
      ]}
      filterField="match"
      initialRows={[
        {
          id: 1,
          profile_image: "",
          visitor: "Ali Hassan",
          email: "ali.hassan@example.com",
          phone: "+92-300-1234567",
          company: "Hassan Enterprises",
          location: "Karachi, Pakistan",
          last_visit: "2026-02-25",
          document: "35202-1234567-1",
          match: "No",
          score: "0%",
          remarks: "No prior visits"
        },
        {
          id: 2,
          profile_image: "",
          visitor: "John Lee",
          email: "john.lee@example.com",
          phone: "+1-555-9876543",
          company: "Lee Corp",
          location: "New York, USA",
          last_visit: "2026-03-01",
          document: "AB123456",
          match: "Potential",
          score: "82%",
          remarks: "Follow up required"
        },
        {
          id: 3,
          profile_image: "",
          visitor: "Ayesha Malik",
          email: "ayesha.malik@example.com",
          phone: "+92-301-7654321",
          company: "Malik Solutions",
          location: "Lahore, Pakistan",
          last_visit: "2026-02-20",
          document: "35201-9876543-2",
          match: "No",
          score: "0%",
          remarks: "First visit"
        }
      ]}
    />
  )
}
