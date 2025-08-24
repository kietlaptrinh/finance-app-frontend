// src/utils/formatCurrency.js (ví dụ)

/**
 * Định dạng và chuyển đổi số tiền dựa trên đơn vị tiền tệ hiện tại
 * @param {number} amount - Số tiền gốc (luôn là VND)
 * @param {string} currency - Đơn vị tiền tệ hiện tại ('VND' hoặc 'AUD')
 * @param {number} exchangeRate - Tỉ giá từ AUD sang VND
 * @returns {string} - Chuỗi đã định dạng
 */
export const formatAndConvertCurrency = (amount, currency, exchangeRate) => {
  if (typeof amount !== 'number' || !currency || !exchangeRate) {
    return '';
  }

  let displayAmount = amount;
  let currencyCode = 'VND';

  if (currency === 'AUD') {
    displayAmount = amount / exchangeRate;
    currencyCode = 'AUD';
  }

  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 0,
  }).format(displayAmount);
};