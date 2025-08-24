import React, { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import AppRoutes from './routes/AppRoutes';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enTranslation from './locales/en.json';
import viTranslation from './locales/vi.json';
import './index.css';

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: enTranslation },
    vi: { translation: viTranslation },
  },
  lng: 'vi',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

function App() {
  useEffect(() => {
    const settings = JSON.parse(localStorage.getItem('settings') || '{}');
    console.log('App loaded with settings from localStorage:', settings);
    if (settings.moodBasedTheme) {
      document.body.className = `theme-${settings.currentMood || 'productive'}`;
    } else {
      document.body.className = '';
    }
  }, []);

  return (
    <>
      <Toaster position="top-right" />
      <AppRoutes />
    </>
  );
}

export default App;