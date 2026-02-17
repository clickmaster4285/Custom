import React, { useState, useEffect } from "react"
import { useLocation, Link, NavLink } from "react-router-dom"
import {
  LayoutDashboard,
  UserCheck,
  Package,
  Users,
  Eye,
  ChevronDown,
  ChevronRight,
  Brain,
  Cog,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { NAV_SECTIONS, getParentMenuForPath, type NavItem, type NavGroup } from "@/routes/config"

const ICONS: Record<string, React.ReactNode> = {
  Dashboard: <LayoutDashboard size={18} />,
  VMS: <UserCheck size={18} />,
  WMS: <Package size={18} />,
  "AI Analytics": <Brain size={18} />,
  HR: <Users size={18} />,
  "System configuration": <Cog size={18} />,
}

export function Sidebar() {
  const pathname = useLocation().pathname
  const [expandedItems, setExpandedItems] = useState<string[]>(() => {
    const parent = getParentMenuForPath(pathname)
    return parent ? [parent] : []
  })

  useEffect(() => {
    const parentMenu = getParentMenuForPath(pathname)
    setExpandedItems(parentMenu ? [parentMenu] : [])
  }, [pathname])

  const toggleExpand = (label: string) => {
    setExpandedItems((prev) =>
      prev.includes(label) ? prev.filter((item) => item !== label) : [...prev, label]
    )
  }

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      "w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all duration-200",
      isActive
        ? "bg-gradient-to-r from-[#3b82f6]/15 via-[#3b82f6]/10 to-transparent text-[#3b82f6] font-medium"
        : "text-muted-foreground hover:bg-gradient-to-r hover:from-[#3b82f6]/10 hover:via-[#3b82f6]/5 hover:to-transparent hover:text-[#3b82f6] hover:translate-x-1"
    )

  const childLinkClass = (href: string) =>
    cn(
      "block px-3 py-1.5 text-sm rounded-md transition-all duration-200",
      pathname === href
        ? "text-[#3b82f6] font-medium bg-[#3b82f6]/5"
        : "text-muted-foreground hover:text-[#3b82f6] hover:bg-[#3b82f6]/5 hover:translate-x-1"
    )

  return (
    <aside className="fixed inset-y-0 left-0 z-30 w-[240px] h-screen bg-background border-r border-border flex flex-col shrink-0">
      <div className="p-4 border-b border-border shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#3b82f6] flex items-center justify-center">
            <Eye className="w-5 h-5 text-white" />
          </div>
          <span className="font-semibold text-lg text-foreground">TekEye</span>
        </div>
      </div>

      <nav className="flex-1 min-h-0 overflow-y-auto py-2 px-2" aria-label="Main">
        {NAV_SECTIONS.map((section, sectionIndex) => (
          <div key={sectionIndex} className="mb-2">
            {section.title && (
              <div className="px-3 py-2 text-xs font-medium text-muted-foreground tracking-wider">
                {section.title}
              </div>
            )}
            {section.items.map((item, itemIndex) => {
              const isGroup = "children" in item
              const label = item.label
              const icon = ICONS[label] ?? null

              if (isGroup) {
                const group = item as NavGroup
                const isActive = group.children.some((c) => c.href === pathname)
                return (
                  <div key={itemIndex}>
                    <button
                      type="button"
                      onClick={() => toggleExpand(label)}
                      aria-expanded={expandedItems.includes(label)}
                      className={cn(
                        "w-full flex items-center justify-between px-3 py-2 rounded-md text-sm transition-all duration-200",
                        isActive
                          ? "bg-gradient-to-r from-[#3b82f6]/15 via-[#3b82f6]/10 to-transparent text-[#3b82f6] font-medium"
                          : "text-muted-foreground hover:bg-gradient-to-r hover:from-[#3b82f6]/10 hover:via-[#3b82f6]/5 hover:to-transparent hover:text-[#3b82f6] hover:translate-x-1"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        {icon}
                        <span className="whitespace-nowrap text-left">{label}</span>
                      </div>
                      {expandedItems.includes(label) ? (
                        <ChevronDown size={16} aria-hidden />
                      ) : (
                        <ChevronRight size={16} aria-hidden />
                      )}
                    </button>
                    {expandedItems.includes(label) && (
                      <div className="ml-6 mt-1 space-y-1">
                        {group.children.map((child, childIndex) => (
                          <Link
                            key={childIndex}
                            to={child.href}
                            className={childLinkClass(child.href)}
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                )
              }

              const navItem = item as NavItem
              return (
                <NavLink
                  key={itemIndex}
                  to={navItem.href}
                  className={linkClass}
                  end={navItem.href === "/"}
                >
                  {icon}
                  <span className="whitespace-nowrap">{label}</span>
                </NavLink>
              )
            })}
          </div>
        ))}
      </nav>

      <div className="p-4 border-t border-border shrink-0">
        <p className="text-xs text-muted-foreground">© 2024 Powered by OSIEMENS</p>
      </div>
    </aside>
  )
}
