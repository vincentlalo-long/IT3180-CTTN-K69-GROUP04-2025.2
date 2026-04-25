import { Button } from "../../../../shared/components/Button";

import { notificationSettingItems } from "../../utils/notification.utils";
import { useNotificationForm } from "../../hooks/useNotificationForm";

export function NotificationTab() {
  const { handleSave, isSaving, settings, toggleSetting } =
    useNotificationForm();

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-lg font-semibold text-white">Thông báo</h3>
        <p className="mt-1 text-sm text-white/75">
          Quản lý các kênh nhận thông báo cho tài khoản quản trị.
        </p>
      </div>

      <div className="space-y-3">
        {notificationSettingItems.map((item) => (
          <div
            key={item.key}
            className="flex items-center justify-between rounded-xl border border-white/20 bg-white/[0.035] px-4 py-3"
          >
            <div>
              <p className="text-sm font-medium text-white">{item.title}</p>
              <p className="text-xs text-white/70">{item.description}</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={settings[item.key]}
              onClick={() => toggleSetting(item.key)}
              className={`relative h-7 w-12 rounded-full transition ${
                settings[item.key] ? "bg-emerald-500" : "bg-white/25"
              }`}
            >
              <span
                className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${
                  settings[item.key] ? "left-6" : "left-1"
                }`}
              />
            </button>
          </div>
        ))}
      </div>

      <Button
        type="button"
        loading={isSaving}
        onClick={() => {
          void handleSave();
        }}
        className="h-[52px] w-full max-w-[260px] text-base"
      >
        Lưu tùy chọn
      </Button>
    </div>
  );
}
