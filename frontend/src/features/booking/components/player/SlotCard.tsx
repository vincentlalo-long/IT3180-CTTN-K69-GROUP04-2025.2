import type { TimeSlotRange } from "@/features/venue/types/venue.types";

export type SlotStatus = "available" | "booked" | "selected";

interface SlotCardProps {
  slot: TimeSlotRange;
  status: SlotStatus;
  onToggle?: (slot: TimeSlotRange) => void;
}

const statusStyles: Record<SlotStatus, string> = {
  available:
    "border-emerald-200 bg-emerald-50 text-emerald-700 hover:border-emerald-300",
  booked: "border-rose-200 bg-rose-50 text-rose-400 opacity-70",
  selected:
    "border-indigo-300 bg-indigo-600 text-white shadow-md hover:bg-indigo-700",
};

export function SlotCard({ slot, status, onToggle }: SlotCardProps) {
  const isBooked = status === "booked";

  return (
    <button
      type="button"
      disabled={isBooked}
      onClick={() => onToggle?.(slot)}
      className={`flex w-full items-center justify-between rounded-xl border px-3 py-2 text-sm font-semibold transition ${statusStyles[status]}`}
    >
      <span>{slot.startTime}</span>
      <span className="text-xs opacity-80">-</span>
      <span>{slot.endTime}</span>
    </button>
  );
}

