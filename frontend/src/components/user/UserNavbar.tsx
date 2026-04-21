import { useNavigate, useLocation } from "react-router-dom";
import { Bell, CircleUserRound } from "lucide-react";
import logoImage from "../../assets/images/logo-amixi.png";

export function UserNavbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { label: "Home", path: "/" },
    { label: "Đặt sân", path: "/booking" },
    { label: "Chợ kèo", path: "/match" },
    { label: "Hồ sơ", path: "/profile" },
  ];

  return (
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
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`transition ${
                location.pathname === item.path
                  ? "text-[#84e30f]"
                  : "text-white hover:text-white/75"
              }`}
            >
              {item.label}
            </button>
          ))}
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
  );
}