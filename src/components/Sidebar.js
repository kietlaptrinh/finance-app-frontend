import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useChallengeNotifications } from '../contexts/ChallengeContext';

const Sidebar = () => {
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation();
    const { pendingChallengeCount } = useChallengeNotifications();

    
    useEffect(() => {
        setIsOpen(false);
    }, [location.pathname]);

    const menuItems = [
        { path: '/', label: t('dashboard.title'), icon: '🏠' },
        { path: '/transactions', label: t('transactions.title'), icon: '📜' },
        { path: '/budgets', label: t('budgets.title'), icon: '💰' },
        { path: '/saving-goals', label: t('savingGoals.title'), icon: '🎯' },
        { path: '/piggy-bank', label: t('piggyBank.title'), icon: '🐷' },
        { path: '/challenges', label: t('challenges.title'), icon: '🏆', notificationCount: pendingChallengeCount },
        { path: '/currency', label: t('currencyConverter.title'), icon: '💸' },
        { path: '/leaderboard', label: t('leaderboard.title'), icon: '🥇' },
        { path: '/settings', label: t('settings.title'), icon: '⚙️' },
    ];

    return (
        <>
            {/* Nút Hamburger (chỉ hiển thị trên mobile) */}
            <button
                className="md:hidden fixed top-4 left-4 z-[60] p-2 bg-blue-600 text-white rounded-md"
                onClick={() => setIsOpen(!isOpen)}
            >
                {isOpen ? '✖' : '☰'}
            </button>

            {/* Lớp nền mờ (overlay) */}
            {isOpen && (
                <div 
                    className="md:hidden fixed inset-0 bg-black opacity-50 z-30"
                    onClick={() => setIsOpen(false)}
                ></div>
            )}

            {/* Sidebar */}
            <div
                className={`w-64 bg-white shadow-lg h-screen p-4 fixed top-0 left-0 transition-transform duration-300 ease-in-out ${
                    isOpen ? 'translate-x-0' : '-translate-x-full'
                } md:translate-x-0 z-40`}
            >
                <h1 className="text-2xl font-bold text-gray-900 mb-8 pt-4 text-center">
                    {t('appName')}
                </h1>
                <nav className="space-y-2">
                    {menuItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                `flex items-center p-3 text-gray-700 rounded-lg hover:bg-blue-100 transition-colors ${
                                    isActive ? 'bg-blue-100 text-blue-600 font-semibold' : ''
                                }`
                            }
                        >
                            <div className="flex items-center">
                                <span className="mr-3 text-xl">{item.icon}</span>
                                {item.label}
                            </div>
                            {item.notificationCount > 0 && (
                                <span className="bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                                    {item.notificationCount}
                                </span>
                            )}
                        </NavLink>
                    ))}
                </nav>
            </div>
        </>
    );
};

export default Sidebar;