import { useMemo, useState } from "react";

import { Button } from "../../components/ui/Button";
import { TextInput } from "../../components/ui/TextInput";
import { ALL_FACILITIES_ID, fields } from "../../data/mockAdminData";
import { useFacilityContext } from "../../contexts/FacilityContext";

type SettingsTab = "facility-info" | "field-management" | "payment" | "staff";

interface FacilityFormState {
  name: string;
  address: string;
  hotline: string;
  openTime: string;
  closeTime: string;
  depositRate: string;
  bankAccount: string;
  qrCode: string;
}

const settingsTabs: Array<{ id: SettingsTab; label: string }> = [
  { id: "facility-info", label: "Thông tin cơ sở" },
  { id: "field-management", label: "Quản lý Sân bóng" },
  { id: "payment", label: "Cấu hình Thanh toán" },
  { id: "staff", label: "Quản lý Nhân viên" },
];

const openingTimeOptions = [
  "05:00",
  "05:30",
  "06:00",
  "06:30",
  "07:00",
  "21:00",
  "21:30",
  "22:00",
  "22:30",
  "23:00",
  "23:30",
];

export function SettingsPage() {
  const { facilities, selectedFacility, selectedFacilityId } =
    useFacilityContext();
  const [activeTab, setActiveTab] = useState<SettingsTab>("facility-info");
  const [isSaving, setIsSaving] = useState(false);

  const [settingsByFacility, setSettingsByFacility] = useState<
    Record<string, FacilityFormState>
  >(() =>
    facilities.reduce<Record<string, FacilityFormState>>(
      (accumulator, facility) => {
        accumulator[facility.id] = {
          name: facility.name,
          address: facility.address,
          hotline: "0988 888 888",
          openTime: "06:30",
          closeTime: "23:00",
          depositRate: "30",
          bankAccount: "1234 5678 8888 - MB Bank",
          qrCode: "QR_MIXIFOOT_DEFAULT",
        };
        return accumulator;
      },
      {},
    ),
  );

  const editableFacilityId =
    selectedFacilityId === ALL_FACILITIES_ID
      ? (facilities[0]?.id ?? "")
      : selectedFacilityId;

  const currentSettings = editableFacilityId
    ? settingsByFacility[editableFacilityId]
    : undefined;

  const currentFacilityFields = useMemo(
    () => fields.filter((field) => field.facilityId === editableFacilityId),
    [editableFacilityId],
  );

  const updateFacilitySettings = (
    key: keyof FacilityFormState,
    value: string,
  ) => {
    if (!editableFacilityId || !currentSettings) {
      return;
    }

    setSettingsByFacility((currentState) => ({
      ...currentState,
      [editableFacilityId]: {
        ...currentState[editableFacilityId],
        [key]: value,
      },
    }));
  };

  const handleSaveChanges = async () => {
    setIsSaving(true);
    await new Promise<void>((resolve) => {
      setTimeout(() => resolve(), 900);
    });
    setIsSaving(false);
  };

  return (
    <section className="space-y-5">
      <header className="rounded-2xl border border-white/15 bg-[#005E2E]/38 px-5 py-4">
        <h2 className="text-xl font-semibold text-white">
          Cài đặt hệ thống - {selectedFacility?.name ?? "Tất cả khu sân"}
        </h2>
        <p className="mt-1 text-sm text-white/80">
          Tùy chỉnh thông tin vận hành theo từng khu sân trong hệ thống.
        </p>
      </header>

      <div className="grid gap-5 lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="rounded-2xl border border-white/15 bg-[#005E2E]/40 p-3">
          <nav className="space-y-2">
            {settingsTabs.map((tab) => {
              const isActive = tab.id === activeTab;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full rounded-xl px-3 py-2.5 text-left text-sm transition ${
                    isActive
                      ? "border border-white/25 bg-white/18 font-semibold text-white"
                      : "text-white/80 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </aside>

        <div className="rounded-2xl border border-white/15 bg-[#005E2E]/35 p-5 lg:p-6">
          {activeTab === "facility-info" ? (
            currentSettings ? (
              <div className="space-y-5">
                <div className="grid gap-4 md:grid-cols-2">
                  <TextInput
                    id="facility-name"
                    label="Tên khu"
                    value={currentSettings.name}
                    onChange={(event) =>
                      updateFacilitySettings("name", event.target.value)
                    }
                    placeholder="Tên khu sân"
                    className="text-base"
                  />
                  <TextInput
                    id="facility-hotline"
                    label="Hotline"
                    value={currentSettings.hotline}
                    onChange={(event) =>
                      updateFacilitySettings("hotline", event.target.value)
                    }
                    placeholder="Hotline"
                    className="text-base"
                  />
                </div>

                <TextInput
                  id="facility-address"
                  label="Địa chỉ"
                  value={currentSettings.address}
                  onChange={(event) =>
                    updateFacilitySettings("address", event.target.value)
                  }
                  placeholder="Địa chỉ khu sân"
                  className="text-base"
                />

                <div className="grid gap-4 md:grid-cols-2">
                  <label className="rounded-auth-control border border-white/85 bg-white/[0.035] px-4 py-3">
                    <p className="mb-2 text-sm text-white/80">Giờ mở cửa</p>
                    <select
                      value={currentSettings.openTime}
                      onChange={(event) =>
                        updateFacilitySettings("openTime", event.target.value)
                      }
                      className="w-full bg-transparent text-base text-white outline-none [&>option]:bg-white [&>option]:text-[#103314]"
                    >
                      {openingTimeOptions.map((time) => (
                        <option key={`open-${time}`} value={time}>
                          {time}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="rounded-auth-control border border-white/85 bg-white/[0.035] px-4 py-3">
                    <p className="mb-2 text-sm text-white/80">Giờ đóng cửa</p>
                    <select
                      value={currentSettings.closeTime}
                      onChange={(event) =>
                        updateFacilitySettings("closeTime", event.target.value)
                      }
                      className="w-full bg-transparent text-base text-white outline-none [&>option]:bg-white [&>option]:text-[#103314]"
                    >
                      {openingTimeOptions.map((time) => (
                        <option key={`close-${time}`} value={time}>
                          {time}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <div className="pt-2">
                  <Button
                    type="button"
                    loading={isSaving}
                    onClick={() => {
                      void handleSaveChanges();
                    }}
                    className="h-[52px] max-w-[280px] text-base"
                  >
                    Lưu thay đổi
                  </Button>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-white/35 p-6 text-white/85">
                Chưa có dữ liệu khu sân để cấu hình.
              </div>
            )
          ) : null}

          {activeTab === "field-management" ? (
            <div className="rounded-xl border border-dashed border-white/30 p-6 text-white/90">
              <p className="text-base font-semibold">Đang cập nhật...</p>
              <p className="mt-2 text-sm text-white/80">
                Sẽ hỗ trợ Thêm/Sửa/Xóa sân và thiết lập giá mặc định theo giờ.
              </p>
              <ul className="mt-4 space-y-2 text-sm text-white/85">
                {currentFacilityFields.map((field) => (
                  <li key={field.id}>
                    {field.name} - {field.type}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {activeTab === "payment" ? (
            <div className="rounded-xl border border-dashed border-white/30 p-6 text-white/90">
              <p className="text-base font-semibold">Đang cập nhật...</p>
              <p className="mt-2 text-sm text-white/80">
                Cấu hình tài khoản ngân hàng, mã QR nhận cọc và tỉ lệ cọc mặc
                định.
              </p>
            </div>
          ) : null}

          {activeTab === "staff" ? (
            <div className="rounded-xl border border-dashed border-white/30 p-6 text-white/90">
              <p className="text-base font-semibold">Đang cập nhật...</p>
              <p className="mt-2 text-sm text-white/80">
                Danh sách tài khoản nhân viên trực quầy sẽ hiển thị tại đây.
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
