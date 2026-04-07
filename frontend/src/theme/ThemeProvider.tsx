import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { ConfigProvider, theme as antdTheme } from "antd";

import {
  getSystemPrefersDark,
  readTheme,
  writeTheme,
  type StoredTheme,
} from "../lib/userPreferences";

type ThemeMode = "light" | "dark";

interface ThemeContextValue {
  mode: ThemeMode;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [storedTheme, setStoredTheme] = useState<StoredTheme | null>(() =>
    readTheme(),
  );
  const [systemDark, setSystemDark] = useState(() => getSystemPrefersDark());

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => setSystemDark(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const mode: ThemeMode = storedTheme ?? (systemDark ? "dark" : "light");

  const toggle = useCallback(() => {
    const nextTheme: ThemeMode = mode === "light" ? "dark" : "light"; //change value
    setStoredTheme(nextTheme);
    writeTheme(nextTheme);
  }, []);

  const value = useMemo(() => {
    return { mode, toggle };
  }, [mode, toggle]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", mode === "dark");
  }, [mode]);

  // Change AntD Component Theme
  const antdThemeConfig = useMemo(
    () => ({
      algorithm:
        mode === "dark" ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
    }),
    [mode],
  );

  return (
    <ThemeContext.Provider value={value}>
      <ConfigProvider theme={antdThemeConfig}>
        <div
          className={
            mode === "dark"
              ? "dark flex min-h-0 min-h-dvh flex-1 flex-col bg-gray-900"
              : "light flex min-h-0 min-h-dvh flex-1 flex-col bg-gray-100 text-gray-900"
          }
        >
          {children}
        </div>
      </ConfigProvider>
    </ThemeContext.Provider>
  );
}

export function useThemeMode() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useThemeMode must be used within a ThemeProvider");
  }
  return context;
}
