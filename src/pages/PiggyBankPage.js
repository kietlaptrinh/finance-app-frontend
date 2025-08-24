import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as api from '../api/api';
import toast from 'react-hot-toast';
import Modal from '../components/Modal';
import Sidebar from '../components/Sidebar';
import { useTranslation } from 'react-i18next';
import Header from '../components/Header';
import { useCurrency } from '../contexts/CurrencyContext';
import { formatAndConvertCurrency } from '../utils/formatCurrency';

const PiggyDepositForm = ({ onSuccess, onCancel }) => {
  const { t } = useTranslation();
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Chuyển đổi amount thành số và kiểm tra
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      toast.error(t('piggyBank.invalidAmount'));
      setLoading(false);
      return;
    }

    try {
      // Gửi amount dưới dạng số
      await api.depositToPiggy({ amount: parsedAmount });
      toast.success(t('piggyBank.deposited'));
      onSuccess();
    } catch (err) {
      console.error('Deposit error:', err.response?.data);
      toast.error(err.response?.data?.message || t('errors.operationFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-bold">{t('piggyBank.deposit')}</h2>
      <div>
        <label className="text-sm font-medium text-gray-700">{t('piggyBank.amount')}</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
          min="0.01"
          step="0.01"
          className="mt-1 w-full px-4 py-2 border rounded-lg"
          placeholder={t('piggyBank.enterAmount')}
        />
      </div>
      <div className="flex justify-end space-x-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
          disabled={loading}
        >
          {t('piggyBank.cancel')}
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-blue-300"
        >
          {loading ? t('piggyBank.depositing') : t('piggyBank.deposit')}
        </button>
      </div>
    </form>
  );
};

export default function PiggyBankPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { currency, exchangeRate } = useCurrency();
  const [piggy, setPiggy] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    if (!userInfo) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        const { data } = await api.fetchPiggyBank();
        setPiggy(data);
      } catch (err) {
        toast.error(t('errors.fetchPiggyBank'));
        if (err.response?.status === 401) {
          localStorage.removeItem('userInfo');
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate, t]);

  const handleDepositSuccess = async () => {
    setIsModalOpen(false);
    setLoading(true);
    try {
      const month = new Date().getMonth() + 1;
      const year = new Date().getFullYear();
      await Promise.all([
        api.fetchPiggyBank().then(({ data }) => setPiggy(data)),
        api.fetchDashboardSummary(month, year) 
      ]);
      toast.success(t('piggyBank.deposited'));
    } catch (err) {
      toast.error(t('errors.fetchPiggyBank'));
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
          <h2 className="text-3xl font-bold text-gray-900 mb-6">{t('piggyBank.title')}</h2>
          {loading ? (
            <p className="text-center text-gray-500">{t('loading')}</p>
          ) : !piggy ? (
            <p className="text-center text-gray-500">{t('piggyBank.noData')}</p>
          ) : (
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center space-x-4">
                <div className="text-4xl">
                  {piggy.status === 'happy' ? '😊' : piggy.status === 'sad' ? '😢' : '😐'}
                </div>
                <div>
                  <p className="text-lg font-medium text-gray-900">
    {t('piggyBank.saved')}:{' '}
    {exchangeRate
        // Thêm parseFloat() để đảm bảo savedAmount là một con số
        ? formatAndConvertCurrency(parseFloat(piggy.savedAmount || 0), currency, exchangeRate)
        : `${parseFloat(piggy.savedAmount || 0).toLocaleString('vi-VN')} VND`
    }
</p>
                  <p className="text-sm text-gray-500">
                    {t('piggyBank.status')}: {t(`piggyBank.statuses.${piggy.status}`)}
                  </p>
                  {piggy.decorations && (
                    <p className="text-sm text-gray-500">
                      {t('piggyBank.decorations')}: {piggy.decorations}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(true)}
                className="mt-4 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-blue-300"
                disabled={loading}
              >
                {t('piggyBank.deposit')}
              </button>
            </div>
          )}
        </div>
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
          <PiggyDepositForm onSuccess={handleDepositSuccess} onCancel={() => setIsModalOpen(false)} />
        </Modal>
        </main>
      </div>
    </div>
  );
}