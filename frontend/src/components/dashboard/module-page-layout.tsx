import { Link } from "react-router-dom"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { ROUTES } from "@/routes/config"

export interface BreadcrumbItemType {
  label: string
  href?: string
}

interface ModulePageLayoutProps {
  title: string
  description: string
  breadcrumbs: BreadcrumbItemType[]
  children: React.ReactNode
}

export function ModulePageLayout({
  title,
  description,
  breadcrumbs,
  children,
}: ModulePageLayoutProps) {
  return (
    <>
      <Breadcrumb className="mb-4">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to={ROUTES.DASHBOARD}>Home</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          {breadcrumbs.map((item, i) => (
            <BreadcrumbItem key={i}>
              <BreadcrumbSeparator />
              {i === breadcrumbs.length - 1 ? (
                <BreadcrumbPage className="text-[#3b82f6] font-medium">
                  {item.label}
                </BreadcrumbPage>
              ) : item.href ? (
                <BreadcrumbLink asChild>
                  <Link to={item.href}>{item.label}</Link>
                </BreadcrumbLink>
              ) : (
                <span className="text-muted-foreground">{item.label}</span>
              )}
            </BreadcrumbItem>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-foreground">{title}</h1>
        <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
      </div>
      {children}
    </>
  )
}
