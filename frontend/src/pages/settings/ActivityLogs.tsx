import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { FileText, Loader2, ChevronLeft, ChevronRight } from "lucide-react"
import { ModulePageLayout } from "@/components/dashboard/module-page-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { fetchActivityLogs, type ActivityLogRecord } from "@/lib/logs-api"

const PAGE_SIZE_OPTIONS = [20, 50, 100] as const
const DEFAULT_PAGE_SIZE = 20

function formatTime(s: string | null | undefined) {
  if (!s) return "—"
  try {
    return new Date(s).toLocaleString(undefined, { dateStyle: "short", timeStyle: "medium" })
  } catch {
    return s
  }
}

function cell(value: string | null | undefined) {
  return value ?? "—"
}

export default function ActivityLogsPage() {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState<number>(DEFAULT_PAGE_SIZE)
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handlePageSizeChange = (value: string) => {
    const next = Number(value) as (typeof PAGE_SIZE_OPTIONS)[number]
    setPageSize(next)
    setPage(1)
  }

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["activity-logs", page, pageSize],
    queryFn: () => fetchActivityLogs({ page, page_size: pageSize }),
  })

  const logs = data?.results ?? []
  const count = data?.count ?? 0
  const hasNext = !!data?.next
  const hasPrev = page > 1
  const from = count === 0 ? 0 : (page - 1) * pageSize + 1
  const to = Math.min(page * pageSize, count)

  return (
    <ModulePageLayout
      title="Logs"
      description="User activity logs — actions, IP, device, and time. Sorted by newest first."
      breadcrumbs={[{ label: "System configuration" }, { label: "Logs" }]}
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-[#3b82f6]" />
            Activity logs
          </CardTitle>
          <CardDescription>
            All user activity recorded by the system. Requires authentication to view.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-[#3b82f6]" />
            </div>
          )}
          {isError && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error instanceof Error ? error.message : "Failed to load logs"}
            </div>
          )}
          {!isLoading && !isError && (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">
                        <span className="sr-only">Select</span>
                      </TableHead>
                      <TableHead className="uppercase text-xs font-semibold">User</TableHead>
                      <TableHead className="uppercase text-xs font-semibold">IP Address</TableHead>
                      <TableHead className="uppercase text-xs font-semibold">Country</TableHead>
                      <TableHead className="uppercase text-xs font-semibold">City</TableHead>
                      <TableHead className="uppercase text-xs font-semibold">Device</TableHead>
                      <TableHead className="uppercase text-xs font-semibold">OS</TableHead>
                      <TableHead className="uppercase text-xs font-semibold">Browser</TableHead>
                      <TableHead className="uppercase text-xs font-semibold">Action</TableHead>
                      <TableHead className="uppercase text-xs font-semibold w-[160px]">Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={10} className="text-center text-muted-foreground py-8">
                          No logs yet. Activity is recorded when authenticated users browse the app.
                        </TableCell>
                      </TableRow>
                    ) : (
                      (logs as ActivityLogRecord[]).map((log) => (
                        <TableRow key={log.id}>
                          <TableCell className="w-[50px]">
                            <Checkbox
                              checked={selectedIds.has(log.id)}
                              onCheckedChange={() => toggleSelect(log.id)}
                              aria-label={`Select log ${log.id}`}
                            />
                          </TableCell>
                          <TableCell>{cell(log.username)}</TableCell>
                          <TableCell className="text-muted-foreground">{cell(log.ip_address)}</TableCell>
                          <TableCell className="text-muted-foreground">{cell(log.country)}</TableCell>
                          <TableCell className="text-muted-foreground">{cell(log.city)}</TableCell>
                          <TableCell className="text-muted-foreground">{cell(log.device)}</TableCell>
                          <TableCell className="text-muted-foreground">{cell(log.os)}</TableCell>
                          <TableCell className="text-muted-foreground">{cell(log.browser)}</TableCell>
                          <TableCell className="font-mono text-xs max-w-[220px] truncate" title={log.action}>
                            {cell(log.action)}
                          </TableCell>
                          <TableCell className="whitespace-nowrap text-muted-foreground">
                            {formatTime(log.time)}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
              {count > 0 && (
                <div className="flex flex-wrap items-center justify-between gap-4 mt-4">
                  <div className="flex items-center gap-4">
                    <p className="text-sm text-muted-foreground">
                      Showing {from}–{to} of {count}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground whitespace-nowrap">Rows per page</span>
                      <Select
                        value={String(pageSize)}
                        onValueChange={handlePageSizeChange}
                      >
                        <SelectTrigger className="w-[72px]" size="sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {PAGE_SIZE_OPTIONS.map((size) => (
                            <SelectItem key={size} value={String(size)}>
                              {size}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={!hasPrev}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => p + 1)}
                      disabled={!hasNext}
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </ModulePageLayout>
  )
}
