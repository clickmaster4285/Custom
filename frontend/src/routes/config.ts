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
  // VMS other modules
  SECURITY_SCREENING: "/security-screening",
  WATCHLIST_SCREENING: "/watchlist-screening",
  BLACKLIST_MANAGEMENT: "/blacklist-management",
  FLAGGED_VISITOR_ALERTS: "/flagged-visitor-alerts",
  ACCESS_CONTROL: "/access-control",
  ZONE_RESTRICTIONS: "/zone-restrictions",
  GATE_INTEGRATION: "/gate-integration",
  ESCORT_REQUIREMENT: "/escort-requirement",
  HOST_DEPARTMENT_DASHBOARD: "/host-department-dashboard",
  VISITOR_NOTIFICATIONS: "/visitor-notifications",
  UPCOMING_VISITS: "/upcoming-visits",
  VISITOR_HISTORY: "/visitor-history",
  GUARD_RECEPTION_PANEL: "/guard-reception-panel",
  VEHICLE_CONTRACTOR_MANAGEMENT: "/vehicle-contractor-management",
  VEHICLE_REGISTRATION: "/vehicle-registration",
  VEHICLE_TRACKING: "/vehicle-tracking",
  CONTRACTOR_PASSES: "/contractor-passes",
  CARGO_DELIVERY_LOGS: "/cargo-delivery-logs",

  // Armory
  ARMORY: "/armory",

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
  LIVE_CAMERA_GRID: "/analytics/live-camera-grid",
  VEHICLE_DETECTION: "/analytics/vehicle-detection",
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
  STANDARD_REPORTS: "/reports/standard",
  CUSTOM_REPORT_BUILDER: "/reports/custom-builder",
  EXPORT_CENTER: "/reports/export-center",
  PREDICTIVE_INSIGHTS: "/predictive-insights",
  DATA_VISUALIZATION: "/data-visualization",

  // WMS Integration
  WEBOC_SYNC: "/integrations/weboc-sync",
  API_LOGS: "/integrations/api-logs",

  // WMS User Management
  USER_ACCOUNTS: "/settings/user-accounts",
  ROLES_PERMISSIONS: "/settings/roles-permissions",
  ACTIVITY_LOGS: "/settings/activity-logs",

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

/** Nav group for sidebar (with children; children can be items or nested groups) */
export interface NavGroup {
  label: string
  children: (NavItem | NavGroup)[]
}

/** Sidebar navigation sections: each has a title and list of groups or items */
export const NAV_SECTIONS: { title: string; items: (NavItem | NavGroup)[] }[] = [
  {
    title: "MAIN MODULES",
    items: [
      { label: "Dashboard", href: ROUTES.DASHBOARD },
      // { label: "Executive Dashboard", href: ROUTES.DASHBOARD },
      {
        label: "Visitor Management",
        children: [
          {
            label: "Visitor Registration",
            children: [
              { label: "Pre-Registration", href: ROUTES.PRE_REGISTRATION },
              { label: "Walk-In Registration", href: ROUTES.WALK_IN_REGISTRATION },
              { label: "Calendar View", href: ROUTES.CALENDAR_VIEW },
            ],
          },
          {
            label: "Security & Screening",
            children: [
              { label: "Watchlist Screening", href: ROUTES.WATCHLIST_SCREENING },
              { label: "Blacklist Management", href: ROUTES.BLACKLIST_MANAGEMENT },
              { label: "Flagged Visitor Alerts", href: ROUTES.FLAGGED_VISITOR_ALERTS },
            ],
          },
          {
            label: "Access Control",
            children: [
              { label: "Zone Restrictions", href: ROUTES.ZONE_RESTRICTIONS },
              { label: "Gate Integration", href: ROUTES.GATE_INTEGRATION },
              { label: "Escort Requirement", href: ROUTES.ESCORT_REQUIREMENT },
            ],
          },
          {
            label: "Host & Department",
            children: [
              { label: "Visitor Notifications", href: ROUTES.VISITOR_NOTIFICATIONS },
              { label: "Upcoming Visits", href: ROUTES.UPCOMING_VISITS },
              { label: "Visitor History", href: ROUTES.VISITOR_HISTORY },
            ],
          },
          { label: "Guard & Reception Panel", href: ROUTES.GUARD_RECEPTION_PANEL },
          {
            label: "Vehicle & Contractor ",
            children: [
              { label: "Vehicle Registration", href: ROUTES.VEHICLE_REGISTRATION },
              { label: "Vehicle Tracking", href: ROUTES.VEHICLE_TRACKING },
              { label: "Contractor Passes", href: ROUTES.CONTRACTOR_PASSES },
              { label: "Cargo/Delivery Logs", href: ROUTES.CARGO_DELIVERY_LOGS },
            ],
          },
        ],
      },
      {
        label: "Armory",
        children: [
          { label: "Armory Dashboard", href: ROUTES.ARMORY },
        ],
      },
      {
        label: "Litigation Management",
        children: [
          {
            label: "Cases",
            children: [
              { label: "FIR Registration", href: ROUTES.FIR_REGISTRATION },
              { label: "Case File Creation", href: ROUTES.CASE_FILE_CREATION },
              { label: "Court Proceedings", href: ROUTES.COURT_PROCEEDINGS },
              { label: "Legal Documents", href: ROUTES.LEGAL_DOCUMENTS },
              { label: "Case Status Tracking", href: ROUTES.CASE_STATUS_TRACKING },
            ],
          },
        ],
      },
      {
        label: "Warehouse Management",
        children: [
          {
            label: "Dashboard", href: ROUTES.OPERATIONS_DASHBOARD,
          },
          {
            label: "Seizure & Receipt",
            children: [
              { label: "New Seizure Entry", href: ROUTES.NEW_SEIZURE_ENTRY },
              { label: "JCP/Toll Plaza Entry (ANPR)", href: ROUTES.JCP_TOLL_PLAZA_ENTRY },
              { label: "Goods Receipt & Handover", href: ROUTES.GOODS_RECEIPT_HANDOVER },
              { label: "AI Item Cataloging", href: ROUTES.AI_ITEM_CATALOGING },
              { label: "QR Code Generation", href: ROUTES.QR_CODE_GENERATION },
              { label: "Seizure Register", href: ROUTES.SEIZURE_REGISTER },
            ],
          },
          {
            label: "Warehouse",
            children: [
              { label: "Warehouse Setup", href: ROUTES.WAREHOUSE_SETUP },
              { label: "Zone & Location", href: ROUTES.ZONE_LOCATION_MANAGEMENT },
              { label: "Storage Allocation", href: ROUTES.STORAGE_ALLOCATION },
              { label: "Inventory Tracking", href: ROUTES.INVENTORY_TRACKING },
              { label: "Stock Reconciliation", href: ROUTES.STOCK_RECONCILIATION },
              { label: "Camera Integration", href: ROUTES.CAMERA_INTEGRATION },
            ],
          },
          {
            label: "Transfers & Handover",
            children: [
              { label: "Inter-Collectorate Transfer", href: ROUTES.INTER_COLLECTORATE_TRANSFER },
              { label: "Internal Movement", href: ROUTES.INTERNAL_MOVEMENT },
              { label: "Handover Requests", href: ROUTES.HANDOVER_REQUESTS },
              { label: "Double Authentication", href: ROUTES.DOUBLE_AUTHENTICATION },
              { label: "Transfer Tracking", href: ROUTES.TRANSFER_TRACKING },
            ],
          },
         
          {
            label: "Computer Vision",
            children: [
              { label: "Cameras", href: ROUTES.CAMERA_MANAGEMENT },
              { label: "Object Detection", href: ROUTES.OBJECT_DETECTION },
              { label: "ANPR Settings", href: ROUTES.ANPR_SETTINGS },
              { label: "Anomaly Detection", href: ROUTES.ANOMALY_DETECTION },
            ],
          },
          {
            label: "Integration",
            children: [
              { label: "WeBOC Sync", href: ROUTES.WEBOC_SYNC },
              { label: "API Logs", href: ROUTES.API_LOGS },
            ],
          },
          {
            label: "Reports",
            children: [
              { label: "Standard Reports", href: ROUTES.STANDARD_REPORTS },
              { label: "Custom Report Builder", href: ROUTES.CUSTOM_REPORT_BUILDER },
              { label: "Export Center", href: ROUTES.EXPORT_CENTER },
            ],
          },
         
          {
            label: "User",
            children: [
              { label: "User Accounts", href: ROUTES.USER_ACCOUNTS },
              { label: "Roles & Permissions", href: ROUTES.ROLES_PERMISSIONS },
              { label: "Activity Logs", href: ROUTES.ACTIVITY_LOGS },
            ],
          },
        ],
      },
      {
        label: "Auction Management",
        children: [
          { label: "ASO Portal Sync", href: ROUTES.ASO_PORTAL_SYNC },
          { label: "Bidding Management", href: ROUTES.BIDDING_MANAGEMENT },
          { label: "Sale Completion", href: ROUTES.SALE_COMPLETION },
          { label: "Revenue Reports", href: ROUTES.REVENUE_REPORTS },
        ],
      },
      {
        label: "AI Analytics",
        children: [
          { label: "Analytics Dashboard", href: ROUTES.ANALYTICS_DASHBOARD },
          { label: "Live Camera Grid", href: ROUTES.LIVE_CAMERA_GRID },
          { label: "Vehicle Detection", href: ROUTES.VEHICLE_DETECTION },
          { label: "Reports", href: ROUTES.REPORTS },
          { label: "Predictive Insights", href: ROUTES.PREDICTIVE_INSIGHTS },
          { label: "Data Visualization", href: ROUTES.DATA_VISUALIZATION },
        ],
      },
      {
        label: "Human Resource",
        children: [
          { label: "Employees", href: ROUTES.EMPLOYEES },
          { label: "Attendance", href: ROUTES.ATTENDANCE },
          { label: "Leave", href: ROUTES.LEAVE_MANAGEMENT },
          { label: "Payroll", href: ROUTES.PAYROLL },
          { label: "Recruitment", href: ROUTES.RECRUITMENT },
        ],
      },
      {
        label: "System Configuration",
        children: [
          { label: "General Settings", href: ROUTES.GENERAL_SETTINGS },
          { label: "User & Role", href: ROUTES.USER_ROLE_MANAGEMENT },
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
  const ancestors = getAncestorMenusForPath(pathname)
  return ancestors.length > 0 ? ancestors[0]! : null
}

/** All group labels that contain this path (top to leaf), for expanding nested sidebar. */
export function getAncestorMenusForPath(pathname: string): string[] {
  function findInGroup(group: NavGroup, parents: string[]): string[] | null {
    for (const child of group.children) {
      if ("href" in child) {
        if (child.href === pathname) return [...parents, group.label]
      } else {
        const found = findInGroup(child, [...parents, group.label])
        if (found) return found
      }
    }
    return null
  }
  for (const section of NAV_SECTIONS) {
    for (const item of section.items) {
      if ("children" in item) {
        const found = findInGroup(item as NavGroup, [])
        if (found) return found
      }
    }
  }
  return []
}
