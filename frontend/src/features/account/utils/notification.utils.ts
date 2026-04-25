import type {
  NotificationSettingItem,
  NotificationSettings,
} from "../types/notification.types";

export const defaultNotificationSettings: NotificationSettings = {
  emailNotification: true,
  appNotification: true,
};

export const notificationSettingItems: NotificationSettingItem[] = [
  {
    key: "emailNotification",
    title: "Email notification",
    description: "Nhận thông báo đơn đặt sân qua email.",
  },
  {
    key: "appNotification",
    title: "App notification",
    description: "Hiển thị thông báo realtime trên trang quản trị.",
  },
];