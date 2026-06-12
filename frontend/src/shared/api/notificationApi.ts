import apiClient from "./apiClient";

export interface NotificationItem {
  id: number;
  type: string;
  title: string;
  message: string;
  targetType: string | null;
  targetId: string | null;
  read: boolean;
  createdAt: string;
  readAt: string | null;
}

interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

interface UnreadCountResponse {
  unreadCount: number;
}

export async function getNotifications(size = 8): Promise<NotificationItem[]> {
  const response = await apiClient.get<PageResponse<NotificationItem>>(
    "/notifications",
    {
      params: {
        page: 0,
        size,
      },
    },
  );

  return response.data.content ?? [];
}

export async function getUnreadNotificationCount(): Promise<number> {
  const response = await apiClient.get<UnreadCountResponse>(
    "/notifications/unread-count",
  );
  return response.data.unreadCount;
}

export async function markNotificationAsRead(
  notificationId: number,
): Promise<NotificationItem> {
  const response = await apiClient.patch<NotificationItem>(
    `/notifications/${notificationId}/read`,
  );
  return response.data;
}

export async function markAllNotificationsAsRead(): Promise<void> {
  await apiClient.patch("/notifications/read-all");
}
