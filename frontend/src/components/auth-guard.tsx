import React, { useEffect, useState } from "react"
import { useLocation, useNavigate, Outlet } from "react-router-dom"
import { Shield } from "lucide-react"
import { Spinner } from "@/components/ui/spinner"
import { Toaster } from "@/components/ui/toaster"
import { AUTH_SESSION_KEY } from "@/lib/auth"
import { ROUTES, isLoginRoute } from "@/routes/config"

export function AuthGuard() {
  const location = useLocation()
  const navigate = useNavigate()
  const [status, setStatus] = useState<"checking" | "allowed" | "redirect">("checking")

  useEffect(() => {
    const auth = typeof window !== "undefined" ? sessionStorage.getItem(AUTH_SESSION_KEY) === "true" : false
    const isLoginPage = isLoginRoute(location.pathname)

    if (!isLoginPage && !auth) {
      navigate(ROUTES.LOGIN, { replace: true })
      setStatus("redirect")
      return
    }
    if (isLoginPage && auth) {
      navigate(ROUTES.DASHBOARD, { replace: true })
      setStatus("redirect")
      return
    }
    setStatus("allowed")
  }, [location.pathname, navigate])

  if (status !== "allowed") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#f8fafc]">
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#3b82f6] text-white shadow-lg">
            <Shield className="h-7 w-7" />
          </div>
          <Spinner className="h-8 w-8 text-[#3b82f6]" />
          <p className="text-sm text-muted-foreground">Loading…</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <Outlet />
      <Toaster />
    </>
  )
}
