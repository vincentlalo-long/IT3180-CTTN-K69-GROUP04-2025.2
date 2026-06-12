import { Loader2, Star, X } from "lucide-react";
import { useState } from "react";
import type { PlayerBookingHistoryItem } from "@/features/account/types/account.types";

interface PitchReviewModalProps {
  isOpen: boolean;
  booking: PlayerBookingHistoryItem | null;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (bookingId: number, rating: number, content: string) => Promise<void> | void;
}

export function PitchReviewModal({
  isOpen,
  booking,
  isSubmitting,
  onClose,
  onSubmit,
}: PitchReviewModalProps) {
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !booking) {
    return null;
  }

  const resetForm = () => {
    setRating(5);
    setContent("");
    setError(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async () => {
    const normalizedContent = content.trim();
    if (!normalizedContent) {
      setError("Vui lòng nhập nhận xét.");
      return;
    }
    if (rating < 1 || rating > 5) {
      setError("Số sao phải từ 1 đến 5.");
      return;
    }

    setError(null);
    await onSubmit(booking.id, rating, normalizedContent);
    resetForm();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 px-4">
      <div className="w-full max-w-[460px] rounded-2xl bg-white p-5 shadow-2xl">
        <div className="mb-4 flex items-start justify-between gap-4 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-lg font-extrabold text-slate-900">Đánh giá sân</h3>
            <p className="mt-1 text-sm font-medium text-slate-500">{booking.pitchName}</p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
            aria-label="Đóng"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mb-4 rounded-xl bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-600">
          {booking.bookingDate} | {booking.startTime} - {booking.endTime}
        </div>

        <div className="mb-4">
          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">Số sao</p>
          <div className="flex gap-2">
            {Array.from({ length: 5 }, (_, index) => {
              const starValue = index + 1;
              const isActive = starValue <= rating;
              return (
                <button
                  key={starValue}
                  type="button"
                  onClick={() => setRating(starValue)}
                  disabled={isSubmitting}
                  className={`flex h-10 w-10 items-center justify-center rounded-xl border transition ${
                    isActive
                      ? "border-amber-300 bg-amber-50 text-amber-500"
                      : "border-slate-200 bg-white text-slate-300 hover:border-amber-200 hover:text-amber-400"
                  } disabled:cursor-not-allowed disabled:opacity-60`}
                  aria-label={`${starValue} sao`}
                >
                  <Star size={21} className={isActive ? "fill-current" : ""} />
                </button>
              );
            })}
          </div>
        </div>

        <div className="mb-4">
          <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
            Nhận xét
          </label>
          <textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            maxLength={1000}
            disabled={isSubmitting}
            rows={4}
            className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-[#2E7D1E] focus:ring-1 focus:ring-[#2E7D1E] disabled:cursor-not-allowed disabled:bg-slate-50"
            placeholder="Chia sẻ trải nghiệm về mặt sân, ánh sáng, dịch vụ..."
          />
          <div className="mt-1 flex items-center justify-between text-xs text-slate-400">
            <span>{error}</span>
            <span>{content.length}/1000</span>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="inline-flex min-w-[118px] items-center justify-center gap-2 rounded-xl bg-[#2E7D1E] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#236117] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting && <Loader2 size={16} className="animate-spin" />}
            Gửi đánh giá
          </button>
        </div>
      </div>
    </div>
  );
}
