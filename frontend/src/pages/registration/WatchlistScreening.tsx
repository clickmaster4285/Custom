import { ROUTES } from "@/routes/config"
import { VmsListPage } from "@/components/vms/vms-list-page"

const WATCHLIST_STORAGE_KEY = "vms_watchlist_screening_rows"

const INITIAL_WATCHLIST_ROWS: Record<string, string>[] = [
  { id: "1", profile_image: "https://randomuser.me/api/portraits/men/32.jpg", visitor: "Ali Khan", phone: "+92-300-1234567", location: "Peshawar", last_visit: "2026-02-25", document_type: "CNIC", document_number: "17301-1234567-1", match: "No", score: "0%", remarks: "No prior security flags" },
  { id: "2", profile_image: "https://randomuser.me/api/portraits/men/44.jpg", visitor: "Usman Ahmad", phone: "+92-304-9876543", location: "D.I. Khan", last_visit: "2026-03-01", document_type: "Passport", document_number: "AB1234567", match: "Potential", score: "82%", remarks: "Name similarity with internal record" },
  { id: "3", profile_image: "https://randomuser.me/api/portraits/women/68.jpg", visitor: "Ayesha Malik", phone: "+92-301-7654321", location: "Peshawar", last_visit: "2026-02-20", document_type: "CNIC", document_number: "17302-9876543-4", match: "No", score: "0%", remarks: "First visit - verified CNIC" },
  { id: "4", profile_image: "https://randomuser.me/api/portraits/men/76.jpg", visitor: "Zeeshan Ullah", phone: "+92-345-9001234", location: "D.I. Khan", last_visit: "2026-03-03", document_type: "CNIC", document_number: "38102-4455667-8", match: "Yes", score: "96%", remarks: "Confirmed match with watchlist database" },
]

export default function WatchlistScreeningPage() {
  return (
    <>
      <VmsListPage
      title="Watchlist Screening"
      description="Match visitor data against internal security watchlists. Match status is determined by AI."
      storageKey={WATCHLIST_STORAGE_KEY}
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
                src={row.profile_image || "/images/default-user.png"}
                alt={row.visitor}
                className="h-12 w-12 rounded-full object-cover border-2 border-gray-200 shadow-sm"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.src = "/images/default-user.png"
                }}
              />
            </div>
          ),
        },

        { key: "visitor", label: "Visitor Name" },
        { key: "phone", label: "Phone" },
        { key: "location", label: "Address" },
        { key: "last_visit", label: "Last Visit" },

        {
          key: "document_type",
          label: "Document Type",
          render: (row: any) => {
            const base = "px-3 py-1 rounded-full text-xs font-semibold"

            if (row.document_type === "CNIC") {
              return (
                <span className={`${base} bg-blue-100 text-blue-700`}>
                  CNIC
                </span>
              )
            }

            return (
              <span className={`${base} bg-purple-100 text-purple-700`}>
                Passport
              </span>
            )
          },
        },

        { key: "document_number", label: "Document Number" },

        {
          key: "match",
          label: "Match Status (AI)",
          render: (row: any) => {
            const base = "px-3 py-1 rounded-full text-xs font-semibold tracking-wide"

            if (row.match === "Yes") {
              return (
                <span className={`${base} bg-red-100 text-red-700`}>
                  High Risk (AI)
                </span>
              )
            }

            if (row.match === "Potential") {
              return (
                <span className={`${base} bg-yellow-100 text-yellow-700`}>
                  Potential Match (AI)
                </span>
              )
            }

            return (
              <span className={`${base} bg-green-100 text-green-700`}>
                Clear (AI)
              </span>
            )
          },
        },

        { key: "score", label: "Match Score" },
        { key: "remarks", label: "Remarks" },
      ]}
      formFields={[
        { key: "visitor", label: "Visitor Name" },
        { key: "document_type", label: "Document Type (CNIC/Passport)" },
        { key: "document_number", label: "Document Number" },
        { key: "match", label: "Match Status (No/Potential/Yes, AI)" },
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
    </>
  )
}
