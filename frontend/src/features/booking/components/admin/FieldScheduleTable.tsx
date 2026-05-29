import {
  ALL_FACILITIES_ID,
  ADMIN_TIME_SLOTS,
  TIME_SLOT_PRICING,
  type AdminTimeSlot,
} from "../../constants/booking.constants";
import type { FieldScheduleRow, ScheduleSlot } from "../../types/booking.types";
import { slotStatusStyles } from "../../constants/booking.constants";
import { formatCompactPrice, getRangeLabel } from "../../utils/booking.utils";
import { useVenueContext as useFacilityContext } from "../../../venue/hooks/useVenueContext";

interface FieldScheduleTableProps {
  rows: FieldScheduleRow[];
  onSlotClick: (
    facilityName: string,
    fieldName: string,
    timeSlot: AdminTimeSlot,
    slot: ScheduleSlot,
  ) => void;
}

export function FieldScheduleTable({
  rows,
  onSlotClick,
}: FieldScheduleTableProps) {
  const { selectedVenueId: selectedFacilityId } = useFacilityContext();

  return (
    <div className="overflow-x-auto overflow-y-auto rounded-2xl border border-white/15 bg-[#005E2E]/32">
      <table className="min-w-max w-full border-separate border-spacing-0">
        <thead>
          <tr>
            <th className="sticky left-0 top-0 z-50 w-[220px] border-b border-r border-white/20 bg-[#005E2E] px-4 py-3 text-left text-sm font-semibold text-white">
              Sân / Giờ
            </th>
            {ADMIN_TIME_SLOTS.map((timeSlot) => {
              const priceMeta = TIME_SLOT_PRICING[timeSlot];
              const isGoldenHour = priceMeta.tier === "golden";

              return (
                <th
                  key={timeSlot}
                  className={`sticky top-0 z-40 min-w-[164px] border-b border-white/20 px-3 py-3 text-center text-white ${
                    isGoldenHour
                      ? "border-t-2 border-t-lime-200/80 bg-[#004f27]"
                      : "bg-[#005E2E]"
                  }`}
                >
                  <p className="text-sm font-semibold leading-tight">
                    {getRangeLabel(timeSlot)}
                  </p>
                </th>
              );
            })}
          </tr>
        </thead>

        <tbody>
          {rows.map((row) => (
            <tr key={row.fieldId}>
              <th
                scope="row"
                className="sticky left-0 z-30 border-r border-white/15 bg-[#005E2E] px-4 py-4 text-left text-sm font-semibold text-white"
              >
                <p>{row.fieldName}</p>
                <p className="mt-1 text-xs font-normal text-white/80">
                  {row.fieldType}
                </p>
                {selectedFacilityId === ALL_FACILITIES_ID || selectedFacilityId === "all" ? (
                  <p className="mt-1 text-[11px] font-normal text-white/65">
                    {row.facilityName}
                  </p>
                ) : null}
              </th>

              {ADMIN_TIME_SLOTS.map((timeSlot) => {
                const slot = row.slots[timeSlot];
                const statusMeta = slotStatusStyles[slot?.status ?? "AVAILABLE"];
                const isDetailSlot = slot?.status === "BOOKED";

                return (
                  <td
                    key={`${row.fieldName}-${timeSlot}`}
                    className="border-b border-r border-white/10 p-1.5"
                  >
                    <button
                      type="button"
                      onClick={() =>
                        onSlotClick(
                          row.facilityName,
                          row.fieldName,
                          timeSlot,
                          slot,
                        )
                      }
                      className={`h-[88px] w-full rounded-lg px-3 py-2 text-left transition ${statusMeta.className} ${
                        isDetailSlot ? "cursor-pointer" : "cursor-default"
                      }`}
                    >
                      <p className="text-sm font-semibold leading-tight">
                        {slot?.customerName ?? statusMeta.label}
                      </p>
                      {isDetailSlot ? (
                        <p className="mt-1 text-xs opacity-90">
                          {statusMeta.label}
                        </p>
                      ) : null}
                      {slot?.price != null ? (
                        <p className="mt-1 text-xs font-bold text-white/90">
                          {formatCompactPrice(slot.price)}
                        </p>
                      ) : null}
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
