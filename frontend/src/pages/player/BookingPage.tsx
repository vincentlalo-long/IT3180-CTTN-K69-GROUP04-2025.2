import { Search } from "lucide-react";
import { VenueCard, VenueSkeleton, useVenueList } from "../../features/venue";
import { PlayerNavBar } from "../../layouts/player/PlayerNavBar";

export function BookingPage() {
  const { venues, isLoading, error } = useVenueList();

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#005E2E] to-[#29721D]">
      <PlayerNavBar />

      <div className="bg-[#005E2E]/40">
        <div className="mx-auto flex max-w-[1280px] items-center gap-4 px-6 py-4">
          <div className="flex flex-1 items-center gap-2 rounded-full bg-white px-4 py-2.5 shadow-sm">
            <Search size={16} className="text-gray-400 shrink-0" />
            <input
              placeholder="Hinted search text"
              className="flex-1 bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-400"
            />
          </div>
          <button
            onClick={() => {
              /* TODO */
            }}
            className="rounded-full border border-white/30 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20"
          >
            Khu vực
          </button>
          <button
            onClick={() => {
              /* TODO */
            }}
            className="rounded-full border border-white/30 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20"
          >
            Ngày đặt sân
          </button>
        </div>
      </div>

      <main className="mx-auto max-w-[1280px] px-6 py-6">
        {isLoading ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, idx) => (
              <VenueSkeleton key={idx} />
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="rounded-full bg-rose-500/20 p-4 mb-4">
              <Search size={48} className="text-rose-200" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Không thể tải danh sách sân</h2>
            <p className="text-rose-100/70 max-w-md">
              {error}. Vui lòng kiểm tra lại kết nối mạng hoặc thử lại sau.
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-6 px-6 py-2 bg-white text-emerald-700 rounded-full font-bold hover:bg-emerald-50 transition"
            >
              Thử lại
            </button>
          </div>
        ) : venues.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="rounded-full bg-white/10 p-4 mb-4">
              <Search size={48} className="text-white/60" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Không có cụm sân nào</h2>
            <p className="text-white/70 max-w-md">
              Hiện tại hệ thống chưa có cụm sân nào hoạt động. Vui lòng quay lại sau.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {venues.map((venue) => (
              <VenueCard key={venue.id} data={venue} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
