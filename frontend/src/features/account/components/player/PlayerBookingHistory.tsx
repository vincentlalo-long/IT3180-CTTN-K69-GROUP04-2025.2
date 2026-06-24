import { Calendar, CheckCircle, Clock, Download, Filter, Loader2, Star } from "lucide-react";
import type { PlayerBookingHistoryItem } from "../../types/account.types";
import { type FormEvent, useState } from "react";
import { PitchReviewModal } from "@/features/venue/components/player/PitchReviewModal";

interface PlayerBookingHistoryProps {
  showHistory: boolean;
  loadingHistory: boolean;
  historyError: string | null;
  history: PlayerBookingHistoryItem[];
  onToggleHistory: () => void;
  onSubmitReview?: (bookingId: number, rating: number, content: string) => Promise<void> | void;
  reviewingBookingId?: number | null;
  isTab?: boolean;
  onCancelBooking?: (bookingId: number) => Promise<void> | void;
  cancellingBookingId?: number | null;
  onRescheduleBooking?: (bookingId: number, bookingDate: string, timeSlotId: number) => Promise<void> | void;
  reschedulingBookingId?: number | null;
  onDownloadInvoice?: (bookingId: number) => Promise<void> | void;
  downloadingInvoiceId?: number | null;
}

const timeSlotOptions = [
  { id: 1, label: "06:30 - 08:00", startTime: "06:30" },
  { id: 2, label: "08:00 - 09:30", startTime: "08:00" },
  { id: 3, label: "09:30 - 11:00", startTime: "09:30" },
  { id: 4, label: "11:00 - 12:30", startTime: "11:00" },
  { id: 5, label: "12:30 - 14:00", startTime: "12:30" },
  { id: 6, label: "14:00 - 15:30", startTime: "14:00" },
  { id: 7, label: "15:30 - 17:00", startTime: "15:30" },
  { id: 8, label: "17:00 - 18:30", startTime: "17:00" },
  { id: 9, label: "18:30 - 20:00", startTime: "18:30" },
  { id: 10, label: "20:00 - 21:30", startTime: "20:00" },
  { id: 11, label: "21:30 - 23:00", startTime: "21:30" },
];

const todayIso = () => new Date().toISOString().slice(0, 10);

export function PlayerBookingHistory({
  showHistory,
  loadingHistory,
  historyError,
  history,
  onToggleHistory,
  onSubmitReview,
  reviewingBookingId = null,
  isTab = false,
  onCancelBooking,
  cancellingBookingId = null,
  onRescheduleBooking,
  reschedulingBookingId = null,
  onDownloadInvoice,
  downloadingInvoiceId = null,
}: PlayerBookingHistoryProps) {
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [reviewTarget, setReviewTarget] = useState<PlayerBookingHistoryItem | null>(null);
  const [rescheduleTarget, setRescheduleTarget] = useState<PlayerBookingHistoryItem | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState(todayIso());
  const [rescheduleTimeSlotId, setRescheduleTimeSlotId] = useState(8);

  const filteredHistory = history.filter((item) => {
    if (statusFilter === "ALL") return true;
    if (statusFilter === "PENDING_RESERVED") {
      return item.status === "PENDING" || item.status === "RESERVED" || item.status === "PENDING_PAYMENT";
    }
    if (statusFilter === "CONFIRMED_BOOKED") {
      return item.status === "CONFIRMED" || item.status === "BOOKED";
    }
    return item.status === statusFilter;
  });

  const handleSubmitReview = async (bookingId: number, rating: number, content: string) => {
    if (!onSubmitReview) {
      return;
    }
    await onSubmitReview(bookingId, rating, content);
    setReviewTarget(null);
  };

  const openRescheduleModal = (booking: PlayerBookingHistoryItem) => {
    const matchedSlot = timeSlotOptions.find((slot) =>
      booking.startTime?.slice(0, 5) === slot.startTime,
    );
    setRescheduleTarget(booking);
    setRescheduleDate(booking.bookingDate >= todayIso() ? booking.bookingDate : todayIso());
    setRescheduleTimeSlotId(matchedSlot?.id ?? 8);
  };

  const handleSubmitReschedule = async (event: FormEvent) => {
    event.preventDefault();
    if (!rescheduleTarget || !onRescheduleBooking) {
      return;
    }

    await onRescheduleBooking(rescheduleTarget.id, rescheduleDate, rescheduleTimeSlotId);
    setRescheduleTarget(null);
  };

  return (
    <>
      {!isTab && (
        <>
          <p className="mb-2 text-base font-bold text-[#2E7D1E]">Hoạt động</p>
          <button
            onClick={onToggleHistory}
            className="mb-5 flex w-full items-center gap-3 rounded-xl bg-[#D9D9D9] px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-[#ccc]"
          >
            <Calendar size={17} className="text-gray-500" />
            Lịch sử đặt sân
          </button>
        </>
      )}
      {(showHistory || isTab) && (
        <div className="mb-5 rounded-xl border p-4 sm:p-5 bg-slate-50">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="font-semibold text-lg text-gray-800">Lịch sử đặt sân</div>
            
            {/* Filter */}
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-gray-500" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 outline-none focus:border-[#2E7D1E]"
              >
                <option value="ALL">Tất cả</option>
                <option value="PENDING_RESERVED">Chờ xác nhận/thanh toán</option>
                <option value="CONFIRMED_BOOKED">Đã đặt</option>
                <option value="COMPLETED">Hoàn thành</option>
                <option value="PLAYING">Đang đá</option>
                <option value="CANCELLED">Đã hủy</option>
              </select>
            </div>
          </div>

          {loadingHistory ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-[#2E7D1E] mb-2" />
              <p className="text-sm font-medium text-gray-500">Đang tải dữ liệu...</p>
            </div>
          ) : historyError ? (
            <div className="rounded-lg bg-red-50 p-4 text-center text-sm font-medium text-red-500 border border-red-100">
              {historyError}
            </div>
          ) : filteredHistory.length === 0 ? (
            <div className="rounded-lg bg-white p-8 text-center border">
              <Calendar className="mx-auto mb-3 h-10 w-10 text-gray-300" />
              <p className="text-sm font-medium text-gray-500">
                {statusFilter === "ALL" 
                  ? "Bạn chưa có lịch sử đặt sân nào." 
                  : "Không tìm thấy lịch sử nào phù hợp với bộ lọc."}
              </p>
            </div>
          ) : (
            <ul className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              {filteredHistory.map((item) => (
                <li
                  key={item.id}
                  className="flex flex-col gap-3 rounded-xl border bg-white p-4 shadow-sm transition hover:shadow-md sm:flex-row sm:items-center sm:gap-6"
                >
                  <div className="flex-1">
                    <div className="mb-1 text-base font-bold text-[#2E7D1E]">
                      {item.pitchName}
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-sm text-gray-600 mb-2">
                      <div className="flex items-center gap-1.5 bg-gray-100 px-2 py-1 rounded-md">
                        <span className="font-semibold text-gray-800">{item.bookingDate}</span>
                      </div>
                      <div className="hidden sm:block text-gray-400">•</div>
                      <div className="font-medium">
                        {item.startTime} - {item.endTime}
                      </div>
                    </div>
                    <div className="text-sm font-medium text-gray-700">
                      Tổng tiền: <span className="text-[#2E7D1E] font-bold">{item.totalPrice.toLocaleString()}₫</span>
                      {item.depositAmount > 0 && (
                        <span className="ml-2 text-gray-500 text-xs font-normal">
                          (Đã cọc: {item.depositAmount.toLocaleString()}₫)
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-end justify-end gap-2 sm:min-w-[140px] sm:flex-col">
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-wide border
                        ${(item.status === "PENDING" || item.status === "RESERVED") ? "bg-yellow-50 text-yellow-700 border-yellow-200" : ""}
                        ${item.status === "PENDING_PAYMENT" ? "bg-amber-50 text-amber-700 border-amber-200" : ""}
                        ${(item.status === "CONFIRMED" || item.status === "BOOKED") ? "bg-emerald-50 text-emerald-700 border-emerald-200" : ""}
                        ${item.status === "COMPLETED" ? "bg-blue-50 text-blue-700 border-blue-200" : ""}
                        ${item.status === "PLAYING" ? "bg-[#e0f2fe] text-[#0369a1] border-[#bae6fd]" : ""}
                        ${item.status === "CANCELLED" ? "bg-red-50 text-red-700 border-red-200" : ""}
                      `}
                    >
                      {(item.status === "PENDING" || item.status === "RESERVED") && "Chờ xác nhận"}
                      {item.status === "PENDING_PAYMENT" && "Chờ thanh toán"}
                      {(item.status === "CONFIRMED" || item.status === "BOOKED") && "Đã đặt"}
                      {item.status === "COMPLETED" && "Hoàn thành"}
                      {item.status === "PLAYING" && "Đang đá"}
                      {item.status === "CANCELLED" && "Đã hủy"}
                    </span>
                    {onDownloadInvoice && (item.depositAmount > 0 || item.status === "COMPLETED") && (
                      <button
                        type="button"
                        onClick={() => onDownloadInvoice(item.id)}
                        disabled={downloadingInvoiceId === item.id}
                        className="inline-flex items-center gap-1.5 rounded-full bg-slate-700 px-3 py-1.5 text-xs font-bold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        {downloadingInvoiceId === item.id ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <Download size={14} />
                        )}
                        Hóa đơn
                      </button>
                    )}
                    {(item.status === "PENDING_PAYMENT" || item.status === "RESERVED") && onRescheduleBooking && (
                      <button
                        type="button"
                        onClick={() => openRescheduleModal(item)}
                        disabled={reschedulingBookingId === item.id}
                        className="inline-flex items-center gap-1.5 rounded-full bg-sky-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        {reschedulingBookingId === item.id ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <Clock size={14} />
                        )}
                        Đổi lịch
                      </button>
                    )}
                    {(item.status === "PENDING_PAYMENT" || item.status === "RESERVED") && onCancelBooking && (
                      <button
                        type="button"
                        onClick={() => onCancelBooking(item.id)}
                        disabled={cancellingBookingId === item.id}
                        className="inline-flex items-center gap-1.5 rounded-full bg-red-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        {cancellingBookingId === item.id && (
                          <Loader2 size={14} className="animate-spin mr-1" />
                        )}
                        Hủy đặt sân
                      </button>
                    )}
                    {item.status === "COMPLETED" && onSubmitReview && (
                      item.reviewed ? (
                        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
                          <CheckCircle size={14} />
                          Đã đánh giá
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setReviewTarget(item)}
                          disabled={reviewingBookingId === item.id}
                          className="inline-flex items-center gap-1.5 rounded-full bg-[#2E7D1E] px-3 py-1.5 text-xs font-bold text-white shadow-sm transition hover:bg-[#236117] disabled:cursor-not-allowed disabled:opacity-70"
                        >
                          {reviewingBookingId === item.id ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <Star size={14} />
                          )}
                          Đánh giá
                        </button>
                      )
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      {rescheduleTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <form
            onSubmit={handleSubmitReschedule}
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
          >
            <div className="mb-5">
              <h3 className="text-lg font-bold text-slate-900">Đổi lịch đặt sân</h3>
              <p className="mt-1 text-sm text-slate-500">
                {rescheduleTarget.pitchName} • {rescheduleTarget.startTime} - {rescheduleTarget.endTime}
              </p>
            </div>

            <div className="space-y-4">
              <label className="block">
                <span className="mb-1 block text-sm font-semibold text-slate-700">Ngày mới</span>
                <input
                  type="date"
                  min={todayIso()}
                  value={rescheduleDate}
                  onChange={(event) => setRescheduleDate(event.target.value)}
                  className="h-11 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-emerald-500"
                  required
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-sm font-semibold text-slate-700">Ca mới</span>
                <select
                  value={rescheduleTimeSlotId}
                  onChange={(event) => setRescheduleTimeSlotId(Number(event.target.value))}
                  className="h-11 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-emerald-500"
                >
                  {timeSlotOptions.map((slot) => (
                    <option key={slot.id} value={slot.id}>
                      {slot.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setRescheduleTarget(null)}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={reschedulingBookingId === rescheduleTarget.id}
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {reschedulingBookingId === rescheduleTarget.id && (
                  <Loader2 size={16} className="animate-spin" />
                )}
                Lưu lịch mới
              </button>
            </div>
          </form>
        </div>
      )}
      <PitchReviewModal
        isOpen={reviewTarget !== null}
        booking={reviewTarget}
        isSubmitting={reviewTarget !== null && reviewingBookingId === reviewTarget.id}
        onClose={() => setReviewTarget(null)}
        onSubmit={handleSubmitReview}
      />
    </>
  );
}
