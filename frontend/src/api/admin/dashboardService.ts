import { axiosInstance } from "../axiosInstance";
import type { DashboardStatsResponse, RecentOrderDto } from "../types/admin";

export async function getDashboardStats(
  facilityId: string | "ALL",
): Promise<DashboardStatsResponse> {
  const { data } = await axiosInstance.get<DashboardStatsResponse>(
    "/managers/dashboard/stats",
    {
      params: {
        facilityId,
      },
    },
  );

  return data;
}

export async function getRecentOrders(
  facilityId: string | "ALL",
): Promise<RecentOrderDto[]> {
  const { data } = await axiosInstance.get<RecentOrderDto[]>(
    "/managers/dashboard/recent-orders",
    {
      params: {
        facilityId,
      },
    },
  );

  return data;
}
