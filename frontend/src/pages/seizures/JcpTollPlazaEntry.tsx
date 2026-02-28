"use client"

import { useState, useEffect } from "react"
import { Car, Camera, Plus, X } from "lucide-react"
import { ModulePageLayout } from "@/components/dashboard/module-page-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"

export default function JcpTollPlazaEntryPage() {
  const [entries, setEntries] = useState<any[]>([])
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({ time: "", plate: "", lane: "Lane 1", status: "OK" })

  // Load data from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("anprEntries")
    if (stored) setEntries(JSON.parse(stored))
  }, [])

  // Save to localStorage whenever entries change
  useEffect(() => {
    localStorage.setItem("anprEntries", JSON.stringify(entries))
  }, [entries])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setEntries([formData, ...entries])
    setFormData({ time: "", plate: "", lane: "Lane 1", status: "OK" })
    setShowModal(false)
  }

  return (
    <ModulePageLayout
      title="JCP/Toll Plaza Entry (ANPR)"
      description="ANPR-based vehicle entry at JCP and toll plazas."
      breadcrumbs={[{ label: "WMS" }, { label: "JCP/Toll Plaza Entry (ANPR)" }]}
    >
      <div className="grid gap-6">
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Entries Today</CardTitle>
              <Car className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{entries.length}</div>
              <p className="text-xs text-muted-foreground mt-1">ANPR captures</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Cameras Active</CardTitle>
              <Camera className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8</div>
              <p className="text-xs text-muted-foreground mt-1">Lanes</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{entries.filter(e => e.status === "Flagged").length}</div>
              <p className="text-xs text-muted-foreground mt-1">Flagged vehicles</p>
            </CardContent>
          </Card>
        </div>

        {/* ANPR Log */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>ANPR Log</CardTitle>
              <CardDescription>Recent vehicle entries and captures</CardDescription>
            </div>
            <Button
              className="bg-[#3b82f6] hover:bg-[#2563eb] text-white"
              onClick={() => setShowModal(true)}
            >
              <Plus className="h-4 w-4 mr-2" /> Add Entry
            </Button>
          </CardHeader>

          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Time</TableHead>
                  <TableHead>Plate</TableHead>
                  <TableHead>Lane</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.map((row, i) => (
                  <TableRow key={i}>
                    <TableCell>{row.time}</TableCell>
                    <TableCell className="font-mono font-medium">{row.plate}</TableCell>
                    <TableCell>{row.lane}</TableCell>
                    <TableCell>
                      <Badge variant={row.status === "Flagged" ? "destructive" : "default"}>
                        {row.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" className="text-[#3b82f6]">
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
            <button
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
              onClick={() => setShowModal(false)}
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-lg font-semibold mb-4">Add ANPR Entry</h2>
            <form onSubmit={handleFormSubmit} className="space-y-3">
              <Input
                placeholder="Time (HH:MM)"
                name="time"
                value={formData.time}
                onChange={handleInputChange}
                required
              />
              <Input
                placeholder="Plate Number"
                name="plate"
                value={formData.plate}
                onChange={handleInputChange}
                required
              />
              <select
                name="lane"
                value={formData.lane}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-2 py-1"
              >
                <option>Lane 1</option>
                <option>Lane 2</option>
                <option>Lane 3</option>
                <option>Lane 4</option>
              </select>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-2 py-1"
              >
                <option>OK</option>
                <option>Flagged</option>
              </select>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white w-full">
                Save Entry
              </Button>
            </form>
          </div>
        </div>
      )}
    </ModulePageLayout>
  )
}