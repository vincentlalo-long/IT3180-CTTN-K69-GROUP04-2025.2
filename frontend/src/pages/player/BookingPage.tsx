import { useState } from "react";
import { Search, Map as MapIcon, Grid } from "lucide-react";
import { VenueCard, VenueSkeleton, useVenueList, MapSearch } from "../../features/venue";
import { PlayerNavBar } from "../../layouts/player/PlayerNavBar";

export function BookingPage() {
  const { venues, isLoading, error } = useVenueList();
  const [viewMode, setViewMode] = useState<"grid" | "map">("grid");

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#005E2E] to-[#29721D]">
      <PlayerNavBar />

      {/* Main Banner & Header Title */}
      <div className="relative overflow-hidden bg-[#005E2E]/40 py-8 border-b border-white/10">
        <div className="mx-auto max-w-[1280px] px-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400 border border-emerald-500/25">
                ⚽ Hạ tầng sân bãi chất lượng
              </span>
              <h1 className="mt-3 text-3xl font-extrabold text-white tracking-tight md:text-4xl">
                Đặt Lịch Sân Bóng
              </h1>
              <p className="mt-2 text-sm text-white/70 max-w-xl">
                Tìm kiếm và đặt lịch cụm sân bóng phù hợp, hệ thống tự động cập nhật bảng giá, khung giờ trống và hỗ trợ giữ sân nhanh chóng.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#005E2E]/20 backdrop-blur-sm sticky top-0 z-40 border-b border-white/10 py-4 shadow-md">
        <div className="mx-auto flex max-w-[1280px] items-center gap-4 px-6">
          <div className="flex flex-1 items-center gap-2 rounded-full bg-white px-4 py-2.5 shadow-sm focus-within:ring-1 focus-within:ring-[#005E2E]">
            <Search size={16} className="text-gray-400 shrink-0" />
            <input
              placeholder="Tìm kiếm cụm sân, địa chỉ..."
              className="flex-1 bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-400"
            />
          </div>
          <button
            onClick={() => {
              /* TODO */
            }}
            className="rounded-full border border-white/30 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20 hover:scale-[1.03] active:scale-[0.97]"
          >
            Khu vực
          </button>
          <button
            onClick={() => {
              /* TODO */
            }}
            className="rounded-full border border-white/30 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20 hover:scale-[1.03] active:scale-[0.97]"
          >
            Ngày đặt sân
          </button>
          <div className="flex bg-white/10 rounded-full border border-white/30 p-1 backdrop-blur">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-full transition ${viewMode === "grid" ? "bg-white text-[#005E2E]" : "text-white hover:bg-white/20"}`}
              title="Dạng lưới"
            >
              <Grid size={18} />
            </button>
            <button
              onClick={() => setViewMode("map")}
              className={`p-1.5 rounded-full transition ${viewMode === "map" ? "bg-white text-[#005E2E]" : "text-white hover:bg-white/20"}`}
              title="Bản đồ"
            >
              <MapIcon size={18} />
            </button>
          </div>
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
        ) : viewMode === "map" ? (
          <MapSearch venues={venues} />
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
