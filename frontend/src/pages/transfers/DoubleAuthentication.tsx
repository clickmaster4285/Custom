
import { Shield, UserCheck } from "lucide-react"
import { ModulePageLayout } from "@/components/dashboard/module-page-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

export default function DoubleAuthenticationPage() {
  return (
    <ModulePageLayout
      title="Double Authentication"
      description="Two-factor and dual-approval for transfers and handovers."
      breadcrumbs={[{ label: "WMS" }, { label: "Double Authentication" }]}
    >
      <div className="grid gap-6">
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending 2FA</CardTitle>
              <Shield className="h-4 w-4 text-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">4</div>
              <p className="text-xs text-muted-foreground mt-1">Awaiting second approval</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Completed Today</CardTitle>
              <UserCheck className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground mt-1">Authenticated</p>
            </CardContent>
          </Card>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Authentication Log</CardTitle>
            <CardDescription>Dual-approval and 2FA events</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Transaction</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>First Auth</TableHead>
                  <TableHead>Second Auth</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  { tx: "TR-2024-0841", type: "Transfer", first: "2024-02-04 10:00", second: "—", status: "Pending" },
                ].map((row) => (
                  <TableRow key={row.tx}>
                    <TableCell className="font-medium">{row.tx}</TableCell>
                    <TableCell>{row.type}</TableCell>
                    <TableCell>{row.first}</TableCell>
                    <TableCell>{row.second}</TableCell>
                    <TableCell><Badge variant="secondary">{row.status}</Badge></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </ModulePageLayout>
  )
}
