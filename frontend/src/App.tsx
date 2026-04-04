import "./App.css";
import { useTranslation } from "react-i18next";

export default function App() {
  const { t } = useTranslation();

  return (
    <div className="bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="app">
        <h1>{t("appName")}</h1>
        <p>React + TypeScript + Vite</p>
        <button
          onClick={() => {
            document.body.classList.toggle("dark");
          }}
        >
          Theme
        </button>
      </div>
    </div>
  );
}
