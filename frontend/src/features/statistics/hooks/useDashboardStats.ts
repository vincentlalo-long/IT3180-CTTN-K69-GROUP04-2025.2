import { CalendarCheck2, ChartColumn, CircleDashed, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { apiClient } from "@/shared/api/apiClient";
import { getApiErrorMessage, logApiError } from "@/shared/utils/apiError";
import type {
  DashboardStatCard,
  DashboardStatsResponse,
  RecentOrderDto,
} from "../types/statistics.types";
import {
  formatCurrency,
  resolveDashboardFacilityId,
} from "../utils/statistics.utils";

async function getDashboardStats(
  facilityId: string | "ALL",
  timeRange: string,
  startDate?: string,
  endDate?: string,
): Promise<DashboardStatsResponse> {
  const { data } = await apiClient.get<DashboardStatsResponse>(
    "/admin/dashboard/stats",
    {
      params: {
        facilityId,
        timeRange,
        startDate,
        endDate,
      },
    },
  );

  return data;
}

async function getRecentOrders(
  facilityId: string | "ALL",
  timeRange: string,
  startDate?: string,
  endDate?: string,
): Promise<RecentOrderDto[]> {
  const { data } = await apiClient.get<RecentOrderDto[]>(
    "/admin/dashboard/recent-orders",
    {
      params: {
        facilityId,
        timeRange,
        startDate,
        endDate,
      },
    },
  );

  return data;
}

export function useDashboardStats(
  selectedFacilityId: string,
  apiFacilityId: string | undefined,
  selectedFacilityName: string | undefined,
  timeRange: string,
  startDate?: string,
  endDate?: string,
) {
  const [dashboardStats, setDashboardStats] =
    useState<DashboardStatsResponse | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrderDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const dashboardFacilityId = resolveDashboardFacilityId(
    selectedFacilityId,
    apiFacilityId,
  );

  useEffect(() => {
    let isActive = true;

    const fetchDashboardData = async () => {
      if (!isActive) {
        return;
      }

      setIsLoading(true);
      setErrorMessage(null);

      try {
        const [statsResponse, recentOrdersResponse] = await Promise.all([
          getDashboardStats(dashboardFacilityId, timeRange, startDate, endDate),
          getRecentOrders(dashboardFacilityId, timeRange, startDate, endDate),
        ]);

        if (!isActive) {
          return;
        }

        setDashboardStats(statsResponse);
        setRecentOrders(recentOrdersResponse);
      } catch (error: unknown) {
        if (!isActive) {
          return;
        }

        const message = getApiErrorMessage(
          error,
          "Không thể tải dữ liệu dashboard",
        );
        logApiError("useDashboardStats.fetchDashboardData", error, {
          dashboardFacilityId,
          timeRange,
          startDate,
          endDate,
        });
        setErrorMessage(message);
        setDashboardStats(null);
        setRecentOrders([]);
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    void fetchDashboardData();

    return () => {
      isActive = false;
    };
  }, [dashboardFacilityId, timeRange, startDate, endDate]);

  const isAllFacilities = selectedFacilityId === "all";

  const facilityLabel = useMemo(
    () =>
      isAllFacilities
        ? "Đang hiển thị số liệu gộp của toàn bộ khu sân"
        : `Đang hiển thị số liệu của ${selectedFacilityName ?? "khu sân hiện tại"}`,
    [isAllFacilities, selectedFacilityName],
  );

  const statCards = useMemo<DashboardStatCard[]>(() => {
    if (!dashboardStats) {
      return [];
    }

    return [
      {
        title: "Tổng doanh thu",
        value: formatCurrency(dashboardStats.totalRevenue),
        icon: ChartColumn,
        trend: {
          value: isAllFacilities
            ? "Theo toàn hệ thống"
            : `Tại ${selectedFacilityName ?? "khu sân hiện tại"}`,
          direction: "up",
        },
      },
      {
        title: "Đơn đặt mới",
        value: dashboardStats.totalBookings.toString(),
        icon: CalendarCheck2,
        trend: {
          value: `${dashboardStats.canceledBookings} đơn đã hủy`,
          direction: "down",
        },
      },
      {
        title: "Số khách hàng",
        value: dashboardStats.uniqueCustomers.toString(),
        icon: Users,
        trend: {
          value: "Dữ liệu trực tiếp từ API",
          direction: "up",
        },
      },
      {
        title: "Tỷ lệ lấp đầy",
        value: `${dashboardStats.occupancyRate}%`,
        icon: CircleDashed,
        trend: {
          value: "Tỷ lệ sử dụng thực tế",
          direction: "up",
        },
      },
    ];
  }, [dashboardStats, isAllFacilities, selectedFacilityName]);

  return {
    dashboardStats,
    statCards,
    recentOrders,
    isLoading,
    errorMessage,
    facilityLabel,
  };
}
