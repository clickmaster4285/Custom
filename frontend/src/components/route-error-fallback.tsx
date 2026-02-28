import { useRouteError, isRouteErrorResponse, Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"
import { ROUTES } from "@/routes/config"

export function RouteErrorFallback() {
  const error = useRouteError()
  let message: string
  if (isRouteErrorResponse(error)) {
    message =
      error.statusText ||
      (error.data as { message?: string })?.message ||
      "Something went wrong"
  } else if (error instanceof Error) {
    const msg = error.message || ""
    if (
      msg.includes("Failed to fetch dynamically imported module") ||
      msg.includes("Loading chunk")
    )
      message =
        "This page failed to load. Check your network connection and try again, or refresh the page."
    else message = msg
  } else {
    message = "Failed to load this page. You can try again or go back."
  }

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 p-6">
      <div className="flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-destructive">
        <AlertCircle className="h-5 w-5 shrink-0" />
        <span className="font-medium">Unexpected error</span>
      </div>
      <p className="max-w-md text-center text-sm text-muted-foreground">
        {message}
      </p>
      <div className="flex gap-2">
        <Button variant="outline" asChild>
          <Link to="..">Go back</Link>
        </Button>
        <Button asChild>
          <Link to={ROUTES.DASHBOARD}>Dashboard</Link>
        </Button>
      </div>
    </div>
  )
}
