import { useCallback, useMemo, useState, type ReactNode } from "react";

import {
  clearTokenFromStorage,
  getUserFromStorage,
} from "@/shared/utils/tokenStorage";
import {
  AuthContext,
  type AuthContextValue,
  type AuthUser,
} from "./AuthContext";

interface AuthProviderProps {
  children: ReactNode;
}

function createEmptyUser(): AuthUser {
  return {
    token: null,
    type: null,
    role: null,
    email: null,
    userId: null,
    username: null,
  };
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser>(() => {
    const userFromStorage = getUserFromStorage();
    if (!userFromStorage) {
      return createEmptyUser();
    }

    return {
      token: userFromStorage.token,
      type: userFromStorage.type,
      role: userFromStorage.role,
      email: userFromStorage.email,
      userId: userFromStorage.userId,
      username: userFromStorage.username,
    };
  });

  const logout = useCallback(() => {
    clearTokenFromStorage();
    setUser(createEmptyUser());
    console.log("Đã đăng xuất");
  }, []);

  const checkAuth = useCallback(() => {
    const userFromStorage = getUserFromStorage();
    if (!userFromStorage || !userFromStorage.token) {
      logout();
      return;
    }

    setUser({
      token: userFromStorage.token,
      type: userFromStorage.type,
      role: userFromStorage.role,
      email: userFromStorage.email,
      userId: userFromStorage.userId,
      username: userFromStorage.username,
    });
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
