import { Moon, Sun } from "lucide-react";
import { useTheme } from "../../hooks/useTheme.js";

export default function ThemeSwitcher() {
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const nextLabel = isDark ? "라이트" : "다크";

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label={`테마 변경, 현재 ${isDark ? "다크" : "라이트"} 모드`}
      title={`${nextLabel} 모드로 전환`}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="theme-toggle relative h-10 w-16 shrink-0 cursor-pointer rounded-full border border-white/50 text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
    >
      <Sun size={16} className="absolute top-3 left-2 opacity-70" aria-hidden="true" />
      <Moon size={16} className="absolute top-3 right-2 opacity-70" aria-hidden="true" />
      <span className={`theme-toggle-thumb ${isDark ? "theme-toggle-thumb-dark" : ""}`} aria-hidden="true">
        <Sun size={18} className={`theme-toggle-icon ${isDark ? "theme-toggle-icon-hidden" : ""}`} />
        <Moon size={18} className={`theme-toggle-icon ${isDark ? "" : "theme-toggle-icon-hidden"}`} />
      </span>
    </button>
  );
}
