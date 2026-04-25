import { useContext } from "react";

import { AuthContext } from "../model/AuthContext";

export function useAuthContext() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error(
      "useAuthContext must be used within an AuthProvider. " +
        "Make sure to wrap your app with <AuthProvider>",
    );
  }

  return context;
}
