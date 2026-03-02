import { useEffect, useState, useCallback } from "react"
import { useLocation, Link, NavLink } from "react-router-dom"
import { Eye, ChevronDown, ChevronRight, Star } from "lucide-react"
import { cn } from "@/lib/utils"
import { NAV_SECTIONS, getAncestorMenusForPath, type NavGroup } from "@/routes/config"
import { getNodeKey, hasActiveDescendant, isNavGroup, type SidebarNode } from "@/components/dashboard/sidebar.helpers"
import { renderMenuIcon } from "@/components/dashboard/sidebar.icons"

const FAVORITES_KEY = "tekeye-sidebar-favorites"

export type FavoriteItem = { href: string; label: string }

function loadFavorites(): FavoriteItem[] {
  try {
    const raw = localStorage.getItem(FAVORITES_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed.filter((x): x is FavoriteItem => x && typeof x.href === "string" && typeof x.label === "string")
  } catch {
    return []
  }
}

function saveFavorites(items: FavoriteItem[]) {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(items))
}

type SidebarChildrenProps = {
  nodes: SidebarNode[]
  pathname: string
  expandedItems: string[]
  onToggle: (label: string) => void
  childLinkClass: (href: string) => string
  depth: number
  isFavorite: (href: string) => boolean
  onToggleFavorite: (href: string, label: string) => void
}

function SidebarChildren({
  nodes,
  pathname,
  expandedItems,
  onToggle,
  childLinkClass,
  depth,
  isFavorite,
  onToggleFavorite,
}: SidebarChildrenProps) {
  return (
    <>
      {nodes.map((node) => {
        if (!isNavGroup(node)) {
          const fav = isFavorite(node.href)
          return (
            <div key={getNodeKey(node)} className="group/link flex items-center gap-1">
              <Link to={node.href} className={cn("flex-1 min-w-0 flex items-center gap-2", childLinkClass(node.href), depth > 1 && "pl-6 text-[13px]")}>
                <span className="w-5 shrink-0 flex items-center justify-start" aria-hidden>
                  {renderMenuIcon(node.label, 12, "shrink-0")}
                </span>
                <span className="truncate">{node.label}</span>
              </Link>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  onToggleFavorite(node.href, node.label)
                }}
                className={cn(
                  "shrink-0 p-1 rounded opacity-0 group-hover/link:opacity-100 focus:opacity-100 transition-opacity",
                  fav ? "text-amber-500" : "text-muted-foreground hover:text-amber-500"
                )}
                aria-label={fav ? "Remove from favorites" : "Add to favorites"}
                title={fav ? "Remove from favorites" : "Add to favorites"}
              >
                <Star size={12} className={fav ? "fill-current" : undefined} />
              </button>
            </div>
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
                "w-full flex items-center justify-between px-2 py-1.5 rounded-r-xl text-sm transition-all duration-200 border border-transparent border-l-0",
                isActive
                  ? "sidebar-submenu-active font-medium"
                  : "text-muted-foreground hover:text-[#3366FF] hover:bg-[#F5F8FF]"
              )}
            >
              <span className="flex items-center gap-2 whitespace-nowrap text-left pl-1">
                <span className="w-5 shrink-0 flex items-center justify-start opacity-70" aria-hidden>
                  {renderMenuIcon(label, 12, "shrink-0")}
                </span>
                {label}
              </span>
              {isExpanded ? <ChevronDown size={14} aria-hidden /> : <ChevronRight size={14} aria-hidden />}
            </button>
            {isExpanded && (
              <div className="ml-5 mt-0.5 space-y-0.5 border-l border-[#C1D9F8] pl-2">
                <SidebarChildren
                  nodes={node.children}
                  pathname={pathname}
                  expandedItems={expandedItems}
                  onToggle={onToggle}
                  childLinkClass={childLinkClass}
                  depth={depth + 1}
                  isFavorite={isFavorite}
                  onToggleFavorite={onToggleFavorite}
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
  const [favorites, setFavorites] = useState<FavoriteItem[]>(loadFavorites)

  useEffect(() => {
    setExpandedItems(getAncestorMenusForPath(pathname))
  }, [pathname])

  useEffect(() => {
    saveFavorites(favorites)
  }, [favorites])

  const toggleExpand = (label: string) => {
    setExpandedItems((prev) =>
      prev.includes(label) ? prev.filter((item) => item !== label) : [...prev, label]
    )
  }

  const isExpanded = (label: string) => expandedItems.includes(label)

  const isFavorite = useCallback((href: string) => favorites.some((f) => f.href === href), [favorites])
  const onToggleFavorite = useCallback((href: string, label: string) => {
    setFavorites((prev) => {
      const has = prev.some((f) => f.href === href)
      if (has) return prev.filter((f) => f.href !== href)
      return [...prev, { href, label }]
    })
  }, [])

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 border border-transparent",
      isActive
        ? "sidebar-active-gradient text-[#2860C8] font-medium border-[#5A82E8]"
        : "text-[#4B5563] hover:text-[#2860C8] hover:bg-[#D2DCF5]/80"
    )

  const childLinkClass = (href: string) =>
    cn(
      "flex items-center gap-2 px-3 py-1.5 text-sm rounded-r-xl transition-all duration-200 border border-transparent border-l-0",
      pathname === href
        ? "sidebar-submenu-active font-medium"
        : "text-[#4B5563] hover:text-[#3366FF] hover:bg-[#F5F8FF]"
    )

  return (
    <aside className="fixed inset-y-0 left-0 z-30 w-[300px] h-screen bg-[#F9FAFB] border-r border-[#E5E7EB] flex flex-col shrink-0 shadow-sm font-sans">
      <div className="p-4 border-b border-[#E5E7EB] shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-[#5B9AFF] to-white flex items-center justify-center">
            <Eye className="w-5 h-5 text-white" />
          </div>
          <span className="font-semibold text-lg text-[#1F2937]">TekEye</span>
        </div>
      </div>

      <nav className="flex-1 min-h-0 overflow-y-auto py-3 px-3" aria-label="Main">
        {favorites.length > 0 && (
          <div className="mb-3">
            <div className="px-3 py-2 text-[11px] font-semibold text-[#6B7280] tracking-[0.12em] uppercase">
              Favorites
            </div>
            <div className="space-y-1">
              {favorites.map((fav) => {
                const active = pathname === fav.href
                return (
                  <div key={fav.href} className="group/link flex items-center gap-1">
                    <Link
                      to={fav.href}
                      className={cn(
                        "flex-1 min-w-0 flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm border border-transparent transition-all",
                        active
                          ? "sidebar-active-gradient text-[#2860C8] font-medium border-[#5A82E8]"
                          : "text-[#4B5563] hover:text-[#2860C8] hover:bg-[#D2DCF5]/80"
                      )}
                    >
                      <span className="w-6 shrink-0 flex items-center justify-start" aria-hidden>
                        {renderMenuIcon(fav.label, 18, "shrink-0")}
                      </span>
                      <span className="truncate whitespace-nowrap">{fav.label}</span>
                    </Link>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault()
                        onToggleFavorite(fav.href, fav.label)
                      }}
                      className="shrink-0 p-1 rounded text-amber-500 opacity-0 group-hover/link:opacity-100 focus:opacity-100 hover:bg-amber-500/10"
                      aria-label="Remove from favorites"
                      title="Remove from favorites"
                    >
                      <Star size={14} className="fill-current" />
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {NAV_SECTIONS.map((section) => (
          <div key={section.title} className="mb-3">
            {section.title && (
              <div className="px-3 py-2 text-[11px] font-semibold text-[#6B7280] tracking-[0.12em] uppercase">
                {section.title}
              </div>
            )}
            {section.items.map((item) => {
              if (!isNavGroup(item)) {
                const fav = isFavorite(item.href)
                return (
                  <div key={getNodeKey(item)} className="group/link flex items-center gap-1">
                    <NavLink to={item.href} className={({ isActive }) => cn("flex-1 min-w-0 flex items-center gap-3", linkClass({ isActive }))} end={item.href === "/"}>
                      <span className="w-6 shrink-0 flex items-center justify-start" aria-hidden>
                        {renderMenuIcon(item.label, 18, "shrink-0")}
                      </span>
                      <span className="whitespace-nowrap truncate">{item.label}</span>
                    </NavLink>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        onToggleFavorite(item.href, item.label)
                      }}
                      className={cn(
                        "shrink-0 p-1 rounded opacity-0 group-hover/link:opacity-100 focus:opacity-100 transition-opacity",
                        fav ? "text-amber-500" : "text-muted-foreground hover:text-amber-500"
                      )}
                      aria-label={fav ? "Remove from favorites" : "Add to favorites"}
                      title={fav ? "Remove from favorites" : "Add to favorites"}
                    >
                      <Star size={14} className={fav ? "fill-current" : undefined} />
                    </button>
                  </div>
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
                      "w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-all duration-200 border border-transparent",
                      isActive
                        ? "sidebar-active-gradient text-[#2860C8] font-medium border-[#5A82E8]"
                        : "text-[#4B5563] hover:text-[#2860C8] hover:bg-[#D2DCF5]/80"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 shrink-0 flex items-center justify-start" aria-hidden>
                        {renderMenuIcon(label, 18, isActive ? "shrink-0 text-[#2860C8]" : "shrink-0 text-[#6B7280]")}
                      </span>
                      <span className="whitespace-nowrap text-left">{label}</span>
                    </div>
                    {isExpanded(label) ? (
                      <ChevronDown size={16} aria-hidden className={isActive ? "text-[#2860C8]" : "text-[#6B7280]"} />
                    ) : (
                      <ChevronRight size={16} aria-hidden className={isActive ? "text-[#2860C8]" : "text-[#6B7280]"} />
                    )}
                  </button>
                  {isExpanded(label) && (
                    <div className="ml-6 mt-1.5 space-y-1 border-l border-[#C1D9F8] pl-2">
                      <SidebarChildren
                        nodes={group.children}
                        pathname={pathname}
                        expandedItems={expandedItems}
                        onToggle={toggleExpand}
                        childLinkClass={childLinkClass}
                        depth={1}
                        isFavorite={isFavorite}
                        onToggleFavorite={onToggleFavorite}
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
        <p className="text-sm leading-4 text-[#6B7280] font-normal">
          © 2026 Powered by <span className="underline">Clickmasters.</span>
        </p>
      </div>
    </aside>
  )
}