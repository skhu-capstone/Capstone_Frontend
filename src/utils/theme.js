export const THEME_STORAGE_KEY = "capstone-theme";
export const SYSTEM_THEME_QUERY = "(prefers-color-scheme: dark)";

export function normalizeTheme(theme) {
  return ["light", "dark", "system"].includes(theme) ? theme : "system";
}

export function readThemePreference() {
  try {
    return normalizeTheme(globalThis.localStorage?.getItem(THEME_STORAGE_KEY));
  } catch {
    return "system";
  }
}

export function saveThemePreference(theme) {
  try {
    globalThis.localStorage?.setItem(THEME_STORAGE_KEY, normalizeTheme(theme));
  } catch {
    // The selected theme still works for this session when storage is blocked.
  }
}

function getSystemMediaQuery() {
  try {
    return globalThis.matchMedia?.(SYSTEM_THEME_QUERY) ?? null;
  } catch {
    return null;
  }
}

export function getSystemIsDark() {
  return Boolean(getSystemMediaQuery()?.matches);
}

export function subscribeSystemTheme(onChange) {
  const media = getSystemMediaQuery();
  if (!media) return () => {};

  if (media.addEventListener) {
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }
  if (media.addListener) {
    media.addListener(onChange);
    return () => media.removeListener(onChange);
  }
  return () => {};
}

export function resolveTheme(theme, systemIsDark = getSystemIsDark()) {
  const preference = normalizeTheme(theme);
  return preference === "system" ? (systemIsDark ? "dark" : "light") : preference;
}

export function applyTheme(theme, systemIsDark = getSystemIsDark()) {
  const resolvedTheme = resolveTheme(theme, systemIsDark);
  const root = globalThis.document?.documentElement;
  if (root) {
    root.classList.toggle("dark", resolvedTheme === "dark");
    root.dataset.theme = resolvedTheme;
    root.style.colorScheme = resolvedTheme;
  }
  return resolvedTheme;
}
