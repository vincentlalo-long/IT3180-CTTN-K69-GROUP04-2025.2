/**
 * Auth Provider Component
 * Provider wrapper cho Auth Context
 */

import { useMemo, useState, useCallback, type ReactNode } from "react";
import {
  getUserFromStorage,
  clearTokenFromStorage,
} from "../utils/tokenStorage";
import {
  AuthContext,
  type AuthContextValue,
  type AuthUser,
} from "./AuthContext";

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser>(() => {
    // Khởi tạo user từ localStorage khi component mount
    const userFromStorage = getUserFromStorage();
    if (!userFromStorage) {
      return {
        token: null,
        role: null,
        email: null,
        userId: null,
        username: null,
      };
    }
    return {
      token: userFromStorage.token,
      role: userFromStorage.role,
      email: userFromStorage.email,
      userId: userFromStorage.userId,
      username: userFromStorage.username,
    };
  });

  const logout = useCallback(() => {
    clearTokenFromStorage();
    setUser({
      token: null,
      role: null,
      email: null,
      userId: null,
      username: null,
    });
    console.log("Đã đăng xuất");
  }, []);

  const checkAuth = useCallback(() => {
    // Kiểm tra xem user có token hợp lệ không
    const userFromStorage = getUserFromStorage();
    if (!userFromStorage || !userFromStorage.token) {
      logout();
    } else {
      setUser({
        token: userFromStorage.token,
        role: userFromStorage.role,
        email: userFromStorage.email,
        userId: userFromStorage.userId,
        username: userFromStorage.username,
      });
    }
  }, [logout]);

  const isAuthenticated = useMemo(() => {
    return !!user.token && user.token.length > 0;
  }, [user.token]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated,
      setUser,
      logout,
      checkAuth,
    }),
    [user, isAuthenticated, logout, checkAuth],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
