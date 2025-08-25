// src/components/CurrencySwitcher.js

import React from 'react';
import { useCurrency } from '../contexts/CurrencyContext';

const CurrencySwitcher = () => {
  const { currency, toggleCurrency, exchangeRate } = useCurrency();

  // Không hiển thị gì nếu chưa có tỉ giá
  if (!exchangeRate) {
    return null;
  }

  return (
    <button
      onClick={toggleCurrency}
      className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none"
      title={`Switch to ${currency === 'VND' ? 'AUD' : 'VND'}`}
    >
      {currency}
    </button>
  );
};

export default CurrencySwitcher;