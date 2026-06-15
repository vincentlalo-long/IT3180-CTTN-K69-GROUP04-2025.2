import { ALL_FACILITIES_ID } from "../../features/venue/model/VenueContext";
import {
  OrderManagementTable,
  useOrderManagement,
} from "../../features/booking";
import { SettleInvoiceModal } from "../../features/booking/components/admin/SettleInvoiceModal";

export function OrdersPage() {
  const {
    visibleOrders,
    handleConfirmDeposit,
    handleCancelOrder,
    handleOpenSettle,
    handleCloseSettle,
    handleSettled,
    handleDownloadInvoice,
    settleOrder,
    selectedFacilityId,
    selectedFacility,
    isLoading,
    errorMessage,
  } = useOrderManagement();

  const isAllFacilitiesSelected = selectedFacilityId === ALL_FACILITIES_ID;
  const shouldShowLoadingState = isLoading && visibleOrders.length === 0;
  const shouldShowEmptyState =
    !isLoading && !errorMessage && visibleOrders.length === 0;
  const shouldShowTable = visibleOrders.length > 0;

  return (
    <section className="space-y-5">
      <header className="rounded-2xl border border-white/20 bg-gradient-to-r from-[#0f5d30] to-[#1f7a3d] px-5 py-4 shadow-[0_12px_24px_-16px_rgba(0,0,0,0.55)]">
        <h2 className="text-xl font-semibold text-white">
          Quản lý đơn đặt sân
        </h2>
        <p className="mt-1 text-sm text-white/80">
          {isAllFacilitiesSelected
            ? "Đang hiển thị đơn đặt sân của toàn bộ hệ thống."
            : `Đang hiển thị đơn đặt sân tại ${selectedFacility?.name}.`}
        </p>
      </header>

      {errorMessage ? (
        <div className="rounded-2xl border border-rose-200/40 bg-rose-500/15 px-5 py-3 text-sm text-rose-50">
          {errorMessage}
        </div>
      ) : null}

      <div className="rounded-lg border border-white/15 bg-[#005E2E]/34 p-4 shadow-md sm:p-5">
        {shouldShowLoadingState ? (
          <div className="px-4 py-8 text-center text-sm text-white/75">
            Đang tải danh sách đơn đặt sân...
          </div>
        ) : null}

        {shouldShowTable ? (
          <div className="overflow-x-auto rounded-lg border border-white/15 bg-[#005E2E]/32 p-2">
            <OrderManagementTable
              orders={visibleOrders}
              onConfirmDeposit={handleConfirmDeposit}
              onCancelOrder={handleCancelOrder}
              onSettleBooking={handleOpenSettle}
              onDownloadInvoice={handleDownloadInvoice}
            />
          </div>
        ) : null}

        {shouldShowEmptyState ? (
          <div className="px-4 py-8 text-center text-sm text-white/75">
            Chưa có đơn đặt sân trong khu vực đang chọn.
          </div>
        ) : null}
      </div>

      {settleOrder ? (
        <SettleInvoiceModal
          bookingId={settleOrder.id}
          venueName={settleOrder.venueName}
          onClose={handleCloseSettle}
          onSettled={handleSettled}
        />
      ) : null}
    </section>
  );
}
