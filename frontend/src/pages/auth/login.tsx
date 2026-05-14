import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  Shield,
  Lock,
  User,
  Eye,
  EyeOff,
  Info,
  CheckCircle2,
  Download,
  Smartphone,
  Apple,
  ExternalLink,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { setAuthenticatedWithToken } from "@/lib/auth"
import { login } from "@/lib/auth-api"
import { ROUTES } from "@/routes/config"

const ANDROID_APK_HREF =
  import.meta.env.VITE_ANDROID_APK_URL?.trim() || "/pakistan-customs-portal.apk"
const ANDROID_APK_FILENAME = "Pakistan-Customs-Portal.apk"
const IOS_APP_STORE_URL = import.meta.env.VITE_IOS_APP_STORE_URL?.trim() ?? ""

export default function LoginPage() {
  const navigate = useNavigate()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)
    try {
      const { token, user } = await login(username.trim(), password)
      setAuthenticatedWithToken(token, user)
      navigate(ROUTES.DASHBOARD, { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid username or password.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen overflow-hidden bg-[#f0f4f8]">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(to right, #0f172a 1px, transparent 1px),
            linear-gradient(to bottom, #0f172a 1px, transparent 1px)`,
          backgroundSize: "32px 32px",
        }}
      />

      <div className="relative hidden lg:flex lg:w-[48%] xl:w-[52%] flex-col justify-between bg-gradient-to-br from-[#0f172a] via-[#1e3a5f] to-[#1d4ed8] p-12 text-white shadow-2xl">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -left-24 -top-24 h-80 w-80 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-[#3b82f6]/20 blur-3xl" />
          <div className="absolute right-1/2 top-1/2 h-64 w-64 -translate-y-1/2 rounded-full bg-white/5 blur-2xl" />
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 shadow-lg backdrop-blur-sm ring-1 ring-white/20">
            <Shield className="h-8 w-8" strokeWidth={2} />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight">PAKISTAN CUSTOMS</span>
            <p className="text-xs font-medium text-white/70 uppercase tracking-widest mt-0.5">
              Government of Pakistan
            </p>
          </div>
        </div>

        <div className="relative z-10 space-y-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#60a5fa] mb-2">
              World&apos;s Leading AI Analytic System
            </p>
            <h1 className="text-4xl xl:text-5xl font-bold leading-[1.1] tracking-tight">
             TekEye Secure Access Portal
            </h1>
            <div className="mt-4 h-1 w-20 rounded-full bg-[#3b82f6]" />
          </div>
          <p className="max-w-md text-lg leading-relaxed text-white/90">
            Sign in to access the integrated customs management system — visitor
            management, warehouse, AI analytics, and more.
          </p>
          <ul className="space-y-3">
            {["VMS", "WMS", "AI Analytics", "HR & System Config"].map((item) => (
              <li key={item} className="flex items-center gap-3 text-white/90">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-[#60a5fa]" />
                <span className="font-medium">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative z-10 max-w-sm space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-white/70">
            Install on your phone
          </p>
          <div className="flex flex-col gap-2">
            <a
              href={ANDROID_APK_HREF}
              download={ANDROID_APK_FILENAME}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/10 px-4 py-3 text-sm font-semibold text-white shadow-lg backdrop-blur-sm transition-colors hover:bg-white/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              <Download className="h-4 w-4 shrink-0" aria-hidden />
              Android — download APK
            </a>
            {IOS_APP_STORE_URL ? (
              <a
                href={IOS_APP_STORE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/10 px-4 py-3 text-sm font-semibold text-white shadow-lg backdrop-blur-sm transition-colors hover:bg-white/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                <Apple className="h-4 w-4 shrink-0" aria-hidden />
                iPhone / iPad — App Store
                <ExternalLink className="h-3.5 w-3.5 shrink-0 opacity-80" aria-hidden />
              </a>
            ) : (
              <div className="rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-sm leading-snug text-white/90 backdrop-blur-sm">
                <p className="flex items-center gap-2 font-semibold text-white">
                  <Apple className="h-4 w-4 shrink-0" aria-hidden />
                  iPhone / iPad — web app
                </p>
                <p className="mt-2 text-xs text-white/70">
                  Apple does not allow installing an app file from a website like Android. Open this
                  portal in <span className="font-semibold text-white/90">Safari</span>, tap{" "}
                  <span className="font-semibold text-white/90">Share</span>, then{" "}
                  <span className="font-semibold text-white/90">Add to Home Screen</span> to install
                  it like a native app.
                </p>
              </div>
            )}
          </div>
        </div>

        <p className="relative z-10 text-sm font-medium text-white/60">
          © Pakistan Customs · Authorized personnel only
        </p>
      </div>

      <div className="relative flex flex-1 items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-[420px]">
          <div className="mb-10 flex flex-wrap items-center gap-2 lg:hidden">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#1d4ed8] text-white shadow-lg shadow-[#3b82f6]/30">
                <Shield className="h-6 w-6" strokeWidth={2} />
              </div>
              <div className="min-w-0">
                <span className="text-lg font-bold text-foreground">Pakistan Customs</span>
                <p className="text-xs font-medium text-[#3b82f6] uppercase tracking-wider">
                  World&apos;s Leading AI Analytic System
                </p>
              </div>
            </div>
            <div className="ml-auto flex shrink-0 gap-1.5">
              <Button variant="outline" size="sm" className="gap-1.5 border-[#1d4ed8]/30 text-[#1d4ed8]" asChild>
                <a href={ANDROID_APK_HREF} download={ANDROID_APK_FILENAME} aria-label="Download Android APK">
                  <Download className="h-4 w-4" aria-hidden />
                  APK
                </a>
              </Button>
              {IOS_APP_STORE_URL ? (
                <Button variant="outline" size="sm" className="gap-1.5 border-[#1d4ed8]/30 text-[#1d4ed8]" asChild>
                  <a
                    href={IOS_APP_STORE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Open in App Store"
                  >
                    <Apple className="h-4 w-4" aria-hidden />
                    iOS
                  </a>
                </Button>
              ) : (
                <Button variant="outline" size="sm" className="gap-1.5 border-[#1d4ed8]/30 text-[#1d4ed8]" asChild>
                  <a href="#install-app" aria-label="iPhone install instructions">
                    <Apple className="h-4 w-4" aria-hidden />
                    iOS
                  </a>
                </Button>
              )}
            </div>
          </div>

          <Card className="border-border/80 bg-card/95 shadow-xl shadow-black/5 backdrop-blur-sm">
            <CardHeader className="space-y-2 pb-6 pt-8 sm:pt-10">
              <CardTitle className="text-2xl font-bold tracking-tight">
                Welcome back
              </CardTitle>
              <CardDescription className="text-base text-muted-foreground">
                Sign in with your Pakistan Customs credentials
              </CardDescription>
              <div id="install-app" className="scroll-mt-24 space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Mobile app
                </p>
                <div className="flex flex-col gap-2 rounded-lg border border-dashed border-border bg-muted/30 p-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-2.5 sm:items-center">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-[#1d4ed8]/10 text-[#1d4ed8]">
                      <Smartphone className="h-4 w-4" aria-hidden />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground">Android</p>
                      <p className="text-xs text-muted-foreground">
                        Download the APK file and open it to install (allow unknown sources if asked).
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="w-full shrink-0 gap-2 sm:w-auto" asChild>
                    <a href={ANDROID_APK_HREF} download={ANDROID_APK_FILENAME}>
                      <Download className="h-4 w-4" aria-hidden />
                      Download APK
                    </a>
                  </Button>
                </div>
                <div className="flex flex-col gap-2 rounded-lg border border-dashed border-border bg-muted/30 p-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-2.5 sm:items-center">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-[#1d4ed8]/10 text-[#1d4ed8]">
                      <Apple className="h-4 w-4" aria-hidden />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground">iPhone / iPad</p>
                      {IOS_APP_STORE_URL ? (
                        <p className="text-xs text-muted-foreground">
                          Get the official app from the App Store (same as tapping &quot;Get&quot; in the
                          store).
                        </p>
                      ) : (
                        <p className="text-xs text-muted-foreground">
                          iOS cannot install an APK-style file from the web. Open this site in{" "}
                          <span className="font-medium text-foreground">Safari</span>, tap{" "}
                          <span className="font-medium text-foreground">Share</span>, then{" "}
                          <span className="font-medium text-foreground">Add to Home Screen</span> for a
                          full-screen installable web app.
                        </p>
                      )}
                    </div>
                  </div>
                  {IOS_APP_STORE_URL ? (
                    <Button variant="outline" size="sm" className="w-full shrink-0 gap-2 sm:w-auto" asChild>
                      <a href={IOS_APP_STORE_URL} target="_blank" rel="noopener noreferrer">
                        App Store
                        <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                      </a>
                    </Button>
                  ) : null}
                </div>
              </div>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-5">
                {error && (
                  <Alert
                    variant="destructive"
                    className="border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200"
                  >
                    <Info className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="username" className="text-sm font-semibold">
                    Username
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="username"
                      type="text"
                      placeholder="Enter your username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="h-11 border-border/80 bg-background/50 pl-10 focus-visible:ring-2 focus-visible:ring-[#3b82f6]/20"
                      autoComplete="username"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-semibold">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-11 border-border/80 bg-background/50 pl-10 pr-10 focus-visible:ring-2 focus-visible:ring-[#3b82f6]/20"
                      autoComplete="current-password"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                      tabIndex={-1}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-4 pb-8 pt-2">
                <Button
                  type="submit"
                  className="h-11 w-full bg-[#1d4ed8] text-base font-semibold text-white shadow-lg shadow-[#3b82f6]/25 transition-all hover:bg-[#1e40af] hover:shadow-[#3b82f6]/30"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Signing in…
                    </span>
                  ) : (
                    "Sign in"
                  )}
                </Button>
                <p className="text-center text-xs text-muted-foreground">
                  Contact HR or IT if you need access.
                </p>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
    </div>
  )
}
