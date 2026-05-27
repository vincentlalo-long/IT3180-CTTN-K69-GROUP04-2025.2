import { useState, useEffect, useCallback } from "react";
import apiClient from "@/shared/api/apiClient";

type ProfileEventListener = () => void;
const listeners: ProfileEventListener[] = [];

export function emitProfileEvent() {
  listeners.forEach((fn) => fn());
}

export function subscribeProfileEvent(fn: ProfileEventListener) {
  listeners.push(fn);
  return () => {
    const idx = listeners.indexOf(fn);
    if (idx !== -1) listeners.splice(idx, 1);
  };
}

export interface PlayerProfileInfo {
  id: number;
  name: string;
  email: string;
  phone: string;
  avatarUrl?: string;
  role?: string;
}

export function usePlayerProfile() {
  const [userInfo, setUserInfo] = useState<PlayerProfileInfo | null>(null);
  const [loadingUser, setLoadingUser] = useState(false);
  const [userError, setUserError] = useState<string | null>(null);

  const fetchUser = useCallback(() => {
    setLoadingUser(true);
    setUserError(null);
    apiClient
      .get("/user/profile")
      .then((res) => {
        setUserInfo(res.data);
        setLoadingUser(false);
      })
      .catch((err) => {
        if (!err.response) setUserError("Không có kết nối mạng.");
        else if (err.response.status === 401) setUserError("Token hết hạn hoặc chưa đăng nhập.");
        else if (err.response.status === 404) setUserError("Không tìm thấy thông tin người dùng.");
        else setUserError("Lỗi server hoặc không xác định.");
        setLoadingUser(false);
      });
  }, []);

  // Effect 1: fetch lần đầu khi mount
  useEffect(() => {
    fetchUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Effect 2: subscribe event emitter
  useEffect(() => {
    const unsub = subscribeProfileEvent(fetchUser);
    return unsub;
  }, [fetchUser]);

  return { userInfo, loadingUser, userError, refetch: fetchUser };
}