import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Sidebar = () => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { path: '/', label: t('dashboard.title'), icon: '🏠' },
    { path: '/transactions', label: t('transactions.title'), icon: '📜' },
    { path: '/budgets', label: t('budgets.title'), icon: '💰' },
    { path: '/saving-goals', label: t('savingGoals.title'), icon: '🎯' },
    { path: '/piggy-bank', label: t('piggyBank.title'), icon: '🐷' },
    { path: '/challenges', label: t('challenges.title'), icon: '🏆' },
    { path: '/currency', label: t('currencyConverter.title'), icon: '💸' },
    { path: '/leaderboard', label: t('leaderboard.title'), icon: '🥇' },
    { path: '/settings', label: t('settings.title'), icon: '⚙️' },
  ];

  return (
    <>
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-blue-600 text-white rounded-md"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? '✖' : '☰'}
      </button>
      <div
        className={`w-64 bg-white shadow-md h-screen p-4 fixed top-0 left-0 transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 z-40`}
      >
        <h1 className="text-xl font-bold text-gray-900 mb-6">Finance App</h1>
        <nav className="space-y-2">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center p-2 text-gray-700 rounded-lg hover:bg-blue-100 ${
                  isActive ? 'bg-blue-100 text-blue-600 font-semibold' : ''
                }`
              }
              onClick={() => setIsOpen(false)}
            >
              <span className="mr-3">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </>
  );
};

export default Sidebar;