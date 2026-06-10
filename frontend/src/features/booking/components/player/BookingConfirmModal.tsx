import { X, CalendarDays, MapPin, Clock, Banknote, AlertCircle, Repeat } from "lucide-react";
import type { SlotDisplayItem } from "./SlotsGrid";

export interface BookingConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isSubmitting: boolean;
  pitchName: string;
  bookingDate: string; // "yyyy-MM-dd"
  slots: SlotDisplayItem[];
  totalPrice: number;
  recurringSummary?: string | null;
  error: string | null;
}

const formatDate = (dateStr: string): string => {
  const [year, month, day] = dateStr.split("-");
  return `${day}/${month}/${year}`;
};

const formatPrice = (amount: number): string =>
  amount.toLocaleString("vi-VN") + "₫";

export function BookingConfirmModal({
  open,
  onClose,
  onConfirm,
  isSubmitting,
  pitchName,
  bookingDate,
  slots,
  totalPrice,
  recurringSummary,
  error,
}: BookingConfirmModalProps) {
  if (!open) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && !isSubmitting) {
      onClose();
    }
  };

  return (
    /* ── backdrop ── */
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="booking-confirm-title"
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
      onClick={handleBackdropClick}
    >
      {/* dim overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        aria-hidden="true"
      />

      {/* ── sheet / card ── */}
      <div className="relative z-10 w-full max-w-md rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl dark:bg-slate-900">
        {/* header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 dark:border-slate-700">
          <h2
            id="booking-confirm-title"
            className="text-base font-semibold text-gray-900 dark:text-slate-100"
          >
            Xác nhận đặt sân
          </h2>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Đóng modal"
            className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:opacity-50 dark:hover:bg-slate-800 dark:hover:text-slate-300"
          >
            <X size={18} />
          </button>
        </div>

        {/* body */}
        <div className="space-y-4 px-5 py-5">
          {/* pitch + date info */}
          <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 space-y-2 dark:border-slate-700 dark:bg-slate-800">
            <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-slate-300">
              <MapPin size={15} className="shrink-0 text-emerald-500" />
              <span className="font-medium">{pitchName}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-slate-400">
              <CalendarDays size={15} className="shrink-0 text-indigo-400" />
              <span>{formatDate(bookingDate)}</span>
            </div>
          </div>

          {recurringSummary && (
            <div className="flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">
              <Repeat size={15} className="shrink-0" />
              <span>{recurringSummary}</span>
            </div>
          )}

          {/* slot list */}
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-slate-500">
              Khung giờ đã chọn ({slots.length})
            </p>
            <ul className="space-y-2">
              {slots.map((item, idx) => (
                <li
                  key={`${item.slot.startTime}-${item.slot.endTime}-${idx}`}
                  className="flex items-center justify-between rounded-lg border border-gray-100 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
                >
                  <div className="flex items-center gap-2 text-gray-700 dark:text-slate-300">
                    <Clock size={14} className="shrink-0 text-indigo-400" />
                    <span className="font-medium">
                      {item.slot.startTime} – {item.slot.endTime}
                    </span>
                  </div>
                  {item.price != null && item.price > 0 ? (
                    <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                      {formatPrice(Number(item.price))}
                    </span>
                  ) : (
                    <span className="text-xs text-gray-400 dark:text-slate-500">
                      —
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* total price */}
          <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 dark:border-emerald-500/30 dark:bg-emerald-500/10">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-slate-300">
              <Banknote size={16} className="shrink-0 text-emerald-500" />
              Tổng tiền
            </div>
            <span className="text-base font-bold text-emerald-700 dark:text-emerald-400">
              {formatPrice(totalPrice)}
            </span>
          </div>

          {/* inline error */}
          {error && (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-400/30 dark:bg-rose-500/10 dark:text-rose-300"
            >
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span className="whitespace-pre-line">{error}</span>
            </div>
          )}
        </div>

        {/* footer actions */}
        <div className="flex gap-3 border-t border-gray-100 px-5 pb-5 pt-4 dark:border-slate-700">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Quay lại
          </button>
          <button
            type="button"
            id="booking-confirm-btn"
            onClick={onConfirm}
            disabled={isSubmitting}
            className="flex-1 rounded-xl bg-emerald-600 py-2.5 text-sm font-semibold text-white shadow transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Đang xử lý...
              </span>
            ) : (
              "Xác nhận đặt sân"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
