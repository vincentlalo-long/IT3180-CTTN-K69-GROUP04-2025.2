import { useNavigate } from "react-router-dom";
import { Bell, CircleUserRound, Search } from "lucide-react";
import logoImage from "../../assets/images/logo-amixi.png";
import Hieugay from "../../assets/images/Hieugay.jpg";
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
          <h3 className="text-sm font-bold text-gray-900 leading-tight">Đinh Thái Sơn</h3>
          <p className="text-sm font-bold text-gray-900 leading-tight">Sân bóng Đền Lừ 3</p>
          <p className="mt-0.5 text-xs text-gray-600">16h30 – 18h00</p>
        </div>
      </div>
    </div>
  );
}

export function MatchPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#005E2E] to-[#29721D]">
      {/* Header */}
      <header className="border-b border-white/15 bg-[#005E2E]/80 backdrop-blur">
        <div className="mx-auto flex max-w-[1280px] items-center justify-between gap-5 px-6 py-4">
          <div className="flex items-center gap-3">
            <img src={logoImage} alt="logo" className="h-10 w-auto object-contain" />
            <div>
              <p className="text-xs font-medium text-white/80">Công ty AMIXI</p>
              <p
                className="text-4xl leading-none tracking-widest text-white"
                style={{ fontFamily: '"Jersey 10", sans-serif' }}
              >
                MIXIFOOT
              </p>
            </div>
          </div>

          <nav className="hidden items-center gap-10 text-lg font-semibold lg:flex">
            <button
              onClick={() => navigate("/")}
              className="text-white transition hover:text-white/75"
            >
              Home
            </button>
            <button
              onClick={() => navigate("/booking")}
              className="text-white transition hover:text-white/75"
            >
              Đặt sân
            </button>
            <button
              onClick={() => navigate("/match")}
              className="text-[#84e30f] transition hover:text-[#84e30f]/80"
            >
              Chợ kèo
            </button>
            <button
              onClick={() => { navigate("/profile") }}
              className="text-white transition hover:text-white/75"
            >
              Hồ sơ
            </button>
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={() => { /* TODO */ }}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/25 bg-white/10 text-white transition hover:bg-white/20"
              aria-label="Thông báo"
            >
              <Bell size={18} />
            </button>
            <button
              onClick={() => { /* TODO */ }}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/25 bg-white/10 text-white transition hover:bg-white/20"
              aria-label="Tài khoản"
            >
              <CircleUserRound size={20} />
            </button>
          </div>
        </div>
      </header>

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
            onClick={() => { /* TODO */ }}
            className="rounded-full border border-white/30 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20"
          >
            Khu vực
          </button>
          <button
            onClick={() => { /* TODO */ }}
            className="rounded-full border border-white/30 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20"
          >
            Trình độ
          </button>
          <button
            onClick={() => { /* TODO */ }}
            className="rounded-full border border-white/30 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20"
          >
            Ngày đặt sân
          </button>
        </div>
      </div>

      {/* Match grid */}
      <main className="mx-auto max-w-[1280px] px-6 py-6">
        // Trong MatchPage, đổi grid gap:
<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 8 }).map((_, index) => (
            <MatchCard key={index} />
          ))}
        </div>
      </main>
    </div>
  );
}