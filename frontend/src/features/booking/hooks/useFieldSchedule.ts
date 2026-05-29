import { useState, useEffect } from "react";
import { useVenueContext as useFacilityContext } from "../../venue/hooks/useVenueContext";
import type { FieldScheduleRow, ScheduleSlot } from "../types/booking.types";
import { getAdminFieldSchedules } from "../api/booking.api";
import { formatMoney, getRangeLabel } from "../utils/booking.utils";
import {
  ADMIN_TIME_SLOTS,
  ALL_FACILITIES_ID,
  type AdminTimeSlot,
} from "../constants/booking.constants";
import { getApiErrorMessage, logApiError } from "@/shared/utils/apiError";

export function useFieldSchedule() {
  const {
    selectedVenue: selectedFacility,
    selectedVenueId: selectedFacilityId,
  } = useFacilityContext();

  const [selectedDate, setSelectedDate] = useState<string>(() => {
    return new Date().toISOString().split("T")[0];
  });
  
  const [fieldScheduleRows, setFieldScheduleRows] = useState<FieldScheduleRow[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSchedules = async () => {
      setIsLoading(true);
      setError(null);
      setFieldScheduleRows([]);
      try {
        const isAllFacilitiesSelected =
          selectedFacilityId === ALL_FACILITIES_ID ||
          selectedFacilityId === "ALL";
        const venueIdConstraint = isAllFacilitiesSelected
          ? null
          : selectedFacilityId;
            
        const data = await getAdminFieldSchedules(venueIdConstraint, selectedDate);
        
        const rows: FieldScheduleRow[] = data.map((pitch) => {
          const slotsRecord: Record<string, ScheduleSlot> = {};
          
          ADMIN_TIME_SLOTS.forEach((timeSlot) => {
            slotsRecord[timeSlot] = { status: "AVAILABLE" };
          });

          pitch.slots.forEach((slotData) => {
            const timeKey = slotData.startTime.slice(0, 5) as AdminTimeSlot; 
            if (slotsRecord[timeKey]) {
              slotsRecord[timeKey] = {
                status: slotData.status,
                customerName: slotData.customerName ?? undefined,
                phone: slotData.customerPhone ?? undefined,
                deposit: slotData.depositAmount != null 
                  ? formatMoney(slotData.depositAmount) 
                  : undefined,
                timeSlotId: slotData.timeSlotId,
                price: slotData.price,
              };
            }
          });

          return {
            fieldId: pitch.pitchId.toString(),
            facilityId: selectedFacilityId?.toString() ?? "",
            facilityName: pitch.venueName,
            fieldName: pitch.pitchName,
            fieldType: pitch.pitchName.includes("5") ? "Sân 5" : pitch.pitchName.includes("7") ? "Sân 7" : "Sân 11",
            slots: slotsRecord,
          };
        });

        setFieldScheduleRows(rows);
      } catch (err: unknown) {
        const message = getApiErrorMessage(err, "Khong the lay lich san.");
        logApiError("useFieldSchedule.fetchSchedules", err, {
          selectedFacilityId,
          selectedDate,
        });
        setError(message);
        setFieldScheduleRows([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSchedules();
  }, [selectedFacilityId, selectedDate]);

  const handleClickSlot = (
    facilityName: string,
    fieldName: string,
    timeSlot: AdminTimeSlot,
    slot: ScheduleSlot,
  ) => {
    if (slot.status !== "BOOKED") {
      return;
    }

    window.alert(
      [
        `Khu sân: ${facilityName}`,
        `Sân: ${fieldName}`,
        `Khung giờ: ${getRangeLabel(timeSlot)}`,
        `Trạng thái: Đã cọc`,
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
    selectedDate,
    setSelectedDate,
    isLoading,
    error
  };
}
