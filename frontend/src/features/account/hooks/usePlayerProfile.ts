import { useEffect, useState } from "react";

import { getPlayerBookings } from "../api/account.api";
import type {
  PlayerBookingHistoryItem,
  PlayerProfileInfo,
} from "../types/account.types";

const defaultPlayerProfileInfo: PlayerProfileInfo = {
  name: "Phạm Gia Linh",
  phone: "",
  email: "",
};

export function usePlayerProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const [userInfo, setUserInfo] = useState<PlayerProfileInfo>(
    defaultPlayerProfileInfo,
  );
  const [history, setHistory] = useState<PlayerBookingHistoryItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    if (!showHistory) {
      return;
    }

    let isMounted = true;

    const loadHistory = async () => {
      setLoadingHistory(true);
      setHistoryError(null);

      try {
        const data = await getPlayerBookings();
        if (isMounted) {
          setHistory(data);
        }
      } catch (error) {
        if (isMounted) {
          setHistoryError(
            error instanceof Error ? error.message : "Lỗi không xác định",
          );
        }
      } finally {
        if (isMounted) {
          setLoadingHistory(false);
        }
      }
    };

    loadHistory();

    return () => {
      isMounted = false;
    };
  }, [showHistory]);

  const toggleEditing = () => {
    setIsEditing((currentValue) => !currentValue);
  };

  const toggleHistory = () => {
    setShowHistory((currentValue) => !currentValue);
  };

  const updateUserInfo = <Key extends keyof PlayerProfileInfo>(
    key: Key,
    value: PlayerProfileInfo[Key],
  ) => {
    setUserInfo((currentValue) => ({
      ...currentValue,
      [key]: value,
    }));
  };

  return {
    isEditing,
    userInfo,
    history,
    loadingHistory,
    historyError,
    showHistory,
    toggleEditing,
    toggleHistory,
    updateUserInfo,
  };
}
