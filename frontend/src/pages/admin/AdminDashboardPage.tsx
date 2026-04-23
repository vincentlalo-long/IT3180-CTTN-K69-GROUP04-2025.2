import {
  AlertCircle,
  CalendarCheck2,
  ChartColumn,
  CircleDashed,
  LoaderCircle,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";

import {
  getDashboardStats,
  getRecentOrders,
} from "../../api/admin/dashboardService";
import type {
  DashboardStatsResponse,
  RecentOrderDto,
} from "../../api/types/admin";
import { StatCard } from "../../components/admin/StatCard";
import { useFacilityContext } from "../../contexts/useFacilityContext";

const formatCurrency = (amount: number): string => {
  if (amount >= 1_000_000_000) {
    return `${(amount / 1_000_000_000).toFixed(2)} tỷ VNĐ`;
  }

  if (amount >= 1_000_000) {
    return `${(amount / 1_000_000).toFixed(1)} triệu VNĐ`;
  }

  return `${amount.toLocaleString("vi-VN")} VNĐ`;
};

const formatVacancyRate = (vacancyRate: string | number): string => {
  if (typeof vacancyRate === "number") {
    return `${vacancyRate.toFixed(1)}%`;
  }

  return vacancyRate;
};

const resolveDashboardFacilityId = (
  selectedFacilityId: string,
  apiFacilityId?: string,
): string | "ALL" => {
  if (selectedFacilityId === "all") {
    return "ALL";
  }

  if (/^\d+$/.test(selectedFacilityId)) {
    return selectedFacilityId;
  }

  if (apiFacilityId && /^\d+$/.test(apiFacilityId)) {
    return apiFacilityId;
  }

  return "ALL";
};

export function AdminDashboardPage() {
  const { selectedFacility, selectedFacilityId } = useFacilityContext();
  const [dashboardStats, setDashboardStats] =
    useState<DashboardStatsResponse | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrderDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const dashboardFacilityId = resolveDashboardFacilityId(
    selectedFacilityId,
    selectedFacility?.apiFacilityId,
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

        setDashboardStats(statsResponse);
        setRecentOrders(recentOrdersResponse);
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

  const dashboardStatsCards = dashboardStats
    ? [
        {
          title: "Tổng doanh thu",
          value: formatCurrency(dashboardStats.totalRevenue),
          icon: ChartColumn,
          trend: {
            value: isAllFacilities
              ? "Theo toàn hệ thống"
              : `Tại ${selectedFacility?.name ?? "khu sân hiện tại"}`,
            direction: "up" as const,
          },
        },
        {
          title: "Đơn đặt mới",
          value: dashboardStats.totalBookings.toString(),
          icon: CalendarCheck2,
          trend: {
            value: `${dashboardStats.activeFields} sân đang hoạt động`,
            direction: "up" as const,
          },
        },
        {
          title: "Số khách hàng",
          value: dashboardStats.uniqueCustomers.toString(),
          icon: Users,
          trend: {
            value: "Dữ liệu trực tiếp từ API",
            direction: "up" as const,
          },
        },
        {
          title: "Tỷ lệ trống sân",
          value: formatVacancyRate(dashboardStats.vacancyRate),
          icon: CircleDashed,
          trend: {
            value: `${dashboardStats.activeFields} sân đang theo dõi`,
            direction: "down" as const,
          },
        },
      ]
    : [];

  const facilityLabel = isAllFacilities
    ? "Đang hiển thị số liệu gộp của toàn bộ khu sân"
    : `Đang hiển thị số liệu của ${selectedFacility?.name ?? "khu sân hiện tại"}`;

  return (
    <section className="space-y-6 lg:space-y-8">
      <div className="rounded-2xl border border-white/15 bg-[#005E2E]/35 px-5 py-3 text-sm text-white/90">
        <div className="flex items-center gap-2">
          {isLoading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
          <span>{facilityLabel}</span>
        </div>
      </div>

      {errorMessage ? (
        <div className="rounded-2xl border border-red-400/30 bg-red-500/15 px-5 py-3 text-sm text-red-50">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            <span>{errorMessage}</span>
          </div>
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {isLoading
          ? Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="h-[146px] animate-pulse rounded-2xl border border-white/15 bg-[#005E2E]/45 p-5"
              >
                <div className="h-4 w-24 rounded bg-white/12" />
                <div className="mt-4 h-8 w-32 rounded bg-white/12" />
                <div className="mt-6 h-7 w-40 rounded-full bg-white/12" />
              </div>
            ))
          : dashboardStatsCards.map((stat) => (
              <StatCard
                key={stat.title}
                title={stat.title}
                value={stat.value}
                icon={stat.icon}
                trend={stat.trend}
              />
            ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-[2fr_1fr]">
        <div className="rounded-2xl border border-white/15 bg-[#005E2E]/45 p-6 shadow-[0_12px_28px_-16px_rgba(0,0,0,0.55)]">
          <h2 className="text-base font-semibold text-admin-text-primary">
            Đơn hàng gần nhất
          </h2>
          <div className="mt-4 min-h-[320px] rounded-xl border border-white/15 bg-[#005E2E]/35 p-4">
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-16 animate-pulse rounded-xl border border-white/10 bg-white/8"
                  />
                ))}
              </div>
            ) : recentOrders.length > 0 ? (
              <ul className="space-y-3">
                {recentOrders.map((order) => (
                  <li
                    key={order.id}
                    className="flex flex-col gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="font-semibold text-admin-text-primary">
                        {order.customerName}
                      </p>
                      <p className="text-sm text-admin-text-secondary">
                        {order.fieldName} · {order.bookingTime}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-white">
                        {formatCurrency(order.price)}
                      </span>
                      <span className="rounded-full bg-[#005E2E]/70 px-3 py-1 text-xs font-semibold text-white">
                        {order.status}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex h-full min-h-[288px] items-center justify-center rounded-xl border border-dashed border-white/20 text-sm text-admin-text-secondary">
                Chưa có đơn hàng gần nhất
              </div>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-white/15 bg-[#005E2E]/45 p-6 shadow-[0_12px_28px_-16px_rgba(0,0,0,0.55)]">
          <h2 className="text-base font-semibold text-admin-text-primary">
            Biểu đồ hiệu suất sân
          </h2>
          <div className="mt-4 h-[320px] rounded-xl border-2 border-dashed border-white/25 bg-[#005E2E]/35" />
        </div>
      </div>
    </section>
  );
}
