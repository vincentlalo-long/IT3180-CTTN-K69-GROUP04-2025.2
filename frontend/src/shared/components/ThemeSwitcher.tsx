import { useState, useRef, useEffect } from "react";
import { Palette, Sun, Moon } from "lucide-react";
import { useThemeStore, type ThemeMode } from "../stores/themeStore";

export function ThemeSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, setTheme } = useThemeStore();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (theme === "pastel") {
      document.documentElement.removeAttribute("data-theme");
    } else {
      document.documentElement.setAttribute("data-theme", theme);
    }
  }, [theme]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getThemeIcon = (mode: ThemeMode) => {
    switch (mode) {
      case "pastel":
        return <Palette size={18} />;
      case "white":
        return <Sun size={18} />;
      case "dark":
        return <Moon size={18} />;
    }
  };

  const getThemeLabel = (mode: ThemeMode) => {
    switch (mode) {
      case "pastel":
        return "Pastel Mode";
      case "white":
        return "White Mode";
      case "dark":
        return "Dark Mode";
    }
  };

  const modes: ThemeMode[] = ["pastel", "white", "dark"];

  return (
    <div ref={containerRef} className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-2">
      {isOpen && (
        <div className="flex flex-col gap-1 rounded-xl border border-border-color bg-surface p-1.5 shadow-xl backdrop-blur-md min-w-[140px]">
          {modes.map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => {
                setTheme(mode);
                setIsOpen(false);
              }}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all text-left ${
                theme === mode
                  ? "bg-accent text-slate-900"
                  : "text-sub hover:bg-primary hover:text-main"
              }`}
            >
              {getThemeIcon(mode)}
              <span>{getThemeLabel(mode)}</span>
            </button>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-12 w-12 items-center justify-center rounded-full bg-accent border border-border-color text-slate-900 shadow-lg shadow-black/25 hover:scale-105 active:scale-95 transition-all focus:outline-none cursor-pointer"
        aria-label="Chuyển đổi giao diện"
      >
        {getThemeIcon(theme)}
      </button>
    </div>
  );
}
