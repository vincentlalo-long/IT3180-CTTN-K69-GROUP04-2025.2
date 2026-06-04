import { useState, useEffect } from "react";
import type { PlayerProfileInfo } from "../../types/account.types";
import { useAuthContext } from "../../../auth/hooks/useAuthContext";
import { CircleUserRound, Camera, User, Activity, Shield, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface PlayerProfileSidebarProps {
  userInfo: PlayerProfileInfo;
  activeTab: "profile" | "history" | "terms";
  setActiveTab: (tab: "profile" | "history" | "terms") => void;
  bookingsCount: number;
}

export function PlayerProfileSidebar({
  userInfo,
  activeTab,
  setActiveTab,
  bookingsCount,
}: PlayerProfileSidebarProps) {
  const { user, logout } = useAuthContext();
  const navigate = useNavigate();
  const avatarUrl = user?.avatar || userInfo.avatarUrl;
  const [hasAvatarError, setHasAvatarError] = useState(false);

  useEffect(() => {
    setHasAvatarError(false);
  }, [avatarUrl]);

  return (
    <div className="flex w-[240px] shrink-0 flex-col gap-5">
      {/* Card 1: Avatar & Basic Info */}
      <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm flex flex-col items-center text-center">
        <div className="relative group">
          <div className="h-28 w-28 overflow-hidden rounded-full border-4 border-emerald-50 bg-slate-100 flex items-center justify-center transition-all group-hover:opacity-90">
            {avatarUrl && !hasAvatarError ? (
              <img
                src={avatarUrl}
                alt="avatar"
                className="h-full w-full object-cover"
                onError={() => setHasAvatarError(true)}
              />
            ) : (
              <CircleUserRound className="h-16 w-16 text-slate-400" />
            )}
          </div>
          <button
            type="button"
            className="absolute bottom-0 right-0 p-2 bg-[#2E7D1E] text-white rounded-full shadow-md hover:bg-[#236117] transition"
            aria-label="Đổi ảnh đại diện"
          >
            <Camera size={14} />
          </button>
        </div>

        <h2 className="mt-4 text-lg font-bold text-slate-900 truncate w-full max-w-[200px]">
          {userInfo.username}
        </h2>
        <p className="text-xs text-slate-400 truncate w-full max-w-[200px]">
          {userInfo.email}
        </p>

        {userInfo.role && (
          <div className="mt-2.5 inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-700 border border-emerald-200 uppercase tracking-wide">
            {userInfo.role}
          </div>
        )}
      </div>

      {/* Card 2: Stats */}
      <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">
          Chỉ số hoạt động
        </h3>
        <div className="grid grid-cols-3 gap-1.5 text-center">
          <div className="p-2 bg-slate-50 rounded-xl">
            <span className="block text-base font-bold text-slate-900">42</span>
            <span className="text-[9px] font-semibold text-slate-400 uppercase">
              Trận
            </span>
          </div>
          <div className="p-2 bg-slate-50 rounded-xl">
            <span className="block text-base font-bold text-slate-900">
              {bookingsCount}
            </span>
            <span className="text-[9px] font-semibold text-slate-400 uppercase">
              Đặt sân
            </span>
          </div>
          <div className="p-2 bg-slate-50 rounded-xl">
            <span className="block text-base font-bold text-emerald-600">
              +98
            </span>
            <span className="text-[9px] font-semibold text-slate-400 uppercase">
              Uy tín
            </span>
          </div>
        </div>
      </div>

      {/* Card 3: Tabs Navigation */}
      <div className="rounded-2xl border border-slate-100 bg-white p-2 shadow-sm">
        <nav className="flex flex-col gap-1">
          <button
            type="button"
            onClick={() => setActiveTab("profile")}
            className={`flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm font-semibold transition ${
              activeTab === "profile"
                ? "bg-[#2E7D1E]/10 text-[#2E7D1E]"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
            }`}
          >
            <User size={16} />
            Hồ sơ cá nhân
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("history")}
            className={`flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm font-semibold transition ${
              activeTab === "history"
                ? "bg-[#2E7D1E]/10 text-[#2E7D1E]"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
            }`}
          >
            <Activity size={16} />
            Lịch sử đặt sân
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("terms")}
            className={`flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm font-semibold transition ${
              activeTab === "terms"
                ? "bg-[#2E7D1E]/10 text-[#2E7D1E]"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
            }`}
          >
            <Shield size={16} />
            Điều khoản dịch vụ
          </button>

          <div className="my-1 border-t border-slate-100" />

          <button
            type="button"
            onClick={() => {
              logout();
              navigate("/");
            }}
            className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm font-semibold text-rose-600 hover:bg-rose-50 transition"
          >
            <LogOut size={16} />
            Đăng xuất
          </button>
        </nav>
      </div>
    </div>
  );
}
