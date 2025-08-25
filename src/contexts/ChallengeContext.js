// src/contexts/ChallengeContext.js

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import * as api from '../api/api';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

const ChallengeContext = createContext();

export const ChallengeProvider = ({ children }) => {
    const { t } = useTranslation();
    const [pendingChallengeCount, setPendingChallengeCount] = useState(0);
    const location = useLocation();

    const fetchChallengesAndNotify = useCallback(async (showToast = false) => {
        const userInfo = localStorage.getItem('userInfo');
        if (!userInfo) {
            setPendingChallengeCount(0);
            return;
        }

        try {
            const { data: userChallenges } = await api.fetchUserChallenges();
            const pendingCount = userChallenges.filter(c => c.status === 'pending').length;
            setPendingChallengeCount(pendingCount);

            if (pendingCount > 0 && showToast) {
                toast.error(t('challenges.pendingReminder'), {
                    icon: '⏰',
                    duration: 5000,
                });
            }
        } catch (error) {
            console.error("Failed to fetch user challenges for notification:", error);
        }
    }, [t]);

    // ==========================================================
    // HIỆU CHỈNH LỚN Ở ĐÂY: TÁCH RA THÀNH 2 useEffect RIÊNG BIỆT
    // ==========================================================

    // useEffect 1: Chỉ chạy MỘT LẦN khi Provider được tạo.
    // Dùng để kiểm tra lần đầu và hẹn giờ kiểm tra định kỳ.
    useEffect(() => {
        const userInfo = localStorage.getItem('userInfo');
        if (!userInfo) return; // Nếu chưa đăng nhập thì không làm gì cả

        // 1. Kiểm tra lần đầu sau 2 giây (có hiển thị thông báo)
        const initialCheckTimeout = setTimeout(() => {
            fetchChallengesAndNotify(true);
        }, 2000);

        // 2. Thiết lập kiểm tra định kỳ mỗi 3 giờ (có hiển thị thông báo)
        const interval = setInterval(() => {
            fetchChallengesAndNotify(true);
        }, 3 * 60 * 60 * 1000); // 3 giờ

        // 3. Hàm dọn dẹp để tránh rò rỉ bộ nhớ
        return () => {
            clearTimeout(initialCheckTimeout);
            clearInterval(interval);
        };
    }, []); // <-- Dependency rỗng đảm bảo nó chỉ chạy 1 lần duy nhất

    // useEffect 2: Chạy mỗi khi chuyển trang (location.key thay đổi).
    // Dùng để cập nhật số trên icon ở Sidebar mà KHÔNG hiện thông báo.
    useEffect(() => {
        const userInfo = localStorage.getItem('userInfo');
        if (userInfo) {
            // Cập nhật thầm lặng số lượng mỗi khi người dùng chuyển trang
            fetchChallengesAndNotify(false); 
        }
    }, [location.key, fetchChallengesAndNotify]);

    const value = {
        pendingChallengeCount,
        refetchChallenges: fetchChallengesAndNotify,
    };

    return (
        <ChallengeContext.Provider value={value}>
            {children}
        </ChallengeContext.Provider>
    );
};

export const useChallengeNotifications = () => {
    return useContext(ChallengeContext);
};