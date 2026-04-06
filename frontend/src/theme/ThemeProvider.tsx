import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { ConfigProvider, theme as antdTheme } from "antd";

import { getInitialTheme } from "../lib/userPreferences";

type ThemeMode = "light" | "dark";

interface ThemeContextValue {
  mode: ThemeMode;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>(() =>
    getInitialTheme() ? "dark" : "light",
  );

  const toggle = useCallback(() => {
    setMode((prev) => (prev === "light" ? "dark" : "light"));
  }, []);

  const value = useMemo(() => {
    return { mode, toggle };
  }, [mode, toggle]);

  // Change AntD Component Theme
  useEffect(() => {
    document.documentElement.classList.toggle("dark", mode === "dark");
  }, [mode]);

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
