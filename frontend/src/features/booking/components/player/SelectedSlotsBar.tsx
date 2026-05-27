import type { TimeSlotRange } from "@/features/venue/types/venue.types";

interface SelectedSlotsBarProps {
  selectedSlots: TimeSlotRange[];
  onClear?: () => void;
  onSubmit?: () => void;
  isSubmitting?: boolean;
  disableSubmit?: boolean;
  submitLabel?: string;
}

export function SelectedSlotsBar({
  selectedSlots,
  onClear,
  onSubmit,
  isSubmitting = false,
  disableSubmit = false,
  submitLabel = "Dat san",
}: SelectedSlotsBarProps) {
  if (!selectedSlots.length) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-4 text-sm text-gray-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
        Chua chon khung gio nao.
      </div>
    );
  }

  return (
    <div className="flex flex-col items-start justify-between gap-3 rounded-2xl border border-gray-200 bg-white p-4 sm:flex-row sm:items-center dark:border-slate-700 dark:bg-slate-800">
      <div>
        <p className="text-sm font-semibold text-gray-900 dark:text-slate-100">
          Da chon {selectedSlots.length} khung gio
        </p>
        <p className="text-xs text-gray-500 dark:text-slate-400">
          {selectedSlots
            .map((slot) => `${slot.startTime}-${slot.endTime}`)
            .join(", ")}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600 hover:border-gray-300 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-600 dark:text-slate-200 dark:hover:border-slate-500"
          onClick={onClear}
          disabled={isSubmitting}
        >
          Xoa
        </button>
        <button
          type="button"
          className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
          onClick={onSubmit}
          disabled={disableSubmit || isSubmitting}
        >
          {isSubmitting ? "Dang xu ly..." : submitLabel}
        </button>
      </div>
    </div>
  );
}

