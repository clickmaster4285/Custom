import { useEffect, useState } from "react"
import { Clock, LogIn, UserCheck, Calendar, Camera } from "lucide-react"
import { ModulePageLayout } from "@/components/dashboard/module-page-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CameraCapture } from "@/components/camera-capture"
import { getStoredUser } from "@/lib/auth"
import { fetchStaff, type StaffRecord } from "@/lib/staff-api"
import {
  fetchAttendance,
  markCheckIn,
  markCheckOut,
  getTodayRecordForUser,
  type AttendanceRecord,
} from "@/lib/attendance-api"

function formatTime(iso: string | null): string {
  if (!iso) return "—"
  try {
    const d = new Date(iso)
    return d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
  } catch {
    return "—"
  }
}

function statusFromRecord(r: AttendanceRecord): string {
  if (r.check_in && r.check_out) return "Present"
  if (r.check_in) return "Present"
  return "Absent"
}

type MarkType = "check_in" | "check_out"

export default function AttendancePage() {
  const currentUser = getStoredUser()
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([])
  const [staff, setStaff] = useState<StaffRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [markType, setMarkType] = useState<MarkType>("check_in")
  const [selectedUserId, setSelectedUserId] = useState<string>(() =>
    String(getStoredUser()?.id ?? "")
  )
  const [cameraOpen, setCameraOpen] = useState(false)
  const [markError, setMarkError] = useState<string | null>(null)
  const [marking, setMarking] = useState(false)

  const loadData = () => {
    setLoading(true)
    Promise.all([fetchAttendance(), fetchStaff()])
      .then(([attData, staffData]) => {
        setAttendance(attData)
        setStaff(staffData)
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load"))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadData()
  }, [])

  const presentToday = attendance.filter((r) => r.check_in && r.date === new Date().toISOString().slice(0, 10)).length

  const userIdNum = selectedUserId ? Number(selectedUserId) : currentUser?.id ?? 0
  const todayRecord = userIdNum ? getTodayRecordForUser(attendance, userIdNum) : undefined
  const canCheckOut = markType === "check_out" && todayRecord

  const handleMarkWithPhoto = (file: File) => {
    setMarkError(null)
    setMarking(true)
    if (markType === "check_in") {
      markCheckIn(userIdNum, file)
        .then(() => {
          setCameraOpen(false)
          loadData()
        })
        .catch((err) => setMarkError(err instanceof Error ? err.message : "Failed to mark check-in"))
        .finally(() => setMarking(false))
    } else {
      if (!todayRecord) {
        setMarkError("No check-in record found for today. Mark check-in first.")
        setMarking(false)
        return
      }
      markCheckOut(todayRecord.id, file)
        .then(() => {
          setCameraOpen(false)
          loadData()
        })
        .catch((err) => setMarkError(err instanceof Error ? err.message : "Failed to mark check-out"))
        .finally(() => setMarking(false))
    }
  }

  const staffOptions = [
    ...(currentUser ? [{ id: currentUser.id, label: `Me (${currentUser.username})` }] : []),
    ...staff
      .filter((s) => s.user_id && s.user_id !== currentUser?.id)
      .map((s) => ({ id: s.user_id!, label: `${s.full_name || s.user} — ${s.department}` })),
  ]


  return (
    <ModulePageLayout
      title="Attendance"
      description="Track check-in/check-out and daily attendance records."
      breadcrumbs={[{ label: "HR" }, { label: "Attendance" }]}
    >
      <div className="grid gap-6">
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Present Today
              </CardTitle>
              <UserCheck className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{presentToday}</div>
              <p className="text-xs text-muted-foreground mt-1">Checked in today</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Records
              </CardTitle>
              <Clock className="h-4 w-4 text-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{attendance.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Attendance entries</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Late Today
              </CardTitle>
              <LogIn className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">—</div>
              <p className="text-xs text-muted-foreground mt-1">After 09:15</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                This Month
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{attendance.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Records</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Mark attendance (camera)</CardTitle>
            <CardDescription>
              Select staff, choose check-in or check-out, then capture photo with camera to record attendance.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap items-end gap-4">
              <div className="space-y-2">
                <Label>Staff</Label>
                <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                  <SelectTrigger className="w-56">
                    <SelectValue placeholder="Select staff" />
                  </SelectTrigger>
                  <SelectContent>
                    {staffOptions.map((opt) => (
                      <SelectItem key={opt.id} value={String(opt.id)}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={markType === "check_in" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setMarkType("check_in")}
                  >
                    Check-in
                  </Button>
                  <Button
                    type="button"
                    variant={markType === "check_out" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setMarkType("check_out")}
                  >
                    Check-out
                  </Button>
                </div>
              </div>
              <Button
                className="bg-[#3b82f6] hover:bg-[#2563eb] text-white"
                disabled={!userIdNum || (markType === "check_out" && !todayRecord)}
                onClick={() => {
                  setMarkError(null)
                  setCameraOpen(true)
                }}
              >
                <Camera className="h-4 w-4 mr-2" />
                Open camera & mark
              </Button>
            </div>
            {markType === "check_out" && !todayRecord && selectedUserId && (
              <p className="text-sm text-amber-600">No check-in found for today. Mark check-in first.</p>
            )}
            <Dialog open={cameraOpen} onOpenChange={setCameraOpen}>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>
                    {markType === "check_in" ? "Check-in" : "Check-out"} — capture photo
                  </DialogTitle>
                </DialogHeader>
                {markError && (
                  <p className="text-sm text-destructive">{markError}</p>
                )}
                <CameraCapture
                  title="Capture attendance photo"
                  description="Position the staff member in frame and capture. The photo will be saved with the attendance record."
                  onCapture={handleMarkWithPhoto}
                  onCancel={() => setCameraOpen(false)}
                />
                {marking && <p className="text-sm text-muted-foreground">Saving…</p>}
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Today&apos;s Attendance</CardTitle>
              <CardDescription>Check-in and check-out log for current day</CardDescription>
            </div>
            <div className="flex gap-2">
              <Input type="date" className="w-40" defaultValue={new Date().toISOString().slice(0, 10)} />
              <Button variant="outline">Export</Button>
            </div>
          </CardHeader>
          <CardContent>
            {error && (
              <p className="text-sm text-destructive mb-4">{error}</p>
            )}
            {loading ? (
              <p className="text-sm text-muted-foreground py-8">Loading attendance…</p>
            ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Username</TableHead>
                  <TableHead>Check-in</TableHead>
                  <TableHead>Check-out</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attendance.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      No attendance records yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  attendance.map((row) => {
                    const status = statusFromRecord(row)
                    return (
                      <TableRow key={row.id}>
                        <TableCell className="font-mono text-muted-foreground">{row.date}</TableCell>
                        <TableCell className="font-medium">{row.username}</TableCell>
                        <TableCell>{formatTime(row.check_in)}</TableCell>
                        <TableCell>{formatTime(row.check_out)}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              status === "Present" ? "default" : "outline"
                            }
                          >
                            {status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </ModulePageLayout>
  )
}
