import type { TimeSlotRange } from "@/features/venue/types/venue.types";

export type SlotStatus = "available" | "booked" | "pending" | "selected";

interface SlotCardProps {
  slot: TimeSlotRange;
  status: SlotStatus;
  price?: number | null;
  onToggle?: (slot: TimeSlotRange) => void;
}

const statusStyles: Record<SlotStatus, string> = {
  available:
    "border-emerald-200 bg-emerald-50 text-emerald-700 hover:border-emerald-300",
  booked: "border-gray-200 bg-gray-100 text-gray-400 opacity-80",
  pending: "border-amber-200 bg-amber-50 text-amber-500 opacity-80",
  selected:
    "border-indigo-300 bg-indigo-600 text-white shadow-md hover:bg-indigo-700",
};

const formatPrice = (price?: number | null) => {
  if (price == null) return "";
  return `${price.toLocaleString("vi-VN")} VND`;
};

export function SlotCard({ slot, status, price, onToggle }: SlotCardProps) {
  const isDisabled = status === "booked" || status === "pending";

  return (
    <button
      type="button"
      disabled={isDisabled}
      onClick={() => onToggle?.(slot)}
      className={`flex w-full items-center justify-between gap-3 rounded-xl border px-3 py-2 text-sm font-semibold transition ${statusStyles[status]}`}
    >
      <span className="whitespace-nowrap">
        {slot.startTime}-{slot.endTime}
      </span>
      {price != null && (
        <span className="shrink-0 text-xs font-medium opacity-80">
          {formatPrice(price)}
        </span>
      )}
    </button>
  );
}

