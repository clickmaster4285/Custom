import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Link } from "react-router-dom"
import { ROUTES } from "@/routes/config"

type RegistrationType = "pre" | "walk-in"

type CalendarEvent = {
  id: string
  visitorName: string
  type: RegistrationType
  date: string // YYYY-MM-DD
  time: string
  host: string
  department: string
  status: "Scheduled" | "Checked-In" | "Pending"
}

// Frontend-only dummy data (no backend integration)
const DUMMY_EVENTS: CalendarEvent[] = [
  {
    id: "PR-1001",
    visitorName: "Ali Hassan",
    type: "pre",
    date: "2026-02-10",
    time: "10:00 AM",
    host: "Syed Muhammad Ali",
    department: "HR",
    status: "Scheduled",
  },
  {
    id: "WR-2001",
    visitorName: "Fatima Noor",
    type: "walk-in",
    date: "2026-02-10",
    time: "11:30 AM",
    host: "Ahmad Raza",
    department: "Operations",
    status: "Checked-In",
  },
  {
    id: "PR-1002",
    visitorName: "Hamza Khan",
    type: "pre",
    date: "2026-02-12",
    time: "02:15 PM",
    host: "Usman Tariq",
    department: "Finance",
    status: "Pending",
  },
  {
    id: "WR-2002",
    visitorName: "Sara Iqbal",
    type: "walk-in",
    date: "2026-02-15",
    time: "09:20 AM",
    host: "Bilal Saeed",
    department: "Admin",
    status: "Scheduled",
  },
  {
    id: "PR-1003",
    visitorName: "Zain Ali",
    type: "pre",
    date: "2026-02-18",
    time: "01:00 PM",
    host: "Hira Qureshi",
    department: "IT",
    status: "Scheduled",
  },
  {
    id: "WR-2003",
    visitorName: "Ayesha Malik",
    type: "walk-in",
    date: "2026-02-21",
    time: "03:45 PM",
    host: "Kashif Mehmood",
    department: "Security",
    status: "Pending",
  },
]

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

function toDateKey(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

export default function CalendarViewPage() {
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date(2026, 1, 1)) // Feb 2026
  const [selectedDate, setSelectedDate] = useState<string>("2026-02-10")

  const eventsByDate = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>()
    for (const event of DUMMY_EVENTS) {
      const bucket = map.get(event.date) ?? []
      bucket.push(event)
      map.set(event.date, bucket)
    }
    return map
  }, [])

  const monthLabel = currentMonth.toLocaleString("en-US", {
    month: "long",
    year: "numeric",
  })

  const calendarCells = useMemo(() => {
    const startOfMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      1
    )
    const startDay = startOfMonth.getDay()
    const gridStart = new Date(startOfMonth)
    gridStart.setDate(startOfMonth.getDate() - startDay)

    return Array.from({ length: 42 }, (_, i) => {
      const d = new Date(gridStart)
      d.setDate(gridStart.getDate() + i)
      return d
    })
  }, [currentMonth])

  const selectedEvents = eventsByDate.get(selectedDate) ?? []

  const prevMonth = () =>
    setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
  const nextMonth = () =>
    setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))

  return (
    <>
      <div className="mb-2">
        <nav className="text-sm text-muted-foreground">
          <Link to={ROUTES.DASHBOARD} className="hover:text-foreground">Home</Link>
          <span className="mx-2">/</span>
          <Link to={ROUTES.PRE_REGISTRATION} className="hover:text-foreground">Visitor Registration</Link>
          <span className="mx-2">/</span>
          <span className="text-[#3b82f6]">Calendar View</span>
        </nav>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground">Calendar View</h1>
        <p className="text-sm text-muted-foreground">
          Frontend calendar showing Pre-Registration and Walk-In Registration with dummy data.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <Button variant="outline" onClick={prevMonth}>
              <ChevronLeft size={16} className="mr-1" />
              Previous
            </Button>
            <h2 className="text-lg font-semibold">{monthLabel}</h2>
            <Button variant="outline" onClick={nextMonth}>
              Next
              <ChevronRight size={16} className="ml-1" />
            </Button>
          </div>

          <div className="grid grid-cols-7 gap-2 mb-2">
            {DAYS.map((day) => (
              <div key={day} className="text-xs font-semibold text-muted-foreground text-center py-2">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {calendarCells.map((dateObj) => {
              const dateKey = toDateKey(dateObj)
              const dayEvents = eventsByDate.get(dateKey) ?? []
              const isCurrentMonth = dateObj.getMonth() === currentMonth.getMonth()
              const isSelected = selectedDate === dateKey

              return (
                <button
                  key={dateKey}
                  type="button"
                  onClick={() => setSelectedDate(dateKey)}
                  className={cn(
                    "min-h-[92px] border rounded-md p-2 text-left transition",
                    isSelected ? "border-[#3b82f6] bg-[#3b82f6]/5" : "border-gray-200 hover:border-[#3b82f6]/50",
                    !isCurrentMonth && "opacity-45"
                  )}
                >
                  <div className="text-sm font-medium mb-1">{dateObj.getDate()}</div>
                  <div className="space-y-1">
                    {dayEvents.slice(0, 2).map((event) => (
                      <div
                        key={event.id}
                        className={cn(
                          "text-[11px] px-1.5 py-0.5 rounded truncate",
                          event.type === "pre"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-emerald-100 text-emerald-700"
                        )}
                        title={`${event.visitorName} (${event.time})`}
                      >
                        {event.type === "pre" ? "PR" : "WI"} - {event.visitorName}
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <div className="text-[10px] text-muted-foreground">
                        +{dayEvents.length - 2} more
                      </div>
                    )}
                  </div>
                </button>
              )
            })}
          </div>

          <div className="flex items-center gap-4 mt-4 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-blue-100 border border-blue-200" />
              <span>Pre-Registration</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-emerald-100 border border-emerald-200" />
              <span>Walk-In Registration</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="text-base font-semibold mb-1">Selected Date</h3>
          <p className="text-sm text-muted-foreground mb-4">{selectedDate}</p>

          {selectedEvents.length === 0 ? (
            <p className="text-sm text-muted-foreground">No events on this date.</p>
          ) : (
            <div className="space-y-3">
              {selectedEvents.map((event) => (
                <div key={event.id} className="border rounded-md p-3">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium text-sm">{event.visitorName}</p>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[11px]",
                        event.type === "pre"
                          ? "border-blue-200 text-blue-700"
                          : "border-emerald-200 text-emerald-700"
                      )}
                    >
                      {event.type === "pre" ? "Pre-Registration" : "Walk-In"}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>ID: {event.id}</p>
                    <p>Time: {event.time}</p>
                    <p>Host: {event.host}</p>
                    <p>Department: {event.department}</p>
                    <p>Status: {event.status}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
