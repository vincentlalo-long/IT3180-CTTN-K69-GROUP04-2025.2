import type { SlotStatusResponse, VenueAvailabilityResponse } from "@/features/venue/types/venue.types";
import type { SelectedSlot } from "../../hooks/useBookingFieldFlow";

interface BookingSlotsTableProps {
  venueAvailability: VenueAvailabilityResponse;
  uniqueTimeRanges: Array<{ startTime: string; endTime: string }>;
  selectedSlots: SelectedSlot[];
  onToggleSlot: (pitchId: number, pitchName: string, slot: SlotStatusResponse) => void;
}

const normalizeTime = (value: string) => value.slice(0, 5);

const formatPrice = (price: number) => {
  if (price === 0) return "Liên hệ";
  if (price >= 1000) {
    return `${(price / 1000).toLocaleString("vi-VN")}k`;
  }
  return `${price.toLocaleString("vi-VN")}đ`;
};

export function BookingSlotsTable({
  venueAvailability,
  uniqueTimeRanges,
  selectedSlots,
  onToggleSlot,
}: BookingSlotsTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl border border-white/10 bg-white/5 backdrop-blur-md shadow-xl">
      <table className="w-full min-w-[1050px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-white/10 bg-white/5">
            <th className="sticky left-0 top-0 z-20 bg-[#236f33] p-4 font-semibold text-emerald-100/90 min-w-[160px] border-r border-b border-white/10 whitespace-nowrap">
              Sân / Giờ
            </th>
            {uniqueTimeRanges.map((range) => (
              <th
                key={`${range.startTime}-${range.endTime}`}
                className="p-4 font-semibold text-emerald-100/90 text-center min-w-[150px] border-r border-b border-white/10 last:border-r-0 bg-[#236f33]/90 backdrop-blur-sm whitespace-nowrap"
              >
                <div className="font-semibold text-emerald-100/90 text-sm">
                  {range.startTime} - {range.endTime}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/10">
          {venueAvailability.pitches.map((pitchItem) => (
            <tr key={pitchItem.pitchId} className="hover:bg-white/5 transition">
              <td className="sticky left-0 z-10 bg-[#236f33]/95 backdrop-blur-sm p-4 font-semibold text-emerald-100/90 border-r border-b border-white/10 min-w-[160px] whitespace-nowrap">
                <div className="text-sm font-semibold">{pitchItem.pitchName}</div>
              </td>

              {uniqueTimeRanges.map((range) => {
                const slot = pitchItem.slots.find(
                  (s) =>
                    normalizeTime(s.startTime) === range.startTime &&
                    normalizeTime(s.endTime) === range.endTime
                );

                if (!slot) {
                  return (
                    <td
                      key={`${range.startTime}-${range.endTime}`}
                      className="p-3 text-center text-white/20 bg-white/2 border-r border-b border-white/10 last:border-r-0"
                    >
                      -
                    </td>
                  );
                }

                const isSelected = selectedSlots.some(
                  (sel) =>
                    sel.pitchId === pitchItem.pitchId &&
                    sel.timeSlotId === slot.timeSlotId
                );

                if (slot.status === "PENDING") {
                  return (
                    <td
                      key={`${range.startTime}-${range.endTime}`}
                      className="p-3 text-center border-r border-b border-white/10 last:border-r-0"
                    >
                      <div className="flex h-14 w-full flex-col justify-center rounded-md bg-amber-500/10 border border-dashed border-amber-500/30 text-amber-200/70 text-left p-3 select-none cursor-not-allowed">
                        <span className="font-bold text-xs">Đã giữ chỗ</span>
                        <span className="text-[10px] opacity-70 mt-0.5">Chờ xác nhận</span>
                      </div>
                    </td>
                  );
                }

                if (slot.status === "BOOKED") {
                  return (
                    <td
                      key={`${range.startTime}-${range.endTime}`}
                      className="p-3 text-center border-r border-b border-white/10 last:border-r-0"
                    >
                      <div className="flex h-14 w-full flex-col justify-center rounded-md bg-white/5 border border-dashed border-white/10 text-white/30 text-left p-3 select-none cursor-not-allowed">
                        <span className="font-bold text-xs">Đã đặt</span>
                        <span className="text-[10px] opacity-70 mt-0.5">-</span>
                      </div>
                    </td>
                  );
                }

                if (slot.status !== "AVAILABLE") {
                  return (
                    <td
                      key={`${range.startTime}-${range.endTime}`}
                      className="p-3 text-center border-r border-b border-white/10 last:border-r-0"
                    >
                      <div className="flex h-14 w-full flex-col justify-center rounded-md bg-white/5 border border-dashed border-white/10 text-white/30 text-left p-3 select-none cursor-not-allowed">
                        <span className="font-bold text-xs">Không khả dụng</span>
                        <span className="text-[10px] opacity-70 mt-0.5">-</span>
                      </div>
                    </td>
                  );
                }

                return (
                  <td
                    key={`${range.startTime}-${range.endTime}`}
                    className="p-3 text-center border-r border-b border-white/10 last:border-r-0"
                  >
                    <button
                      type="button"
                      onClick={() => onToggleSlot(pitchItem.pitchId, pitchItem.pitchName, slot)}
                      className={`flex h-14 w-full flex-col justify-center rounded-md p-3 shadow-sm transition transform hover:scale-[1.02] active:scale-[0.98] ${
                        isSelected
                          ? "bg-emerald-500 border border-emerald-400 text-white hover:bg-emerald-400"
                          : "bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:border-white/30"
                      }`}
                    >
                      <span className="font-bold text-xs">{isSelected ? "Đã chọn" : "Trống"}</span>
                      <span className="text-[11px] font-medium mt-0.5">
                        {formatPrice(slot.price != null ? Number(slot.price) : 0)}
                      </span>
                    </button>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
