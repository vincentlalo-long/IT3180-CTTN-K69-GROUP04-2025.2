import type { TimeSlotRange } from "@/features/venue/types/venue.types";

interface SelectedSlotsBarProps {
  selectedSlots: TimeSlotRange[];
  onClear?: () => void;
  onSubmit?: () => void;
  isSubmitting?: boolean;
  disableSubmit?: boolean;
  submitLabel?: string;
  fieldTotal?: number;
  serviceTotal?: number;
  totalPrice?: number;
}

const formatCurrency = (amount: number) =>
  `${amount.toLocaleString("vi-VN")} VND`;

export function SelectedSlotsBar({
  selectedSlots,
  onClear,
  onSubmit,
  isSubmitting = false,
  disableSubmit = false,
  submitLabel = "Đặt sân",
  fieldTotal = 0,
  serviceTotal = 0,
  totalPrice = 0,
}: SelectedSlotsBarProps) {
  if (!selectedSlots.length) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-4 text-sm text-gray-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
        Chưa chọn khung giờ nào.
      </div>
    );
  }

  return (
    <div className="flex flex-col items-start justify-between gap-3 rounded-2xl border border-gray-200 bg-white p-4 sm:flex-row sm:items-center dark:border-slate-700 dark:bg-slate-800">
      <div>
        <p className="text-sm font-semibold text-gray-900 dark:text-slate-100">
          Đã chọn {selectedSlots.length} khung giờ
        </p>
        <p className="text-xs text-gray-500 dark:text-slate-400">
          {selectedSlots
            .map((slot) => `${slot.startTime}-${slot.endTime}`)
            .join(", ")}
        </p>
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-slate-400">
          <span>Tiền sân: {formatCurrency(fieldTotal)}</span>
          <span>Dịch vụ: {formatCurrency(serviceTotal)}</span>
          <span className="font-semibold text-gray-900 dark:text-slate-100">
            Tổng: {formatCurrency(totalPrice)}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600 hover:border-gray-300 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-600 dark:text-slate-200 dark:hover:border-slate-500"
          onClick={onClear}
          disabled={isSubmitting}
        >
          Xóa
        </button>
        <button
          type="button"
          className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
          onClick={onSubmit}
          disabled={disableSubmit || isSubmitting}
        >
          {isSubmitting ? "Đang xử lý..." : submitLabel}
        </button>
      </div>
    </div>
  );
}

