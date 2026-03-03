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
        { 
          key: "id", 
          label: "ID" 
        },
        {
          key: "profile_image",
          label: "Profile Image",
          render: (row: any) => (
            <img
              src={row.profile_image}
              alt={row.name}
              className="h-10 w-10 rounded-full object-cover"
              onError={(e) => {
                // Fallback if image fails to load
                const target = e.target as HTMLImageElement;
                target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(row.name || 'User')}&background=random`;
              }}
            />
          ),
        },
        { 
          key: "name", 
          label: "Visitor Name",
          render: (row: any) => (
            <div className="font-medium">{row.name}</div>
          )
        },
        { 
          key: "email", 
          label: "Email" 
        },
        { 
          key: "phone", 
          label: "Phone" 
        },
        { 
          key: "document", 
          label: "ID Document" 
        },
        { 
          key: "restriction", 
          label: "Restriction Type",
          render: (row: any) => (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              row.restriction === 'Permanent' 
                ? 'bg-red-100 text-red-700' 
                : 'bg-yellow-100 text-yellow-700'
            }`}>
              {row.restriction}
            </span>
          )
        },
        { 
          key: "duration", 
          label: "Duration",
          render: (row: any) => (
            <span className={row.duration === 'N/A' ? 'text-muted-foreground' : ''}>
              {row.duration}
            </span>
          )
        },
        { 
          key: "reason", 
          label: "Reason",
          render: (row: any) => (
            <div className="max-w-xs truncate" title={row.reason}>
              {row.reason}
            </div>
          )
        },
        { 
          key: "blacklisted_date", 
          label: "Blacklisted Date" 
        },
        { 
          key: "expiry_date", 
          label: "Expiry Date",
          render: (row: any) => (
            <span className={row.expiry_date && new Date(row.expiry_date) < new Date() ? 'text-amber-600' : ''}>
              {row.expiry_date || '—'}
            </span>
          )
        },
      ]}
      formFields={[
        { key: "name", label: "Visitor Name", placeholder: "Full name" },
        { key: "email", label: "Email", placeholder: "visitor@example.com" },
        { key: "phone", label: "Phone", placeholder: "+1-234-567-8900" },
        { key: "document", label: "ID Document (CNIC/Passport)", placeholder: "Enter ID number" },
        { key: "restriction", label: "Restriction Type (Permanent/Temporary)", placeholder: "Permanent or Temporary" },
        { key: "duration", label: "Duration", placeholder: "e.g., 7 days, 30 days, N/A" },
        { key: "reason", label: "Reason", placeholder: "Reason for blacklisting" },
        { key: "expiry_date", label: "Expiry Date (if temporary)", placeholder: "YYYY-MM-DD" },
      ]}
      filterField="restriction"
      initialRows={[
        { 
          id: 1,
          profile_image: "https://ui-avatars.com/api/?name=Imran+Yousaf&background=random",
          name: "Imran Yousaf", 
          email: "imran.yousaf@example.com",
          phone: "+92-300-1112233",
          document: "35202-7654321-1",
          restriction: "Permanent", 
          duration: "N/A", 
          reason: "Security violation - attempted unauthorized access to server room",
          blacklisted_date: "2026-02-15",
          expiry_date: "—"
        },
        { 
          id: 2,
          profile_image: "https://ui-avatars.com/api/?name=Samina+Irfan&background=random",
          name: "Samina Irfan", 
          email: "samina.irfan@example.com",
          phone: "+92-321-4445566",
          document: "35201-1234987-2",
          restriction: "Temporary", 
          duration: "7 days", 
          reason: "Invalid documents - provided expired CNIC",
          blacklisted_date: "2026-03-01",
          expiry_date: "2026-03-08"
        },
        { 
          id: 3,
          profile_image: "https://ui-avatars.com/api/?name=Robert+Kim&background=random",
          name: "Robert Kim", 
          email: "robert.kim@example.com",
          phone: "+82-10-9876-5432",
          document: "M12345678",
          restriction: "Temporary", 
          duration: "30 days", 
          reason: "Unauthorized area access - entered restricted laboratory",
          blacklisted_date: "2026-02-20",
          expiry_date: "2026-03-22"
        },
        { 
          id: 4,
          profile_image: "https://ui-avatars.com/api/?name=Fatima+Zahra&background=random",
          name: "Fatima Zahra", 
          email: "fatima.zahra@example.com",
          phone: "+92-333-7778899",
          document: "35203-5556667-3",
          restriction: "Permanent", 
          duration: "N/A", 
          reason: "Theft of company property",
          blacklisted_date: "2026-01-10",
          expiry_date: "—"
        },
      ]}
    />
  )
}