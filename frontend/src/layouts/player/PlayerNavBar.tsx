import { useNavigate, useLocation } from "react-router-dom";
import { Bell, CircleUserRound } from "lucide-react";
import logoImage from "../../assets/images/logo-amixi.png";
import { logoutUser } from "../../features/auth/api/authApi";
import { useAuthContext } from "../../features/auth/hooks/useAuthContext";
import { useState, useEffect } from "react";

export function PlayerNavBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, logout, checkAuth } = useAuthContext();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const navItems = [
    { label: "Home", path: "/" },
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
          {!isAuthenticated ? (
            <button
              onClick={() => navigate("/login")}
              className="px-4 py-2 rounded-full border border-white/25 bg-white/10 text-white font-semibold transition hover:bg-white/20"
            >
              Đăng nhập
            </button>
          ) : (
            <>
              <button
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/25 bg-white/10 text-white transition hover:bg-white/20"
              >
                <Bell size={18} />
              </button>

              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/25 bg-white/10 text-white transition hover:bg-white/20"
                >
                  <CircleUserRound size={20} />
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-xl border border-gray-200 bg-white py-1 shadow-lg z-50">
                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        navigate("/profile");
                      }}
                      className="block w-full text-left px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 transition"
                    >
                      Hồ sơ cá nhân
                    </button>
                    <button
                      onClick={async (e) => {
                        e.preventDefault();
                        setIsDropdownOpen(false);
                        try {
                          await logoutUser();
                        } catch (err) {
                          console.error(err);
                        }
                        logout(); // clears localStorage and state
                        window.location.href = "/login"; // ensure hard redirect to clear any dangling states
                      }}
                      className="block w-full text-left px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition"
                    >
                      Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
