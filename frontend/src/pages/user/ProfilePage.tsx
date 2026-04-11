import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, CircleUserRound, Calendar, Terminal, Pencil, Check } from "lucide-react";
import logoImage from "../../assets/images/logo-amixi.png";
import Linh from "../../assets/images/Linh.jpg";

export function ProfilePage() {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [info, setInfo] = useState({
    name: "Phạm Đình Minh Đức",
    field1: "",
    field2: "",
  });

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
            <button onClick={() => navigate("/")} className="text-white transition hover:text-white/75">
              Home
            </button>
            <button onClick={() => navigate("/booking")} className="text-white transition hover:text-white/75">
              Đặt sân
            </button>
            <button onClick={() => navigate("/match")} className="text-white transition hover:text-white/75">
              Chợ kèo
            </button>
            <button onClick={() => navigate("/profile")} className="text-[#84e30f] transition hover:text-[#84e30f]/80">
              Hồ sơ
            </button>
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={() => { /* TODO */ }}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/25 bg-white/10 text-white transition hover:bg-white/20"
            >
              <Bell size={18} />
            </button>
            <button
              onClick={() => { /* TODO */ }}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/25 bg-white/10 text-white transition hover:bg-white/20"
            >
              <CircleUserRound size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-[1280px] px-6 py-8">
        <div className="flex gap-5">
          {/* Left column */}
          <div className="flex w-[200px] shrink-0 flex-col gap-4">
            <div className="h-[190px] w-full rounded-2xl bg-white/90 overflow-hidden">
              <img src={Linh} alt="avatar" className="h-full w-full object-cover" />
            </div>
            <div className="h-[130px] w-full rounded-2xl bg-white/20" />
          </div>

          {/* Right column */}
          <div className="flex-1 rounded-2xl bg-white/90 px-8 py-6">

            {/* Name + edit toggle */}
            <div className="flex items-center gap-6 mb-5">
              {isEditing ? (
                <input
                  value={info.name}
                  onChange={(e) => setInfo({ ...info, name: e.target.value })}
                  className="text-xl font-bold text-[#2E7D1E] bg-transparent border-b-2 border-[#2E7D1E] outline-none"
                />
              ) : (
                <span className="text-xl font-bold text-[#2E7D1E]">{info.name}</span>
              )}
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 transition hover:text-gray-900"
              >
                {isEditing ? (
                  <>
                    Lưu thay đổi
                    <Check size={15} className="text-[#2E7D1E]" />
                  </>
                ) : (
                  <>
                    Chỉnh sửa thông tin cá nhân
                    <Pencil size={15} />
                  </>
                )}
              </button>
            </div>

            {/* Hoạt động */}
            <p className="text-base font-bold text-[#2E7D1E] mb-2">Hoạt động</p>
            <button
              onClick={() => { /* TODO */ }}
              className="flex w-full items-center gap-3 rounded-xl bg-[#D9D9D9] px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-[#ccc] mb-5"
            >
              <Calendar size={17} className="text-gray-500" />
              Lịch sử đặt sân
            </button>

            {/* Thông tin cá nhân */}
            <p className="text-base font-bold text-[#2E7D1E] mb-2">Thông tin cá nhân</p>
            <div className="flex flex-col gap-3 mb-5">
              <input
                disabled={!isEditing}
                value={info.field1}
                onChange={(e) => setInfo({ ...info, field1: e.target.value })}
                placeholder="Số điện thoại"
                className={`h-11 w-full rounded-xl px-4 text-sm text-gray-700 outline-none transition
                  ${isEditing
                    ? "bg-white border-2 border-[#2E7D1E]/50 focus:border-[#2E7D1E]"
                    : "bg-[#D9D9D9] cursor-default"
                  }`}
              />
              <input
                disabled={!isEditing}
                value={info.field2}
                onChange={(e) => setInfo({ ...info, field2: e.target.value })}
                placeholder="Email"
                className={`h-11 w-full rounded-xl px-4 text-sm text-gray-700 outline-none transition
                  ${isEditing
                    ? "bg-white border-2 border-[#2E7D1E]/50 focus:border-[#2E7D1E]"
                    : "bg-[#D9D9D9] cursor-default"
                  }`}
              />
            </div>

            {/* Hệ thống */}
            <p className="text-base font-bold text-[#2E7D1E] mb-2">Hệ thống</p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => { /* TODO */ }}
                className="flex w-full items-center gap-3 rounded-xl bg-[#D9D9D9] px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-[#ccc]"
              >
                <Terminal size={15} className="text-gray-500" />
                Điều khoản và chính sách
              </button>
              <button
                onClick={() => { /* TODO */ }}
                className="flex w-full items-center gap-3 rounded-xl bg-[#D9D9D9] px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-[#ccc]"
              >
                <Terminal size={15} className="text-gray-500" />
                Report và hỗ trợ
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}