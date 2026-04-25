export { RecentOrderList } from "./components/admin/RecentOrderList";
export * from "./components/admin/StatCard";
export {
  useDashboardStats,
  type DashboardStatsResponse,
  type DashboardStatCard,
  type RecentOrderDto,
} from "./hooks/useDashboardStats";
export {
  formatCurrency,
  formatVacancyRate,
  resolveDashboardFacilityId,
} from "./utils/statistics.utils";
