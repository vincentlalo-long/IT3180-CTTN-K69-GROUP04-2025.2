import { useMemo, useState } from "react";
import type {
  SlotStatusResponse,
  TimeSlotRange,
} from "@/features/venue/types/venue.types";
import { DateSelector } from "./DateSelector";
import { SelectedSlotsBar } from "./SelectedSlotsBar";
import { SlotsGrid, type SlotDisplayItem } from "./SlotsGrid";
import { useAvailableSlots } from "@/features/booking/hooks/useAvailableSlots";
import { useSlotSelection } from "@/features/booking/hooks/useSlotSelection";

const toSlotRange = (slot: SlotStatusResponse): TimeSlotRange => ({
  startTime: slot.startTime.slice(0, 5),
  endTime: slot.endTime.slice(0, 5),
});

const sortSlots = (left: TimeSlotRange, right: TimeSlotRange) =>
  left.startTime.localeCompare(right.startTime);

export interface BookingSlotsDemoProps {
  venueId?: number;
  pitchId?: number;
}

export function BookingSlotsDemo({
  venueId = 1,
  pitchId = 1,
}: BookingSlotsDemoProps) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { selectedSlots, toggleSlot, clearSlots } = useSlotSelection({
    resetKey: [selectedDate, pitchId],
  });

  const { loading, error, slots, pitch } = useAvailableSlots(
    venueId,
    pitchId,
    selectedDate,
  );

  const slotItems = useMemo<SlotDisplayItem[]>(() => {
    return slots
      .map((slot) => {
        const slotRange = toSlotRange(slot);
        if (slot.status === "BOOKED") {
          return { slot: slotRange, status: "booked" } as SlotDisplayItem;
        }

        if (
          selectedSlots.some(
            (item) =>
              item.startTime === slotRange.startTime &&
              item.endTime === slotRange.endTime,
          )
        ) {
          return { slot: slotRange, status: "selected" } as SlotDisplayItem;
        }

        return { slot: slotRange, status: "available" } as SlotDisplayItem;
      })
      .sort((left, right) => sortSlots(left.slot, right.slot));
  }, [slots, selectedSlots]);

  const handleSlotToggle = (slot: TimeSlotRange) => {
    toggleSlot(slot);
  };

  return (
    <div className="space-y-6">
      <DateSelector selectedDate={selectedDate} onChange={setSelectedDate} />

      {loading && (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-6 text-center text-sm text-gray-500">
          Dang tai khung gio...
        </div>
      )}

      {!loading && error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center text-sm text-rose-600">
          {error}
        </div>
      )}

      {!loading && !error && !pitch && (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-6 text-center text-sm text-gray-500">
          Khong tim thay san phu hop.
        </div>
      )}

      {!loading && !error && pitch && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-gray-200 bg-white p-4 text-sm text-gray-600">
            Dang xem: <span className="font-semibold text-gray-900">{pitch.pitchName}</span>
          </div>
          <SlotsGrid slots={slotItems} onSlotToggle={handleSlotToggle} />
        </div>
      )}

      <SelectedSlotsBar
        selectedSlots={selectedSlots}
        onClear={clearSlots}
        onSubmit={() => window.alert("Gui yeu cau dat san")}
      />
      <p className="text-xs text-gray-400">
        Du lieu lay tu API /player/venues/{venueId}/availability. Thay doi venueId, pitchId neu can.
      </p>
    </div>
  );
}
