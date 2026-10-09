import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { ThemeContext } from "./ThemeContext.js";
import {
  applyTheme,
  getSystemIsDark,
  normalizeTheme,
  readThemePreference,
  resolveTheme,
  saveThemePreference,
  subscribeSystemTheme,
  THEME_STORAGE_KEY,
} from "../utils/theme.js";

const getServerIsDark = () => false;

export default function ThemeProvider({ children }) {
  const [theme, setPreference] = useState(readThemePreference);
  const transitionTimerRef = useRef(null);
  const systemIsDark = useSyncExternalStore(subscribeSystemTheme, getSystemIsDark, getServerIsDark);
  const resolvedTheme = resolveTheme(theme, systemIsDark);

  useLayoutEffect(() => {
    applyTheme(theme, systemIsDark);
  }, [theme, systemIsDark]);

  useEffect(() => {
    const handleStorage = (event) => {
      if (event.key !== THEME_STORAGE_KEY && event.key !== null) return;
      const nextTheme = readThemePreference();
      applyTheme(nextTheme);
      setPreference(nextTheme);
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  useEffect(() => () => {
    clearTimeout(transitionTimerRef.current);
    document.documentElement.classList.remove("theme-transition");
  }, []);

  const setTheme = useCallback((nextTheme) => {
    // System is an automatic initial fallback, never a user-selectable mode.
    if (nextTheme !== "light" && nextTheme !== "dark") return;
    const preference = normalizeTheme(nextTheme);
    const root = document.documentElement;
    clearTimeout(transitionTimerRef.current);
    root.classList.add("theme-transition");
    saveThemePreference(preference);
    applyTheme(preference);
    setPreference(preference);
    transitionTimerRef.current = setTimeout(() => {
      root.classList.remove("theme-transition");
      transitionTimerRef.current = null;
    }, 350);
  }, []);

  const value = useMemo(() => ({ theme, resolvedTheme, setTheme }), [theme, resolvedTheme, setTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
