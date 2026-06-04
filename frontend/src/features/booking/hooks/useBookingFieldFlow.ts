import { useState, useEffect, useMemo } from "react";
import { format } from "date-fns";
import { useAvailableSlots } from "./useAvailableSlots";
import { createBooking } from "@/features/booking/api/bookingApi";
import { getApiErrorMessage, logApiError } from "@/shared/utils/apiError";
import type { SlotStatusResponse, ServiceItemResponse } from "@/features/venue/types/venue.types";
import type { SlotDisplayItem } from "@/features/booking/components/player/SlotsGrid";

const normalizeTime = (value: string) => value.slice(0, 5);
const toNumber = (value: string | number | null | undefined) => Number(value ?? 0);

export interface SelectedSlot {
  pitchId: number;
  pitchName: string;
  timeSlotId: number;
  startTime: string;
  endTime: string;
  price: number;
}

export function useBookingFieldFlow(venueId: number) {
  const [selectedDate, setSelectedDate] = useState(new Date());
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

  const handleSubmit = () => {
    if (!selectedSlots.length) {
      setSubmitError("Vui lòng chọn ít nhất một khung giờ.");
      return;
    }

    const timeSlotIds = selectedSlots.map((item) => item.timeSlotId);
    const totalPrice = fieldTotal + serviceTotal;

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
    });
    setShowConfirmModal(true);
  };

  const handleConfirmBooking = async () => {
    if (!pendingBooking) return;

    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(null);

    try {
      await Promise.all(
        selectedSlots.map((sel, index) =>
          createBooking({
            pitchId: sel.pitchId,
            bookingDate: pendingBooking.bookingDate,
            timeSlotId: sel.timeSlotId,
            services: index === 0 ? selectedServicePayload : [],
          })
        )
      );

      setShowConfirmModal(false);
      setPendingBooking(null);
      setSelectedSlots([]);
      setSelectedServices({});
      refresh();
      setSubmitSuccess(
        `Đặt sân thành công! ${selectedSlots.length} khung giờ đã được xác nhận.`
      );
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
    isSubmitting,
    submitSuccess,
    submitError,
    showConfirmModal,
    setShowConfirmModal,
    pendingBooking,
    handleToggleSlot,
    handleClearSlots,
    handleSubmit,
    handleConfirmBooking,
  };
}
