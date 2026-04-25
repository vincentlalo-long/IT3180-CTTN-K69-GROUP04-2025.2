import {
  RecentOrderList,
  StatCard,
  useDashboardStats,
} from "../../features/statistics";
import { useVenueContext as useFacilityContext } from "../../features/venue/hooks/useVenueContext";

export function AdminDashboardPage() {
  const {
    selectedVenue: selectedFacility,
    selectedVenueId: selectedFacilityId,
  } = useFacilityContext();
  const { statCards, recentOrders, isLoading, errorMessage, facilityLabel } =
    useDashboardStats(
      selectedFacilityId,
      selectedFacility?.apiFacilityId,
      selectedFacility?.name,
    );

  return (
    <section className="space-y-6 lg:space-y-8">
      <div className="rounded-2xl border border-white/15 bg-[#005E2E]/35 px-5 py-3 text-sm text-white/90">
        <div className="flex items-center gap-2">
          {isLoading ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/60 border-t-transparent" />
          ) : null}
          <span>{facilityLabel}</span>
        </div>
      </div>

      {errorMessage ? (
        <div className="rounded-2xl border border-red-400/30 bg-red-500/15 px-5 py-3 text-sm text-red-50">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-red-100/80 text-[10px] leading-none">
              !
            </span>
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
          : statCards.map((stat) => (
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
            <RecentOrderList
              recentOrders={recentOrders}
              isLoading={isLoading}
            />
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
