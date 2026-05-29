import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ThemeMode = "pastel" | "white" | "dark";

interface ThemeState {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: "pastel",
      setTheme: (theme) => {
        set({ theme });
        if (theme === "pastel") {
          document.documentElement.removeAttribute("data-theme");
        } else {
          document.documentElement.setAttribute("data-theme", theme);
        }
      },
    }),
    {
      name: "mixifoot-theme-storage",
      onRehydrateStorage: () => (state) => {
        if (state) {
          if (state.theme === "pastel") {
            document.documentElement.removeAttribute("data-theme");
          } else {
            document.documentElement.setAttribute("data-theme", state.theme);
          }
        }
      },
    }
  )
);
