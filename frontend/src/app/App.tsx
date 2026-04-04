import "./index.css";
import { useTranslation } from "react-i18next";
import { lazy, useId, Suspense } from "react";
import i18n from "../i18n";

const BoardPage = lazy(() =>
  import("../features/board/BoardPage").then((m) => ({ default: m.BoardPage })),
);

export default function App() {
  const { t } = useTranslation();
  const langId = useId();

  return (
    <div className="flex min-h-0 flex-1 flex-col text-gray-900 dark:text-gray-100">
      <header className="flex shrink-0 justify-end gap-2 px-4 pt-3 pb-2">
        <label htmlFor={langId} className="sr-only">
          Language
        </label>
        <div className="relative inline-flex items-center">
          <select
            id={langId}
            value={i18n.language}
            onChange={(event) => {
              const lng = event.target.value as "zh-CN" | "en";
              void i18n.changeLanguage(lng);
            }}
            className="h-9 cursor-pointer appearance-none rounded border border-gray-300 bg-white py-0 pl-2 pr-6 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
          >
            <option value="zh-CN">中文</option>
            <option value="en">English</option>
          </select>
        </div>
        <button
          type="button"
          className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-gray-300 text-lg text-gray-900 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-100 dark:hover:bg-gray-800"
          onClick={() => {
            document.documentElement.classList.toggle("dark");
          }}
        >
          Sk
        </button>
      </header>
      <main className="flex min-h-0 flex-1 flex-col">
        <Suspense
          fallback={
            <div className="flex min-h-0 flex-1 animate-pulse flex-col space-y-4 px-4 pb-4 pt-2 md:px-6">
              <div className="h-8 w-48 rounded bg-gray-200 dark:bg-gray-800" />
              <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 md:grid-cols-3">
                <div className="min-h-64 rounded bg-gray-200 dark:bg-gray-800" />
                <div className="min-h-64 rounded bg-gray-200 dark:bg-gray-800" />
                <div className="min-h-64 rounded bg-gray-200 dark:bg-gray-800" />
              </div>
            </div>
          }
        >
          <BoardPage />
        </Suspense>
      </main>
    </div>
  );
}
