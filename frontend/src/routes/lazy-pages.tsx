import { lazy, Suspense } from "react"
import { createBrowserRouter, Navigate } from "react-router-dom"
import { AuthGuard } from "@/components/auth-guard"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Spinner } from "@/components/ui/spinner"

const Dashboard = lazy(() => import("@/pages/dashboard/Dashboard").then((m) => ({ default: m.Dashboard })))
const Login = lazy(() => import("@/pages/auth/login").then((m) => ({ default: m.default })))
const PreRegistration = lazy(() => import("@/pages/registration/PreRegistration").then((m) => ({ default: m.default })))
const WalkInRegistration = lazy(() => import("@/pages/registration/WalkInRegistration").then((m) => ({ default: m.default })))
const StreamedUpload = lazy(() => import("@/pages/registration/StreamedUpload").then((m) => ({ default: m.default })))
const PhotoCapture = lazy(() => import("@/pages/registration/PhotoCapture").then((m) => ({ default: m.default })))
const QRCodeGeneration = lazy(() => import("@/pages/registration/QRCodeGeneration").then((m) => ({ default: m.default })))
const VisitorDetail = lazy(() => import("@/pages/registration/VisitorDetail").then((m) => ({ default: m.default })))
const VisitorEdit = lazy(() => import("@/pages/registration/VisitorEdit").then((m) => ({ default: m.default })))
const AppointmentScheduling = lazy(() => import("@/pages/registration/AppointmentScheduling").then((m) => ({ default: m.default })))
const TimeSlotBooking = lazy(() => import("@/pages/registration/TimeSlotBooking").then((m) => ({ default: m.default })))
const HostSelection = lazy(() => import("@/pages/registration/HostSelection").then((m) => ({ default: m.default })))
const VisitPurpose = lazy(() => import("@/pages/registration/VisitPurpose").then((m) => ({ default: m.default })))
const CalendarView = lazy(() => import("@/pages/registration/CalendarView").then((m) => ({ default: m.default })))
const ActiveVisitors = lazy(() => import("@/pages/vms/ActiveVisitors").then((m) => ({ default: m.default })))
const ApprovalWorkflow = lazy(() => import("@/pages/vms/ApprovalWorkflow").then((m) => ({ default: m.default })))
const CheckInOut = lazy(() => import("@/pages/vms/CheckInOut").then((m) => ({ default: m.default })))
const SecurityScreening = lazy(() => import("@/pages/vms/SecurityScreening").then((m) => ({ default: m.default })))
const VehicleContractor = lazy(() => import("@/pages/vms/VehicleContractor").then((m) => ({ default: m.default })))
const VmsReportsAnalytics = lazy(() => import("@/pages/vms/VmsReportsAnalytics").then((m) => ({ default: m.default })))
const Communication = lazy(() => import("@/pages/vms/Communication").then((m) => ({ default: m.default })))
const WatchlistScreening = lazy(() => import("@/pages/vms/WatchlistScreening").then((m) => ({ default: m.default })))
const BlacklistManagement = lazy(() => import("@/pages/vms/BlacklistManagement").then((m) => ({ default: m.default })))
const FlaggedVisitorAlerts = lazy(() => import("@/pages/vms/FlaggedVisitorAlerts").then((m) => ({ default: m.default })))
const ZoneRestrictions = lazy(() => import("@/pages/vms/ZoneRestrictions").then((m) => ({ default: m.default })))
const GateIntegration = lazy(() => import("@/pages/vms/GateIntegration").then((m) => ({ default: m.default })))
const EscortRequirement = lazy(() => import("@/pages/vms/EscortRequirement").then((m) => ({ default: m.default })))
const VisitorNotifications = lazy(() => import("@/pages/vms/VisitorNotifications").then((m) => ({ default: m.default })))
const UpcomingVisits = lazy(() => import("@/pages/vms/UpcomingVisits").then((m) => ({ default: m.default })))
const VisitorHistory = lazy(() => import("@/pages/vms/VisitorHistory").then((m) => ({ default: m.default })))
const GuardReceptionPanel = lazy(() => import("@/pages/vms/GuardReceptionPanel").then((m) => ({ default: m.default })))
const WarehouseSetup = lazy(() => import("@/pages/warehouse/WarehouseSetup").then((m) => ({ default: m.default })))
const ZoneLocationManagement = lazy(() => import("@/pages/warehouse/ZoneLocationManagement").then((m) => ({ default: m.default })))
const StorageAllocation = lazy(() => import("@/pages/warehouse/StorageAllocation").then((m) => ({ default: m.default })))
const InventoryTracking = lazy(() => import("@/pages/warehouse/InventoryTracking").then((m) => ({ default: m.default })))
const StockReconciliation = lazy(() => import("@/pages/warehouse/StockReconciliation").then((m) => ({ default: m.default })))
const CameraIntegration = lazy(() => import("@/pages/cameras/CameraIntegration").then((m) => ({ default: m.default })))
const OperationsDashboard = lazy(() => import("@/pages/operations/OperationsDashboard").then((m) => ({ default: m.default })))
const AnalyticsDashboard = lazy(() => import("@/pages/operations/AnalyticsDashboard").then((m) => ({ default: m.default })))
const LiveMonitoring = lazy(() => import("@/pages/cameras/LiveMonitoring").then((m) => ({ default: m.default })))
const NewSeizureEntry = lazy(() => import("@/pages/seizures/NewSeizureEntry").then((m) => ({ default: m.default })))
const JcpTollPlazaEntry = lazy(() => import("@/pages/seizures/JcpTollPlazaEntry").then((m) => ({ default: m.default })))
const GoodsReceiptHandover = lazy(() => import("@/pages/seizures/GoodsReceiptHandover").then((m) => ({ default: m.default })))
const AiItemCataloging = lazy(() => import("@/pages/seizures/AiItemCataloging").then((m) => ({ default: m.default })))
const SeizureRegister = lazy(() => import("@/pages/seizures/SeizureRegister").then((m) => ({ default: m.default })))
const FirRegistration = lazy(() => import("@/pages/seizures/FirRegistration").then((m) => ({ default: m.default })))
const CaseFileCreation = lazy(() => import("@/pages/seizures/CaseFileCreation").then((m) => ({ default: m.default })))
const CourtProceedings = lazy(() => import("@/pages/seizures/CourtProceedings").then((m) => ({ default: m.default })))
const LegalDocuments = lazy(() => import("@/pages/seizures/LegalDocuments").then((m) => ({ default: m.default })))
const CaseStatusTracking = lazy(() => import("@/pages/seizures/CaseStatusTracking").then((m) => ({ default: m.default })))
const InterCollectorateTransfer = lazy(() => import("@/pages/transfers/InterCollectorateTransfer").then((m) => ({ default: m.default })))
const InternalMovement = lazy(() => import("@/pages/transfers/InternalMovement").then((m) => ({ default: m.default })))
const HandoverRequests = lazy(() => import("@/pages/transfers/HandoverRequests").then((m) => ({ default: m.default })))
const DoubleAuthentication = lazy(() => import("@/pages/transfers/DoubleAuthentication").then((m) => ({ default: m.default })))
const TransferTracking = lazy(() => import("@/pages/transfers/TransferTracking").then((m) => ({ default: m.default })))
const PerishableRegister = lazy(() => import("@/pages/inventory/PerishableRegister").then((m) => ({ default: m.default })))
const ExpiryTracking = lazy(() => import("@/pages/inventory/ExpiryTracking").then((m) => ({ default: m.default })))
const PriorityDisposalQueue = lazy(() => import("@/pages/inventory/PriorityDisposalQueue").then((m) => ({ default: m.default })))
const DestructionOrders = lazy(() => import("@/pages/inventory/DestructionOrders").then((m) => ({ default: m.default })))
const LotCreation = lazy(() => import("@/pages/inventory/LotCreation").then((m) => ({ default: m.default })))
const ItemValuation = lazy(() => import("@/pages/inventory/ItemValuation").then((m) => ({ default: m.default })))
const AsoPortalSync = lazy(() => import("@/pages/auction/AsoPortalSync").then((m) => ({ default: m.default })))
const BiddingManagement = lazy(() => import("@/pages/auction/BiddingManagement").then((m) => ({ default: m.default })))
const SaleCompletion = lazy(() => import("@/pages/auction/SaleCompletion").then((m) => ({ default: m.default })))
const RevenueReports = lazy(() => import("@/pages/auction/RevenueReports").then((m) => ({ default: m.default })))
const CameraManagement = lazy(() => import("@/pages/cameras/CameraManagement").then((m) => ({ default: m.default })))
const ObjectDetection = lazy(() => import("@/pages/cameras/ObjectDetection").then((m) => ({ default: m.default })))
const AnprSettings = lazy(() => import("@/pages/cameras/AnprSettings").then((m) => ({ default: m.default })))
const AnomalyDetection = lazy(() => import("@/pages/cameras/AnomalyDetection").then((m) => ({ default: m.default })))
const Reports = lazy(() => import("@/pages/reports/Reports").then((m) => ({ default: m.default })))
const PredictiveInsights = lazy(() => import("@/pages/reports/PredictiveInsights").then((m) => ({ default: m.default })))
const DataVisualization = lazy(() => import("@/pages/reports/DataVisualization").then((m) => ({ default: m.default })))
const Employees = lazy(() => import("@/pages/hr/Employees").then((m) => ({ default: m.default })))
const Attendance = lazy(() => import("@/pages/hr/Attendance").then((m) => ({ default: m.default })))
const LeaveManagement = lazy(() => import("@/pages/hr/LeaveManagement").then((m) => ({ default: m.default })))
const Payroll = lazy(() => import("@/pages/hr/Payroll").then((m) => ({ default: m.default })))
const Recruitment = lazy(() => import("@/pages/hr/Recruitment").then((m) => ({ default: m.default })))
const GeneralSettings = lazy(() => import("@/pages/settings/GeneralSettings").then((m) => ({ default: m.default })))
const UserRoleManagement = lazy(() => import("@/pages/settings/UserRoleManagement").then((m) => ({ default: m.default })))
const Integrations = lazy(() => import("@/pages/settings/Integrations").then((m) => ({ default: m.default })))
const Notifications = lazy(() => import("@/pages/settings/Notifications").then((m) => ({ default: m.default })))
const SecurityAccess = lazy(() => import("@/pages/settings/SecurityAccess").then((m) => ({ default: m.default })))
const NotFound = lazy(() => import("@/pages/NotFound").then((m) => ({ default: m.NotFound })))

/** Map of page keys to lazy components; used by routes.tsx and route-list. */
export const PAGES = {
  Dashboard,
  Login,
  PreRegistration,
  WalkInRegistration,
  StreamedUpload,
  PhotoCapture,
  QRCodeGeneration,
  VisitorDetail,
  VisitorEdit,
  AppointmentScheduling,
  TimeSlotBooking,
  HostSelection,
  VisitPurpose,
  CalendarView,
  ActiveVisitors,
  ApprovalWorkflow,
  CheckInOut,
  SecurityScreening,
  VehicleContractor,
  VmsReportsAnalytics,
  Communication,
  WatchlistScreening,
  BlacklistManagement,
  FlaggedVisitorAlerts,
  ZoneRestrictions,
  GateIntegration,
  EscortRequirement,
  VisitorNotifications,
  UpcomingVisits,
  VisitorHistory,
  GuardReceptionPanel,
  WarehouseSetup,
  ZoneLocationManagement,
  StorageAllocation,
  InventoryTracking,
  StockReconciliation,
  CameraIntegration,
  OperationsDashboard,
  AnalyticsDashboard,
  LiveMonitoring,
  NewSeizureEntry,
  JcpTollPlazaEntry,
  GoodsReceiptHandover,
  AiItemCataloging,
  SeizureRegister,
  FirRegistration,
  CaseFileCreation,
  CourtProceedings,
  LegalDocuments,
  CaseStatusTracking,
  InterCollectorateTransfer,
  InternalMovement,
  HandoverRequests,
  DoubleAuthentication,
  TransferTracking,
  PerishableRegister,
  ExpiryTracking,
  PriorityDisposalQueue,
  DestructionOrders,
  LotCreation,
  ItemValuation,
  AsoPortalSync,
  BiddingManagement,
  SaleCompletion,
  RevenueReports,
  CameraManagement,
  ObjectDetection,
  AnprSettings,
  AnomalyDetection,
  Reports,
  PredictiveInsights,
  DataVisualization,
  Employees,
  Attendance,
  LeaveManagement,
  Payroll,
  Recruitment,
  GeneralSettings,
  UserRoleManagement,
  Integrations,
  Notifications,
  SecurityAccess,
  NotFound,
}

function LazyRoute({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<PageLoader />}>{children}</Suspense>
}

function PageLoader() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center">
      <Spinner className="h-8 w-8 text-[#3b82f6]" />
    </div>
  )
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AuthGuard />,
    children: [
      { path: "login", element: <LazyRoute><Login /></LazyRoute> },
      {
        element: <DashboardLayout />,
        children: [
          { index: true, element: <LazyRoute><Dashboard /></LazyRoute> },
          { path: "pre-registration", element: <LazyRoute><PreRegistration /></LazyRoute> },
          { path: "walk-in-registration", element: <LazyRoute><WalkInRegistration /></LazyRoute> },
          { path: "visitors/:id", element: <LazyRoute><VisitorDetail /></LazyRoute> },
          { path: "visitors/:id/edit", element: <LazyRoute><VisitorEdit /></LazyRoute> },
          { path: "streamed-upload", element: <LazyRoute><StreamedUpload /></LazyRoute> },
          { path: "photo-capture", element: <LazyRoute><PhotoCapture /></LazyRoute> },
          { path: "qr-code-generation", element: <LazyRoute><QRCodeGeneration /></LazyRoute> },
          { path: "appointment-scheduling", element: <LazyRoute><AppointmentScheduling /></LazyRoute> },
          { path: "time-slot-booking", element: <LazyRoute><TimeSlotBooking /></LazyRoute> },
          { path: "host-selection", element: <LazyRoute><HostSelection /></LazyRoute> },
          { path: "visit-purpose", element: <LazyRoute><VisitPurpose /></LazyRoute> },
          { path: "calendar-view", element: <LazyRoute><CalendarView /></LazyRoute> },
          { path: "warehouse-setup", element: <LazyRoute><WarehouseSetup /></LazyRoute> },
          { path: "zone-location-management", element: <LazyRoute><ZoneLocationManagement /></LazyRoute> },
          { path: "storage-allocation", element: <LazyRoute><StorageAllocation /></LazyRoute> },
          { path: "inventory-tracking", element: <LazyRoute><InventoryTracking /></LazyRoute> },
          { path: "stock-reconciliation", element: <LazyRoute><StockReconciliation /></LazyRoute> },
          { path: "camera-integration", element: <LazyRoute><CameraIntegration /></LazyRoute> },
          { path: "operations-dashboard", element: <LazyRoute><OperationsDashboard /></LazyRoute> },
          { path: "analytics-dashboard", element: <LazyRoute><AnalyticsDashboard /></LazyRoute> },
          { path: "live-monitoring", element: <LazyRoute><LiveMonitoring /></LazyRoute> },
          { path: "new-seizure-entry", element: <LazyRoute><NewSeizureEntry /></LazyRoute> },
          { path: "jcp-toll-plaza-entry", element: <LazyRoute><JcpTollPlazaEntry /></LazyRoute> },
          { path: "goods-receipt-handover", element: <LazyRoute><GoodsReceiptHandover /></LazyRoute> },
          { path: "ai-item-cataloging", element: <LazyRoute><AiItemCataloging /></LazyRoute> },
          { path: "seizure-register", element: <LazyRoute><SeizureRegister /></LazyRoute> },
          { path: "fir-registration", element: <LazyRoute><FirRegistration /></LazyRoute> },
          { path: "case-file-creation", element: <LazyRoute><CaseFileCreation /></LazyRoute> },
          { path: "court-proceedings", element: <LazyRoute><CourtProceedings /></LazyRoute> },
          { path: "legal-documents", element: <LazyRoute><LegalDocuments /></LazyRoute> },
          { path: "case-status-tracking", element: <LazyRoute><CaseStatusTracking /></LazyRoute> },
          { path: "inter-collectorate-transfer", element: <LazyRoute><InterCollectorateTransfer /></LazyRoute> },
          { path: "internal-movement", element: <LazyRoute><InternalMovement /></LazyRoute> },
          { path: "handover-requests", element: <LazyRoute><HandoverRequests /></LazyRoute> },
          { path: "double-authentication", element: <LazyRoute><DoubleAuthentication /></LazyRoute> },
          { path: "transfer-tracking", element: <LazyRoute><TransferTracking /></LazyRoute> },
          { path: "perishable-register", element: <LazyRoute><PerishableRegister /></LazyRoute> },
          { path: "expiry-tracking", element: <LazyRoute><ExpiryTracking /></LazyRoute> },
          { path: "priority-disposal-queue", element: <LazyRoute><PriorityDisposalQueue /></LazyRoute> },
          { path: "destruction-orders", element: <LazyRoute><DestructionOrders /></LazyRoute> },
          { path: "lot-creation", element: <LazyRoute><LotCreation /></LazyRoute> },
          { path: "item-valuation", element: <LazyRoute><ItemValuation /></LazyRoute> },
          { path: "aso-portal-sync", element: <LazyRoute><AsoPortalSync /></LazyRoute> },
          { path: "bidding-management", element: <LazyRoute><BiddingManagement /></LazyRoute> },
          { path: "sale-completion", element: <LazyRoute><SaleCompletion /></LazyRoute> },
          { path: "revenue-reports", element: <LazyRoute><RevenueReports /></LazyRoute> },
          { path: "camera-management", element: <LazyRoute><CameraManagement /></LazyRoute> },
          { path: "object-detection", element: <LazyRoute><ObjectDetection /></LazyRoute> },
          { path: "anpr-settings", element: <LazyRoute><AnprSettings /></LazyRoute> },
          { path: "anomaly-detection", element: <LazyRoute><AnomalyDetection /></LazyRoute> },
          { path: "reports", element: <LazyRoute><Reports /></LazyRoute> },
          { path: "predictive-insights", element: <LazyRoute><PredictiveInsights /></LazyRoute> },
          { path: "data-visualization", element: <LazyRoute><DataVisualization /></LazyRoute> },
          { path: "employees", element: <LazyRoute><Employees /></LazyRoute> },
          { path: "attendance", element: <LazyRoute><Attendance /></LazyRoute> },
          { path: "leave-management", element: <LazyRoute><LeaveManagement /></LazyRoute> },
          { path: "payroll", element: <LazyRoute><Payroll /></LazyRoute> },
          { path: "recruitment", element: <LazyRoute><Recruitment /></LazyRoute> },
          { path: "general-settings", element: <LazyRoute><GeneralSettings /></LazyRoute> },
          { path: "user-role-management", element: <LazyRoute><UserRoleManagement /></LazyRoute> },
          { path: "integrations", element: <LazyRoute><Integrations /></LazyRoute> },
          { path: "notifications", element: <LazyRoute><Notifications /></LazyRoute> },
          { path: "security-access", element: <LazyRoute><SecurityAccess /></LazyRoute> },
          { path: "*", element: <Navigate to="/" replace /> },
        ],
      },
    ],
  },
])
