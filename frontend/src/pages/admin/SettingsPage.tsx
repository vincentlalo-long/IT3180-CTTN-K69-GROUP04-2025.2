import {
  BellRing,
  ShieldCheck,
  UserRound,
  Users,
  Volleyball,
  type LucideIcon,
} from "lucide-react";
import { useMemo, useState } from "react";

import { NotificationTab } from "../../components/admin/settings/NotificationTab";
import { PitchManagementTab } from "../../components/admin/settings/PitchManagementTab";
import { ProfileTab } from "../../components/admin/settings/ProfileTab";
import { SecurityTab } from "../../components/admin/settings/SecurityTab";
import { UserManagementTab } from "../../components/admin/settings/UserManagementTab";
import { ALL_FACILITIES_ID } from "../../data/mockAdminData";
import { useFacilityContext } from "../../contexts/useFacilityContext";

type SettingsTabId =
  | "pitch-management"
  | "profile"
  | "user-management"
  | "security"
  | "notifications";

interface SettingsTabItem {
  id: SettingsTabId;
  label: string;
  icon: LucideIcon;
  helperText: string;
}

const settingsTabs: SettingsTabItem[] = [
  {
    id: "pitch-management",
    label: "Quản lý Sân bóng",
    icon: Volleyball,
    helperText: "Thiết lập thông tin sân và giá cơ bản",
  },
  {
    id: "profile",
    label: "Thông tin cá nhân",
    icon: UserRound,
    helperText: "Quản lý hồ sơ tài khoản quản trị",
  },
  {
    id: "user-management",
    label: "Quản lý người dùng",
    icon: Users,
    helperText: "Danh sách nhân sự vận hành",
  },
  {
    id: "security",
    label: "Bảo mật",
    icon: ShieldCheck,
    helperText: "Đổi mật khẩu và bảo vệ tài khoản",
  },
  {
    id: "notifications",
    label: "Thông báo",
    icon: BellRing,
    helperText: "Bật/tắt kênh thông báo hệ thống",
  },
];

export function SettingsPage() {
  const { facilities, selectedFacility, selectedFacilityId } =
    useFacilityContext();
  const [activeTab, setActiveTab] = useState<SettingsTabId>("pitch-management");

  const editableFacilityName = useMemo(() => {
    if (selectedFacilityId === ALL_FACILITIES_ID) {
      return facilities[0]?.name ?? "";
    }

    return selectedFacility?.name ?? "";
  }, [facilities, selectedFacility, selectedFacilityId]);

  const renderActiveTab = () => {
    switch (activeTab) {
      case "pitch-management":
        return <PitchManagementTab facilityName={editableFacilityName} />;
      case "profile":
        return <ProfileTab />;
      case "user-management":
        return <UserManagementTab />;
      case "security":
        return <SecurityTab />;
      case "notifications":
        return <NotificationTab />;
      default:
        return null;
    }
  };

  return (
    <section className="space-y-5">
      <header className="rounded-2xl border border-white/15 bg-[#005E2E]/38 px-5 py-4">
        <h2 className="text-xl font-semibold text-white">
          Cài đặt hệ thống - {selectedFacility?.name ?? "Tất cả khu sân"}
        </h2>
        <p className="mt-1 text-sm text-white/80">
          Quản lý module vận hành theo khu sân với cấu trúc tab mở rộng.
        </p>
      </header>

      <div className="grid gap-5 xl:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="rounded-2xl border border-white/15 bg-[#005E2E]/40 p-3">
          <nav className="flex gap-2 overflow-x-auto xl:flex-col xl:overflow-visible">
            {settingsTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`group min-w-[210px] rounded-xl border px-3 py-3 text-left transition xl:min-w-0 ${
                    isActive
                      ? "border-white/30 bg-[#3BA55D]/26 text-white shadow-[0_0_18px_rgba(132,227,15,0.22)]"
                      : "border-transparent text-white/80 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={`mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-lg border ${
                        isActive
                          ? "border-white/30 bg-white/10"
                          : "border-white/10 bg-white/5 group-hover:border-white/25"
                      }`}
                    >
                      <Icon size={16} />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold leading-tight">
                        {tab.label}
                      </span>
                      <span className="mt-1 block text-xs text-white/70">
                        {tab.helperText}
                      </span>
                    </span>
                  </div>
                </button>
              );
            })}
          </nav>
        </aside>

        <div className="rounded-2xl border border-white/15 bg-[#005E2E]/35 p-5 lg:p-6">
          {renderActiveTab()}
        </div>
      </div>
    </section>
  );
}
