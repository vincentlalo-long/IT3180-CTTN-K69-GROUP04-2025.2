import { useState } from "react";

import { Button } from "../../ui/Button";

interface NotificationSettings {
  emailNotification: boolean;
  appNotification: boolean;
}

function ToggleSwitch({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative h-7 w-12 rounded-full transition ${
        checked ? "bg-emerald-500" : "bg-white/25"
      }`}
    >
      <span
        className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${
          checked ? "left-6" : "left-1"
        }`}
      />
    </button>
  );
}

export function NotificationTab() {
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState<NotificationSettings>({
    emailNotification: true,
    appNotification: true,
  });

  const handleSave = async () => {
    setIsSaving(true);

    await new Promise<void>((resolve) => {
      setTimeout(() => resolve(), 700);
    });

    setIsSaving(false);
  };

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-lg font-semibold text-white">Thông báo</h3>
        <p className="mt-1 text-sm text-white/75">
          Quản lý các kênh nhận thông báo cho tài khoản quản trị.
        </p>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between rounded-xl border border-white/20 bg-white/[0.035] px-4 py-3">
          <div>
            <p className="text-sm font-medium text-white">Email notification</p>
            <p className="text-xs text-white/70">
              Nhận thông báo đơn đặt sân qua email.
            </p>
          </div>
          <ToggleSwitch
            checked={settings.emailNotification}
            onChange={(checked) =>
              setSettings((currentValue) => ({
                ...currentValue,
                emailNotification: checked,
              }))
            }
          />
        </div>

        <div className="flex items-center justify-between rounded-xl border border-white/20 bg-white/[0.035] px-4 py-3">
          <div>
            <p className="text-sm font-medium text-white">App notification</p>
            <p className="text-xs text-white/70">
              Hiển thị thông báo realtime trên trang quản trị.
            </p>
          </div>
          <ToggleSwitch
            checked={settings.appNotification}
            onChange={(checked) =>
              setSettings((currentValue) => ({
                ...currentValue,
                appNotification: checked,
              }))
            }
          />
        </div>
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
