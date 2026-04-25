import { fields } from "../../../../data/mockAdminData";
import type { Order } from "../../types";
import {
  canCancelOrder,
  formatCompactPrice,
  getStatusClass,
} from "../../utils/booking.utils";

interface OrderManagementTableProps {
  orders: Order[];
  onConfirmDeposit: (id: string) => void;
  onCancelOrder: (id: string) => void;
}

export function OrderManagementTable({
  orders,
  onConfirmDeposit,
  onCancelOrder,
}: OrderManagementTableProps) {
  return (
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
        {orders.map((order, index) => {
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
                <p className="font-medium text-white">{field?.name ?? "N/A"}</p>
                <p className="mt-0.5 text-xs text-white/75">{order.shift}</p>
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
                      onClick={() => onConfirmDeposit(order.id)}
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
                      order.status === "Đã hủy" ? "Đơn đã hủy" : cancelTitle
                    }
                    disabled={disableCancel}
                    onClick={() => onCancelOrder(order.id)}
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
  );
}
