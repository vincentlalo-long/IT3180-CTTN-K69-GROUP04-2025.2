import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Bell, CircleUserRound } from "lucide-react";
import logoImage from "../../assets/images/logo-amixi.png";
import { logoutUser } from "../../features/auth/api/authApi";
import { useAuthContext } from "../../features/auth/hooks/useAuthContext";

export function PlayerNavBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, logout, checkAuth } = useAuthContext(); // GIỮ INCOMING + HOÀN TRỘN checkAuth của HEAD
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [hasAvatarError, setHasAvatarError] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Gọi checkAuth khi component mount để luôn đồng bộ trạng thái từ server (Nhặt từ HEAD)
  useEffect(() => {
    if (typeof checkAuth === "function") {
      checkAuth();
    }
  }, [checkAuth]);

  useEffect(() => {
    setHasAvatarError(false);
  }, [user?.avatar]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navItems = [
    { label: "Trang chủ", path: "/" },
    { label: "Đặt sân", path: "/booking" },
    { label: "Chợ kèo", path: "/match" },
    { label: "Đội bóng", path: "/team" },
    { label: "Hồ sơ", path: "/profile" },
  ];

  return (
    <header className="relative z-[9999] border-b border-white/15 bg-[#005E2E]/80 backdrop-blur">
      <div className="mx-auto flex max-w-[1280px] items-center justify-between gap-5 px-6 py-4">
        <div className="flex items-center gap-3">
          <img
            src={logoImage}
            alt="logo"
            className="h-10 w-auto object-contain"
          />
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
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`transition ${location.pathname === item.path
                ? "text-[#84e30f]"
                : "text-white hover:text-white/75"
                }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <div className="relative flex items-center gap-3" ref={dropdownRef}>
              <span className="hidden text-sm font-semibold text-white sm:inline-block">
                {user?.username}
              </span>
              <button
                type="button"
                onClick={() => setIsDropdownOpen((prev) => !prev)}
                className="inline-flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-white/25 bg-white/10 text-white transition hover:bg-white/20 focus:outline-none"
                aria-label="Menu tài khoản"
              >
                {user?.avatar && !hasAvatarError ? (
                  <img
                    src={user.avatar}
                    alt={user.username || "Avatar"}
                    className="h-full w-full object-cover"
                    onError={() => setHasAvatarError(true)}
                  />
                ) : (
                  <CircleUserRound size={22} />
                )}
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 top-12 z-[999] w-48 rounded-lg border border-white/15 bg-[#005E2E] p-2 shadow-lg">
                  <button
                    type="button"
                    onClick={() => {
                      setIsDropdownOpen(false);
                      navigate("/profile", { state: { tab: "profile" } });
                    }}
                    className="w-full rounded-md px-4 py-2 text-left text-sm font-medium text-white hover:bg-white/10 transition"
                  >
                    Hồ sơ cá nhân
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsDropdownOpen(false);
                      navigate("/profile", { state: { tab: "history" } });
                    }}
                    className="w-full rounded-md px-4 py-2 text-left text-sm font-medium text-white hover:bg-white/10 transition"
                  >
                    Lịch sử đặt sân
                  </button>
                  <div className="my-1 border-t border-white/10" />
                  <button
                    type="button"
                    onClick={async () => {
                      setIsDropdownOpen(false);
                      try {
                        await logoutUser(); // Gọi API logout của Backend trước khi xóa state local
                      } catch (err) {
                        console.error("Backend logout failed:", err);
                      }
                      logout(); // Xóa sạch localStorage và Context state
                      navigate("/");
                    }}
                    className="w-full rounded-md px-4 py-2 text-left text-sm font-medium text-rose-300 hover:bg-rose-500/20 transition"
                  >
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="inline-flex items-center rounded-md bg-[#29721D] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#225f19]"
            >
              Đăng nhập
            </button>
          )}

          {/* Nút chuông thông báo nằm bên phải Avatar chuẩn UX */}
          <button
            type="button"
            onClick={() => {
              /* TODO */
            }}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/25 bg-white/10 text-white transition hover:bg-white/20"
            aria-label="Thông báo"
          >
            <Bell size={18} />
          </button>
        </div>
      </div>
    </header>
  );
}