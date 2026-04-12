import { CalendarCheck2, ChartColumn, CircleDashed, Users } from "lucide-react";

import { StatCard } from "../../components/admin/StatCard";
import {
  ALL_FACILITIES_ID,
  ADMIN_TIME_SLOTS,
  fields,
  mockBookings,
  mockOrders,
} from "../../data/mockAdminData";
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

export function AdminDashboardPage() {
  const { selectedFacility, selectedFacilityId } = useFacilityContext();

  const isAllFacilities = selectedFacilityId === ALL_FACILITIES_ID;
  const filteredFields = isAllFacilities
    ? fields
    : fields.filter((field) => field.facilityId === selectedFacilityId);

  const filteredBookings = isAllFacilities
    ? mockBookings
    : mockBookings.filter(
        (booking) => booking.facilityId === selectedFacilityId,
      );

  const filteredOrders = isAllFacilities
    ? mockOrders
    : mockOrders.filter((order) => order.facilityId === selectedFacilityId);

  const totalRevenue = filteredOrders.reduce(
    (sum, order) => sum + order.totalPrice,
    0,
  );
  const totalBookings = filteredBookings.filter(
    (booking) =>
      booking.status === "booked" || booking.status === "in-progress",
  ).length;
  const uniqueCustomers = new Set(
    filteredBookings
      .map((booking) => booking.customerPhone)
      .filter((phone): phone is string => Boolean(phone)),
  ).size;

  const totalSlots = filteredFields.length * ADMIN_TIME_SLOTS.length;
  const occupiedSlots = filteredBookings.filter(
    (booking) =>
      booking.status === "booked" || booking.status === "in-progress",
  ).length;
  const vacancyRate = totalSlots
    ? `${Math.max(0, ((totalSlots - occupiedSlots) / totalSlots) * 100).toFixed(1)}%`
    : "0%";

  const dashboardStats = [
    {
      title: "Tổng doanh thu",
      value: formatCurrency(totalRevenue),
      icon: ChartColumn,
      trend: {
        value: isAllFacilities
          ? "Theo toàn hệ thống"
          : `Tại ${selectedFacility?.name}`,
        direction: "up" as const,
      },
    },
    {
      title: "Đơn đặt mới",
      value: totalBookings.toString(),
      icon: CalendarCheck2,
      trend: {
        value: `${filteredFields.length} sân đang theo dõi`,
        direction: "up" as const,
      },
    },
    {
      title: "Số khách hàng",
      value: uniqueCustomers.toString(),
      icon: Users,
      trend: {
        value: "Lọc theo khu sân hiện tại",
        direction: "up" as const,
      },
    },
    {
      title: "Tỷ lệ trống sân",
      value: vacancyRate,
      icon: CircleDashed,
      trend: {
        value: `${Math.max(totalSlots - occupiedSlots, 0)} khung giờ còn trống`,
        direction: "down" as const,
      },
    },
  ];

  return (
    <section className="space-y-6 lg:space-y-8">
      <div className="rounded-2xl border border-white/15 bg-[#005E2E]/35 px-5 py-3 text-sm text-white/90">
        {isAllFacilities
          ? "Đang hiển thị số liệu gộp của toàn bộ khu sân"
          : `Đang hiển thị số liệu của ${selectedFacility?.name}`}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {dashboardStats.map((stat) => (
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
          <div className="mt-4 h-[320px] rounded-xl border-2 border-dashed border-white/25 bg-[#005E2E]/35" />
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
