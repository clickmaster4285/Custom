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
        {
          key: "profile_image",
          label: "Profile Image",
          render: (row: any) => (
            <div className="flex items-center justify-center">
              <img
                src={row.profile_image}
                alt={row.visitor}
                className="h-10 w-10 rounded-full object-cover"
                onError={(e) => {
                  // Fallback if image fails to load
                  const target = e.target as HTMLImageElement;
                  target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(row.visitor || 'User')}&background=random`;
                }}
              />
            </div>
          ),
        },
        { key: "visitor", label: "Visitor Name" },
        { key: "email", label: "Email" },
        { key: "phone", label: "Phone" },
        { key: "location", label: "Location" },
        { key: "last_visit", label: "Last Visit" },
        { key: "document", label: "Document" },
        { 
          key: "match", 
          label: "Match Status",
          render: (row: any) => (
            <span className={`px-2 py-1 rounded-full text-xs ${
              row.match === 'Yes' ? 'bg-red-100 text-red-700' :
              row.match === 'Potential' ? 'bg-yellow-100 text-yellow-700' :
              'bg-green-100 text-green-700'
            }`}>
              {row.match}
            </span>
          )
        },
        { key: "score", label: "Match Score" },
        { key: "remarks", label: "Remarks" },
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
          profile_image: "https://ui-avatars.com/api/?name=Ali+Hassan&background=random",
          visitor: "Ali Hassan",
          email: "ali.hassan@example.com",
          phone: "+92-300-1234567",
          location: "Karachi, Pakistan",
          last_visit: "2026-02-25",
          document: "35202-1234567-1",
          match: "No",
          score: "0%",
          remarks: "No prior visits"
        },
        {
          id: 2,
          profile_image: "https://ui-avatars.com/api/?name=John+Lee&background=random",
          visitor: "John Lee",
          email: "john.lee@example.com",
          phone: "+1-555-9876543",
          location: "New York, USA",
          last_visit: "2026-03-01",
          document: "AB123456",
          match: "Potential",
          score: "82%",
          remarks: "Follow up required"
        },
        {
          id: 3,
          profile_image: "https://ui-avatars.com/api/?name=Ayesha+Malik&background=random",
          visitor: "Ayesha Malik",
          email: "ayesha.malik@example.com",
          phone: "+92-301-7654321",
          location: "Yarik, Pakistan",
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