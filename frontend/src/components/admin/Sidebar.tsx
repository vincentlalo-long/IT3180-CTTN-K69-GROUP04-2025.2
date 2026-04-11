import {
  CalendarDays,
  House,
  Settings,
  SquareChartGantt,
  Users,
  type LucideIcon,
} from "lucide-react";
import { NavLink } from "react-router-dom";

interface SidebarItem {
  label: string;
  to: string;
  icon: LucideIcon;
}

interface SidebarProps {
  onNavigate?: () => void;
  className?: string;
}

const sidebarItems: SidebarItem[] = [
  { label: "Tổng quan", to: "/admin", icon: House },
  { label: "Người dùng", to: "/admin/users", icon: Users },
  { label: "Đơn đặt sân", to: "/admin/bookings", icon: SquareChartGantt },
  { label: "Lịch sân", to: "/admin/schedule", icon: CalendarDays },
  { label: "Cài đặt", to: "/admin/settings", icon: Settings },
];

export function Sidebar({ onNavigate, className }: SidebarProps) {
  return (
    <aside
      className={`flex h-full w-full flex-col border-r border-white/15 bg-gradient-to-b from-[#005E2E] to-[#29721D] text-admin-text-primary ${className ?? ""}`.trim()}
    >
      <div className="border-b border-white/15 px-6 py-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-admin-icon-light">
          MIXIFOOT
        </p>
        <h2 className="mt-2 text-xl font-bold text-admin-text-primary">
          Admin Dashboard
        </h2>
      </div>

      <nav className="flex-1 space-y-2 p-4">
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/admin"}
              onClick={onNavigate}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? "bg-white/22 text-white shadow-lg shadow-black/20"
                    : "text-admin-text-secondary hover:bg-white/12 hover:text-admin-text-primary"
                }`
              }
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}
