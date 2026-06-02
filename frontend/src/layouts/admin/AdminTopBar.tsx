import { Bell, ChevronDown, Menu, Search, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useAuthContext } from "../../features/auth/hooks/useAuthContext";
import { ALL_FACILITIES_ID } from "../../features/venue/model/VenueContext";
import { useVenueContext as useFacilityContext } from "../../features/venue/hooks/useVenueContext";

interface AdminTopBarProps {
  onMenuToggle?: () => void;
}

interface FacilityStatusState {
  displayName: string;
  statusMessage: string | null;
  statusToneClass: string;
  shouldDisableSelect: boolean;
}

const resolveFacilityStatus = (
  facilityName: string | null | undefined,
  hasFacilities: boolean,
  isLoadingFacilities: boolean,
  facilityError: string | null,
): FacilityStatusState => {
  if (facilityError) {
    return {
      displayName: "Không tải được khu sân",
      statusMessage: facilityError,
      statusToneClass: "text-rose-100/80",
      shouldDisableSelect: true,
    };
  }

  if (isLoadingFacilities) {
    return {
      displayName: "Đang tải khu sân",
      statusMessage: "Đang tải danh sách khu sân...",
      statusToneClass: "text-admin-text-secondary",
      shouldDisableSelect: true,
    };
  }

  if (!hasFacilities) {
    return {
      displayName: "Chưa có khu sân",
      statusMessage: "Chưa có khu sân nào trong hệ thống.",
      statusToneClass: "text-admin-text-secondary",
      shouldDisableSelect: true,
    };
  }

  return {
    displayName: facilityName ?? "Tất cả khu sân",
    statusMessage: null,
    statusToneClass: "text-admin-text-secondary",
    shouldDisableSelect: false,
  };
};

export function AdminTopBar({ onMenuToggle }: AdminTopBarProps) {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const {
    facilities,
    selectedVenue: selectedFacility,
    selectedVenueId: selectedFacilityId,
    setSelectedVenueId: setSelectedFacilityId,
    isLoadingFacilities,
    facilityError,
  } = useFacilityContext();

  const hasFacilities = facilities.length > 0;
  const facilityStatus = resolveFacilityStatus(
    selectedFacility?.name,
    hasFacilities,
    isLoadingFacilities,
    facilityError,
  );

  return (
    <header className="sticky top-0 z-20 flex-shrink-0 border-b border-white/15 bg-gradient-to-r from-[#005E2E] to-[#29721D] px-4 py-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onMenuToggle}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/20 text-admin-text-primary transition hover:bg-white/10 lg:hidden"
            aria-label="Mở menu"
          >
            <Menu size={20} />
          </button>

          <div>
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-admin-text-secondary">
              QUẢN TRỊ HỆ THỐNG
            </p>
            <h1 className="text-lg font-semibold text-admin-text-primary sm:text-xl">
              Bảng điều khiển
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          <label className="relative flex min-w-[220px] items-center gap-2 rounded-xl border border-white/20 bg-[#005E2E]/45 px-3 py-2.5 text-admin-text-primary">
            <div className="flex-1 leading-tight">
              <p className="text-[11px] uppercase tracking-[0.12em] text-admin-text-secondary">
                Đang xem
              </p>
              <p className="truncate text-sm font-semibold text-white">
                {facilityStatus.displayName}
              </p>
              {facilityStatus.statusMessage ? (
                <p
                  className={`mt-1 text-[11px] ${facilityStatus.statusToneClass}`}
                >
                  {facilityStatus.statusMessage}
                </p>
              ) : null}
            </div>
            <ChevronDown size={16} className="text-admin-text-secondary" />
            <select
              aria-label="Chọn khu sân"
              value={selectedFacilityId}
              onChange={(event) => setSelectedFacilityId(event.target.value)}
              disabled={facilityStatus.shouldDisableSelect}
              className="absolute inset-0 cursor-pointer opacity-0 disabled:cursor-not-allowed [&>option]:bg-white [&>option]:text-[#103314]"
            >
              <option value={ALL_FACILITIES_ID}>Tất cả khu sân</option>
              {facilities.map((facility) => (
                <option key={facility.id} value={facility.id}>
                  {facility.name}
                </option>
              ))}
            </select>
          </label>

          <label className="hidden items-center gap-2 rounded-full border border-white/20 bg-[#005E2E]/45 px-4 py-2 text-admin-text-secondary lg:flex">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search for something"
              className="w-52 bg-transparent text-sm text-admin-text-primary outline-none placeholder:text-admin-text-secondary"
            />
          </label>

          <button
            type="button"
            onClick={() => navigate("/admin/settings")}
            className="hidden h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-[#005E2E]/45 text-admin-text-secondary transition hover:bg-white/12 hover:text-admin-icon-light lg:inline-flex"
            aria-label="Cài đặt"
          >
            <Settings size={18} />
          </button>

          <button
            type="button"
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-[#005E2E]/45 text-admin-text-secondary transition hover:bg-white/12 hover:text-admin-alert"
            aria-label="Thông báo"
          >
            <Bell size={18} />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-admin-alert" />
          </button>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-admin-text-primary">
                {user?.username || "Admin MIXIFOOT"}
              </p>
              <p className="text-xs text-admin-text-secondary">
                {user?.email || "admin@mixifoot.vn"}
              </p>
            </div>
            <img
              src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=80&q=80"
              alt="Admin avatar"
              className="h-10 w-10 rounded-full border-2 border-admin-surface-soft object-cover"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
