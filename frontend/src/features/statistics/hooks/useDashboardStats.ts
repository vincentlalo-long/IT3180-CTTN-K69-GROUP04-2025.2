import { CalendarCheck2, ChartColumn, CircleDashed, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { axiosInstance } from "../../../services/http";
import {
  formatCurrency,
  formatVacancyRate,
  resolveDashboardFacilityId,
} from "../utils/statistics.utils";

export interface DashboardStatsResponse {
  totalRevenue: number;
  totalBookings: number;
  activeFields: number;
  uniqueCustomers: number;
  vacancyRate: string | number;
}

export interface RecentOrderDto {
  id: string;
  customerName: string;
  fieldName: string;
  bookingTime: string;
  price: number;
  status: string;
}

async function getDashboardStats(
  facilityId: string | "ALL",
): Promise<DashboardStatsResponse> {
  const { data } = await axiosInstance.get<DashboardStatsResponse>(
    "/admin/dashboard/stats",
    {
      params: {
        facilityId,
      },
    },
  );

  return data;
}

async function getRecentOrders(
  facilityId: string | "ALL",
): Promise<RecentOrderDto[]> {
  const { data } = await axiosInstance.get<RecentOrderDto[]>(
    "/admin/dashboard/recent-orders",
    {
      params: {
        facilityId,
      },
    },
  );

  return data;
}

interface DashboardStatCard {
  title: string;
  value: string;
  icon: typeof ChartColumn;
  trend: {
    value: string;
    direction: "up" | "down";
  };
}

export function useDashboardStats(
  selectedFacilityId: string,
  apiFacilityId?: string,
  selectedFacilityName?: string,
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
          getDashboardStats(dashboardFacilityId),
          getRecentOrders(dashboardFacilityId),
        ]);

        if (!isActive) {
          return;
        }

        setDashboardStats(statsResponse as DashboardStatsResponse);
        setRecentOrders(recentOrdersResponse as RecentOrderDto[]);
      } catch (error: unknown) {
        if (!isActive) {
          return;
        }

        const message =
          error instanceof Error
            ? error.message
            : "Không thể tải dữ liệu dashboard";
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
  }, [dashboardFacilityId]);

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
          value: `${dashboardStats.activeFields} sân đang hoạt động`,
          direction: "up",
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
        title: "Tỷ lệ trống sân",
        value: formatVacancyRate(dashboardStats.vacancyRate),
        icon: CircleDashed,
        trend: {
          value: `${dashboardStats.activeFields} sân đang theo dõi`,
          direction: "down",
        },
      },
    ];
  }, [dashboardStats, isAllFacilities, selectedFacilityName]);

  return {
    statCards,
    recentOrders,
    isLoading,
    errorMessage,
    facilityLabel,
  };
}

export type { DashboardStatCard };
