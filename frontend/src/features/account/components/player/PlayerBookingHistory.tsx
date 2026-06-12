import { Calendar, CheckCircle, Filter, Loader2, Star } from "lucide-react";
import type { PlayerBookingHistoryItem } from "../../types/account.types";
import { useState } from "react";
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
}

export function PlayerBookingHistory({
  showHistory,
  loadingHistory,
  historyError,
  history,
  onToggleHistory,
  onSubmitReview,
  reviewingBookingId = null,
  isTab = false,
}: PlayerBookingHistoryProps) {
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [reviewTarget, setReviewTarget] = useState<PlayerBookingHistoryItem | null>(null);

  const filteredHistory = history.filter((item) => {
    if (statusFilter === "ALL") return true;
    if (statusFilter === "PENDING_RESERVED") {
      return item.status === "PENDING" || item.status === "RESERVED";
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
                <option value="PENDING_RESERVED">Chờ xác nhận</option>
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
                        ${(item.status === "CONFIRMED" || item.status === "BOOKED") ? "bg-emerald-50 text-emerald-700 border-emerald-200" : ""}
                        ${item.status === "COMPLETED" ? "bg-blue-50 text-blue-700 border-blue-200" : ""}
                        ${item.status === "PLAYING" ? "bg-[#e0f2fe] text-[#0369a1] border-[#bae6fd]" : ""}
                        ${item.status === "CANCELLED" ? "bg-red-50 text-red-700 border-red-200" : ""}
                      `}
                    >
                      {(item.status === "PENDING" || item.status === "RESERVED") && "Chờ xác nhận"}
                      {(item.status === "CONFIRMED" || item.status === "BOOKED") && "Đã đặt"}
                      {item.status === "COMPLETED" && "Hoàn thành"}
                      {item.status === "PLAYING" && "Đang đá"}
                      {item.status === "CANCELLED" && "Đã hủy"}
                    </span>
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
