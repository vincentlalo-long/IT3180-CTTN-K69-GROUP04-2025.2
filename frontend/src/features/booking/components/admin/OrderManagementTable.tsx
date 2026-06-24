import type { AdminBookingSummaryResponse } from "../../api/bookingApi";
import { formatCompactPrice } from "../../utils/booking.utils";
import { Download } from "lucide-react";

const STATUS_LABELS: Record<string, string> = {
  BOOKED: "Đã đặt",
  RESERVED: "Chờ xác nhận",
  PENDING: "Giữ chỗ",
  PENDING_PAYMENT: "Chờ thanh toán",
  CONFIRMED: "Đã đặt",
  PLAYING: "Đang đá",
  CANCELLED: "Đã hủy",
};

const STATUS_CLASSES: Record<string, string> = {
  BOOKED: "border border-lime-100/85 bg-lime-300/45 text-[#123915]",
  RESERVED: "border border-amber-100/75 bg-amber-300/30 text-amber-50",
  PENDING: "border border-amber-100/75 bg-amber-300/30 text-amber-50",
  PENDING_PAYMENT: "border border-orange-100/75 bg-orange-300/30 text-orange-50",
  CONFIRMED: "border border-lime-100/85 bg-lime-300/45 text-[#123915]",
  PLAYING: "border border-sky-100/75 bg-sky-300/30 text-sky-50",
  CANCELLED: "border border-rose-100/80 bg-rose-400/35 text-rose-50",
};

interface OrderManagementTableProps {
  orders: AdminBookingSummaryResponse[];
  onConfirmDeposit: (id: number) => void;
  onCancelOrder: (id: number) => void;
  onSettleBooking: (order: AdminBookingSummaryResponse) => void;
  onDownloadInvoice: (id: number) => void;
}

function formatTime(time: string): string {
  // "17:00:00" -> "17:00"
  return time.slice(0, 5);
}

function formatDate(dateStr: string): string {
  // "2026-04-18" -> "18/04/2026"
  const [year, month, day] = dateStr.split("-");
  return `${day}/${month}/${year}`;
}

export function OrderManagementTable({
  orders,
  onConfirmDeposit,
  onCancelOrder,
  onSettleBooking,
  onDownloadInvoice,
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
          const statusLabel = STATUS_LABELS[order.status] ?? order.status;
          const statusClass =
            STATUS_CLASSES[order.status] ??
            "border border-white/40 bg-white/15 text-white/80";

          const shiftLabel = `${formatTime(order.startTime)} - ${formatTime(order.endTime)}, ${formatDate(order.bookingDate)}`;
          const canConfirm =
            order.status === "RESERVED" ||
            order.status === "PENDING";
          const canSettle =
            order.status === "BOOKED" ||
            order.status === "PLAYING";
          const isCancelled = order.status === "CANCELLED";
          const disableCancel = isCancelled || order.status === "PLAYING" || order.status === "COMPLETED";

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
                #{order.id}
              </td>
              <td
                className={`${cellBaseClass} ${rowToneClass} ${rowHoverClass}`}
              >
                <p className="font-medium text-white">{order.customerName}</p>
                <p className="mt-0.5 text-xs text-white/65">
                  {order.customerPhone}
                </p>
              </td>
              <td
                className={`${cellBaseClass} ${rowToneClass} ${rowHoverClass}`}
              >
                <p className="font-medium text-white">
                  {order.pitchName} — {order.venueName}
                </p>
                <p className="mt-0.5 text-xs text-white/75">{shiftLabel}</p>
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
                  className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass}`}
                >
                  {statusLabel}
                </span>
              </td>
              <td
                className={`${cellBaseClass} ${rowToneClass} ${rowHoverClass} rounded-r-lg border-r border-white/15`}
              >
                <div className="flex items-center gap-2">
                  {canConfirm ? (
                    <button
                      type="button"
                      onClick={() => onConfirmDeposit(order.id)}
                      className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700"
                    >
                      Xác nhận đơn
                    </button>
                  ) : canSettle ? (
                    <button
                      type="button"
                      onClick={() => onSettleBooking(order)}
                      className="rounded-lg bg-sky-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-sky-700"
                    >
                      Chốt hoá đơn
                    </button>
                  ) : (
                    <span className="text-xs text-white/40">-</span>
                  )}

                  <button
                    type="button"
                    title="Tải hóa đơn PDF"
                    onClick={() => onDownloadInvoice(order.id)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-white transition hover:bg-white/20"
                  >
                    <Download size={14} />
                  </button>

                  <button
                    type="button"
                    title={
                      isCancelled ? "Đơn đã hủy" : "Hủy đơn"
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
