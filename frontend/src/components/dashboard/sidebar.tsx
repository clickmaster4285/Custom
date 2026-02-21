import React, { useState, useEffect } from "react"
import { useLocation, Link, NavLink } from "react-router-dom"
import {
  LayoutDashboard,
  User,
  Users,
  UserCheck,
  ChevronDown,
  ChevronRight,
  Calendar,
  ClipboardList,
  Shield,
  Lock,
  Bell,
  Building2,
  Cloud,
  LogIn,
  Truck,
  Package,
  Brain,
  Cog,
  Eye,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  NAV_SECTIONS,
  getExpandedLabelsForPath,
  type NavItem,
  type NavGroup,
  type NavSeparator,
} from "@/routes/config"

const iconSize = 10
const mainModuleIconSize = 12
const subModuleIconSize = 12
const ICONS: Record<string, React.ReactNode> = {
  Dashboard: <LayoutDashboard size={iconSize} />,
  "Visitor Management System": <UserCheck size={iconSize} />,
  "Visitor Registration": <ClipboardList size={iconSize} />,
  "Pre-Registration": <ClipboardList size={iconSize} />,
  "Walk-In Registration": <UserCheck size={iconSize} />,
  "Calendar View": <Calendar size={iconSize} />,
  "Security & Screening": <Shield size={iconSize} />,
  "Watchlist Screening": <Shield size={iconSize} />,
  "Blacklist Management": <Lock size={iconSize} />,
  "Flagged Visitor Alerts": <Bell size={iconSize} />,
  "Access Control": <Lock size={iconSize} />,
  "Zone Restrictions": <Building2 size={iconSize} />,
  "Gate Integration": <Lock size={iconSize} />,
  "Escort Requirement": <UserCheck size={iconSize} />,
  "Host & Department Dashboard": <Building2 size={iconSize} />,
  "Visitor Notifications": <Bell size={iconSize} />,
  "Upcoming Visits": <Calendar size={iconSize} />,
  "Visitor History": <ClipboardList size={iconSize} />,
  "Guard & Reception Panel": <User size={iconSize} />,
  "Vehicle & Contractor Management": <Truck size={iconSize} />,
  "Warehouse Management System": <Package size={iconSize} />,
  "AI Analytics System": <Brain size={iconSize} />,
  "Human Resource Management": <Users size={iconSize} />,
  "System Configuration": <Cog size={iconSize} />,
}

function isNavSeparator(item: NavItem | NavGroup | NavSeparator): item is NavSeparator {
  return item !== null && typeof item === "object" && "type" in item && item.type === "separator"
}

function isNavGroup(item: NavItem | NavGroup | NavSeparator): item is NavGroup {
  return item !== null && typeof item === "object" && "children" in item
}

export function Sidebar() {
  const pathname = useLocation().pathname
  const [expandedItems, setExpandedItems] = useState<string[]>(() => getExpandedLabelsForPath(pathname))

  useEffect(() => {
    setExpandedItems(getExpandedLabelsForPath(pathname))
  }, [pathname])

  const toggleExpand = (label: string) => {
    setExpandedItems((prev) =>
      prev.includes(label) ? prev.filter((item) => item !== label) : [...prev, label]
    )
  }

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      "w-full flex items-center gap-3 px-3 py-2 rounded-md text-xs transition-colors",
      isActive
        ? "bg-[#3366FF]/10 text-[#3366FF] font-medium"
        : "text-[#374151] hover:bg-[#3366FF]/10 hover:text-[#3366FF]"
    )

  const isLastTwoVmsModules = (label: string) =>
    label === "Guard & Reception Panel" || label === "Vehicle & Contractor Management"

  const childLinkClass = (href: string, label?: string) =>
    cn(
      "flex items-center gap-2 py-1.5 text-sm rounded-md transition-all duration-200",
      isLastTwoVmsModules(label ?? "")
        ? "px-3"
        : "pl-6 pr-3 mb-0.5",
      pathname === href
        ? "text-[#3366FF] font-medium bg-[#3366FF]/10"
        : "text-[#4b5563] hover:bg-[#3366FF]/10 hover:text-[#3366FF]"
    )

  function renderGroup(
    group: NavGroup,
    depth: number,
    options: { isTopLevel?: boolean; hasVerticalLine?: boolean; isVms?: boolean }
  ) {
    const { hasVerticalLine = true, isVms = group.label === "Visitor Management System" } = options
    const isExpanded = expandedItems.includes(group.label)
    const isActive = (() => {
      function anyChildActive(g: NavGroup): boolean {
        for (const c of g.children) {
          if ("href" in c && c.href === pathname) return true
          if ("children" in c && anyChildActive(c as NavGroup)) return true
        }
        return false
      }
      return anyChildActive(group)
    })()

    const isNestedGroup = depth > 0
    const groupButtonClass = cn(
      "w-full flex items-center justify-between gap-2 rounded-md text-sm transition-colors",
      isNestedGroup ? "px-2 py-1.5" : "px-3 py-2.5",
      isActive ? "text-[#3366FF] font-medium" : "text-[#4b5563] hover:bg-[#3366FF]/10 hover:text-[#3366FF]"
    )

    return (
      <div key={group.label}>
        <button
          type="button"
          onClick={() => toggleExpand(group.label)}
          aria-expanded={isExpanded}
          className={groupButtonClass}
        >
          <div className="flex items-center gap-3 min-w-0">
            {ICONS[group.label] && React.isValidElement(ICONS[group.label])
              ? React.cloneElement(ICONS[group.label] as React.ReactElement<{ size?: number }>, { size: mainModuleIconSize })
              : ICONS[group.label]}
            <span className="whitespace-nowrap text-left truncate">{group.label}</span>
          </div>
          {isExpanded ? (
            <ChevronDown size={10} className={cn("shrink-0", isActive ? "text-[#3366FF]" : "text-[#6b7280]")} aria-hidden />
          ) : (
            <ChevronRight size={10} className={cn("shrink-0", isActive ? "text-[#3366FF]" : "text-[#6b7280]")} aria-hidden />
          )}
        </button>
        {isExpanded && (
          <div
            className={cn(
              "mt-1.5 space-y-1",
              hasVerticalLine &&
                (group.label === "Visitor Management System"
                  ? "border-l border-[#d1d5db] ml-4 pl-2"
                  : "border-l border-[#d1d5db] ml-4 pl-2")
            )}
          >
            {group.children.map((child, idx) => {
              if (isNavGroup(child)) {
                return (
                  <div key={child.label} className="ml-0">
                    {renderGroup(child, depth + 1, { hasVerticalLine: true, isVms })}
                  </div>
                )
              }
              const item = child as NavItem
              const subIcon =
                ICONS[item.label] && React.isValidElement(ICONS[item.label])
                  ? React.cloneElement(ICONS[item.label] as React.ReactElement<{ size?: number }>, { size: subModuleIconSize })
                  : ICONS[item.label]
              return (
                <Link key={idx} to={item.href} className="block">
                  <span className={childLinkClass(item.href, item.label)}>
                    {subIcon}
                    <span className="truncate">{item.label}</span>
                  </span>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  return (
    <aside className="fixed inset-y-0 left-0 z-30 w-[299px] h-screen bg-white border-r border-[#e5e7eb] flex flex-col shrink-0">
      <div className="p-4 border-b border-[#e5e7eb] shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-[#3366FF]">
            <Eye className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-sm text-[#111827]">TekEye</span>
        </div>
      </div>
      <nav className="flex-1 min-h-0 overflow-y-auto py-2 px-2" aria-label="Main">
        {NAV_SECTIONS.map((section, sectionIndex) => (
          <div key={sectionIndex} className="mb-2">
            {section.title && (
              <div className="px-3 py-2 text-[10px] font-medium text-[#6b7280] tracking-wider uppercase">
                {section.title}
              </div>
            )}
            {section.items.map((item, itemIndex) => {
              if (isNavSeparator(item)) {
                return null
              }
              if (isNavGroup(item)) {
                return (
                  <div key={item.label}>
                    {renderGroup(item, 0, { isTopLevel: true, hasVerticalLine: true })}
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
                  {ICONS[navItem.label]}
                  <span className="whitespace-nowrap">{navItem.label}</span>
                </NavLink>
              )
            })}
          </div>
        ))}
      </nav>
      <div className="p-4 border-t border-[#e5e7eb] shrink-0">
        <p className="text-[10px] text-[#6b7280]">© 2024 Powered by OSIEMENS</p>
      </div>
    </aside>
  )
}
