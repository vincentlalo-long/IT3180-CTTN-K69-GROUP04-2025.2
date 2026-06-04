import { format } from "date-fns";
import { ArrowLeft, CalendarDays } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import {
  DateSelector,
  SelectedSlotsBar,
  ServiceSelector,
  BookingSlotsTable,
  useBookingFieldFlow,
} from "@/features/booking";
import { BookingConfirmModal } from "@/features/booking/components/player/BookingConfirmModal";
import { PlayerNavBar } from "@/layouts/player/PlayerNavBar";

export function BookingField() {
  const navigate = useNavigate();
  const { fieldId } = useParams();
  const venueId = Number(fieldId) || 1;

  const {
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
  } = useBookingFieldFlow(venueId);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#005E2E] to-[#29721D]">
      <PlayerNavBar />

      <main className="mx-auto w-full max-w-[1280px] px-6 py-8 space-y-6">
        {/* Header Block */}
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
            {/* Popover Chọn Ngày */}
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
                  <div className="fixed inset-0 z-40" onClick={() => setShowDatePicker(false)} />
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

        {/* Trạng thái Loading / Error */}
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

        {/* Bảng Ma trận Sân Con */}
        {venueAvailability?.pitches.length ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between rounded-2xl bg-white/10 border border-white/10 p-4 text-sm font-medium text-white backdrop-blur">
              <span>Sơ đồ đặt sân (Vuốt ngang để xem hết khung giờ)</span>
              {lastUpdated && (
                <span className="text-xs text-emerald-200/80">
                  Cập nhật lúc: {format(lastUpdated, "HH:mm:ss")}
                </span>
              )}
            </div>

            <BookingSlotsTable
              venueAvailability={venueAvailability}
              uniqueTimeRanges={uniqueTimeRanges}
              selectedSlots={selectedSlots}
              onToggleSlot={handleToggleSlot}
            />

            <ServiceSelector
              venueId={venueId}
              selectedServices={selectedServices}
              onChange={setSelectedServices}
              onServicesLoaded={setAvailableServices}
            />
          </div>
        ) : null}

        {submitSuccess && (
          <div className="rounded-2xl bg-emerald-50 border border-emerald-100 p-4 text-sm font-semibold text-[#2E7D1E]">
            {submitSuccess}
          </div>
        )}

        {/* Thanh bar chốt đơn */}
        <SelectedSlotsBar
          selectedSlots={selectedSlots}
          onClear={handleClearSlots}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          disableSubmit={!selectedSlots.length || loading}
          fieldTotal={fieldTotal}
          serviceTotal={serviceTotal}
          totalPrice={fieldTotal + serviceTotal}
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