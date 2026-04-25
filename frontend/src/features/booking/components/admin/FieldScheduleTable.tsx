import {
  ALL_FACILITIES_ID,
  ADMIN_TIME_SLOTS,
  TIME_SLOT_PRICING,
  type AdminTimeSlot,
} from "../../../../data/mockAdminData";
import type { FieldScheduleRow, ScheduleSlot } from "../../types/booking.types";
import { slotStatusStyles } from "../../constants/booking.constants";
import { formatMoney, getRangeLabel } from "../../utils/booking.utils";
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
              const badgeClass =
                priceMeta.tier === "off-peak"
                  ? "bg-white/16 text-white/95"
                  : priceMeta.tier === "transition"
                    ? "bg-amber-300/30 text-amber-50"
                    : "bg-lime-300/40 text-[#15381a]";

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
                  <span
                    className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ${badgeClass}`}
                  >
                    {formatMoney(priceMeta.price)} - {priceMeta.tierLabel}
                  </span>
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
                {selectedFacilityId === ALL_FACILITIES_ID ? (
                  <p className="mt-1 text-[11px] font-normal text-white/65">
                    {row.facilityName}
                  </p>
                ) : null}
              </th>

              {ADMIN_TIME_SLOTS.map((timeSlot) => {
                const slot = row.slots[timeSlot];
                const statusMeta = slotStatusStyles[slot.status];
                const isDetailSlot =
                  slot.status === "booked" || slot.status === "in-progress";

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
                        {slot.customerName ?? statusMeta.label}
                      </p>
                      <p className="mt-1 text-xs opacity-90">
                        {statusMeta.label}
                      </p>
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
