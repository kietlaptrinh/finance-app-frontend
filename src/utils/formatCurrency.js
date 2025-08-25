/**
 * Định dạng và chuyển đổi số tiền để hiển thị.
 * Mặc định số tiền đầu vào là AUD.
 * @param {number} amount - Số tiền gốc (luôn là AUD)
 * @param {string} displayCurrency - Đơn vị tiền tệ muốn hiển thị ('AUD' hoặc 'VND')
 * @param {number} exchangeRate - Tỷ giá từ AUD sang VND
 * @returns {string} - Chuỗi đã định dạng
 */
export const formatAndConvertCurrency = (amount, displayCurrency, exchangeRate) => {
    if (typeof amount !== 'number' || !displayCurrency) {
        return '';
    }

    // <<< LOGIC ĐÃ ĐƯỢC CẬP NHẬT >>>
    let displayAmount = amount;
    let currencyCode = 'AUD';
    let locale = 'en-AU'; // Locale cho đô la Úc

    // Chỉ chuyển đổi nếu người dùng muốn xem VND và có tỷ giá
    if (displayCurrency === 'VND' && exchangeRate) {
        displayAmount = amount * exchangeRate;
        currencyCode = 'VND';
        locale = 'vi-VN'; // Locale cho Việt Nam Đồng
    }

    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currencyCode,
    }).format(displayAmount);
};