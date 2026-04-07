/** Store Language and Theme on the client side */
export const THEME_STORAGE_KEY = "mini-board-theme";
export const LANG_STORAGE_KEY = "mini-board-language";

export type StoredTheme = "light" | "dark";

/** Read the keys from localStorage */
export function readTheme(): StoredTheme | null {
  if (typeof window === "undefined") return null;
  const value = window.localStorage.getItem(THEME_STORAGE_KEY);
  if (value === "light" || value === "dark") return value;
  return null;
}

export function writeTheme(theme: StoredTheme) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(THEME_STORAGE_KEY, theme);
}

export function readLanguage(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(LANG_STORAGE_KEY) as string | null;
}

export function writeLanguage(language: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(LANG_STORAGE_KEY, language);
}

/** Get locale from browser, set language */

export function getLanguageFromBrowser(): 'zh-CN' | 'en' {
    if (typeof navigator === "undefined") return "en";
    const language = navigator.language || navigator.languages?.[0] || 'en';
    const lower = language.toLowerCase();
    if (lower.startsWith('zh-')) return 'zh-CN';
    return "en";
}

export function getInitialLanguage(): 'zh-CN' | 'en' {
    const stored = readLanguage();
    if (stored) return stored as 'zh-CN' | 'en';
    return getLanguageFromBrowser();
}

export function setLanguage(language: 'zh-CN' | 'en') {
    writeLanguage(language);
}

/** Get Theme from browser, set theme */

export function getSystemPrefersDark(): boolean {
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
}


export function setTheme(theme: StoredTheme) {
    writeTheme(theme);
}

