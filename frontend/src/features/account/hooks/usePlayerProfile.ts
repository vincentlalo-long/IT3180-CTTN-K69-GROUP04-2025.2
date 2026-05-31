import { useState, useEffect, useCallback } from "react";
import apiClient from "@/shared/api/apiClient";
import { getApiErrorMessage, logApiError } from "@/shared/utils/apiError";
import type { PlayerProfileInfo } from "../types/account.types";

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
  teamId?: number | null;
}

export function usePlayerProfile() {
  const [userInfo, setUserInfo] = useState<PlayerProfileInfo | null>(null);
  const [loadingUser, setLoadingUser] = useState(false);
  const [userError, setUserError] = useState<string | null>(null);

  const fetchUser = useCallback(() => {
    setLoadingUser(true);
    setUserError(null);
    apiClient
      .get("/users/me")
      .then((res) => {
        const dto = res.data;
        setUserInfo({
          id: dto.id,
          name: dto.username,
          email: dto.email,
          phone: dto.phoneNumber,
          avatarUrl: dto.avatarUrl,
          role: dto.role,
          teamId: dto.teamId,
        });
        setLoadingUser(false);
      })
      .catch((err) => {
        logApiError("usePlayerProfile.fetchUser", err);
        setUserError(
          getApiErrorMessage(err, "Không thể tải thông tin tài khoản."),
        );
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