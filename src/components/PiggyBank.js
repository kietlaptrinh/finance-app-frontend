import React, { useEffect, useState } from 'react';
import * as api from '../api/api';
import { useTranslation } from 'react-i18next';

const PiggyBank = () => {
  const { t } = useTranslation();
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await api.fetchSettings();
        setSettings(data);
      } catch (err) {
        console.error('Fetch settings error:', err);
      }
    };
    fetchSettings();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">{t('piggyBank.title')}</h2>
      <div className="flex items-center justify-center">
        <div className="w-32 h-32 bg-pink-300 rounded-full flex items-center justify-center">
          <span className="text-4xl">🐷</span>
        </div>
      </div>
      <div className="mt-4">
        <p className="text-lg font-medium">{t('settings.points')}: {settings?.points || 0}</p>
        <p className="text-lg font-medium">{t('settings.badges')}:</p>
        {settings?.badges?.length ? (
          <div className="flex flex-wrap">
            {settings.badges.map((badge, index) => (
              <span key={index} className={`badge badge-${badge}`}>
                {badge}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">{t('settings.noBadges')}</p>
        )}
      </div>
    </div>
  );
};

export default PiggyBank;