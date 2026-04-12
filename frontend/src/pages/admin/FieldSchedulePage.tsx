import {
  ALL_FACILITIES_ID,
  ADMIN_TIME_SLOTS,
  fields,
  facilities,
  mockBookings,
  TIME_SLOT_PRICING,
  type AdminTimeSlot,
  type BookingStatus,
} from "../../data/mockAdminData";
import { useFacilityContext } from "../../contexts/useFacilityContext";

type SlotStatus = BookingStatus | "available";

interface ScheduleSlot {
  status: SlotStatus;
  customerName?: string;
  phone?: string;
  deposit?: string;
}

interface FieldScheduleRow {
  fieldId: string;
  facilityId: string;
  facilityName: string;
  fieldName: string;
  fieldType: string;
  slots: Record<AdminTimeSlot, ScheduleSlot>;
}

const formatMoney = (amount: number): string =>
  `${amount.toLocaleString("vi-VN")}đ`;

const addMinutes = (time: string, minutes: number): string => {
  const [hoursPart, minutesPart] = time
    .split(":")
    .map((value) => Number(value));
  const totalMinutes = hoursPart * 60 + minutesPart + minutes;
  const hours = String(Math.floor(totalMinutes / 60)).padStart(2, "0");
  const mins = String(totalMinutes % 60).padStart(2, "0");
  return `${hours}:${mins}`;
};

const getRangeLabel = (startTime: AdminTimeSlot): string =>
  `${startTime} - ${addMinutes(startTime, 90)}`;

const slotStatusStyles: Record<
  SlotStatus,
  { label: string; className: string }
> = {
  available: {
    label: "Trống",
    className:
      "border border-white/20 bg-white/6 text-white/90 hover:border-white/55",
  },
  booked: {
    label: "Đã cọc",
    className:
      "border border-amber-200/70 bg-amber-300/30 text-amber-50 hover:border-amber-100",
  },
  "in-progress": {
    label: "Đang đá",
    className:
      "border border-lime-100/90 bg-lime-300/45 text-[#103314] hover:border-white",
  },
  maintenance: {
    label: "Bảo trì",
    className:
      "border border-slate-200/45 bg-[repeating-linear-gradient(135deg,rgba(255,255,255,0.16)_0px,rgba(255,255,255,0.16)_9px,rgba(130,130,130,0.2)_9px,rgba(130,130,130,0.2)_18px)] text-slate-100 hover:border-slate-100/65",
  },
};

export function FieldSchedulePage() {
  const { selectedFacility, selectedFacilityId } = useFacilityContext();

  const visibleFields =
    selectedFacilityId === ALL_FACILITIES_ID
      ? fields
      : fields.filter((field) => field.facilityId === selectedFacilityId);

  const visibleBookings =
    selectedFacilityId === ALL_FACILITIES_ID
      ? mockBookings
      : mockBookings.filter(
          (booking) => booking.facilityId === selectedFacilityId,
        );

  const bookingLookup = new Map<string, (typeof visibleBookings)[number]>();
  visibleBookings.forEach((booking) => {
    bookingLookup.set(`${booking.fieldId}-${booking.startTime}`, booking);
  });

  const fieldScheduleRows: FieldScheduleRow[] = visibleFields.map((field) => {
    const facilityName =
      facilities.find((facility) => facility.id === field.facilityId)?.name ??
      "Khu sân";

    const slots = ADMIN_TIME_SLOTS.reduce(
      (accumulator, timeSlot) => {
        const booking = bookingLookup.get(`${field.id}-${timeSlot}`);

        if (!booking) {
          accumulator[timeSlot] = { status: "available" };
          return accumulator;
        }

        accumulator[timeSlot] = {
          status: booking.status,
          customerName: booking.customerName,
          phone: booking.customerPhone,
          deposit: booking.depositAmount
            ? formatMoney(booking.depositAmount)
            : formatMoney(TIME_SLOT_PRICING[timeSlot].price),
        };

        return accumulator;
      },
      {} as Record<AdminTimeSlot, ScheduleSlot>,
    );

    return {
      fieldId: field.id,
      facilityId: field.facilityId,
      facilityName,
      fieldName: field.name,
      fieldType: field.type,
      slots,
    };
  });

  const handleClickSlot = (
    facilityName: string,
    fieldName: string,
    timeSlot: AdminTimeSlot,
    slot: ScheduleSlot,
  ) => {
    if (slot.status !== "booked" && slot.status !== "in-progress") {
      return;
    }

    const statusLabel = slot.status === "booked" ? "Đã cọc" : "Đang đá";

    window.alert(
      [
        `Khu sân: ${facilityName}`,
        `Sân: ${fieldName}`,
        `Khung giờ: ${getRangeLabel(timeSlot)}`,
        `Trạng thái: ${statusLabel}`,
        `Khách: ${slot.customerName ?? "N/A"}`,
        `SĐT: ${slot.phone ?? "N/A"}`,
        `Số tiền đã cọc: ${slot.deposit ?? "0đ"}`,
      ].join("\n"),
    );
  };

  return (
    <section className="space-y-5">
      <header className="rounded-2xl border border-white/15 bg-[#005E2E]/38 px-5 py-4">
        <h2 className="text-xl font-semibold text-white">Quản lý lịch sân</h2>
        <p className="mt-1 text-sm text-white/80">
          {selectedFacilityId === ALL_FACILITIES_ID
            ? "Đang hiển thị lịch của toàn bộ khu sân trong hệ thống."
            : `Đang hiển thị lịch của ${selectedFacility?.name}.`}
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          <span className="rounded-full border border-white/20 bg-white/8 px-3 py-1 text-xs font-medium text-white/90">
            Trống
          </span>
          <span className="rounded-full border border-amber-100/70 bg-amber-300/30 px-3 py-1 text-xs font-medium text-amber-50">
            Đã cọc
          </span>
          <span className="rounded-full border border-lime-100/90 bg-lime-300/45 px-3 py-1 text-xs font-medium text-[#123915]">
            Đang đá
          </span>
          <span className="rounded-full border border-slate-200/45 bg-white/12 px-3 py-1 text-xs font-medium text-slate-100">
            Khóa/Bảo trì
          </span>
        </div>
      </header>

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
            {fieldScheduleRows.map((row) => (
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
                          handleClickSlot(
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
    </section>
  );
}
