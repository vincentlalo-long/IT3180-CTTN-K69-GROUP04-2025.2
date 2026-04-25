export type NotificationSettingKey =
  | "emailNotification"
  | "appNotification";

export interface NotificationSettings {
  emailNotification: boolean;
  appNotification: boolean;
}

export interface NotificationSettingItem {
  key: NotificationSettingKey;
  title: string;
  description: string;
}