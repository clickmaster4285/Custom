import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Search, Bell, HelpCircle, User, LogOut } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { clearAuth, getStoredUser } from "@/lib/auth"
import { ROUTES } from "@/routes/config"

export function Header() {
  const navigate = useNavigate()
  const user = getStoredUser()
  const [searchInput, setSearchInput] = useState("")

  const handleLogout = () => {
    clearAuth()
    if (typeof window !== "undefined") window.localStorage.clear()
    navigate(ROUTES.LOGIN, { replace: true })
  }

  const displayName = user?.username ?? "Sarah Wasim"
  const role = "Admin Panel"
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  return (
    <header className="h-16 border-b border-gray-100 bg-white px-10 flex items-center justify-between shrink-0">
      {/* Search bar - rounded, light gray border */}
      <div className="flex shrink-0 items-center rounded-[10px] border border-gray-200 bg-white pl-4 pr-3.5 py-2 min-w-[200px] max-w-[452px] w-full">
        <Search className="w-5 h-5 text-gray-400 shrink-0" />
        <input
          type="text"
          placeholder="Search visitors, pass IDs..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="text-[#4A5565] bg-transparent text-[15px] flex-1 min-w-0 py-1 border-0 outline-none placeholder:text-gray-400 ml-2"
        />
      </div>

      <div className="flex-1 min-w-4" />

      {/* Notifications (bell with red dot) + Help */}
      <div className="flex shrink-0 items-center gap-2">
        <button
          type="button"
          className="relative p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
          aria-label="Notifications"
        >
          <Bell className="w-6 h-6" />
          <span
            className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"
            aria-hidden
          />
        </button>
        <button
          type="button"
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
          aria-label="Help"
        >
          <HelpCircle className="w-6 h-6" />
        </button>
      </div>

      {/* Vertical separator */}
      <div className="h-8 w-px bg-gray-200 mx-2 shrink-0" aria-hidden />

      {/* User profile: name, role, avatar */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="flex shrink-0 items-center gap-3 pl-2 py-1.5 rounded-lg hover:bg-gray-50 transition-colors text-left"
          >
            <div className="flex flex-col items-start">
              <span className="text-[#101727] text-sm font-semibold">{displayName}</span>
              <span className="text-[#697282] text-xs">{role}</span>
            </div>
            <Avatar className="h-10 w-10 rounded-full border-2 border-gray-100 shrink-0">
              <AvatarImage
                src="https://randomuser.me/api/portraits/women/44.jpg"
                alt={displayName}
              />
              <AvatarFallback className="bg-gray-200 text-[#6B7280] text-sm">
                {initials || <User className="w-5 h-5" />}
              </AvatarFallback>
            </Avatar>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem
            onClick={handleLogout}
            className="text-destructive focus:text-destructive cursor-pointer"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
