import { ROUTES } from "@/routes/config"
import { VmsListPage } from "@/components/vms/vms-list-page"
import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"

export default function FlaggedVisitorAlertsPage() {
  const [selectedAlert, setSelectedAlert] = useState<any>(null)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [localRows, setLocalRows] = useState<any[]>([])

  const handleView = (row: any) => {
    setSelectedAlert(row)
    setViewDialogOpen(true)
  }

  const handleAcknowledge = (row: any, updateRows: Function) => {
    // Update the status of the alert to "Acknowledged"
    const updatedRow = { ...row, status: "Acknowledged" }
    
    // Show toast notification
    toast({
      title: "Alert Acknowledged",
      description: `Alert ${row.alertId} has been acknowledged.`,
      duration: 3000,
    })

    // Return the updated row to update the table
    return updatedRow
  }

  const handleResolve = (row: any, updateRows: Function) => {
    const updatedRow = { ...row, status: "Resolved" }
    
    toast({
      title: "Alert Resolved",
      description: `Alert ${row.alertId} has been marked as resolved.`,
      duration: 3000,
    })

    return updatedRow
  }

  const handleEscalate = (row: any, updateRows: Function) => {
    const updatedRow = { ...row, status: "Escalated", priority: "High" }
    
    toast({
      title: "Alert Escalated",
      description: `Alert ${row.alertId} has been escalated to high priority.`,
      duration: 3000,
    })

    return updatedRow
  }

  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case 'High': return 'destructive'
      case 'Medium': return 'warning'
      case 'Low': return 'secondary'
      default: return 'default'
    }
  }

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'New': return 'destructive'
      case 'Acknowledged': return 'default'
      case 'Resolved': return 'secondary'
      case 'Escalated': return 'warning'
      default: return 'default'
    }
  }

  return (
    <>
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
          { 
            key: "alertId", 
            label: "Alert ID",
            render: (row: any) => (
              <span className="font-mono text-xs sm:text-sm font-medium whitespace-nowrap">
                {row.alertId}
              </span>
            )
          },
          {
            key: "profile_image",
            label: "Visitor",
            render: (row: any) => (
              <div className="flex items-center gap-2 min-w-[120px]">
                <img
                  src={row.profile_image}
                  alt={row.visitor_name}
                  className="h-8 w-8 rounded-full object-cover flex-shrink-0"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(row.visitor_name || 'Visitor')}&background=random`;
                  }}
                />
                <div className="flex flex-col min-w-0">
                  <span className="text-xs sm:text-sm font-medium truncate" title={row.visitor_name}>
                    {row.visitor_name}
                  </span>
                  <span className="text-xs text-muted-foreground truncate hidden sm:block" title={row.visitor_initials}>
                    {row.visitor_initials}
                  </span>
                </div>
              </div>
            ),
          },
          { 
            key: "priority", 
            label: "Priority",
            render: (row: any) => {
              const priorityStyles = {
                High: "bg-red-100 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-400",
                Medium: "bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-400",
                Low: "bg-green-100 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-400"
              };
              return (
                <span className={`px-2 py-1 rounded-full text-xs font-medium border whitespace-nowrap ${priorityStyles[row.priority as keyof typeof priorityStyles] || 'bg-gray-100 text-gray-700'}`}>
                  {row.priority}
                </span>
              );
            }
          },
          { 
            key: "summary", 
            label: "Alert Summary",
            render: (row: any) => (
              <div className="max-w-[200px] lg:max-w-[300px]">
                <p className="text-xs sm:text-sm line-clamp-2" title={row.summary}>
                  {row.summary}
                </p>
                {row.visitor_document && (
                  <p className="text-xs text-muted-foreground mt-1 font-mono truncate" title={row.visitor_document}>
                    ID: {row.visitor_document}
                  </p>
                )}
              </div>
            )
          },
          { 
            key: "location", 
            label: "Location",
            render: (row: any) => (
              <div className="min-w-[100px]">
                <p className="text-xs sm:text-sm truncate" title={row.location}>
                  {row.location}
                </p>
                {row.gate && (
                  <span className="text-xs text-muted-foreground block truncate" title={`Gate: ${row.gate}`}>
                    Gate: {row.gate}
                  </span>
                )}
              </div>
            )
          },
          { 
            key: "time", 
            label: "Alert Time",
            render: (row: any) => (
              <div className="whitespace-nowrap">
                <div className="text-xs sm:text-sm">{row.time}</div>
                {row.date && (
                  <div className="text-xs text-muted-foreground">{row.date}</div>
                )}
              </div>
            )
          },
          { 
            key: "status", 
            label: "Status",
            render: (row: any) => {
              const statusStyles = {
                "New": "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
                "Acknowledged": "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400",
                "Resolved": "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400",
                "Escalated": "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400"
              };
              return (
                <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${statusStyles[row.status as keyof typeof statusStyles] || 'bg-gray-100'}`}>
                  {row.status}
                </span>
              );
            }
          },
          { 
            key: "actions", 
            label: "Actions",
            render: (row: any, updateRows?: Function) => (
              <div className="flex flex-col sm:flex-row gap-1 min-w-[90px]">
                <Button 
                  size="sm" 
                  variant="default"
                  className="h-7 px-2 text-xs"
                  onClick={() => handleView(row)}
                >
                  View
                </Button>
                {row.status === "New" && (
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="h-7 px-2 text-xs"
                    onClick={() => {
                      if (updateRows) {
                        const updatedRow = handleAcknowledge(row, updateRows);
                        updateRows(updatedRow);
                      }
                    }}
                  >
                    Ack
                  </Button>
                )}
                {row.status === "Acknowledged" && (
                  <>
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="h-7 px-2 text-xs border-green-500 text-green-600 hover:bg-green-50"
                      onClick={() => {
                        if (updateRows) {
                          const updatedRow = handleResolve(row, updateRows);
                          updateRows(updatedRow);
                        }
                      }}
                    >
                      Resolve
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="h-7 px-2 text-xs border-orange-500 text-orange-600 hover:bg-orange-50"
                      onClick={() => {
                        if (updateRows) {
                          const updatedRow = handleEscalate(row, updateRows);
                          updateRows(updatedRow);
                        }
                      }}
                    >
                      Escalate
                    </Button>
                  </>
                )}
              </div>
            )
          },
        ]}
        formFields={[
          { key: "alertId", label: "Alert ID", placeholder: "e.g., AL-2401" },
          { key: "visitor_name", label: "Visitor Name", placeholder: "Full name" },
          { key: "visitor_initials", label: "Visitor Initials", placeholder: "e.g., UV, JD" },
          { key: "priority", label: "Priority (High/Medium/Low)", placeholder: "High, Medium, or Low" },
          { key: "summary", label: "Alert Summary", placeholder: "Brief description of the alert" },
          { key: "visitor_document", label: "Visitor Document ID", placeholder: "CNIC/Passport number" },
          { key: "location", label: "Location", placeholder: "e.g., Gate 2, Lobby" },
          { key: "gate", label: "Gate/Entry Point", placeholder: "Specific gate number" },
          { key: "time", label: "Time", placeholder: "e.g., 09:14 AM" },
          { key: "date", label: "Date", placeholder: "YYYY-MM-DD" },
          { key: "status", label: "Status (New/Acknowledged/Resolved/Escalated)", placeholder: "New" },
        ]}
        filterField="priority"
        initialRows={[
          { 
            alertId: "AL-2401", 
            profile_image: "https://randomuser.me/api/portraits/men/31.jpg",
            visitor_name: "Unknown Male",
            visitor_initials: "UV",
            visitor_document: "35202-7654321-1",
            priority: "High", 
            summary: "Flagged profile match at Gate 2 - Individual matches watchlist entry #WL-1089",
            location: "Main Entrance",
            gate: "Gate 2",
            time: "09:14 AM",
            date: "2026-03-03",
            status: "New"
          },
          { 
            alertId: "AL-2402", 
            profile_image: "https://randomuser.me/api/portraits/men/32.jpg",
            visitor_name: "John Doe",
            visitor_initials: "JD",
            visitor_document: "AB987654",
            priority: "Medium", 
            summary: "Repeated access attempts with incomplete details - 3 attempts in 30 minutes",
            location: "Visitor Registration",
            gate: "Gate 1",
            time: "10:40 AM",
            date: "2026-03-03",
            status: "Acknowledged"
          },
          { 
            alertId: "AL-2403", 
            profile_image: "https://randomuser.me/api/portraits/men/50.jpg",
            visitor_name: "Michael Smith",
            visitor_initials: "MS",
            visitor_document: "M99887766",
            priority: "High", 
            summary: "Blacklist hit during walk-in registration - Permanent restriction for security violation",
            location: "Walk-in Registration",
            gate: "Gate 3",
            time: "12:05 PM",
            date: "2026-03-03",
            status: "New"
          },
          { 
            alertId: "AL-2399", 
            profile_image: "https://randomuser.me/api/portraits/women/45.jpg",
            visitor_name: "Sarah Ahmed",
            visitor_initials: "SA",
            visitor_document: "35201-4455667-4",
            priority: "Low", 
            summary: "Document expiration warning - Passport expired 5 days ago",
            location: "Pre-registration Desk",
            gate: "Gate 4",
            time: "08:30 AM",
            date: "2026-03-02",
            status: "Resolved"
          },
          { 
            alertId: "AL-2398", 
            profile_image: "https://randomuser.me/api/portraits/men/52.jpg",
            visitor_name: "David Chen",
            visitor_initials: "DC",
            visitor_document: "E12345678",
            priority: "High", 
            summary: "Multiple failed biometric attempts - Possible identity fraud",
            location: "Biometric Scanner",
            gate: "Gate 2",
            time: "03:20 PM",
            date: "2026-03-02",
            status: "Escalated"
          },
          // ✅ Additional new images/visitors
          { 
            alertId: "AL-2404", 
            profile_image: "https://randomuser.me/api/portraits/women/60.jpg",
            visitor_name: "Ayesha Khan",
            visitor_initials: "AK",
            visitor_document: "P98765432",
            priority: "High", 
            summary: "Multiple security violations at main gate",
            location: "Main Entrance",
            gate: "Gate 2",
            time: "11:15 AM",
            date: "2026-03-04",
            status: "New"
          },
          { 
            alertId: "AL-2405", 
            profile_image: "https://randomuser.me/api/portraits/men/65.jpg",
            visitor_name: "Ali Raza",
            visitor_initials: "AR",
            visitor_document: "35203-8765432-0",
            priority: "Medium", 
            summary: "Attempted unauthorized access to server room",
            location: "Server Room",
            gate: "Gate 5",
            time: "02:10 PM",
            date: "2026-03-04",
            status: "Acknowledged"
          },
          { 
            alertId: "AL-2406", 
            profile_image: "https://randomuser.me/api/portraits/women/70.jpg",
            visitor_name: "Sadia Malik",
            visitor_initials: "SM",
            visitor_document: "35204-1234567-8",
            priority: "Low", 
            summary: "Banned due to repeated policy violations",
            location: "Lobby",
            gate: "Gate 1",
            time: "09:50 AM",
            date: "2026-03-04",
            status: "Resolved"
          },
          { 
            alertId: "AL-2407", 
            profile_image: "https://randomuser.me/api/portraits/men/75.jpg",
            visitor_name: "Hamza Sheikh",
            visitor_initials: "HS",
            visitor_document: "P54321678",
            priority: "High", 
            summary: "Unauthorized visit to restricted laboratory",
            location: "Restricted Lab",
            gate: "Gate 3",
            time: "01:30 PM",
            date: "2026-03-04",
            status: "Escalated"
          },
        ]}
      />

      {/* View Alert Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Alert Details: {selectedAlert?.alertId}
              <Badge variant={getPriorityColor(selectedAlert?.priority) as any}>
                {selectedAlert?.priority} Priority
              </Badge>
            </DialogTitle>
            <DialogDescription>
              Complete information about the flagged visitor alert
            </DialogDescription>
          </DialogHeader>
          
          {selectedAlert && (
            <div className="space-y-4">
              {/* Visitor Information */}
              <div className="flex items-start gap-4 p-4 bg-muted/50 rounded-lg">
                <img
                  src={selectedAlert.profile_image}
                  alt={selectedAlert.visitor_name}
                  className="h-16 w-16 rounded-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedAlert.visitor_name)}&background=random`;
                  }}
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{selectedAlert.visitor_name}</h3>
                  <p className="text-sm text-muted-foreground">ID: {selectedAlert.visitor_document}</p>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="outline">{selectedAlert.visitor_initials}</Badge>
                    <Badge variant={getStatusColor(selectedAlert.status) as any}>
                      {selectedAlert.status}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Alert Details Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Location</p>
                  <p className="text-sm">{selectedAlert.location}</p>
                  {selectedAlert.gate && (
                    <p className="text-xs text-muted-foreground">Gate: {selectedAlert.gate}</p>
                  )}
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Time</p>
                  <p className="text-sm">{selectedAlert.time}</p>
                  <p className="text-xs text-muted-foreground">{selectedAlert.date}</p>
                </div>
                <div className="col-span-2 space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Alert Summary</p>
                  <p className="text-sm p-3 bg-muted/30 rounded-lg">{selectedAlert.summary}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 pt-4 border-t">
                {selectedAlert.status === "New" && (
                  <>
                    <Button 
                      variant="outline"
                      onClick={() => {
                        // Handle acknowledge
                        setViewDialogOpen(false);
                        toast({
                          title: "Alert Acknowledged",
                          description: `Alert ${selectedAlert.alertId} has been acknowledged.`,
                        });
                      }}
                    >
                      Acknowledge
                    </Button>
                    <Button 
                      variant="destructive"
                      onClick={() => {
                        // Handle escalate
                        setViewDialogOpen(false);
                        toast({
                          title: "Alert Escalated",
                          description: `Alert ${selectedAlert.alertId} has been escalated.`,
                        });
                      }}
                    >
                      Escalate
                    </Button>
                  </>
                )}
                {selectedAlert.status === "Acknowledged" && (
                  <>
                    <Button 
                      variant="default"
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => {
                        // Handle resolve
                        setViewDialogOpen(false);
                        toast({
                          title: "Alert Resolved",
                          description: `Alert ${selectedAlert.alertId} has been resolved.`,
                        });
                      }}
                    >
                      Mark as Resolved
                    </Button>
                    <Button 
                      variant="destructive"
                      onClick={() => {
                        // Handle escalate
                        setViewDialogOpen(false);
                        toast({
                          title: "Alert Escalated",
                          description: `Alert ${selectedAlert.alertId} has been escalated.`,
                        });
                      }}
                    >
                      Escalate
                    </Button>
                  </>
                )}
                <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}