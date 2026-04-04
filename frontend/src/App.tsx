import './App.css';
import { useTranslation } from 'react-i18next';

export default function App() {
    
  const { t } = useTranslation();

  return (
    <div className="app">
      <h1>{t('appName')}</h1>
      <p>React + TypeScript + Vite</p>
    </div>
  );
}
