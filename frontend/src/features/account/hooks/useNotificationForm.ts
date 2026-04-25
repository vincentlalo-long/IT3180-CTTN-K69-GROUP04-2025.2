import { useState } from "react";

import { notificationSchema } from "../schemas/notification.schema";
import { defaultNotificationSettings } from "../utils/notification.utils";
import type {
  NotificationSettingKey,
  NotificationSettings,
} from "../types/notification.types";

export function useNotificationForm() {
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState<NotificationSettings>(
    defaultNotificationSettings,
  );

  const toggleSetting = (key: NotificationSettingKey) => {
    setSettings((currentValue) => ({
      ...currentValue,
      [key]: !currentValue[key],
    }));
  };

  const handleSave = async () => {
    const validationResult = notificationSchema.safeParse(settings);
    if (!validationResult.success) {
      return;
    }

    setIsSaving(true);

    await new Promise<void>((resolve) => {
      setTimeout(() => resolve(), 700);
    });

    setIsSaving(false);
  };

  return {
    isSaving,
    settings,
    toggleSetting,
    handleSave,
  };
}
