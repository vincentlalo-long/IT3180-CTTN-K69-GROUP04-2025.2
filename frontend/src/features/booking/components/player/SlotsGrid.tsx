import type { TimeSlotRange } from "@/features/venue/types/venue.types";
import { SlotCard, type SlotStatus } from "./SlotCard";

export interface SlotDisplayItem {
  slot: TimeSlotRange;
  status: SlotStatus;
  /** Resolved from SlotStatusResponse — used for booking submission and price display */
  timeSlotId?: number;
  price?: number | null;
}

interface SlotsGridProps {
  slots: SlotDisplayItem[];
  onSlotToggle?: (slot: TimeSlotRange) => void;
}

export function SlotsGrid({ slots, onSlotToggle }: SlotsGridProps) {
  if (!slots.length) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-6 text-center text-sm text-gray-500">
        Khong co khung gio nao.
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {slots.map((item) => (
        <SlotCard
          key={`${item.slot.startTime}-${item.slot.endTime}`}
          slot={item.slot}
          status={item.status}
          onToggle={onSlotToggle}
        />
      ))}
    </div>
  );
}

