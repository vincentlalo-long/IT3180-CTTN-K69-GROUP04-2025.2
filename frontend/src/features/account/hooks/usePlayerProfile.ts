import { useEffect, useState } from "react";
import apiClient from "@/shared/api/apiClient";
import { getPlayerBookings } from "../api/account.api";
import type {
  PlayerBookingHistoryItem,
  PlayerProfileInfo,
} from "../types/account.types";

export function usePlayerProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const [userInfo, setUserInfo] = useState<PlayerProfileInfo | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [userError, setUserError] = useState<string | null>(null);
  const [history, setHistory] = useState<PlayerBookingHistoryItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  // Fetch user info khi đã đăng nhập
  useEffect(() => {
    let isMounted = true;
    setLoadingUser(true);
    setUserError(null);
    apiClient.get("/user/profile")
      .then((res) => {
        if (isMounted) setUserInfo(res.data);
      })
      .catch((err) => {
        if (isMounted) {
          if (err.response && err.response.status === 401) {
            setUserError("Unauthenticated");
          } else {
            setUserError("Không thể tải thông tin tài khoản");
          }
        }
      })
      .finally(() => {
        if (isMounted) setLoadingUser(false);
      });
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    if (!showHistory) return;
    let isMounted = true;
    const loadHistory = async () => {
      setLoadingHistory(true);
      setHistoryError(null);
      try {
        const data = await getPlayerBookings();
        if (isMounted) setHistory(data);
      } catch (error) {
        if (isMounted) {
          setHistoryError(
            error instanceof Error ? error.message : "Lỗi không xác định",
          );
        }
      } finally {
        if (isMounted) setLoadingHistory(false);
      }
    };
    loadHistory();
    return () => { isMounted = false; };
  }, [showHistory]);

  const toggleEditing = () => setIsEditing((v) => !v);
  const toggleHistory = () => setShowHistory((v) => !v);
  const updateUserInfo = <Key extends keyof PlayerProfileInfo>(
    key: Key,
    value: PlayerProfileInfo[Key],
  ) => {
    setUserInfo((currentValue) =>
      currentValue ? { ...currentValue, [key]: value } : currentValue
    );
  };

  return {
    isEditing,
    userInfo,
    loadingUser,
    userError,
    history,
    loadingHistory,
    historyError,
    showHistory,
    toggleEditing,
    toggleHistory,
    updateUserInfo,
  };
}