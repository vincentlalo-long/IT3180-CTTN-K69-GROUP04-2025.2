import { Search } from "lucide-react";
import Hieugay from "../../assets/images/Hieugay.jpg";
import { UserNavbar } from "../../components/user/UserNavbar.tsx";

function MatchCard() {
  return (
    <div className="overflow-hidden rounded-2xl border border-black/20 bg-[#EEF3D6] shadow-[0_4px_10px_rgba(0,0,0,0.35)]">
      <div className="flex items-center gap-3 px-4 py-3">
        <img
          src={Hieugay}
          alt="avatar"
          className="h-16 w-16 rounded-full object-cover shadow shrink-0"
        />
        <div className="min-w-0">
          <h3 className="text-sm font-bold text-gray-900 leading-tight">
            Đinh Thái Sơn
          </h3>
          <p className="text-sm font-bold text-gray-900 leading-tight">
            Sân bóng Đền Lừ 3
          </p>
          <p className="mt-0.5 text-xs text-gray-600">16h30 – 18h00</p>
        </div>
      </div>
    </div>
  );
}

export function MatchPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#005E2E] to-[#29721D]">
      {/* Header */}
      <UserNavbar />
      {/* Search bar */}
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
            Trình độ
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

      {/* Match grid */}
      <main className="mx-auto max-w-[1280px] px-6 py-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 8 }).map((_, index) => (
            <MatchCard key={index} />
          ))}
        </div>
      </main>
    </div>
  );
}
