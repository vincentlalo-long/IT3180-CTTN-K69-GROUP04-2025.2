import { createContext } from "react";

export interface AuthUser {
  token: string | null;
  type: string | null;
  role: string | null;
  email: string | null;
  userId: string | null;
  username: string | null;
}

export interface AuthContextValue {
  user: AuthUser;
  isAuthenticated: boolean;
  setUser: (user: AuthUser) => void;
  logout: () => void;
  checkAuth: () => void;
}

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined,
);
