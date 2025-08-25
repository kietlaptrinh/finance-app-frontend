import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as api from '../api/api';
import toast from 'react-hot-toast';
import Modal from '../components/Modal';
import Sidebar from '../components/Sidebar';
import { useTranslation } from 'react-i18next';
import Header from '../components/Header';
import BudgetRuleForm from '../components/BudgetRuleForm'; 
import { useCallback } from 'react';



const CategoryForm = ({ onSuccess, onCancel }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    type: 'expense',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.createCategory(formData);
      toast.success(t('settings.categoryCreated'));
      onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.message || t('errors.operationFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-bold">{t('settings.createCategory')}</h2>
      <div>
        <label className="text-sm font-medium text-gray-700">{t('settings.categoryName')}</label>
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
        <label className="text-sm font-medium text-gray-700">{t('settings.categoryType')}</label>
        <select
          name="type"
          value={formData.type}
          onChange={handleChange}
          className="mt-1 w-full px-4 py-2 border rounded-lg"
        >
          <option value="expense">{t('settings.expense')}</option>
          <option value="income">{t('settings.income')}</option>
        </select>
      </div>
      <div className="flex justify-end space-x-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
        >
          {t('settings.cancel')}
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-blue-300"
        >
          {loading ? t('settings.saving') : t('settings.createCategory')}
        </button>
      </div>
    </form>
  );
};

export default function SettingsPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [settings, setSettings] = useState(null);
  const [categories, setCategories] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [budgetRules, setBudgetRules] = useState([]);
  const [isRuleModalOpen, setIsRuleModalOpen] = useState(false);



    const fetchData = useCallback(async () => {
      setLoading(true);
      try {
        const [settingsRes, categoriesRes, challengesRes, rulesRes] = await Promise.all([
          api.fetchSettings(),
          api.fetchCategories(),
          api.fetchChallenges(),
          api.fetchBudgetRules(),
        ]);
        setSettings(settingsRes.data);
        setCategories(categoriesRes.data);
        setChallenges(challengesRes.data);
        setBudgetRules(rulesRes.data);
        
        localStorage.setItem('settings', JSON.stringify(settingsRes.data));
            if (settingsRes.data.moodBasedTheme) {
                document.body.className = `theme-${settingsRes.data.currentMood || 'productive'}`;
            } else {
                document.body.className = '';
            }
        } catch (err) {
            console.error('Fetch data error:', err);
            toast.error(t('errors.fetchSettings'));
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

  const handleDeleteChallenge = async (userChallengeId) => {
  if (window.confirm(t('settings.confirmDeleteChallenge'))) {
    setLoading(true);
    try {
      await api.deleteChallenge(userChallengeId);
      toast.success(t('settings.challengeDeleted'));
      const updatedChallengesRes = await api.fetchChallenges();
      setChallenges(updatedChallengesRes.data);
    } catch (err) {
      console.error('Delete challenge error:', err);
      toast.error(err.response?.data?.message || t('errors.operationFailed'));
    } finally {
      setLoading(false);
    }
  }
};

  const handleUpdateSettings = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.target);
    const data = {
      moodBasedTheme: formData.get('moodBasedTheme') === 'on',
      currentMood: formData.get('currentMood'),
      calendarSyncUrl: formData.get('calendarSyncUrl'),
      preferredCurrency: formData.get('preferredCurrency'),
    };
    console.log('Updating settings with data:', data);
    try {
      await api.updateSettings(data);
      toast.success(t('settings.updated'));
      const { data: updatedSettings } = await api.fetchSettings();
      setSettings(updatedSettings);
      localStorage.setItem('settings', JSON.stringify(updatedSettings));
      console.log('Updated settings from update:', updatedSettings);
      if (data.moodBasedTheme) {
        document.body.className = `theme-${data.currentMood || 'productive'}`;
      } else {
        document.body.className = '';
      }
    } catch (err) {
      console.error('Update settings error:', err);
      toast.error(err.response?.data?.message || t('errors.operationFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteChallenge = async (userChallengeId) => {
    setLoading(true);
    try {
      console.log('Attempting to complete challenge with userChallengeId:', userChallengeId);
      const result = await api.completeChallenge(userChallengeId); 
      console.log('Challenge completion result:', result);
      const points = result.data.points || 0;
      const message = t('settings.challengeCompleted', { points }); 
      toast.success(message);
      // Force fetch mới nhất từ server
      const [updatedSettingsRes, updatedChallengesRes] = await Promise.all([
        api.fetchSettings(),
        api.fetchChallenges(),
      ]);
      console.log('Fetched settings after completion:', updatedSettingsRes.data);
      // Cập nhật toàn bộ state settings
      setSettings(updatedSettingsRes.data);
      setChallenges(updatedChallengesRes.data);
      localStorage.setItem('settings', JSON.stringify(updatedSettingsRes.data));
    } catch (err) {
      console.error('Complete challenge error:', err);
      toast.error(err.response?.data?.message || t('errors.operationFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleConvertPoints = async () => {
    const pointsToConvert = prompt(t('settings.enterPointsToConvert'), '100');
    if (!pointsToConvert) return;
    const points = parseInt(pointsToConvert);
    if (isNaN(points) || points < 100 || points % 100 !== 0) {
      toast.error(t('settings.invalidPoints'));
      return;
    }
    if (window.confirm(t('settings.confirmConvertPoints', { points, amount: (points / 100) * 10000 }))) {
      setLoading(true);
      try {
        const result = await api.convertPointsToBalance(points);
        toast.success(t('settings.pointsConverted', { amount: result.data.balance }));
        const updatedSettings = await api.fetchSettings();
        setSettings(updatedSettings.data);
        localStorage.setItem('settings', JSON.stringify(updatedSettings.data));
      } catch (err) {
        toast.error(err.response?.data?.message || t('errors.operationFailed'));
      } finally {
        setLoading(false);
      }
    }
  };

  const handleExportData = async () => {
    setLoading(true);
    try {
      const { data } = await api.exportData();
      const csv = ['Transaction ID,Category,Amount,Date,Type,Note'].concat(
        data.map((t) => `${t.transactionId},${t.Category?.name || 'Unknown'},${t.amount},${t.transactionDate},${t.type},${t.note || ''}`)
      ).join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'transactions.csv';
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success(t('settings.exported'));
    } catch (err) {
      toast.error(err.response?.data?.message || t('errors.operationFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm(t('settings.confirmDeleteAccount'))) {
      setLoading(true);
      try {
        await api.deleteAccount();
        localStorage.removeItem('userInfo');
        localStorage.removeItem('settings');
        toast.success(t('settings.accountDeleted'));
        navigate('/login');
      } catch (err) {
        toast.error(err.response?.data?.message || t('errors.operationFailed'));
      } finally {
        setLoading(false);
      }
    }
  };

  const handleRuleSuccess = () => {
        setIsRuleModalOpen(false);
        fetchData();
    };

    const handleDeleteRule = async (ruleId) => {
        if (window.confirm("Bạn có chắc muốn xóa quy tắc này?")) {
            try {
                await api.deleteBudgetRule(ruleId);
                toast.success("Đã xóa quy tắc.");
                fetchData();
            } catch (err) {
                toast.error("Xóa quy tắc thất bại.");
            }
        }
    };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <div className="flex-1 md:pl-64 pt-16">
        <Header />
        <main className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">{t('settings.title')}</h2>
          {loading ? (
            <p className="text-center text-gray-500">{t('loading')}</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">{t('settings.generalSettings')}</h3>
                {settings && (
                  <form onSubmit={handleUpdateSettings} className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">{t('settings.moodBasedTheme')}</label>
                      <input
                        type="checkbox"
                        name="moodBasedTheme"
                        defaultChecked={settings.moodBasedTheme}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">{t('settings.currentMood')}</label>
                      <select
                        name="currentMood"
                        defaultValue={settings.currentMood}
                        className="mt-1 w-full px-4 py-2 border rounded-lg"
                      >
                        <option value="happy">{t('settings.moods.happy')}</option>
                        <option value="sad">{t('settings.moods.sad')}</option>
                        <option value="productive">{t('settings.moods.productive')}</option>
                        <option value="relaxed">{t('settings.moods.relaxed')}</option>
                      </select>
                    </div>

                    <div>
                                                <label className="text-sm font-medium text-gray-700">{t('settings.calendarSyncUrl')}</label>
                                                <input
                                                    name="calendarSyncUrl"
                                                    type="url"
                                                    defaultValue={settings.calendarSyncUrl}
                                                    placeholder="Dán link .ics từ lịch của bạn"
                                                    className="mt-1 w-full px-4 py-2 border rounded-lg"
                                                />
                                            </div>

                    
                    <div>
                      <label className="text-sm font-medium text-gray-700">{t('settings.preferredCurrency')}</label>
                      <input
                        name="preferredCurrency"
                        type="text"
                        defaultValue={settings.preferredCurrency}
                        className="mt-1 w-full px-4 py-2 border rounded-lg"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-blue-300"
                    >
                      {loading ? t('settings.saving') : t('settings.saveSettings')}
                    </button>
                  </form>
                )}
              </div>

                <div className="bg-white shadow rounded-lg p-6">
                                    <div className="flex justify-between items-center mb-2">
                                        <h4 className="text-lg font-medium text-gray-900">{t('settings.autoBudgetRules')}</h4>
                                        <button onClick={() => setIsRuleModalOpen(true)} className="px-3 py-1 text-sm text-white bg-blue-600 rounded hover:bg-blue-700">
                                            {t('settings.addRule')}
                                        </button>
                                    </div>
                                    <ul className="divide-y divide-gray-200 mt-4">
                                        {budgetRules && budgetRules.length > 0 ? budgetRules.map(rule => (
                                            <li key={rule.ruleId} className="py-3 flex justify-between items-center text-sm">
                                                <span className="flex-1 pr-4">
                                                    {t('settings.rules.when')} **{rule.eventType}**, {t('settings.rules.budgetFor')} **{rule.Category?.name}** {t('settings.rules.will')} {rule.adjustmentValue > 0 ? t('settings.rules.increase') : t('settings.rules.decrease')} **{Math.abs(rule.adjustmentValue)}{rule.adjustmentType === 'percentage' ? '%' : ' VND'}**.
                                                </span>
                                                <button onClick={() => handleDeleteRule(rule.ruleId)} className="text-red-500 hover:text-red-700 font-medium">Xóa</button>
                                            </li>
                                        )) : <p className="text-sm text-gray-500">Chưa có quy tắc nào.</p>}
                                    </ul>
                                </div>

              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">{t('settings.categories')}</h3>
                <button
                  onClick={() => setIsCategoryModalOpen(true)}
                  className="mb-4 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-blue-300"
                  disabled={loading}
                >
                  {t('settings.addCategory')}
                </button>
                {categories.length === 0 ? (
                  <p className="text-sm text-gray-500">{t('settings.noCategories')}</p>
                ) : (
                  <ul className="divide-y divide-gray-200">
                    {categories.map((cat) => (
                      <li key={cat.categoryId} className="py-2">
                        <p className="text-sm text-gray-900">
                          {cat.name} ({t(`settings.${cat.type}`)}) {cat.isDefault ? `(${t('settings.default')})` : ''}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
                <h3 className="text-lg font-medium text-gray-900 mt-6 mb-4">{t('settings.challenges')}</h3>
                {challenges.length === 0 ? (
                  <p className="text-sm text-gray-500">{t('settings.noChallenges')}</p>
                ) : (
                  <ul className="divide-y divide-gray-200">
                    {challenges.map((challenge) => (
                      <li key={challenge.userChallengeId} className="py-2 flex justify-between items-center">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{challenge.description}</p>
                          <p className="text-sm text-gray-500">
                            {t('settings.challengeCategory')}: {challenge.category || 'N/A'} | 
                            {t('settings.points')}: {challenge.rewardPoints} | 
                            {t('settings.duration')}: {challenge.durationDays} {t('settings.days')}
                          </p>
                          <p className="text-sm text-gray-500">
                            {t('settings.startDate')}: {new Date(challenge.startDate).toLocaleDateString()} | 
                            {t('settings.endDate')}: {new Date(challenge.endDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          {challenge.status === 'pending' && (
                            <button
                              onClick={() => handleCompleteChallenge(challenge.userChallengeId)}
                              className="px-3 py-1 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:bg-green-300 mr-2"
                              disabled={loading}
                            >
                              {t('settings.completeChallenge')}
                            </button>
                          ) || challenge.status === 'completed' && (
                            <>
                              <span className="text-sm text-green-600 mr-2">{t('settings.completed')}</span>
                              <button
                                onClick={() => handleDeleteChallenge(challenge.userChallengeId)}
                                className="px-3 py-1 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:bg-red-300"
                                disabled={loading}
                              >
                                {t('settings.delete')}
                              </button>
                            </>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
                <h3 className="text-lg font-medium text-gray-900 mt-6 mb-4">{t('settings.rewards')}</h3>
                <p className="text-sm text-gray-900">
                  {t('settings.points')}: {settings ? settings.points : 0}
                </p>
                <p className="text-sm text-gray-900">
                  {t('settings.badges')}: {settings && settings.badges?.length ? settings.badges.join(', ') : t('settings.noBadges')}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                <button
                  onClick={handleConvertPoints}
                  className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700 disabled:bg-purple-300"
                  disabled={loading || (settings && settings.points < 100)}
                >
                  {t('settings.convertPoints')}
                  </button>
                <button
                  onClick={handleExportData}
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:bg-green-300"
                  disabled={loading}
                >
                  {t('settings.exportData')}
                </button>
                <button
                  onClick={handleDeleteAccount}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:bg-red-300"
                  disabled={loading}
                >
                  {t('settings.deleteAccount')}
                </button>
                </div>
              </div>
            </div>
          )}
        </div>
        <Modal isOpen={isCategoryModalOpen} onClose={() => setIsCategoryModalOpen(false)}>
          <CategoryForm
            onSuccess={() => {
              setIsCategoryModalOpen(false);
              setLoading(true);
              api
                .fetchCategories()
                .then(({ data }) => setCategories(data))
                .finally(() => setLoading(false));
            }}
            onCancel={() => setIsCategoryModalOpen(false)}
          />
        </Modal>

<Modal isOpen={isRuleModalOpen} onClose={() => setIsRuleModalOpen(false)}>
                        <BudgetRuleForm onSuccess={handleRuleSuccess} onCancel={() => setIsRuleModalOpen(false)} />
                    </Modal>

        </main>
      </div>
    </div>
  );
}