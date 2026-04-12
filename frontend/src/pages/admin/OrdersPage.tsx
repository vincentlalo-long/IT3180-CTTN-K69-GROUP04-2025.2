import {
  ALL_FACILITIES_ID,
  fields,
  mockOrders,
  type Order,
} from "../../data/mockAdminData";
import { useMemo, useState } from "react";
import { useFacilityContext } from "../../contexts/useFacilityContext";

const HOURS_24 = 24 * 60 * 60 * 1000;

const formatCompactPrice = (amount: number): string =>
  `${Math.round(amount / 1_000).toLocaleString("vi-VN")}k`;

const getStatusClass = (status: Order["status"]): string => {
  if (status === "Chờ cọc") {
    return "border border-amber-100/75 bg-amber-300/30 text-amber-50";
  }

  if (status === "Đã cọc") {
    return "border border-lime-100/85 bg-lime-300/45 text-[#123915]";
  }

  return "border border-rose-100/80 bg-rose-400/35 text-rose-50";
};

const canCancelOrder = (matchDate: string): boolean => {
  const diff = new Date(matchDate).getTime() - Date.now();
  return diff > HOURS_24;
};

export function OrdersPage() {
  const { selectedFacility, selectedFacilityId } = useFacilityContext();
  const [orders, setOrders] = useState<Order[]>(mockOrders);

  const visibleOrders = useMemo(
    () =>
      selectedFacilityId === ALL_FACILITIES_ID
        ? orders
        : orders.filter((order) => order.facilityId === selectedFacilityId),
    [orders, selectedFacilityId],
  );

  const handleConfirmDeposit = (orderId: string) => {
    setOrders((currentOrders) =>
      currentOrders.map((order) =>
        order.id === orderId ? { ...order, status: "Đã cọc" } : order,
      ),
    );
  };

  const handleCancelOrder = (orderId: string) => {
    setOrders((currentOrders) =>
      currentOrders.map((order) =>
        order.id === orderId ? { ...order, status: "Đã hủy" } : order,
      ),
    );
  };

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
          <table className="min-w-[980px] w-full border-separate [border-spacing:0_8px] text-sm">
            <thead>
              <tr>
                <th className="rounded-l-lg border border-white/20 bg-[#004f27] px-4 py-3 text-left font-semibold text-white">
                  Mã đơn
                </th>
                <th className="border border-white/20 bg-[#004f27] px-4 py-3 text-left font-semibold text-white">
                  Khách hàng
                </th>
                <th className="border border-white/20 bg-[#004f27] px-4 py-3 text-left font-semibold text-white">
                  Sân &amp; Ca đá
                </th>
                <th className="border border-white/20 bg-[#004f27] px-4 py-3 text-left font-semibold text-white">
                  Tiền cọc / Tổng
                </th>
                <th className="border border-white/20 bg-[#004f27] px-4 py-3 text-left font-semibold text-white">
                  Trạng thái
                </th>
                <th className="rounded-r-lg border border-white/20 bg-[#004f27] px-4 py-3 text-left font-semibold text-white">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody>
              {visibleOrders.map((order, index) => {
                const field = fields.find((item) => item.id === order.fieldId);
                const cancelable = canCancelOrder(order.matchDate);
                const cancelTitle = cancelable
                  ? "Hủy đơn"
                  : "Không thể hủy trong vòng 24h trước giờ đá";
                const disableCancel = !cancelable || order.status === "Đã hủy";
                const rowToneClass =
                  index % 2 === 0 ? "bg-[#0d5a2f]/60" : "bg-[#0a4d29]/60";
                const rowHoverClass = "hover:bg-[#146f3d]/70";
                const cellBaseClass =
                  "border-y border-white/10 px-4 py-3 text-white/90 transition-colors";

                return (
                  <tr key={order.id}>
                    <td
                      className={`${cellBaseClass} ${rowToneClass} ${rowHoverClass} rounded-l-lg border-l border-white/15 font-medium text-white`}
                    >
                      {order.id.toUpperCase()}
                    </td>
                    <td
                      className={`${cellBaseClass} ${rowToneClass} ${rowHoverClass}`}
                    >
                      {order.customerName}
                    </td>
                    <td
                      className={`${cellBaseClass} ${rowToneClass} ${rowHoverClass}`}
                    >
                      <p className="font-medium text-white">
                        {field?.name ?? "N/A"}
                      </p>
                      <p className="mt-0.5 text-xs text-white/75">
                        {order.shift}
                      </p>
                    </td>
                    <td
                      className={`${cellBaseClass} ${rowToneClass} ${rowHoverClass} font-medium text-lime-100`}
                    >
                      {formatCompactPrice(order.depositAmount)} /{" "}
                      {formatCompactPrice(order.totalPrice)}
                    </td>
                    <td
                      className={`${cellBaseClass} ${rowToneClass} ${rowHoverClass}`}
                    >
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusClass(order.status)}`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td
                      className={`${cellBaseClass} ${rowToneClass} ${rowHoverClass} rounded-r-lg border-r border-white/15`}
                    >
                      <div className="flex items-center gap-2">
                        {order.status === "Chờ cọc" ? (
                          <button
                            type="button"
                            onClick={() => handleConfirmDeposit(order.id)}
                            className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700"
                          >
                            Xác nhận cọc
                          </button>
                        ) : (
                          <span className="text-xs text-white/40">-</span>
                        )}

                        <button
                          type="button"
                          title={
                            order.status === "Đã hủy"
                              ? "Đơn đã hủy"
                              : cancelTitle
                          }
                          disabled={disableCancel}
                          onClick={() => handleCancelOrder(order.id)}
                          className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                            disableCancel
                              ? "cursor-not-allowed bg-rose-900/35 text-rose-100/65"
                              : "bg-rose-600 text-white shadow-sm hover:bg-rose-700"
                          }`}
                        >
                          Hủy đơn
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
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
