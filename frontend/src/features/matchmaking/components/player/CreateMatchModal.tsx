import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { getVenues } from "@/features/venue/api/venueApi";
import type { VenueResponseDTO } from "@/features/venue/types/venue.types";
import { useMatchStore } from "../../model/matchStore";
import type { MatchSkillLevel } from "../../types/matchmaking.types";

interface CreateMatchModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateMatchModal({ onClose, onSuccess }: CreateMatchModalProps) {
  const createNewMatch = useMatchStore((state) => state.createNewMatch);
  const [venues, setVenues] = useState<VenueResponseDTO[]>([]);
  const [venueId, setVenueId] = useState<string>("");
  const [skillLevel, setSkillLevel] = useState<MatchSkillLevel>("AVERAGE");
  const [matchTime, setMatchTime] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getVenues()
      .then((data) => {
        setVenues(data);
        if (data.length > 0) {
          setVenueId(data[0].id.toString());
        }
      })
      .catch((err) => {
        console.error("Lỗi khi lấy danh sách sân:", err);
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!venueId) {
      setError("Vui lòng chọn khu sân.");
      return;
    }
    if (!matchTime) {
      setError("Vui lòng chọn thời gian thi đấu.");
      return;
    }

    // Clean formatting to prevent timezone shift (send local ISO format)
    const selectedDate = new Date(matchTime);
    
    // Check if less than 12 hours from now
    const now = new Date();
    const minTime = new Date(now.getTime() + 12 * 60 * 60 * 1000);
    if (selectedDate.getTime() < minTime.getTime()) {
      setError("Thời gian thi đấu phải sau thời điểm hiện tại ít nhất 12 tiếng.");
      return;
    }

    // Format clean local date string (e.g. yyyy-MM-ddTHH:mm:ss)
    const formattedTime = format(selectedDate, "yyyy-MM-dd'T'HH:mm:ss");

    setSubmitting(true);
    setError(null);

    try {
      await createNewMatch(parseInt(venueId), skillLevel, formattedTime);
      alert("Đăng ký tạo kèo thành công!");
      onSuccess();
    } catch (err) {
      console.error(err);
      const axiosError = err as { response?: { data?: { message?: string } } };
      const errMsg = axiosError.response?.data?.message || "Tạo kèo thất bại. Vui lòng thử lại!";
      setError(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8">
      <button
        type="button"
        aria-label="Đóng modal"
        onClick={onClose}
        className="absolute inset-0 bg-[#03150a]/78 backdrop-blur-[2px]"
      />

      <div className="relative z-10 w-full max-w-md rounded-2xl border border-white/20 bg-gradient-to-b from-[#05512a] to-[#033b1e] p-6 shadow-[0_28px_70px_-30px_rgba(0,0,0,0.9)] text-white">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <h3 className="text-lg font-bold">Đăng ký tìm đối (Tạo kèo)</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-white/20 bg-white/10 p-1.5 transition hover:bg-white/15"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {error && (
            <div className="rounded-lg border border-rose-500/30 bg-rose-500/20 px-3 py-2 text-xs font-semibold text-rose-300">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-white/70 mb-1.5">
              Chọn khu sân
            </label>
            <select
              required
              value={venueId}
              onChange={(e) => setVenueId(e.target.value)}
              className="w-full rounded-xl border border-white/15 bg-[#032e1a] px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
            >
              <option value="" disabled>
                -- Chọn khu sân --
              </option>
              {venues.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-white/70 mb-1.5">
              Trình độ yêu cầu
            </label>
            <select
              required
              value={skillLevel}
              onChange={(e) => setSkillLevel(e.target.value as MatchSkillLevel)}
              className="w-full rounded-xl border border-white/15 bg-[#032e1a] px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
            >
              <option value="WEAK">Phong trào (Yếu)</option>
              <option value="AVERAGE">Trung bình</option>
              <option value="GOOD">Khá / Mạnh</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-white/70 mb-1.5">
              Thời gian thi đấu (Ít nhất sau 12h)
            </label>
            <input
              type="datetime-local"
              required
              value={matchTime}
              onChange={(e) => setMatchTime(e.target.value)}
              className="w-full rounded-xl border border-white/15 bg-[#032e1a] px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-white/10 pt-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium transition hover:bg-white/15"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-5 py-2 text-sm font-bold text-white shadow-lg shadow-emerald-500/20 transition hover:from-emerald-600 hover:to-teal-700 disabled:opacity-50"
            >
              {submitting ? "Đang tạo kèo..." : "Xác nhận tạo kèo"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
