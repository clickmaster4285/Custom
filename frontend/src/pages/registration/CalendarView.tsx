import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ChevronLeft, ChevronRight, Check } from "lucide-react"
import { Link } from "react-router-dom"
import { ROUTES } from "@/routes/config"

const steps = [
  { number: 1, label: "Calendar Configuration" },
  { number: 2, label: "Calendar Event" },
  { number: 3, label: "Calendar Actions" },
]

export default function CalendarViewPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    // Step 1
    calendarViewType: "",
    calendarScope: "",
    timeZone: "",
    colorCoding: "",
    accessRole: "",
    // Step 2
    eventId: "G-214-M8",
    bookingId: "B-2025-12",
    visitorName: "Ali Hassan",
    visitorType: "",
    department: "Human Resources (HR)",
    hostName: "Syed Muhammad Ali",
    eventStartTime: "10:00 AM",
    eventEndTime: "11:00 AM",
    entryGate: "Gate 4",
    eventStatus: "",
    approvalStatus: "",
    securityLevel: "",
    escortAssigned: "yes",
  })

  const handleNext = () => {
    if (currentStep < 3) setCurrentStep(currentStep + 1)
  }

  const handlePrevious = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1)
  }

  return (
    <>
      {/* Breadcrumb */}
          <div className="mb-2">
            <nav className="text-sm text-muted-foreground">
              <Link to={ROUTES.DASHBOARD} className="hover:text-foreground">Home</Link>
              <span className="mx-2">/</span>
              <Link to={ROUTES.APPOINTMENT_SCHEDULING} className="hover:text-foreground">Appointment Scheduling</Link>
              <span className="mx-2">/</span>
              <span className="text-[#3b82f6]">Calendar View</span>
            </nav>
          </div>

          {/* Page Title */}
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-foreground">Calendar View</h1>
            <p className="text-sm text-muted-foreground">Check department wise and official wise calendar to search event for your visit.</p>
          </div>

          {/* Step Indicator */}
          <div className="flex items-center justify-center gap-4 mb-8">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      currentStep > step.number
                        ? "bg-[#3b82f6] text-white"
                        : currentStep === step.number
                        ? "bg-[#3b82f6] text-white"
                        : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {currentStep > step.number ? <Check size={16} /> : step.number}
                  </div>
                  <span
                    className={`text-sm whitespace-nowrap ${
                      currentStep >= step.number ? "text-[#3b82f6] font-medium" : "text-gray-500"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className="w-16 h-[2px] bg-gray-200 mx-4">
                    <div
                      className={`h-full bg-[#3b82f6] transition-all ${
                        currentStep > step.number ? "w-full" : "w-0"
                      }`}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            {currentStep === 1 && (
              <div>
                <h2 className="text-lg font-semibold mb-6">Calendar Configuration</h2>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Calendar View Type</label>
                    <Select value={formData.calendarViewType} onValueChange={(v) => setFormData({ ...formData, calendarViewType: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="day">Day View</SelectItem>
                        <SelectItem value="week">Week View</SelectItem>
                        <SelectItem value="month">Month View</SelectItem>
                        <SelectItem value="agenda">Agenda View</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Calendar Scope</label>
                    <Select value={formData.calendarScope} onValueChange={(v) => setFormData({ ...formData, calendarScope: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select scope" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="personal">Personal</SelectItem>
                        <SelectItem value="department">Department</SelectItem>
                        <SelectItem value="organization">Organization</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Time Zone</label>
                    <Select value={formData.timeZone} onValueChange={(v) => setFormData({ ...formData, timeZone: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select time zone" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pkt">PKT (Pakistan Standard Time)</SelectItem>
                        <SelectItem value="utc">UTC</SelectItem>
                        <SelectItem value="gmt">GMT</SelectItem>
                        <SelectItem value="est">EST (Eastern Standard Time)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Color Coding</label>
                    <Select value={formData.colorCoding} onValueChange={(v) => setFormData({ ...formData, colorCoding: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select color coding" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="status">By Status</SelectItem>
                        <SelectItem value="type">By Visit Type</SelectItem>
                        <SelectItem value="department">By Department</SelectItem>
                        <SelectItem value="priority">By Priority</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Access Role</label>
                    <Select value={formData.accessRole} onValueChange={(v) => setFormData({ ...formData, accessRole: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select who can access" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin Only</SelectItem>
                        <SelectItem value="manager">Managers</SelectItem>
                        <SelectItem value="all">All Users</SelectItem>
                        <SelectItem value="custom">Custom Roles</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div>
                <h2 className="text-lg font-semibold mb-6">Calendar Event</h2>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Event ID</label>
                    <Input
                      value={formData.eventId}
                      onChange={(e) => setFormData({ ...formData, eventId: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Booking ID</label>
                    <Input
                      value={formData.bookingId}
                      onChange={(e) => setFormData({ ...formData, bookingId: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Visitor Name</label>
                    <Input
                      value={formData.visitorName}
                      onChange={(e) => setFormData({ ...formData, visitorName: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Visitor Type</label>
                    <Select value={formData.visitorType} onValueChange={(v) => setFormData({ ...formData, visitorType: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Official" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="official">Official</SelectItem>
                        <SelectItem value="vendor">Vendor</SelectItem>
                        <SelectItem value="contractor">Contractor</SelectItem>
                        <SelectItem value="interview">Interview</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Department</label>
                    <Input
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Host Name</label>
                    <Input
                      value={formData.hostName}
                      onChange={(e) => setFormData({ ...formData, hostName: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Event Start Time</label>
                    <Input
                      value={formData.eventStartTime}
                      onChange={(e) => setFormData({ ...formData, eventStartTime: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Event End Time</label>
                    <Input
                      value={formData.eventEndTime}
                      onChange={(e) => setFormData({ ...formData, eventEndTime: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Entry Gate</label>
                    <Input
                      value={formData.entryGate}
                      onChange={(e) => setFormData({ ...formData, entryGate: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Event Status</label>
                    <Input
                      placeholder="Scheduled"
                      value={formData.eventStatus}
                      onChange={(e) => setFormData({ ...formData, eventStatus: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Approval Status</label>
                    <Input
                      placeholder="Approved"
                      value={formData.approvalStatus}
                      onChange={(e) => setFormData({ ...formData, approvalStatus: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Security Level</label>
                    <Input
                      placeholder="Standard"
                      value={formData.securityLevel}
                      onChange={(e) => setFormData({ ...formData, securityLevel: e.target.value })}
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium mb-2">Escort Assigned</label>
                    <div className="flex items-center gap-6">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="escortAssigned"
                          checked={formData.escortAssigned === "yes"}
                          onChange={() => setFormData({ ...formData, escortAssigned: "yes" })}
                          className="w-4 h-4 text-[#3b82f6]"
                        />
                        <span className="text-sm">Yes</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="escortAssigned"
                          checked={formData.escortAssigned === "no"}
                          onChange={() => setFormData({ ...formData, escortAssigned: "no" })}
                          className="w-4 h-4 text-[#3b82f6]"
                        />
                        <span className="text-sm">No</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div>
                <h2 className="text-lg font-semibold mb-6">Calendar Actions</h2>
                <div className="text-center py-12">
                  <p className="text-muted-foreground">Calendar actions configuration will be available here.</p>
                </div>
              </div>
            )}
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-between mt-6">
            <div className="flex items-center gap-3">
              <Button variant="outline" className="bg-transparent">Cancel</Button>
              <Button variant="link" className="text-[#3b82f6]">Save & Continue</Button>
            </div>
            <div className="flex items-center gap-3">
              {currentStep > 1 && (
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  className="bg-[#3b82f6] text-white hover:bg-[#2563eb] border-0"
                >
                  <ChevronLeft size={16} className="mr-1" />
                  Previous
                </Button>
              )}
              <Button
                onClick={handleNext}
                className="bg-[#3b82f6] text-white hover:bg-[#2563eb]"
              >
                {currentStep === 3 ? "Next Step" : "Next"}
                <ChevronRight size={16} className="ml-1" />
              </Button>
            </div>
          </div>
    </>
  )
}
