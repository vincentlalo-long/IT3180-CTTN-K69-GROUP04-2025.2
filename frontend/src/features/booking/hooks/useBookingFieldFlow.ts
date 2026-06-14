import { useState, useEffect, useMemo } from "react";
import { format } from "date-fns";
import { useAvailableSlots } from "./useAvailableSlots";
import { createBooking, createRecurringBooking } from "@/features/booking/api/bookingApi";
import { getApiErrorMessage, logApiError } from "@/shared/utils/apiError";
import type { SlotStatusResponse, ServiceItemResponse } from "@/features/venue/types/venue.types";
import type { SlotDisplayItem } from "@/features/booking/components/player/SlotsGrid";
import { useNavigate } from "react-router-dom";
import type {
  RecurringBookingSkippedOccurrence,
  RecurringDayOfWeek,
} from "@/features/booking/types/booking.types";

const normalizeTime = (value: string) => value.slice(0, 5);
const toNumber = (value: string | number | null | undefined) => Number(value ?? 0);

const WEEKDAY_SORT_ORDER = [1, 2, 3, 4, 5, 6, 0];

const RECURRENCE_WEEKDAY_OPTIONS: Array<{
  value: number;
  label: string;
  dayOfWeek: RecurringDayOfWeek;
}> = [
  { value: 1, label: "T2", dayOfWeek: "MONDAY" },
  { value: 2, label: "T3", dayOfWeek: "TUESDAY" },
  { value: 3, label: "T4", dayOfWeek: "WEDNESDAY" },
  { value: 4, label: "T5", dayOfWeek: "THURSDAY" },
  { value: 5, label: "T6", dayOfWeek: "FRIDAY" },
  { value: 6, label: "T7", dayOfWeek: "SATURDAY" },
  { value: 0, label: "CN", dayOfWeek: "SUNDAY" },
];

const sortWeekdays = (days: number[]) =>
  [...days].sort(
    (a, b) => WEEKDAY_SORT_ORDER.indexOf(a) - WEEKDAY_SORT_ORDER.indexOf(b),
  );

const formatDateForDisplay = (dateStr: string): string => {
  const [year, month, day] = dateStr.split("-");
  return `${day}/${month}/${year}`;
};

const getWeeklyOccurrenceCount = (
  startDate: Date,
  numberOfWeeks: number,
  weekdays: number[],
) => {
  if (numberOfWeeks < 1 || weekdays.length === 0) {
    return 0;
  }

  const selectedDays = new Set(weekdays);
  const cursor = new Date(startDate);
  cursor.setHours(0, 0, 0, 0);
  const endDate = new Date(startDate);
  endDate.setHours(0, 0, 0, 0);
  endDate.setDate(endDate.getDate() + numberOfWeeks * 7 - 1);

  let count = 0;
  while (cursor <= endDate) {
    if (selectedDays.has(cursor.getDay())) {
      count += 1;
    }
    cursor.setDate(cursor.getDate() + 1);
  }

  return count;
};

const buildRecurringConflictMessage = (
  skippedOccurrences: RecurringBookingSkippedOccurrence[],
) => {
  const visibleDates = skippedOccurrences
    .slice(0, 6)
    .map((item) => `- ${formatDateForDisplay(item.bookingDate)}: ${item.reason}`);
  const hiddenCount = skippedOccurrences.length - visibleDates.length;
  const suffix = hiddenCount > 0 ? `\n... và ${hiddenCount} ngày khác` : "";

  return `Một số ngày không thể đặt do trùng lịch:\n${visibleDates.join("\n")}${suffix}`;
};

export interface SelectedSlot {
  pitchId: number;
  pitchName: string;
  timeSlotId: number;
  startTime: string;
  endTime: string;
  price: number;
}

const getSafeInitialDate = (initialDate?: Date) =>
  initialDate && !Number.isNaN(initialDate.getTime()) ? initialDate : new Date();

export function useBookingFieldFlow(venueId: number, initialDate?: Date) {
  const navigate = useNavigate();
  const initialSelectedDate = getSafeInitialDate(initialDate);
  const [selectedDate, setSelectedDate] = useState(initialSelectedDate);
  const [recurringEnabled, setRecurringEnabled] = useState(false);
  const [recurringWeeks, setRecurringWeeks] = useState(4);
  const [recurringDays, setRecurringDays] = useState<number[]>([initialSelectedDate.getDay()]);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedServices, setSelectedServices] = useState<Record<number, number>>({});
  const [availableServices, setAvailableServices] = useState<ServiceItemResponse[]>([]);
  const [selectedSlots, setSelectedSlots] = useState<SelectedSlot[]>([]);
  const [pendingBooking, setPendingBooking] = useState<{
    pitchId: number;
    bookingDate: string;
    slots: SlotDisplayItem[];
    timeSlotIds: number[];
    totalPrice: number;
    isRecurring: boolean;
    recurringWeeks: number;
    recurringDayNames: RecurringDayOfWeek[];
    recurringSummary: string | null;
  } | null>(null);

  const {
    loading,
    error,
    venueAvailability,
    refresh,
    lastUpdated,
  } = useAvailableSlots(venueId, 0, selectedDate, {
    refreshIntervalMs: 15000,
    autoRefresh,
  });

  // Clear selections khi đổi ngày
  useEffect(() => {
    setSelectedSlots([]);
    setSelectedServices({});
    setSubmitError(null);
    setSubmitSuccess(null);
  }, [selectedDate]);

  // Trích xuất các khung giờ độc nhất trên tất cả các sân con
  const uniqueTimeRanges = useMemo(() => {
    if (!venueAvailability?.pitches) return [];
    const rangesMap = new Map<string, { startTime: string; endTime: string }>();

    venueAvailability.pitches.forEach((p) => {
      p.slots.forEach((s) => {
        const startNorm = normalizeTime(s.startTime);
        const endNorm = normalizeTime(s.endTime);
        const key = `${startNorm}-${endNorm}`;
        if (!rangesMap.has(key)) {
          rangesMap.set(key, { startTime: startNorm, endTime: endNorm });
        }
      });
    });

    return Array.from(rangesMap.values()).sort((a, b) =>
      a.startTime.localeCompare(b.startTime)
    );
  }, [venueAvailability]);

  const handleToggleSlot = (pitchId: number, pitchName: string, slot: SlotStatusResponse) => {
    const startNorm = normalizeTime(slot.startTime);
    const endNorm = normalizeTime(slot.endTime);

    setSelectedSlots((prev) => {
      const exists = prev.some(
        (s) => s.pitchId === pitchId && s.timeSlotId === slot.timeSlotId
      );
      if (exists) {
        return prev.filter(
          (s) => !(s.pitchId === pitchId && s.timeSlotId === slot.timeSlotId)
        );
      }
      return [
        ...prev,
        {
          pitchId,
          pitchName,
          timeSlotId: slot.timeSlotId,
          startTime: startNorm,
          endTime: endNorm,
          price: slot.price != null ? Number(slot.price) : 0,
        },
      ];
    });
  };

  const handleClearSlots = () => {
    setSelectedSlots([]);
    setSelectedServices({});
  };

  const handleRecurringEnabledChange = (enabled: boolean) => {
    setRecurringEnabled(enabled);
    setSubmitError(null);
    if (enabled && recurringDays.length === 0) {
      setRecurringDays([selectedDate.getDay()]);
    }
  };

  const handleRecurringWeeksChange = (weeks: number) => {
    const safeWeeks = Math.min(52, Math.max(1, Math.trunc(weeks || 1)));
    setRecurringWeeks(safeWeeks);
  };

  const handleToggleRecurringDay = (day: number) => {
    setRecurringDays((prev) => {
      const next = prev.includes(day)
        ? prev.filter((item) => item !== day)
        : [...prev, day];
      return sortWeekdays(next);
    });
  };

  const fieldTotal = useMemo(() => {
    return selectedSlots.reduce((total, slot) => total + slot.price, 0);
  }, [selectedSlots]);

  const serviceTotal = useMemo(() => {
    return availableServices.reduce((total, service) => {
      const quantity = selectedServices[service.id] ?? 0;
      return total + quantity * toNumber(service.price);
    }, 0);
  }, [availableServices, selectedServices]);

  const selectedServicePayload = useMemo(() => {
    return Object.entries(selectedServices)
      .map(([serviceId, quantity]) => ({
        serviceId: Number(serviceId),
        quantity,
      }))
      .filter((item) => item.quantity > 0);
  }, [selectedServices]);

  const selectedRecurringDayNames = useMemo(
    () =>
      recurringDays
        .map(
          (day) =>
            RECURRENCE_WEEKDAY_OPTIONS.find((option) => option.value === day)
              ?.dayOfWeek,
        )
        .filter((day): day is RecurringDayOfWeek => Boolean(day)),
    [recurringDays],
  );

  const recurringOccurrenceCount = useMemo(
    () =>
      recurringEnabled
        ? getWeeklyOccurrenceCount(selectedDate, recurringWeeks, recurringDays)
        : 1,
    [recurringDays, recurringEnabled, recurringWeeks, selectedDate],
  );

  const recurringSummary = useMemo(() => {
    if (!recurringEnabled) {
      return null;
    }

    const labels = recurringDays
      .map((day) => RECURRENCE_WEEKDAY_OPTIONS.find((option) => option.value === day)?.label)
      .filter(Boolean)
      .join(", ");

    return `${recurringOccurrenceCount} ngày trong ${recurringWeeks} tuần (${labels})`;
  }, [recurringDays, recurringEnabled, recurringOccurrenceCount, recurringWeeks]);

  const totalPrice = useMemo(() => {
    const multiplier = recurringEnabled ? recurringOccurrenceCount : 1;
    return (fieldTotal + serviceTotal) * multiplier;
  }, [fieldTotal, recurringEnabled, recurringOccurrenceCount, serviceTotal]);

  const handleSubmit = () => {
    if (!selectedSlots.length) {
      setSubmitError("Vui lòng chọn ít nhất một khung giờ.");
      return;
    }

    if (recurringEnabled && selectedRecurringDayNames.length === 0) {
      setSubmitError("Vui lòng chọn ít nhất một thứ lặp lại.");
      return;
    }

    if (recurringEnabled && recurringOccurrenceCount === 0) {
      setSubmitError("Không có ngày nào phù hợp với lịch lặp lại đã chọn.");
      return;
    }

    const timeSlotIds = selectedSlots.map((item) => item.timeSlotId);

    const confirmSlots: SlotDisplayItem[] = selectedSlots.map((sel) => ({
      slot: {
        startTime: sel.startTime,
        endTime: sel.endTime,
      },
      status: "selected",
      timeSlotId: sel.timeSlotId,
      price: sel.price,
    }));

    setSubmitError(null);
    setPendingBooking({
      pitchId: selectedSlots[0].pitchId,
      bookingDate: format(selectedDate, "yyyy-MM-dd"),
      slots: confirmSlots,
      timeSlotIds,
      totalPrice,
      isRecurring: recurringEnabled,
      recurringWeeks,
      recurringDayNames: selectedRecurringDayNames,
      recurringSummary,
    });
    setShowConfirmModal(true);
  };

  const handleConfirmBooking = async () => {
    if (!pendingBooking) return;

    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(null);

    try {
      if (pendingBooking.isRecurring) {
        const recurringResponses = await Promise.all(
          selectedSlots.map((sel, index) =>
            createRecurringBooking({
              pitchId: sel.pitchId,
              startDate: pendingBooking.bookingDate,
              recurrenceType: "WEEKLY",
              daysOfWeek: pendingBooking.recurringDayNames,
              numberOfWeeks: pendingBooking.recurringWeeks,
              skipConflicts: true,
              timeSlotId: sel.timeSlotId,
              services: index === 0 ? selectedServicePayload : [],
            })
          )
        );

        const createdBookings = recurringResponses.flatMap(
          (response) => response.bookings,
        );
        const skippedOccurrences = recurringResponses.flatMap(
          (response) => response.skippedOccurrences,
        );

        if (!createdBookings.length) {
          const message = skippedOccurrences.length
            ? `${buildRecurringConflictMessage(skippedOccurrences)}\nKhông có booking nào được tạo.`
            : "Không có booking nào được tạo.";
          setSubmitError(message);
          return;
        }

        const bookingIdsConcat = createdBookings.map(b => b.id).join("-");
        const pitchNameDisplay = selectedSlots.length > 1
          ? `${selectedSlots[0].pitchName} và ${selectedSlots.length - 1} sân khác`
          : selectedSlots[0].pitchName;
        const totalCreatedPrice = recurringResponses.reduce(
          (total, response) => total + toNumber(response.totalPrice),
          0,
        );
        const recurringWarning = skippedOccurrences.length
          ? buildRecurringConflictMessage(skippedOccurrences)
          : null;

        setShowConfirmModal(false);
        setPendingBooking(null);
        setSelectedSlots([]);
        setSelectedServices({});
        refresh();

        navigate("/checkout", {
          state: {
            bookingData: {
              bookingId: bookingIdsConcat,
              pitchName: pitchNameDisplay,
              bookingDate: pendingBooking.bookingDate,
              startTime: selectedSlots[0].startTime,
              endTime: selectedSlots[selectedSlots.length - 1].endTime,
              totalPrice: totalCreatedPrice,
              recurringSummary: pendingBooking.recurringSummary,
              recurringWarning,
              createdCount: createdBookings.length,
              skippedCount: skippedOccurrences.length,
            }
          }
        });
        return;
      }

      const bookingResponses = await Promise.all(
        selectedSlots.map((sel, index) =>
          createBooking({
            pitchId: sel.pitchId,
            bookingDate: pendingBooking.bookingDate,
            timeSlotId: sel.timeSlotId,
            services: index === 0 ? selectedServicePayload : [],
          })
        )
      );

      const bookingIdsConcat = bookingResponses.map(b => b.id).join("-");

      const pitchNameDisplay = selectedSlots.length > 1
        ? `${selectedSlots[0].pitchName} và ${selectedSlots.length - 1} sân khác`
        : selectedSlots[0].pitchName;
      const bDate = pendingBooking.bookingDate;
      const sTime = selectedSlots[0].startTime;
      const eTime = selectedSlots[selectedSlots.length - 1].endTime;
      const tPrice = pendingBooking.totalPrice;

      setShowConfirmModal(false);
      setPendingBooking(null);
      setSelectedSlots([]);
      setSelectedServices({});
      refresh();

      navigate("/checkout", {
        state: {
          bookingData: {
            bookingId: bookingIdsConcat,
            pitchName: pitchNameDisplay,
            bookingDate: bDate,
            startTime: sTime,
            endTime: eTime,
            totalPrice: tPrice
          }
        }
      });
    } catch (err) {
      logApiError("BookingField.handleConfirmBooking", err, {
        venueId,
        selectedSlotCount: selectedSlots.length,
      });
      setSubmitError(
        getApiErrorMessage(err, "Đặt sân thất bại. Vui lòng thử lại.")
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    selectedDate,
    setSelectedDate,
    showDatePicker,
    setShowDatePicker,
    autoRefresh,
    setAutoRefresh,
    recurringEnabled,
    recurringWeeks,
    recurringDays,
    recurringDayOptions: RECURRENCE_WEEKDAY_OPTIONS,
    recurringOccurrenceCount,
    recurringSummary,
    loading,
    error,
    venueAvailability,
    lastUpdated,
    uniqueTimeRanges,
    selectedSlots,
    selectedServices,
    setSelectedServices,
    setAvailableServices,
    fieldTotal,
    serviceTotal,
    totalPrice,
    isSubmitting,
    submitSuccess,
    submitError,
    showConfirmModal,
    setShowConfirmModal,
    pendingBooking,
    handleToggleSlot,
    handleClearSlots,
    handleRecurringEnabledChange,
    handleRecurringWeeksChange,
    handleToggleRecurringDay,
    handleSubmit,
    handleConfirmBooking,
  };
}
