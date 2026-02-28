import { useEffect, useState } from "react"
import { useLocation, Link, NavLink } from "react-router-dom"
import { Eye, ChevronDown, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { NAV_SECTIONS, getAncestorMenusForPath, type NavGroup } from "@/routes/config"
import { getNodeKey, hasActiveDescendant, isNavGroup, type SidebarNode } from "@/components/dashboard/sidebar.helpers"
import { renderMenuIcon } from "@/components/dashboard/sidebar.icons"

type SidebarChildrenProps = {
  nodes: SidebarNode[]
  pathname: string
  expandedItems: string[]
  onToggle: (label: string) => void
  childLinkClass: (href: string) => string
  depth: number
}

function SidebarChildren({
  nodes,
  pathname,
  expandedItems,
  onToggle,
  childLinkClass,
  depth,
}: SidebarChildrenProps) {
  return (
    <>
      {nodes.map((node) => {
        if (!isNavGroup(node)) {
          return (
            <Link key={getNodeKey(node)} to={node.href} className={cn(childLinkClass(node.href), depth > 1 && "pl-6 text-[13px]")}>
              {renderMenuIcon(node.label, 12, "shrink-0")}
              <span>{node.label}</span>
            </Link>
          )
        }

        const label = node.label
        const isExpanded = expandedItems.includes(label)
        const isActive = hasActiveDescendant(node, pathname)

        return (
          <div key={getNodeKey(node)}>
            <button
              type="button"
              onClick={() => onToggle(label)}
              aria-expanded={isExpanded}
              className={cn(
                "w-full flex items-center justify-between px-2 py-1.5 rounded-md text-sm transition-all duration-200",
                isActive
                  ? "text-[#3b82f6] font-medium bg-[#3b82f6]/5"
                  : "text-muted-foreground hover:text-[#3b82f6] hover:bg-[#3b82f6]/5"
              )}
            >
              <span className="flex items-center gap-2 whitespace-nowrap text-left pl-1">
                {renderMenuIcon(label, 12, "shrink-0 opacity-70")}
                {label}
              </span>
              {isExpanded ? <ChevronDown size={14} aria-hidden /> : <ChevronRight size={14} aria-hidden />}
            </button>
            {isExpanded && (
              <div className="ml-5 mt-0.5 space-y-0.5 border-l border-border pl-2">
                <SidebarChildren
                  nodes={node.children}
                  pathname={pathname}
                  expandedItems={expandedItems}
                  onToggle={onToggle}
                  childLinkClass={childLinkClass}
                  depth={depth + 1}
                />
              </div>
            )}
          </div>
        )
      })}
    </>
  )
}

export function Sidebar() {
  const pathname = useLocation().pathname
  const [expandedItems, setExpandedItems] = useState<string[]>(() => getAncestorMenusForPath(pathname))

  useEffect(() => {
    setExpandedItems(getAncestorMenusForPath(pathname))
  }, [pathname])

  const toggleExpand = (label: string) => {
    setExpandedItems((prev) =>
      prev.includes(label) ? prev.filter((item) => item !== label) : [...prev, label]
    )
  }

  const isExpanded = (label: string) => expandedItems.includes(label)

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      "w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-all duration-200 border-l-2 border-transparent",
      isActive
        ? "bg-gradient-to-r from-[#155DFC] to-[#5F9EFC] text-white font-medium border-[#155DFC] shadow-sm"
        : "text-[#4B5563] hover:text-[#155DFC] hover:bg-[#155DFC]/10"
    )

  const childLinkClass = (href: string) =>
    cn(
      "flex items-center gap-2 px-3 py-1.5 text-sm rounded-md transition-all duration-200 border-l-2 border-transparent",
      pathname === href
        ? "bg-gradient-to-r from-[#155DFC] to-[#5F9EFC] text-white font-medium border-[#155DFC] shadow-sm"
        : "text-[#4B5563] hover:text-[#155DFC] hover:bg-[#155DFC]/10"
    )

  return (
    <aside className="fixed inset-y-0 left-0 z-30 w-[300px] h-screen bg-[#F9FAFB] border-r border-[#E5E7EB] flex flex-col shrink-0 shadow-sm font-sans">
      <div className="p-4 border-b border-[#E5E7EB] shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-[#155DFC] to-[#5F9EFC] flex items-center justify-center">
            <Eye className="w-5 h-5 text-white" />
          </div>
          <span className="font-semibold text-lg text-[#1F2937]">TekEye</span>
        </div>
      </div>

      <nav className="flex-1 min-h-0 overflow-y-auto py-3 px-3" aria-label="Main">
        {NAV_SECTIONS.map((section) => (
          <div key={section.title} className="mb-3">
            {section.title && (
              <div className="px-3 py-2 text-[11px] font-semibold text-[#6B7280] tracking-[0.12em] uppercase">
                {section.title}
              </div>
            )}
            {section.items.map((item) => {
              if (!isNavGroup(item)) {
                return (
                  <NavLink
                    key={getNodeKey(item)}
                    to={item.href}
                    className={linkClass}
                    end={item.href === "/"}
                  >
                    {renderMenuIcon(item.label, 18, "shrink-0")}
                    <span className="whitespace-nowrap">{item.label}</span>
                  </NavLink>
                )
              }

              const group = item as NavGroup
              const label = group.label
              const isActive = hasActiveDescendant(group, pathname)

              return (
                <div key={getNodeKey(group)}>
                  <button
                    type="button"
                    onClick={() => toggleExpand(label)}
                    aria-expanded={isExpanded(label)}
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-2.5 rounded-md text-sm transition-all duration-200 border-l-2 border-transparent",
                      isActive
                        ? "bg-gradient-to-r from-[#155DFC] to-[#5F9EFC] text-white font-medium border-[#155DFC] shadow-sm"
                        : "text-[#4B5563] hover:text-[#155DFC] hover:bg-[#155DFC]/10"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      {renderMenuIcon(label, 18, isActive ? "shrink-0 text-white" : "shrink-0 text-[#6B7280]")}
                      <span className="whitespace-nowrap text-left">{label}</span>
                    </div>
                    {isExpanded(label) ? (
                      <ChevronDown size={16} aria-hidden className={isActive ? "text-white" : "text-[#6B7280]"} />
                    ) : (
                      <ChevronRight size={16} aria-hidden className={isActive ? "text-white" : "text-[#6B7280]"} />
                    )}
                  </button>
                  {isExpanded(label) && (
                    <div className="ml-6 mt-1.5 space-y-1 border-l-2 border-[#155DFC]/50 pl-2">
                      <SidebarChildren
                        nodes={group.children}
                        pathname={pathname}
                        expandedItems={expandedItems}
                        onToggle={toggleExpand}
                        childLinkClass={childLinkClass}
                        depth={1}
                      />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        ))}
      </nav>

      <div className="p-4 border-t border-[#E5E7EB] shrink-0">
        <p className="text-xs text-[#6B7280]">© 2024 Powered by OSIEMENS</p>
      </div>
    </aside>
  )
}