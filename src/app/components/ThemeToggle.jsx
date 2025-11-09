"use client";

import { useTheme } from "../context/ThemeContext";
import { HiSun, HiMoon, HiComputerDesktop } from "react-icons/hi2";

export default function ThemeToggle() {
  const { theme, setTheme, effectiveTheme } = useTheme();

  const themes = [
    { value: "light", icon: HiSun, label: "Light" },
    { value: "dark", icon: HiMoon, label: "Dark" },
    { value: "system", icon: HiComputerDesktop, label: "System" },
  ];

  return (
    <div className="flex items-center gap-1 rounded-full bg-neutral-900/80 p-1 shadow-lg shadow-black/50 ring-1 ring-neutral-700/50 backdrop-blur dark:bg-neutral-900/80 light:bg-neutral-100/80 light:ring-neutral-300/50">
      {themes.map(({ value, icon: Icon, label }) => {
        const isActive = theme === value;
        return (
          <button
            key={value}
            onClick={() => setTheme(value)}
            className={`flex h-8 w-8 items-center justify-center rounded-full transition-all duration-200 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-emerald-400 ${
              isActive
                ? "bg-emerald-400/20 text-emerald-400 ring-1 ring-emerald-400/30"
                : "text-neutral-400 hover:bg-neutral-800/50 hover:text-neutral-200 light:hover:bg-neutral-200/50 light:hover:text-neutral-700"
            }`}
            title={label}
            aria-label={`Switch to ${label.toLowerCase()} mode`}
          >
            <Icon className="h-4 w-4" />
          </button>
        );
      })}
    </div>
  );
}
