import {
  ALL_FACILITIES_ID,
  ADMIN_TIME_SLOTS,
  fields,
  facilities,
  mockBookings,
  TIME_SLOT_PRICING,
  type AdminTimeSlot,
} from "../../../data/mockAdminData";
import { useVenueContext as useFacilityContext } from "../../venue/hooks/useVenueContext";
import type { FieldScheduleRow, ScheduleSlot } from "../types/booking.types";
import { formatMoney, getRangeLabel } from "../utils/booking.utils";

export function useFieldSchedule() {
  const {
    selectedVenue: selectedFacility,
    selectedVenueId: selectedFacilityId,
  } = useFacilityContext();

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

  return {
    fieldScheduleRows,
    handleClickSlot,
    selectedFacility,
    selectedFacilityId,
  };
}
