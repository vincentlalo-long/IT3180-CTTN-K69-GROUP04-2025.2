import type { RecentOrderDto } from "../../hooks/useDashboardStats";
import { formatCurrency } from "../../utils/statistics.utils";

interface RecentOrderListProps {
  recentOrders: RecentOrderDto[];
  isLoading: boolean;
}

export function RecentOrderList({
  recentOrders,
  isLoading,
}: RecentOrderListProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-16 animate-pulse rounded-xl border border-white/10 bg-white/8"
          />
        ))}
      </div>
    );
  }

  if (recentOrders.length > 0) {
    return (
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
    );
  }

  return (
    <div className="flex h-full min-h-[288px] items-center justify-center rounded-xl border border-dashed border-white/20 text-sm text-admin-text-secondary">
      Chưa có đơn hàng gần nhất
    </div>
  );
}
