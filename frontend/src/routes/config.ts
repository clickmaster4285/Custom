/**
 * Central route paths. Use these for all navigation (Link, useNavigate, redirects)
 * so URLs are defined in one place.
 */
export const ROUTES = {
  // Auth
  LOGIN: "/login",

  // Dashboard (home)
  DASHBOARD: "/",

  // Registration (VMS)
  PRE_REGISTRATION: "/pre-registration",
  WALK_IN_REGISTRATION: "/walk-in-registration",
  STREAMED_UPLOAD: "/streamed-upload",
  PHOTO_CAPTURE: "/photo-capture",
  QR_CODE_GENERATION: "/qr-code-generation",
  APPOINTMENT_SCHEDULING: "/appointment-scheduling",
  TIME_SLOT_BOOKING: "/time-slot-booking",
  HOST_SELECTION: "/host-selection",
  VISIT_PURPOSE: "/visit-purpose",
  CALENDAR_VIEW: "/calendar-view",

  // Warehouse
  WAREHOUSE_SETUP: "/warehouse-setup",
  ZONE_LOCATION_MANAGEMENT: "/zone-location-management",
  STORAGE_ALLOCATION: "/storage-allocation",
  INVENTORY_TRACKING: "/inventory-tracking",
  STOCK_RECONCILIATION: "/stock-reconciliation",

  // Cameras & monitoring
  CAMERA_INTEGRATION: "/camera-integration",
  OPERATIONS_DASHBOARD: "/operations-dashboard",
  ANALYTICS_DASHBOARD: "/analytics-dashboard",
  LIVE_MONITORING: "/live-monitoring",
  CAMERA_MANAGEMENT: "/camera-management",
  OBJECT_DETECTION: "/object-detection",
  ANPR_SETTINGS: "/anpr-settings",
  ANOMALY_DETECTION: "/anomaly-detection",

  // Seizures & cases
  NEW_SEIZURE_ENTRY: "/new-seizure-entry",
  JCP_TOLL_PLAZA_ENTRY: "/jcp-toll-plaza-entry",
  GOODS_RECEIPT_HANDOVER: "/goods-receipt-handover",
  AI_ITEM_CATALOGING: "/ai-item-cataloging",
  SEIZURE_REGISTER: "/seizure-register",
  FIR_REGISTRATION: "/fir-registration",
  CASE_FILE_CREATION: "/case-file-creation",
  COURT_PROCEEDINGS: "/court-proceedings",
  LEGAL_DOCUMENTS: "/legal-documents",
  CASE_STATUS_TRACKING: "/case-status-tracking",

  // Transfers
  INTER_COLLECTORATE_TRANSFER: "/inter-collectorate-transfer",
  INTERNAL_MOVEMENT: "/internal-movement",
  HANDOVER_REQUESTS: "/handover-requests",
  DOUBLE_AUTHENTICATION: "/double-authentication",
  TRANSFER_TRACKING: "/transfer-tracking",

  // Inventory
  PERISHABLE_REGISTER: "/perishable-register",
  EXPIRY_TRACKING: "/expiry-tracking",
  PRIORITY_DISPOSAL_QUEUE: "/priority-disposal-queue",
  DESTRUCTION_ORDERS: "/destruction-orders",
  LOT_CREATION: "/lot-creation",
  ITEM_VALUATION: "/item-valuation",

  // Auction
  ASO_PORTAL_SYNC: "/aso-portal-sync",
  BIDDING_MANAGEMENT: "/bidding-management",
  SALE_COMPLETION: "/sale-completion",
  REVENUE_REPORTS: "/revenue-reports",

  // Reports & analytics
  REPORTS: "/reports",
  PREDICTIVE_INSIGHTS: "/predictive-insights",
  DATA_VISUALIZATION: "/data-visualization",

  // HR
  EMPLOYEES: "/employees",
  ATTENDANCE: "/attendance",
  LEAVE_MANAGEMENT: "/leave-management",
  PAYROLL: "/payroll",
  RECRUITMENT: "/recruitment",

  // Settings
  GENERAL_SETTINGS: "/general-settings",
  USER_ROLE_MANAGEMENT: "/user-role-management",
  INTEGRATIONS: "/integrations",
  NOTIFICATIONS: "/notifications",
  SECURITY_ACCESS: "/security-access",

  // Fallback
  NOT_FOUND: "/404",
} as const

export type RoutePath = (typeof ROUTES)[keyof typeof ROUTES]

/** Returns true if pathname is the login route */
export function isLoginRoute(pathname: string): boolean {
  return pathname === ROUTES.LOGIN
}

/** Returns true if pathname is the dashboard (root) */
export function isDashboardRoute(pathname: string): boolean {
  return pathname === ROUTES.DASHBOARD
}

/** Nav item for sidebar (leaf) */
export interface NavItem {
  label: string
  href: RoutePath
}

/** Nav group for sidebar (with children) */
export interface NavGroup {
  label: string
  children: NavItem[]
}

/** Sidebar navigation sections: each has a title and list of groups or items */
export const NAV_SECTIONS: { title: string; items: (NavItem | NavGroup)[] }[] = [
  {
    title: "MAIN MODULES",
    items: [
      { label: "Dashboard", href: ROUTES.DASHBOARD },
      {
        label: "VMS",
        children: [
          { label: "Pre-Registration", href: ROUTES.PRE_REGISTRATION },
          { label: "Walk-In Registration", href: ROUTES.WALK_IN_REGISTRATION },
          { label: "Appointment Scheduling", href: ROUTES.APPOINTMENT_SCHEDULING },
          { label: "Calendar View", href: ROUTES.CALENDAR_VIEW },
        ],
      },
      {
        label: "WMS",
        children: [
          { label: "Executive Dashboard", href: ROUTES.DASHBOARD },
          { label: "Operations Dashboard", href: ROUTES.OPERATIONS_DASHBOARD },
          { label: "AI Analytics Dashboard", href: ROUTES.ANALYTICS_DASHBOARD },
          { label: "Live Monitoring", href: ROUTES.LIVE_MONITORING },
          { label: "New Seizure Entry", href: ROUTES.NEW_SEIZURE_ENTRY },
          { label: "JCP/Toll Plaza Entry (ANPR)", href: ROUTES.JCP_TOLL_PLAZA_ENTRY },
          { label: "Goods Receipt & Handover", href: ROUTES.GOODS_RECEIPT_HANDOVER },
          { label: "AI Item Cataloging", href: ROUTES.AI_ITEM_CATALOGING },
          { label: "QR Code Generation", href: ROUTES.QR_CODE_GENERATION },
          { label: "Seizure Register", href: ROUTES.SEIZURE_REGISTER },
          { label: "Warehouse Setup", href: ROUTES.WAREHOUSE_SETUP },
          { label: "Zone & Location Management", href: ROUTES.ZONE_LOCATION_MANAGEMENT },
          { label: "Storage Allocation", href: ROUTES.STORAGE_ALLOCATION },
          { label: "Inventory Tracking", href: ROUTES.INVENTORY_TRACKING },
          { label: "Stock Reconciliation", href: ROUTES.STOCK_RECONCILIATION },
          { label: "Camera Integration", href: ROUTES.CAMERA_INTEGRATION },
          { label: "FIR Registration", href: ROUTES.FIR_REGISTRATION },
          { label: "Case File Creation", href: ROUTES.CASE_FILE_CREATION },
          { label: "Court Proceedings", href: ROUTES.COURT_PROCEEDINGS },
          { label: "Legal Documents", href: ROUTES.LEGAL_DOCUMENTS },
          { label: "Case Status Tracking", href: ROUTES.CASE_STATUS_TRACKING },
          { label: "Inter-Collectorate Transfer", href: ROUTES.INTER_COLLECTORATE_TRANSFER },
          { label: "Internal Movement", href: ROUTES.INTERNAL_MOVEMENT },
          { label: "Handover Requests", href: ROUTES.HANDOVER_REQUESTS },
          { label: "Double Authentication", href: ROUTES.DOUBLE_AUTHENTICATION },
          { label: "Transfer Tracking", href: ROUTES.TRANSFER_TRACKING },
          { label: "Perishable Register", href: ROUTES.PERISHABLE_REGISTER },
          { label: "Expiry Tracking", href: ROUTES.EXPIRY_TRACKING },
          { label: "Priority Disposal Queue", href: ROUTES.PRIORITY_DISPOSAL_QUEUE },
          { label: "Destruction Orders", href: ROUTES.DESTRUCTION_ORDERS },
          { label: "Lot Creation", href: ROUTES.LOT_CREATION },
          { label: "Item Valuation", href: ROUTES.ITEM_VALUATION },
          { label: "ASO Portal Sync", href: ROUTES.ASO_PORTAL_SYNC },
          { label: "Bidding Management", href: ROUTES.BIDDING_MANAGEMENT },
          { label: "Sale Completion", href: ROUTES.SALE_COMPLETION },
          { label: "Revenue Reports", href: ROUTES.REVENUE_REPORTS },
          { label: "Camera Management", href: ROUTES.CAMERA_MANAGEMENT },
          { label: "Object Detection", href: ROUTES.OBJECT_DETECTION },
          { label: "ANPR Settings", href: ROUTES.ANPR_SETTINGS },
          { label: "Anomaly Detection", href: ROUTES.ANOMALY_DETECTION },
        ],
      },
      {
        label: "AI Analytics",
        children: [
          { label: "Analytics Dashboard", href: ROUTES.ANALYTICS_DASHBOARD },
          { label: "Reports", href: ROUTES.REPORTS },
          { label: "Predictive Insights", href: ROUTES.PREDICTIVE_INSIGHTS },
          { label: "Data Visualization", href: ROUTES.DATA_VISUALIZATION },
        ],
      },
      {
        label: "HR",
        children: [
          { label: "Employees", href: ROUTES.EMPLOYEES },
          { label: "Attendance", href: ROUTES.ATTENDANCE },
          { label: "Leave Management", href: ROUTES.LEAVE_MANAGEMENT },
          { label: "Payroll", href: ROUTES.PAYROLL },
          { label: "Recruitment", href: ROUTES.RECRUITMENT },
        ],
      },
      {
        label: "System configuration",
        children: [
          { label: "General Settings", href: ROUTES.GENERAL_SETTINGS },
          { label: "User & Role Management", href: ROUTES.USER_ROLE_MANAGEMENT },
          { label: "Integrations", href: ROUTES.INTEGRATIONS },
          { label: "Notifications", href: ROUTES.NOTIFICATIONS },
          { label: "Security & Access", href: ROUTES.SECURITY_ACCESS },
        ],
      },
    ],
  },
]

/** Map pathname to parent menu label (for sidebar expand state). Returns null for top-level items like Dashboard. */
export function getParentMenuForPath(pathname: string): string | null {
  for (const section of NAV_SECTIONS) {
    for (const item of section.items) {
      if ("children" in item && item.children.some((c) => c.href === pathname)) {
        return item.label
      }
    }
  }
  return null
}
