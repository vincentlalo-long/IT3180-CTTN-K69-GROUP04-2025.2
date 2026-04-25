import { ALL_FACILITIES_ID } from "../../data/mockAdminData";
import {
  OrderManagementTable,
  useOrderManagement,
} from "../../features/booking";

export function OrdersPage() {
  const {
    visibleOrders,
    handleConfirmDeposit,
    handleCancelOrder,
    selectedFacilityId,
    selectedFacility,
  } = useOrderManagement();

  return (
    <section className="space-y-5">
      <header className="rounded-2xl border border-white/20 bg-gradient-to-r from-[#0f5d30] to-[#1f7a3d] px-5 py-4 shadow-[0_12px_24px_-16px_rgba(0,0,0,0.55)]">
        <h2 className="text-xl font-semibold text-white">
          Quản lý đơn đặt sân
        </h2>
        <p className="mt-1 text-sm text-white/80">
          {selectedFacilityId === ALL_FACILITIES_ID
            ? "Đang hiển thị đơn đặt sân của toàn bộ hệ thống."
            : `Đang hiển thị đơn đặt sân tại ${selectedFacility?.name}.`}
        </p>
      </header>

      <div className="rounded-lg border border-white/15 bg-[#005E2E]/34 p-4 shadow-md sm:p-5">
        <div className="overflow-x-auto rounded-lg border border-white/15 bg-[#005E2E]/32 p-2">
          <OrderManagementTable
            orders={visibleOrders}
            onConfirmDeposit={handleConfirmDeposit}
            onCancelOrder={handleCancelOrder}
          />
        </div>

        {visibleOrders.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-white/75">
            Chưa có đơn đặt sân trong khu vực đang chọn.
          </div>
        ) : null}
      </div>
    </section>
  );
}
