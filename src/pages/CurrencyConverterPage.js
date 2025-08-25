import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as api from '../api/api';
import toast from 'react-hot-toast';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Sidebar from '../components/Sidebar';
import { useTranslation } from 'react-i18next';
import Header from '../components/Header';


const CurrencyConverterPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    from: 'USD',
    to: 'VND',
    amount: '',
  });
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [historicalRates, setHistoricalRates] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    if (!userInfo) {
      navigate('/login');
      return;
    }

    const fetchHistory = async () => {
      setLoading(true);
      try {
        const { data } = await api.fetchConversionsHistory();
        setHistory(data);
      } catch (err) {
        toast.error(t('errors.fetchConversionHistory'));
        if (err.response?.status === 401) {
          localStorage.removeItem('userInfo');
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [navigate, t]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleConvert = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.convertCurrency(formData);
      setResult(data);
      const { data: historyData } = await api.fetchConversionsHistory();
      setHistory(historyData);
      toast.success(t('currencyConverter.converted'));
    } catch (err) {
      toast.error(err.response?.data?.message || t('currencyConverter.failed'));
    } finally {
      setLoading(false);
    }
  };

  // frontend/src/pages/CurrencyConverterPage.js
// frontend/src/pages/CurrencyConverterPage.js
// frontend/src/pages/CurrencyConverterPage.js

const fetchHistorical = async () => {
    setLoading(true);
    try {
        const rates = [];
        let currentDate = new Date();
        let attempts = 0; // <<< THAY ĐỔI 1: Thêm biến đếm an toàn
        const maxAttempts = 60; // Giới hạn số ngày lùi lại để tránh vòng lặp vô hạn

        while (rates.length < 5 && attempts < maxAttempts) {
            currentDate.setDate(currentDate.getDate() - 1);
            
            if (currentDate.getDay() !== 0 && currentDate.getDay() !== 6) { // Bỏ qua T7, CN
                const dateStr = currentDate.toISOString().split('T')[0];
                try {
                    const { data } = await api.fetchHistoricalRates({
                        from: formData.from,
                        to: formData.to,
                        date: dateStr,
                    });
                    if (data && data.rate !== null) {
                        rates.push({ date: dateStr, rate: data.rate });
                    }
                } catch (singleDayError) {
                    console.warn(`Could not fetch rate for ${dateStr}, skipping.`);
                }
            }
            
            attempts++; // <<< THAY ĐỔI 2: Tăng biến đếm sau mỗi lần lặp
        }
        
        if (attempts >= maxAttempts && rates.length < 5) {
            toast.error(t('errors.notEnoughHistoricalData'));
        }

        rates.sort((a, b) => new Date(a.date) - new Date(b.date));
        setHistoricalRates(rates);
        
        if (rates.length > 0) {
            toast.success(t('currencyConverter.ratesFetched'));
        }

    } catch (err) {
        toast.error(err.response?.data?.message || t('errors.fetchHistoricalRates'));
    } finally {
        setLoading(false);
    }
};

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <div className="flex-1 md:pl-64 pt-16">
        <Header />
        <main className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">{t('currencyConverter.title')}</h2>
          {loading ? (
            <p className="text-center text-gray-500">{t('loading')}</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">{t('currencyConverter.convert')}</h3>
                <form onSubmit={handleConvert} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">{t('currencyConverter.from')}</label>
                    <input
                      name="from"
                      type="text"
                      value={formData.from}
                      onChange={handleChange}
                      required
                      className="mt-1 w-full px-4 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">{t('currencyConverter.to')}</label>
                    <input
                      name="to"
                      type="text"
                      value={formData.to}
                      onChange={handleChange}
                      required
                      className="mt-1 w-full px-4 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">{t('currencyConverter.amount')}</label>
                    <input
                      name="amount"
                      type="number"
                      value={formData.amount}
                      onChange={handleChange}
                      required
                      min="0"
                      className="mt-1 w-full px-4 py-2 border rounded-lg"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-blue-300"
                  >
                    {loading ? t('currencyConverter.converting') : t('currencyConverter.convert')}
                  </button>
                </form>
                {result && (
                  <p className="mt-4 text-sm text-gray-900">
                    {result.amount} {result.from} = {result.result.toLocaleString('vi-VN')} {result.to}
                  </p>
                )}
              </div>
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">{t('currencyConverter.conversionHistory')}</h3>
                {history.length === 0 ? (
                  <p className="text-sm text-gray-500">{t('currencyConverter.noHistory')}</p>
                ) : (
                  <ul className="divide-y divide-gray-200">
                    {history.slice(0, 5).map((conv) => (
                      <li key={conv.conversionId} className="py-2">
                        <p className="text-sm text-gray-500">
                          {conv.amount} {conv.fromCurrency} → {conv.result.toLocaleString('vi-VN')} {conv.toCurrency} (
                          {new Date(conv.conversionDate).toLocaleDateString('vi-VN')})
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
                <button
                  onClick={fetchHistorical}
                  className="mt-4 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-blue-300"
                  disabled={loading}
                >
                  {t('currencyConverter.viewHistoricalRates')}
                </button>
                {historicalRates.length > 0 && (
                  <div className="mt-4">
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart data={historicalRates}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip formatter={(value) => value.toLocaleString('vi-VN')} />
                        <Line type="monotone" dataKey="rate" stroke="#8884d8" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        </main>
      </div>
    </div>
  );
};

export default CurrencyConverterPage;