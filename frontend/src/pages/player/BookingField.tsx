import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import {
  DateSelector,
  SelectedSlotsBar,
  SlotsGrid,
  useAvailableSlots,
  useSlotSelection,
} from "@/features/booking";
import type {
  SlotStatusResponse,
  TimeSlotRange,
} from "@/features/venue/types/venue.types";
import { createBooking } from "@/features/booking/api/bookingApi";
import type { SlotDisplayItem } from "@/features/booking/components/player/SlotsGrid";
import { getApiErrorMessage, logApiError } from "@/shared/utils/apiError";

const normalizeTime = (value: string) => value.slice(0, 5);

const toSlotRange = (slot: SlotStatusResponse): TimeSlotRange => ({
  startTime: normalizeTime(slot.startTime),
  endTime: normalizeTime(slot.endTime),
});

const sortSlots = (left: TimeSlotRange, right: TimeSlotRange) =>
  left.startTime.localeCompare(right.startTime);

export function BookingField() {
  const navigate = useNavigate();
  const { fieldId } = useParams();
  const venueId = Number(fieldId) || 1;

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedPitchId, setSelectedPitchId] = useState<number | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const { selectedSlots, toggleSlot, clearSlots } = useSlotSelection({
    resetKey: [selectedDate, selectedPitchId],
  });

  const {
    loading,
    error,
    slots,
    pitch,
    venueAvailability,
    refresh,
    lastUpdated,
  } = useAvailableSlots(venueId, selectedPitchId ?? 0, selectedDate, {
    refreshIntervalMs: 15000,
    autoRefresh,
  });

  useEffect(() => {
    if (!selectedPitchId && venueAvailability?.pitches.length) {
      setSelectedPitchId(venueAvailability.pitches[0].pitchId);
    }
  }, [selectedPitchId, venueAvailability]);

  useEffect(() => {
    setSubmitError(null);
    setSubmitSuccess(null);
  }, [selectedDate, selectedPitchId]);

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

  const handleSubmit = async () => {
    if (!selectedPitchId) {
      setSubmitError("Vui long chon san truoc khi dat.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(null);

    const bookingDate = format(selectedDate, "yyyy-MM-dd");

    try {
      const timeSlotIds = selectedSlots
        .map((slot) => {
          const match = slots.find(
            (item) =>
              normalizeTime(item.startTime) === slot.startTime &&
              normalizeTime(item.endTime) === slot.endTime,
          );
          return match?.timeSlotId;
        })
        .filter((value): value is number => typeof value === "number");

      if (timeSlotIds.length !== selectedSlots.length) {
        setSubmitError("Khong the xac dinh timeSlotId cho tat ca khung gio.");
        setIsSubmitting(false);
        return;
      }

      await Promise.all(
        timeSlotIds.map((timeSlotId) =>
          createBooking({
            pitchId: selectedPitchId,
            bookingDate,
            timeSlotId,
          }),
        ),
      );

      setSubmitSuccess("Dat san thanh cong.");
      clearSlots();
      refresh();
    } catch (err) {
      logApiError("BookingField.handleSubmit", err, {
        venueId,
        selectedPitchId,
        bookingDate,
        selectedSlotCount: selectedSlots.length,
      });
      setSubmitError(getApiErrorMessage(err, "Dat san that bai."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f7fb] px-4 py-6 dark:bg-slate-900">
      <div className="mx-auto w-full max-w-4xl space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-semibold text-gray-900 dark:text-slate-100">
              Dat san
            </h1>
            <p className="text-sm text-gray-500 dark:text-slate-400">
              {venueAvailability?.venueName ?? "Dang tai thong tin san"}
            </p>
          </div>
          <label className="flex items-center gap-2 text-xs font-semibold text-gray-600 dark:text-slate-300">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(event) => setAutoRefresh(event.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-emerald-600"
            />
            Cap nhat tu dong
          </label>
        </div>

        <DateSelector selectedDate={selectedDate} onChange={setSelectedDate} />

        {venueAvailability?.pitches.length ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
            <label className="text-sm font-semibold text-gray-900 dark:text-slate-100">
              Chon san
            </label>
            <select
              value={selectedPitchId ?? ""}
              onChange={(event) => {
                setSelectedPitchId(Number(event.target.value));
                clearSlots();
              }}
              className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            >
              {venueAvailability.pitches.map((pitchItem) => (
                <option key={pitchItem.pitchId} value={pitchItem.pitchId}>
                  {pitchItem.pitchName}
                </option>
              ))}
            </select>
            {lastUpdated && (
              <p className="mt-2 text-xs text-gray-400 dark:text-slate-500">
                Cap nhat luc {format(lastUpdated, "HH:mm:ss")}
              </p>
            )}
          </div>
        ) : null}

        {loading && (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-6 text-center text-sm text-gray-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
            Dang tai khung gio...
          </div>
        )}

        {!loading && error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center text-sm text-rose-600 dark:border-rose-400/40 dark:bg-rose-500/10 dark:text-rose-200">
            {error}
          </div>
        )}

        {!loading && !error && !pitch && (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-6 text-center text-sm text-gray-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
            Khong tim thay san phu hop.
          </div>
        )}

        {!loading && !error && pitch && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-gray-200 bg-white p-4 text-sm text-gray-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
              Dang xem:{" "}
              <span className="font-semibold text-gray-900 dark:text-slate-100">
                {pitch.pitchName}
              </span>
            </div>
            <SlotsGrid slots={slotItems} onSlotToggle={toggleSlot} />
          </div>
        )}

        {submitError && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-600 dark:border-rose-400/40 dark:bg-rose-500/10 dark:text-rose-200">
            {submitError}
          </div>
        )}

        {submitSuccess && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700 dark:border-emerald-400/40 dark:bg-emerald-500/10 dark:text-emerald-200">
            {submitSuccess}
          </div>
        )}

        <SelectedSlotsBar
          selectedSlots={selectedSlots}
          onClear={clearSlots}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          disableSubmit={!selectedPitchId || loading}
        />
      </div>
    </div>
  );
}
