import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import * as api from '../api/api';
import toast from 'react-hot-toast';
import Modal from '../components/Modal';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { useTranslation } from 'react-i18next';
import { useCurrency } from '../contexts/CurrencyContext';
import { formatAndConvertCurrency } from '../utils/formatCurrency';



const BudgetForm = ({ onSuccess, onCancel, budget = null }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    categoryId: '',
    amount: '',
    period: 'monthly',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const isPointsHarvest = formData.period === 'points_harvest';
  useEffect(() => {
        if (isPointsHarvest) {
            setFormData(prev => ({ ...prev, amount: '0' }));
        }
    }, [isPointsHarvest]);

  useEffect(() => {
    if (budget) {
      setFormData({
        categoryId: budget.categoryId,
        amount: budget.amount,
        period: budget.period,
        startDate: budget.startDate,
        endDate: budget.endDate || '',
      });
    }
    const fetchCategories = async () => {
      try {
        const { data } = await api.fetchCategories();
        setCategories(data);
      } catch (err) {
        toast.error(t('errors.fetchCategories'));
      }
    };
    fetchCategories();
  }, [budget, t]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (budget) {
        await api.updateBudget(budget.budgetId, formData);
        toast.success(t('budgets.updated'));
      } else {
        await api.createBudget(formData);
        toast.success(t('budgets.created'));
      }
      onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.message || t('errors.operationFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-bold">{budget ? t('budgets.edit') : t('budgets.create')}</h2>
      <div>
        <label className="text-sm font-medium text-gray-700">{t('budgets.category')}</label>
        <select
          name="categoryId"
          value={formData.categoryId}
          onChange={handleChange}
          required
          className="mt-1 w-full px-4 py-2 border rounded-lg"
        >
          <option value="">{t('budgets.selectCategory')}</option>
          {categories.map((cat) => (
            <option key={cat.categoryId} value={cat.categoryId}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700">{t('budgets.amount')}</label>
        <input
          name="amount"
          type="number"
          value={formData.amount}
          onChange={handleChange}
          required
          min="0"
          disabled={isPointsHarvest}
                    readOnly={isPointsHarvest}
                    className={`mt-1 w-full px-4 py-2 border rounded-lg ${isPointsHarvest ? 'bg-gray-200' : ''}`}
        />
        {isPointsHarvest && <p className="text-xs text-gray-500 mt-1">{t('budgets.pointsHarvestNote')}</p>}
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700">{t('budgets.period')}</label>
        <select
          name="period"
          value={formData.period}
          onChange={handleChange}
          className="mt-1 w-full px-4 py-2 border rounded-lg"
        >
          <option value="monthly">{t('budgets.monthly')}</option>
          <option value="weekly">{t('budgets.weekly')}</option>
          <option value="yearly">{t('budgets.yearly')}</option>
          <option value="points_harvest">{t('budgets.pointsHarvest')}</option>
        </select>
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700">{t('budgets.startDate')}</label>
        <input
          name="startDate"
          type="date"
          value={formData.startDate}
          onChange={handleChange}
          required
          className="mt-1 w-full px-4 py-2 border rounded-lg"
        />
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700">{t('budgets.endDate')}</label>
        <input
          name="endDate"
          type="date"
          value={formData.endDate}
          onChange={handleChange}
          className="mt-1 w-full px-4 py-2 border rounded-lg"
        />
      </div>
      <div className="flex justify-end space-x-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
        >
          {t('budgets.cancel')}
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-blue-300"
        >
          {loading ? t('budgets.saving') : budget ? t('budgets.update') : t('budgets.create')}
        </button>
      </div>
    </form>
  );
};

export default function BudgetsPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { currency, exchangeRate } = useCurrency();
  const [budgets, setBudgets] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await api.fetchBudgets();
            setBudgets(data);
        } catch (err) {
            toast.error(t('errors.fetchBudgets'));
            if (err.response?.status === 401) {
                localStorage.removeItem('userInfo');
                navigate('/login');
            }
        } finally {
            setLoading(false);
        }
    }, [navigate, t]);

    useEffect(() => {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        if (!userInfo) {
            navigate('/login');
            return;
        }
        fetchData();
    }, [fetchData, navigate]);

  const handleSuccess = () => {
    setIsModalOpen(false);
    setSelectedBudget(null);
    setLoading(true);
    api
      .fetchBudgets()
      .then(({ data }) => setBudgets(data))
      .catch(() => toast.error(t('errors.fetchBudgets')))
      .finally(() => setLoading(false));
  };

  const handleDelete = async (id) => {
    setLoading(true);
    try {
      await api.deleteBudget(id);
      toast.success(t('budgets.deleted'));
      setBudgets(budgets.filter((b) => b.budgetId !== id));
    } catch (err) {
      toast.error(err.response?.data?.message || t('errors.operationFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
        <div className="min-h-screen bg-gray-50 flex">
            <Sidebar />
            <div className="flex-1 md:pl-64 pt-16">
                <Header />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-3xl font-bold text-gray-900">{t('budgets.title')}</h2>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                        >
                            {t('budgets.addBudget')}
                        </button>
                    </div>
                    <div className="bg-white shadow rounded-lg p-6">
                        {loading ? (
                            <p className="text-center text-gray-500">{t('loading')}</p>
                        ) : budgets.length === 0 ? (
                            <p className="text-center text-gray-500">{t('budgets.noBudgets')}</p>
                        ) : (
                            <ul className="divide-y divide-gray-200">
                                {budgets.map((budget) => {
                                    // <<< THAY ĐỔI: Logic hiển thị số tiền được cập nhật tại đây
                                    const isAdjusted = budget.adjustedAmount !== null && budget.adjustedAmount !== undefined;
                                    const displayAmount = isAdjusted ? budget.adjustedAmount : budget.amount;
                                    
                                    const formattedDisplayAmount = exchangeRate
                                        ? formatAndConvertCurrency(parseFloat(displayAmount || 0), currency, exchangeRate)
                                        : `${parseFloat(displayAmount || 0).toLocaleString('vi-VN')} VND`;

                                    const formattedOriginalAmount = exchangeRate
                                        ? formatAndConvertCurrency(parseFloat(budget.amount || 0), currency, exchangeRate)
                                        : `${parseFloat(budget.amount || 0).toLocaleString('vi-VN')} VND`;

                                    return (
                                        <li key={budget.budgetId} className="py-4 flex justify-between items-center">
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">{budget.Category?.name || 'Unknown'}</p>
                                                <p className="text-sm text-gray-500">
                                                    <span className={isAdjusted ? "font-bold text-blue-600" : ""}>
                                                        {formattedDisplayAmount}
                                                    </span>
                                                    {isAdjusted && (
                                                        <span className="line-through ml-2 text-gray-400">
                                                            {formattedOriginalAmount}
                                                        </span>
                                                    )}
                                                    {' '}({t(`budgets.${budget.period}`)})
                                                </p>
                                            </div>
                                            <div className="space-x-2">
                                                <button
                                                    onClick={() => {
                                                        setSelectedBudget(budget);
                                                        setIsModalOpen(true);
                                                    }}
                                                    className="text-blue-600 hover:text-blue-800"
                                                >
                                                    {t('budgets.editButton')}
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(budget.budgetId)}
                                                    className="text-red-600 hover:text-red-800"
                                                >
                                                    {t('budgets.delete')}
                                                </button>
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </div>
                </div>
                <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setSelectedBudget(null); }}>
                    <BudgetForm onSuccess={handleSuccess} onCancel={() => { setIsModalOpen(false); setSelectedBudget(null); }} budget={selectedBudget} />
                </Modal>
            </div>
        </div>
    );
}