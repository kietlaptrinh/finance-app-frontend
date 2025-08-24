// src/contexts/CurrencyContext.js

import React, { createContext, useState, useContext, useEffect } from 'react';
import toast from 'react-hot-toast';

// 1. Khởi tạo Context
const CurrencyContext = createContext();

// 2. Tạo Provider Component
export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrency] = useState('VND'); // Mặc định là VND
  const [exchangeRate, setExchangeRate] = useState(null); // Tỉ giá 1 AUD sang VND

  // 3. Lấy tỉ giá hối đoái từ một API miễn phí khi ứng dụng khởi động
  useEffect(() => {
    const fetchExchangeRate = async () => {
      try {
        // API này không cần key, lấy tỉ giá từ AUD
        const response = await fetch('https://api.exchangerate-api.com/v4/latest/AUD');
        const data = await response.json();
        setExchangeRate(data.rates.VND); // Lưu lại tỉ giá AUD -> VND
      } catch (error) {
        console.error("Failed to fetch exchange rate:", error);
        toast.error("Không thể tải tỉ giá hối đoái.");
      }
    };
    fetchExchangeRate();
  }, []);

  // 4. Hàm để chuyển đổi tiền tệ
  const toggleCurrency = () => {
    setCurrency((prevCurrency) => (prevCurrency === 'VND' ? 'AUD' : 'VND'));
  };

  // 5. Cung cấp state và hàm cho các component con
  const value = {
    currency,
    toggleCurrency,
    exchangeRate,
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
};

// 6. Tạo một custom hook để sử dụng Context dễ dàng hơn
export const useCurrency = () => {
  return useContext(CurrencyContext);
};