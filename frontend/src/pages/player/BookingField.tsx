import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { ArrowLeft, CalendarDays } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import {
  DateSelector,
  SelectedSlotsBar,
  useAvailableSlots,
} from "@/features/booking";
import type { SlotStatusResponse } from "@/features/venue/types/venue.types";
import { createBooking } from "@/features/booking/api/bookingApi";
import type { SlotDisplayItem } from "@/features/booking/components/player/SlotsGrid";
import { getApiErrorMessage, logApiError } from "@/shared/utils/apiError";
import { BookingConfirmModal } from "@/features/booking/components/player/BookingConfirmModal";
import { PlayerNavBar } from "@/layouts/player/PlayerNavBar";

const normalizeTime = (value: string) => value.slice(0, 5);

export function BookingField() {
  const navigate = useNavigate();
  const { fieldId } = useParams();
  const venueId = Number(fieldId) || 1;

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [pendingBooking, setPendingBooking] = useState<{
    pitchId: number;
    bookingDate: string;
    slots: SlotDisplayItem[];
    timeSlotIds: number[];
    totalPrice: number;
  } | null>(null);

  // Custom state for selecting slots across multiple pitches
  interface SelectedSlot {
    pitchId: number;
    pitchName: string;
    timeSlotId: number;
    startTime: string;
    endTime: string;
    price: number;
  }
  const [selectedSlots, setSelectedSlots] = useState<SelectedSlot[]>([]);

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

  // Clear selections when date changes
  useEffect(() => {
    setSelectedSlots([]);
    setSubmitError(null);
    setSubmitSuccess(null);
  }, [selectedDate]);

  // Extract unique time ranges across all pitches
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
  };

  const formatPrice = (price: number) => {
    if (price === 0) return "Liên hệ";
    if (price >= 1000) {
      return `${(price / 1000).toLocaleString("vi-VN")}k`;
    }
    return `${price.toLocaleString("vi-VN")}đ`;
  };

  const handleSubmit = () => {
    if (!selectedSlots.length) {
      setSubmitError("Vui lòng chọn ít nhất một khung giờ.");
      return;
    }

    const timeSlotIds = selectedSlots.map((item) => item.timeSlotId);
    const totalPrice = selectedSlots.reduce((sum, item) => sum + item.price, 0);

    // Map SelectedSlot to SlotDisplayItem structure for Confirm Modal compatibility
    const confirmSlots: SlotDisplayItem[] = selectedSlots.map((sel) => ({
      slot: {
        startTime: sel.startTime,
        endTime: sel.endTime,
      },
      status: "selected",
      timeSlotId: sel.timeSlotId,
      price: sel.price,
    }));

    // For multi-pitch summary, we will override the single pitchName inside the Modal layout if needed,
    // or display the primary/first selected pitch.
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
      // Execute all creations with their corresponding pitch IDs!
      await Promise.all(
        selectedSlots.map((sel) =>
          createBooking({
            pitchId: sel.pitchId,
            bookingDate: pendingBooking.bookingDate,
            timeSlotId: sel.timeSlotId,
          })
        )
      );

      setShowConfirmModal(false);
      setPendingBooking(null);
      setSelectedSlots([]);
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#005E2E] to-[#29721D]">
      <PlayerNavBar />

      <main className="mx-auto w-full max-w-[1280px] px-6 py-8 space-y-6">
        {/* Header Block with Back Button & Details */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-white/10 pb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition hover:bg-white/20 hover:scale-[1.05] active:scale-[0.95]"
              title="Quay lại"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 className="text-2xl font-extrabold text-white tracking-tight md:text-3xl">
                Đặt Lịch Chi Tiết
              </h1>
              <p className="text-sm text-emerald-100/80 mt-1">
                {venueAvailability?.venueName ?? "Đang tải thông tin sân bóng..."}
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            {/* Popover Date Selector */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowDatePicker(!showDatePicker)}
                className="inline-flex items-center gap-2 rounded-xl bg-white border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition shadow-md active:scale-95"
              >
                <CalendarDays size={16} className="text-[#005E2E]" />
                <span>Ngày: {format(selectedDate, "dd/MM/yyyy")}</span>
              </button>
              
              {showDatePicker && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowDatePicker(false)}
                  />
                  <div className="absolute right-0 top-full mt-2 z-50 bg-white rounded-xl shadow-2xl p-4 border border-slate-100 text-slate-800 w-[330px]">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Chọn ngày đặt</span>
                      <button
                        type="button"
                        onClick={() => setShowDatePicker(false)}
                        className="text-xs font-bold text-emerald-600 hover:text-emerald-700"
                      >
                        Đóng
                      </button>
                    </div>
                    <DateSelector
                      selectedDate={selectedDate}
                      onChange={(date) => {
                        setSelectedDate(date);
                        setShowDatePicker(false);
                      }}
                    />
                  </div>
                </>
              )}
            </div>

            <label className="inline-flex items-center gap-2 rounded-xl bg-white/10 border border-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(event) => setAutoRefresh(event.target.checked)}
                className="h-4 w-4 rounded border-white/30 text-[#2E7D1E] focus:ring-offset-0"
              />
              Cập nhật tự động
            </label>
          </div>
        </div>

        {/* Loader, Error or Empty States */}
        {loading && !venueAvailability && (
          <div className="rounded-2xl border-2 border-dashed border-white/20 bg-white/5 p-8 text-center text-sm font-medium text-emerald-100/70">
            Đang tải sơ đồ sân và khung giờ hoạt động...
          </div>
        )}

        {!loading && error && (
          <div className="rounded-2xl bg-rose-50 border border-rose-100 p-6 text-center text-sm font-semibold text-rose-600">
            {error}
          </div>
        )}

        {!loading && !error && !venueAvailability?.pitches.length && (
          <div className="rounded-2xl border-2 border-dashed border-white/20 bg-white/5 p-8 text-center text-sm font-medium text-emerald-100/70">
            Không tìm thấy thông tin sân phù hợp tại cụm sân này.
          </div>
        )}

        {/* Timetable Grid Card */}
        {venueAvailability?.pitches.length ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-2xl bg-white/10 border border-white/10 p-4 text-sm font-medium text-white backdrop-blur">
              <span>Sơ đồ đặt sân (Vuốt ngang để xem hết khung giờ)</span>
              {lastUpdated && (
                <span className="text-xs text-emerald-200/80">
                  Cập nhật lúc: {format(lastUpdated, "HH:mm:ss")}
                </span>
              )}
            </div>

            {/* Scrollable Matrix Table Wrapper */}
            <div className="overflow-x-auto rounded-xl border border-white/10 bg-white/5 backdrop-blur-md shadow-xl">
              <table className="w-full min-w-[1050px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5">
                    <th className="sticky left-0 top-0 z-20 bg-[#005E2E] p-4 font-bold text-white min-w-[160px] border-r border-white/10 whitespace-nowrap">
                      Sân / Giờ
                    </th>
                    {uniqueTimeRanges.map((range) => (
                      <th
                        key={`${range.startTime}-${range.endTime}`}
                        className="p-4 font-bold text-white text-center min-w-[150px] border-r border-white/10 last:border-r-0 bg-[#005E2E]/80 backdrop-blur-sm whitespace-nowrap"
                      >
                        <div className="font-bold text-white text-sm whitespace-nowrap">
                          {range.startTime} - {range.endTime}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {venueAvailability.pitches.map((pitchItem) => (
                    <tr key={pitchItem.pitchId} className="hover:bg-white/5 transition">
                      {/* Sticky left Pitch Name */}
                      <td className="sticky left-0 z-10 bg-[#005E2E] p-4 font-bold text-white border-r border-white/10 min-w-[160px] whitespace-nowrap">
                        <div className="text-sm font-semibold">{pitchItem.pitchName}</div>
                      </td>

                      {/* Render Cells */}
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
                              className="p-3 text-center text-white/20 bg-white/2 border-r border-white/10 last:border-r-0"
                            >
                              -
                            </td>
                          );
                        }

                        const isBooked = slot.status === "BOOKED";
                        const isSelected = selectedSlots.some(
                          (sel) =>
                            sel.pitchId === pitchItem.pitchId &&
                            sel.timeSlotId === slot.timeSlotId
                        );

                        return (
                          <td
                            key={`${range.startTime}-${range.endTime}`}
                            className="p-3 text-center border-r border-white/10 last:border-r-0"
                          >
                            {isBooked ? (
                              <div className="flex h-14 w-full flex-col justify-center rounded-md bg-white/5 border border-dashed border-white/10 text-white/30 text-left p-3 select-none cursor-not-allowed">
                                <span className="font-bold text-xs">Đã đặt</span>
                                <span className="text-[10px] opacity-70 mt-0.5">-</span>
                              </div>
                            ) : isSelected ? (
                              <button
                                onClick={() =>
                                  handleToggleSlot(pitchItem.pitchId, pitchItem.pitchName, slot)
                                }
                                className="flex h-14 w-full flex-col justify-center rounded-md bg-emerald-500 border border-emerald-400 text-white text-left p-3 shadow-md hover:bg-emerald-400 transition transform hover:scale-[1.02] active:scale-[0.98]"
                              >
                                <span className="font-bold text-xs">Đã chọn</span>
                                <span className="text-[11px] font-medium mt-0.5">
                                  {formatPrice(slot.price != null ? Number(slot.price) : 0)}
                                </span>
                              </button>
                            ) : (
                              <button
                                onClick={() =>
                                  handleToggleSlot(pitchItem.pitchId, pitchItem.pitchName, slot)
                                }
                                className="flex h-14 w-full flex-col justify-center rounded-md bg-white/5 border border-white/15 text-white text-left p-3 transition transform hover:bg-white/15 hover:border-white/30 hover:scale-[1.02] active:scale-[0.98]"
                              >
                                <span className="font-bold text-xs">Trống</span>
                                <span className="text-[11px] text-emerald-300 font-medium mt-0.5">
                                  {formatPrice(slot.price != null ? Number(slot.price) : 0)}
                                </span>
                              </button>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}

        {submitSuccess && (
          <div className="rounded-2xl bg-emerald-50 border border-emerald-100 p-4 text-sm font-semibold text-[#2E7D1E]">
            {submitSuccess}
          </div>
        )}

        <SelectedSlotsBar
          selectedSlots={selectedSlots}
          onClear={handleClearSlots}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          disableSubmit={!selectedSlots.length || loading}
        />

        {showConfirmModal && pendingBooking && (
          <BookingConfirmModal
            open={showConfirmModal}
            onClose={() => setShowConfirmModal(false)}
            onConfirm={handleConfirmBooking}
            isSubmitting={isSubmitting}
            pitchName={
              selectedSlots.length > 1
                ? `${selectedSlots[0].pitchName} và ${selectedSlots.length - 1} sân khác`
                : selectedSlots[0].pitchName
            }
            bookingDate={pendingBooking.bookingDate}
            slots={pendingBooking.slots}
            totalPrice={pendingBooking.totalPrice}
            error={submitError ?? null}
          />
        )}
      </main>
    </div>
  );
}