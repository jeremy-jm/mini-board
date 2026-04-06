import {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useState,
} from "react";

type ThemeMode = "light" | "dark";

interface ThemeContextValue {
    mode: ThemeMode;
    toggle: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function getSystemPrefersDark(): boolean {
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const mode: ThemeMode = useMemo(() => {
        return getSystemPrefersDark() ? "dark" : "light";
    }, []);

    const toggle = useCallback(() => {
        return mode === "light" ? "dark" : "light";
    }, [mode]);

    const value = useMemo(() => {
        return { mode, toggle };
    }, [mode, toggle]);

    return (
        <ThemeContext.Provider value={value}>
            <div
                className={
                    mode === "dark"
                        ? "dark flex min-h-0 min-h-dvh flex-1 flex-col bg-gray-900"
                        : "light flex min-h-0 min-h-dvh flex-1 flex-col bg-gray-100 text-gray-900"
                }
            >
                {children}
            </div>
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
