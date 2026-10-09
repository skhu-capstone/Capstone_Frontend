import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import {
  applyTheme,
  getSystemIsDark,
  normalizeTheme,
  readThemePreference,
  resolveTheme,
  saveThemePreference,
  subscribeSystemTheme,
  THEME_STORAGE_KEY,
} from "./theme.js";

function withGlobals(values, run) {
  const descriptors = new Map();
  for (const [key, value] of Object.entries(values)) {
    descriptors.set(key, Object.getOwnPropertyDescriptor(globalThis, key));
    Object.defineProperty(globalThis, key, { configurable: true, value });
  }
  try {
    run();
  } finally {
    for (const [key, descriptor] of descriptors) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else delete globalThis[key];
    }
  }
}

function createRoot() {
  const classes = new Set();
  return {
    dataset: {},
    style: {},
    classList: {
      toggle: (name, enabled) => enabled ? classes.add(name) : classes.delete(name),
      contains: (name) => classes.has(name),
    },
  };
}

test("missing or invalid preferences use System; explicit modes override the OS", () => {
  for (const value of [null, undefined, "", "invalid", "DARK"]) {
    assert.equal(normalizeTheme(value), "system");
  }
  assert.equal(resolveTheme("system", true), "dark");
  assert.equal(resolveTheme("system", false), "light");
  assert.equal(resolveTheme("light", true), "light");
  assert.equal(resolveTheme("dark", false), "dark");
});

test("selection persists and root theme remains available across new reads", () => {
  const stored = new Map();
  const root = createRoot();
  withGlobals({
    localStorage: { getItem: (key) => stored.get(key), setItem: (key, value) => stored.set(key, value) },
    document: { documentElement: root },
    matchMedia: () => ({ matches: true }),
  }, () => {
    assert.equal(readThemePreference(), "system");
    for (const theme of ["light", "dark", "system"]) {
      saveThemePreference(theme);
      assert.equal(stored.get(THEME_STORAGE_KEY), theme);
      assert.equal(readThemePreference(), theme);
      const resolved = applyTheme(readThemePreference());
      assert.equal(root.dataset.theme, resolved);
      assert.equal(root.style.colorScheme, resolved);
      assert.equal(root.classList.contains("dark"), resolved === "dark");
    }
  });
});

test("storage and media failures do not prevent manual theme selection", () => {
  const root = createRoot();
  withGlobals({
    localStorage: { getItem: () => { throw new Error("Blocked"); }, setItem: () => { throw new Error("Full"); } },
    matchMedia: () => { throw new Error("Unavailable"); },
    document: { documentElement: root },
  }, () => {
    assert.equal(readThemePreference(), "system");
    assert.equal(getSystemIsDark(), false);
    assert.doesNotThrow(() => saveThemePreference("dark"));
    assert.equal(applyTheme("dark"), "dark");
    assert.equal(root.dataset.theme, "dark");
    assert.doesNotThrow(() => subscribeSystemTheme(() => {})());
  });
  withGlobals({ localStorage: undefined, matchMedia: undefined, document: undefined }, () => {
    assert.equal(readThemePreference(), "system");
    assert.equal(applyTheme("system"), "light");
    assert.doesNotThrow(() => saveThemePreference("dark"));
  });
});

test("modern and legacy OS subscriptions receive changes and remove their listener", () => {
  for (const legacy of [false, true]) {
    let listener;
    let removed;
    const media = { matches: false };
    if (legacy) {
      media.addListener = (callback) => { listener = callback; };
      media.removeListener = (callback) => { removed = callback; };
    } else {
      media.addEventListener = (event, callback) => { assert.equal(event, "change"); listener = callback; };
      media.removeEventListener = (event, callback) => { assert.equal(event, "change"); removed = callback; };
    }
    withGlobals({ matchMedia: () => media }, () => {
      let resolved = "light";
      const unsubscribe = subscribeSystemTheme(() => { resolved = resolveTheme("system"); });
      media.matches = true;
      listener();
      assert.equal(resolved, "dark");
      media.matches = false;
      listener();
      assert.equal(resolved, "light");
      unsubscribe();
      assert.equal(removed, listener);
    });
  }
});

test("pre-render initialization agrees with the runtime for every saved and OS mode", () => {
  const html = readFileSync(new URL("../../index.html", import.meta.url), "utf8");
  const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];
  for (const stored of [null, "invalid", "light", "dark", "system"]) {
    for (const matches of [false, true]) {
      const root = createRoot();
      runInNewContext(script, {
        localStorage: { getItem: (key) => { assert.equal(key, THEME_STORAGE_KEY); return stored; } },
        window: { matchMedia: () => ({ matches }) },
        document: { documentElement: root },
      });
      assert.equal(root.dataset.theme, resolveTheme(normalizeTheme(stored), matches));
    }
  }
  const root = createRoot();
  assert.doesNotThrow(() => runInNewContext(script, { window: {}, document: { documentElement: root } }));
  assert.equal(root.dataset.theme, "light");
});

test("dark semantic text and status colors meet normal-text WCAG AA contrast", () => {
  const css = readFileSync(new URL("../theme.css", import.meta.url), "utf8");
  const light = css.match(/:root \{([\s\S]*?)\n {2}\}/)[1];
  const dark = css.match(/:root\.dark \{([\s\S]*?)\n {2}\}/)[1];
  const tokens = Object.fromEntries([...`${light}\n${dark}`.matchAll(/(--[\w-]+):\s*([^;]+);/g)].map((match) => [match[1], match[2]]));
  const resolve = (name) => tokens[name].startsWith("var(") ? resolve(tokens[name].slice(4, -1)) : tokens[name];
  const luminance = (hex) => {
    const channels = hex.slice(1).match(/../g).map((channel) => parseInt(channel, 16) / 255)
      .map((value) => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
    return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
  };
  const check = (foreground, background) => {
    const values = [luminance(resolve(foreground)), luminance(resolve(background))].sort((a, b) => b - a);
    const contrast = (values[0] + 0.05) / (values[1] + 0.05);
    assert.ok(contrast >= 4.5, `${foreground} on ${background}: ${contrast.toFixed(2)}`);
  };
  for (const text of ["--theme-text", "--theme-secondary", "--theme-muted"]) {
    for (const background of ["--theme-page", "--theme-surface", "--theme-subtle", "--theme-hover"]) check(text, background);
  }
  check("--theme-link", "--theme-accent");
  for (const action of ["primary", "primary-hover", "success-action", "success-hover", "danger-action", "danger-hover"]) check("--theme-on-action", `--theme-${action}`);
  for (const status of ["success", "danger", "warning"]) check(`--theme-${status}`, `--theme-${status}-bg`);
  for (const hue of ["sky", "pink", "green", "amber", "violet", "red"]) check(`--avatar-${hue}-text`, `--avatar-${hue}-bg`);
});
