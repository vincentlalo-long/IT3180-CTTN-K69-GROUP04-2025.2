import { useMemo, useState } from "react";

import { Button } from "../../components/ui/Button";
import { TextInput } from "../../components/ui/TextInput";
import { ALL_FACILITIES_ID, fields } from "../../data/mockAdminData";
import { useFacilityContext } from "../../contexts/useFacilityContext";

type SettingsTab = "facility-info" | "field-management" | "payment" | "staff";

interface FacilityFormState {
  name: string;
  address: string;
  hotline: string;
  openTime: string;
  closeTime: string;
  depositRate: string;
  cancelWindowHours: string;
  bankName: string;
  accountHolder: string;
  accountNumber: string;
  goldenHourFrom: string;
  goldenHourTo: string;
  goldenHourSurcharge: string;
}

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
          depositRate: "50",
          cancelWindowHours: "24",
          bankName: "MB Bank",
          accountHolder: "NGUYEN TRI HIEU",
          accountNumber: "12345678999",
          goldenHourFrom: "17:30",
          goldenHourTo: "20:30",
          goldenHourSurcharge: "150000",
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
            <button
              type="button"
              onClick={() => setActiveTab("facility-info")}
              className={`w-full rounded-xl px-3 py-2.5 text-left text-sm transition ${
                activeTab === "facility-info"
                  ? "border border-white/30 bg-[#3BA55D]/26 font-semibold text-white shadow-[0_0_18px_rgba(132,227,15,0.22)]"
                  : "text-white/80 hover:bg-white/10 hover:text-white"
              }`}
            >
              Thông tin cơ sở
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("field-management")}
              className={`w-full rounded-xl px-3 py-2.5 text-left text-sm transition ${
                activeTab === "field-management"
                  ? "border border-white/30 bg-[#3BA55D]/26 font-semibold text-white shadow-[0_0_18px_rgba(132,227,15,0.22)]"
                  : "text-white/80 hover:bg-white/10 hover:text-white"
              }`}
            >
              Quản lý Sân bóng
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("payment")}
              className={`w-full rounded-xl px-3 py-2.5 text-left text-sm transition ${
                activeTab === "payment"
                  ? "border border-white/30 bg-[#3BA55D]/26 font-semibold text-white shadow-[0_0_18px_rgba(132,227,15,0.22)]"
                  : "text-white/80 hover:bg-white/10 hover:text-white"
              }`}
            >
              Cấu hình Thanh toán
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("staff")}
              className={`w-full rounded-xl px-3 py-2.5 text-left text-sm transition ${
                activeTab === "staff"
                  ? "border border-white/30 bg-[#3BA55D]/26 font-semibold text-white shadow-[0_0_18px_rgba(132,227,15,0.22)]"
                  : "text-white/80 hover:bg-white/10 hover:text-white"
              }`}
            >
              Quản lý Nhân viên
            </button>
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
            currentSettings ? (
              <div className="space-y-4">
                <div className="grid gap-4 xl:grid-cols-3">
                  <article className="rounded-xl border border-white/15 bg-[#0a4d29]/65 p-4 shadow-[0_10px_24px_-16px_rgba(0,0,0,0.7)]">
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-white/90">
                      Quy định Đặt/Hủy sân
                    </h3>
                    <div className="mt-3 space-y-3">
                      <TextInput
                        id="payment-deposit-rate"
                        label="Tỉ lệ đặt cọc bắt buộc (%)"
                        value={currentSettings.depositRate}
                        onChange={(event) =>
                          updateFacilitySettings(
                            "depositRate",
                            event.target.value,
                          )
                        }
                        type="number"
                        min="0"
                        max="100"
                        placeholder="50"
                        className="text-base"
                      />

                      <TextInput
                        id="payment-cancel-window"
                        label="Thời gian tối thiểu cho phép hủy sân (Giờ)"
                        value={currentSettings.cancelWindowHours}
                        onChange={(event) =>
                          updateFacilitySettings(
                            "cancelWindowHours",
                            event.target.value,
                          )
                        }
                        type="number"
                        min="0"
                        placeholder="24"
                        className="text-base"
                      />
                    </div>
                  </article>

                  <article className="rounded-xl border border-white/15 bg-[#0a4d29]/65 p-4 shadow-[0_10px_24px_-16px_rgba(0,0,0,0.7)]">
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-white/90">
                      Tài khoản thụ hưởng (Tạo QR)
                    </h3>
                    <div className="mt-3 space-y-3">
                      <TextInput
                        id="payment-bank-name"
                        label="Ngân hàng"
                        value={currentSettings.bankName}
                        onChange={(event) =>
                          updateFacilitySettings("bankName", event.target.value)
                        }
                        placeholder="MB Bank"
                        className="text-base"
                      />

                      <TextInput
                        id="payment-account-holder"
                        label="Chủ tài khoản"
                        value={currentSettings.accountHolder}
                        onChange={(event) =>
                          updateFacilitySettings(
                            "accountHolder",
                            event.target.value,
                          )
                        }
                        placeholder="NGUYEN TRI HIEU"
                        className="text-base"
                      />

                      <TextInput
                        id="payment-account-number"
                        label="Số tài khoản"
                        value={currentSettings.accountNumber}
                        onChange={(event) =>
                          updateFacilitySettings(
                            "accountNumber",
                            event.target.value,
                          )
                        }
                        placeholder="12345678999"
                        className="text-base"
                      />
                    </div>
                  </article>

                  <article className="rounded-xl border border-white/15 bg-[#0a4d29]/65 p-4 shadow-[0_10px_24px_-16px_rgba(0,0,0,0.7)]">
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-white/90">
                      Cấu hình Khung giờ Vàng
                    </h3>
                    <div className="mt-3 space-y-3">
                      <div className="grid gap-3 sm:grid-cols-2">
                        <label className="rounded-auth-control border border-white/85 bg-white/[0.035] px-4 py-3">
                          <p className="mb-2 text-sm text-white/80">Từ giờ</p>
                          <input
                            type="time"
                            value={currentSettings.goldenHourFrom}
                            onChange={(event) =>
                              updateFacilitySettings(
                                "goldenHourFrom",
                                event.target.value,
                              )
                            }
                            className="w-full bg-transparent text-base text-white outline-none"
                          />
                        </label>

                        <label className="rounded-auth-control border border-white/85 bg-white/[0.035] px-4 py-3">
                          <p className="mb-2 text-sm text-white/80">Đến giờ</p>
                          <input
                            type="time"
                            value={currentSettings.goldenHourTo}
                            onChange={(event) =>
                              updateFacilitySettings(
                                "goldenHourTo",
                                event.target.value,
                              )
                            }
                            className="w-full bg-transparent text-base text-white outline-none"
                          />
                        </label>
                      </div>

                      <TextInput
                        id="payment-golden-surcharge"
                        label="Phụ thu giờ vàng (VNĐ)"
                        value={currentSettings.goldenHourSurcharge}
                        onChange={(event) =>
                          updateFacilitySettings(
                            "goldenHourSurcharge",
                            event.target.value,
                          )
                        }
                        type="number"
                        min="0"
                        placeholder="150000"
                        className="text-base"
                      />
                    </div>
                  </article>
                </div>

                <div className="pt-2">
                  <Button
                    type="button"
                    loading={isSaving}
                    onClick={() => {
                      void handleSaveChanges();
                    }}
                    className="h-[52px] max-w-[280px] text-base shadow-[0_0_34px_rgba(132,227,15,0.45)]"
                  >
                    Lưu thay đổi
                  </Button>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-white/35 p-6 text-white/85">
                Chưa có dữ liệu khu sân để cấu hình thanh toán.
              </div>
            )
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
