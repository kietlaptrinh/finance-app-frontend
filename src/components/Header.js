import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import * as api from '../api/api';
import toast from 'react-hot-toast';
import CurrencySwitcher from './CurrencySwitcher';

const Header = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    if (userInfo) {
      setUser(userInfo);
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    localStorage.removeItem('settings');
    toast.success(t('auth.logoutSuccess'));
    navigate('/login');
  };

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    toast.success(t('settings.languageChanged'));
    setIsDropdownOpen(false);
  };

  return (
    <nav className="bg-white shadow-sm fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-gray-900">{t('appName')}</h1>
          </div>
          <div className="flex items-center space-x-4">
             <CurrencySwitcher /> 
            <span className="text-sm text-gray-700">{t('welcome', { name: user?.fullName || 'User' })}</span>
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center space-x-2 focus:outline-none"
              >
                <img
                  src={user?.profilePictureUrl || 'https://via.placeholder.com/40'}
                  alt="Avatar"
                  className="w-10 h-10 rounded-full"
                />
              </button>
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                  <button
                    onClick={() => {
                      navigate('/profile');
                      setIsDropdownOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    {t('profile.title')}
                  </button>
                  <button
                    onClick={() => changeLanguage(i18n.language === 'vi' ? 'en' : 'vi')}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    {t('settings.changeLanguage')} ({i18n.language === 'vi' ? 'English' : 'Tiếng Việt'})
                  </button>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                  >
                    {t('logout')}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Header;