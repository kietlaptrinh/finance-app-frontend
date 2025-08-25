import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import * as api from '../api/api';
import toast from 'react-hot-toast';
import Modal from '../components/Modal';
import Sidebar from '../components/Sidebar';
import { useTranslation } from 'react-i18next';
import Header from '../components/Header';
import { useCurrency } from '../contexts/CurrencyContext';
import { formatAndConvertCurrency } from '../utils/formatCurrency';
import DepositToGoalForm from '../components/DepositToGoalForm';


const SavingGoalForm = ({ onSuccess, onCancel, goal = null }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    targetAmount: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (goal) {
      setFormData({
        name: goal.name,
        targetAmount: goal.targetAmount,
        startDate: goal.startDate,
        endDate: goal.endDate || '',
      });
    }
  }, [goal]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (goal) {
        await api.updateSavingGoal(goal.goalId, formData);
        toast.success(t('savingGoals.updated'));
      } else {
        await api.createSavingGoal(formData);
        toast.success(t('savingGoals.created'));
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
      <h2 className="text-xl font-bold">{goal ? t('savingGoals.edit') : t('savingGoals.create')}</h2>
      <div>
        <label className="text-sm font-medium text-gray-700">{t('savingGoals.name')}</label>
        <input
          name="name"
          type="text"
          value={formData.name}
          onChange={handleChange}
          required
          className="mt-1 w-full px-4 py-2 border rounded-lg"
        />
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700">{t('savingGoals.targetAmount')}</label>
        <input
          name="targetAmount"
          type="number"
          value={formData.targetAmount}
          onChange={handleChange}
          required
          min="0"
          className="mt-1 w-full px-4 py-2 border rounded-lg"
        />
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700">{t('savingGoals.startDate')}</label>
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
        <label className="text-sm font-medium text-gray-700">{t('savingGoals.endDate')}</label>
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
          {t('savingGoals.cancel')}
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-blue-300"
        >
          {loading ? t('savingGoals.saving') : goal ? t('savingGoals.update') : t('savingGoals.create')}
        </button>
      </div>
    </form>
  );
};

export default function SavingGoalsPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { currency, exchangeRate } = useCurrency();
  const [goals, setGoals] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
    const [goalToDeposit, setGoalToDeposit] = useState(null);

  

    const fetchData = useCallback(async () => {
      setLoading(true);
      try {
        const { data } = await api.fetchSavingGoals();
        setGoals(data);
      } catch (err) {
        toast.error(t('errors.fetchGoals'));
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
    setSelectedGoal(null);
    setIsDepositModalOpen(false);
    setGoalToDeposit(null);
    setLoading(true);
    fetchData();
    api
      .fetchSavingGoals()
      .then(({ data }) => setGoals(data))
      .catch(() => toast.error(t('errors.fetchGoals')))
      .finally(() => setLoading(false));
  };

  const handleDelete = async (id) => {
    setLoading(true);
    try {
      await api.deleteSavingGoal(id);
      toast.success(t('savingGoals.deleted'));
      setGoals(goals.filter((g) => g.goalId !== id));
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
        <main className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-gray-900">{t('savingGoals.title')}</h2>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-blue-300"
              disabled={loading}
            >
              {t('savingGoals.addGoal')}
            </button>
          </div>
          <div className="bg-white shadow rounded-lg p-6">
            {loading ? (
              <p className="text-center text-gray-500">{t('loading')}</p>
            ) : goals.length === 0 ? (
              <p className="text-center text-gray-500">{t('savingGoals.noGoals')}</p>
            ) : (
              <ul className="divide-y divide-gray-200">
                  {goals.map((goal) => {
                    // <<< THAY ĐỔI 4: Tạo biến chứa số tiền đã định dạng
                    const formattedCurrent = exchangeRate
                      ? formatAndConvertCurrency(parseFloat(goal.currentAmount || 0), currency, exchangeRate)
                      : `${parseFloat(goal.currentAmount || 0).toLocaleString('vi-VN')}`;
                    
                    const formattedTarget = exchangeRate
                      ? formatAndConvertCurrency(parseFloat(goal.targetAmount || 0), currency, exchangeRate)
                      : `${parseFloat(goal.targetAmount || 0).toLocaleString('vi-VN')}`;

                    return (
                      <li key={goal.goalId} className="py-4 flex justify-between items-center">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{goal.name}</p>
                          {/* <<< THAY ĐỔI 5: Cập nhật cách hiển thị */}
                          <p className="text-sm text-gray-500">
                            {formattedCurrent} / {formattedTarget} {currency === 'VND' && 'VND'} (
                            {(goal.progressPercentage || 0).toFixed(2)}%)
                          </p>
                        </div>
                       <div className="flex items-center space-x-2">
                          <button
                                                    onClick={() => {
                                                        setGoalToDeposit(goal);
                                                        setIsDepositModalOpen(true);
                                                    }}
                                                    title={t('savingGoals.depositFor', { name: goal.name })}
                                                    className="p-2 rounded-full hover:bg-pink-100 transition-colors"
                                                >
                                                    <span role="img" aria-label="deposit" className="text-2xl animate-bounce">🐖</span>
                                                </button>
                          <button
                            onClick={() => {
                              setSelectedGoal(goal);
                              setIsModalOpen(true);
                            }}
                            className="text-blue-600 hover:text-blue-800"
                            disabled={loading}
                          >
                            {t('savingGoals.editButton')}
                          </button>
                          <button
                            onClick={() => handleDelete(goal.goalId)}
                            className="text-red-600 hover:text-red-800"
                            disabled={loading}
                          >
                            {t('savingGoals.delete')}
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
            )}
          </div>
        </div>
        <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setSelectedGoal(null); }}>
          <SavingGoalForm onSuccess={handleSuccess} onCancel={() => { setIsModalOpen(false); setSelectedGoal(null); }} goal={selectedGoal} />
        </Modal>
        <Modal isOpen={isDepositModalOpen} onClose={() => setIsDepositModalOpen(false)}>
                    <DepositToGoalForm goal={goalToDeposit} onSuccess={handleSuccess} onCancel={() => setIsDepositModalOpen(false)} />
                </Modal>
        </main>
      </div>
    </div>
  );
}