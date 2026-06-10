import { useCallback, useEffect, useRef, useState } from "react";
import { Bell, CheckCheck, Loader2 } from "lucide-react";

import {
  getNotifications,
  getUnreadNotificationCount,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  type NotificationItem,
} from "@/shared/api/notificationApi";

interface NotificationDropdownProps {
  buttonClassName?: string;
  panelClassName?: string;
  unreadBadgeClassName?: string;
  enabled?: boolean;
}

const joinClasses = (
  ...classes: Array<string | false | null | undefined>
): string => classes.filter(Boolean).join(" ");

const formatNotificationTime = (value: string): string => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const diffMs = Date.now() - date.getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "Vua xong";
  if (minutes < 60) return `${minutes} phut truoc`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} gio truoc`;

  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export function NotificationDropdown({
  buttonClassName,
  panelClassName,
  unreadBadgeClassName,
  enabled = true,
}: NotificationDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isMarkingAll, setIsMarkingAll] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const refreshNotifications = useCallback(async () => {
    if (!enabled) {
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const [latestNotifications, latestUnreadCount] = await Promise.all([
        getNotifications(),
        getUnreadNotificationCount(),
      ]);
      setNotifications(latestNotifications);
      setUnreadCount(latestUnreadCount);
    } catch (fetchError) {
      console.error("Failed to load notifications:", fetchError);
      setError("Khong tai duoc thong bao");
    } finally {
      setIsLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    void refreshNotifications();
    const intervalId = window.setInterval(() => {
      void refreshNotifications();
    }, 30000);

    return () => window.clearInterval(intervalId);
  }, [enabled, refreshNotifications]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggle = () => {
    setIsOpen((previous) => !previous);
    if (!isOpen) {
      void refreshNotifications();
    }
  };

  const handleNotificationClick = async (notification: NotificationItem) => {
    if (notification.read) {
      return;
    }

    try {
      const updatedNotification = await markNotificationAsRead(notification.id);
      setNotifications((current) =>
        current.map((item) =>
          item.id === notification.id ? updatedNotification : item,
        ),
      );
      setUnreadCount((current) => Math.max(0, current - 1));
    } catch (markError) {
      console.error("Failed to mark notification as read:", markError);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (unreadCount === 0 || isMarkingAll) {
      return;
    }

    setIsMarkingAll(true);
    try {
      await markAllNotificationsAsRead();
      setNotifications((current) =>
        current.map((notification) => ({
          ...notification,
          read: true,
          readAt: notification.readAt ?? new Date().toISOString(),
        })),
      );
      setUnreadCount(0);
    } catch (markError) {
      console.error("Failed to mark all notifications as read:", markError);
    } finally {
      setIsMarkingAll(false);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={handleToggle}
        className={joinClasses(
          "relative inline-flex h-10 w-10 items-center justify-center rounded-full border text-white transition focus:outline-none",
          buttonClassName,
        )}
        aria-label="Thong bao"
        aria-expanded={isOpen}
      >
        <Bell size={18} />
        {unreadCount > 0 ? (
          <span
            className={joinClasses(
              "absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full px-1 text-[11px] font-bold leading-none",
              unreadBadgeClassName ?? "bg-[#84e30f] text-[#005E2E]",
            )}
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        ) : null}
      </button>

      {isOpen ? (
        <div
          className={joinClasses(
            "absolute right-0 top-12 z-[1000] w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-lg border border-white/15 bg-[#005E2E] shadow-2xl",
            panelClassName,
          )}
        >
          <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
            <p className="text-sm font-semibold text-white">Thong bao</p>
            <button
              type="button"
              onClick={handleMarkAllAsRead}
              disabled={unreadCount === 0 || isMarkingAll}
              className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-semibold text-white/80 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-45"
            >
              {isMarkingAll ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <CheckCheck size={14} />
              )}
              Da doc
            </button>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {isLoading && notifications.length === 0 ? (
              <div className="flex items-center justify-center gap-2 px-4 py-8 text-sm text-white/75">
                <Loader2 size={16} className="animate-spin" />
                Dang tai...
              </div>
            ) : null}

            {!isLoading && error ? (
              <div className="px-4 py-8 text-center text-sm text-rose-200">
                {error}
              </div>
            ) : null}

            {!isLoading && !error && notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-white/70">
                Chua co thong bao
              </div>
            ) : null}

            {notifications.map((notification) => (
              <button
                key={notification.id}
                type="button"
                onClick={() => void handleNotificationClick(notification)}
                className={joinClasses(
                  "flex w-full gap-3 border-b border-white/10 px-4 py-3 text-left transition last:border-b-0 hover:bg-white/10",
                  !notification.read && "bg-white/[0.07]",
                )}
              >
                <span
                  className={joinClasses(
                    "mt-1 h-2 w-2 flex-shrink-0 rounded-full",
                    notification.read ? "bg-white/25" : "bg-[#84e30f]",
                  )}
                />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-white">
                    {notification.title}
                  </span>
                  <span className="mt-1 block break-words text-xs leading-5 text-white/75">
                    {notification.message}
                  </span>
                  <span className="mt-2 block text-[11px] font-medium text-white/50">
                    {formatNotificationTime(notification.createdAt)}
                  </span>
                </span>
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
