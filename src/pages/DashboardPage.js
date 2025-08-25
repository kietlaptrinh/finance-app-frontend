import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import * as api from '../api/api';
import toast from 'react-hot-toast';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';
import TransactionForm from '../components/TransactionForm';
import Modal from '../components/Modal';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { useTranslation } from 'react-i18next';
import { useCurrency } from '../contexts/CurrencyContext'; 
import { formatAndConvertCurrency } from '../utils/formatCurrency';
import { useMemo } from 'react';

const SummaryCard = ({ title, amount, cardType}) => {
  const { currency, exchangeRate } = useCurrency();

  const formattedAmount = exchangeRate
    ? formatAndConvertCurrency(amount, currency, exchangeRate)
    : `${amount.toLocaleString('vi-VN')} VND`;
  
  const isNegative = currency === 'VND' ? amount < 0 : (amount / (exchangeRate || 1)) < 0;

  let colorClass = 'text-blue-600';
  if (cardType === 'income') colorClass = 'text-green-600';
  if (cardType === 'expense') colorClass = 'text-red-600';
  if (isNegative && cardType === 'balance') colorClass = 'text-red-600';


  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-sm font-medium text-gray-500">{title}</h3>
      <p className={`mt-1 text-3xl font-semibold ${colorClass}`}>
        {formattedAmount}
      </p>
    </div>
  );
};

export default function DashboardPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { currency, exchangeRate } = useCurrency(); 
  const [user, setUser] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [budgetRules, setBudgetRules] = useState([]);
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);

  const handleDeleteTransaction = async (id) => {
    try {
      await api.deleteTransaction(id);
      toast.success(t('transactions.deleted'));
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || t('errors.operationFailed'));
    }
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const month = new Date().getMonth() + 1;
      const year = new Date().getFullYear();
      const [analyticsRes, transactionsRes, rulesRes, eventsRes, categoriesRes] = await Promise.all([
        api.fetchDashboardSummary(month, year),
        api.fetchTransactions({ page: 1, pageSize: 10 }),
        api.fetchBudgetRules().catch(() => ({ data: [] })),
        api.fetchCalendarEvents().catch(() => ({ data: [] })),
        api.fetchCategories(),
      ]);
      setAnalytics(analyticsRes.data);
      const transactionData = Array.isArray(transactionsRes.data.transactions) 
        ? transactionsRes.data.transactions 
        : Array.isArray(transactionsRes.data) 
          ? transactionsRes.data 
          : [];
      setTransactions(transactionData.slice(0, 10));
      setCategories(categoriesRes.data);
      setBudgetRules(Array.isArray(rulesRes.data) ? rulesRes.data : []);
      setCalendarEvents(Array.isArray(eventsRes.data) ? eventsRes.data : []);
      console.log('Dữ liệu analytics:', analyticsRes.data);
      console.log('Dữ liệu giao dịch:', transactionData);
      console.log('Quy tắc ngân sách:', rulesRes.data);
      console.log('Sự kiện lịch:', eventsRes.data);
    } catch (error) {
      console.error('Lỗi tải dữ liệu:', error);
      toast.error(t('errors.fetchDashboardData'));
      if (error.response?.status === 401) {
        localStorage.removeItem('userInfo');
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  }, [navigate, t]);

  const categoryMap = useMemo(() => {
        const map = new Map();
        if (categories) {
            categories.forEach(cat => {
                map.set(cat.categoryId, cat.name);
            });
        }
        return map;
    }, [categories]);

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    if (!userInfo) {
      navigate('/login');
    } else {
      setUser(userInfo);
      fetchData();
    }
  }, [navigate, fetchData]);

  const handleTransactionSuccess = () => {
    setIsModalOpen(false);
    setSelectedTransaction(null);
    fetchData();
  };

  const COLORS = analytics?.isNegativeBalance 
    ? ['#EF4444', '#F87171', '#FCA5A5', '#FECACA', '#FEE2E2'] // Màu đỏ khi số dư âm
    : ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF']; // Màu bình thường

  const lineChartData = analytics
    ? Object.entries(analytics.categoryExpenses).map(([categoryId, total]) => ({
        name: categoryMap.get(parseInt(categoryId)) || t('dashboard.category_fallback', { id: categoryId }),
        total,
      }))
    : [];

    const formatTooltipValue = (value) => {
    if (!exchangeRate) return `${value.toLocaleString('vi-VN')} VND`;
    return formatAndConvertCurrency(value, currency, exchangeRate);
  };

  const activeBudgetAdjustments = budgetRules.filter((rule) => {
    const today = new Date();
    if (rule.eventType === 'custom') {
      return today >= new Date(rule.startDate) && today <= new Date(rule.endDate);
    }
    return calendarEvents.some((event) => {
      const eventDate = new Date(event.start);
      return (
        (rule.eventType === 'exam_week' && event.summary?.toLowerCase().includes('exam')) ||
        (rule.eventType === 'summer_break' && event.summary?.toLowerCase().includes('summer'))
      );
    });
  });

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <div className="flex-1 md:pl-64 pt-16">
        <Header />
        <main className="py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-gray-900">{t('dashboard.title')}</h2>
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-4 py-2 font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                {t('dashboard.addTransaction')}
              </button>
            </div>

            {loading ? (
              <p className="text-center text-gray-500">{t('loading')}</p>
            ) : analytics && (
              <>
                {analytics.isNegativeBalance && (
                  <div className="bg-red-100 p-4 rounded-lg mb-6">
                    <h3 className="text-lg font-medium text-red-900">{t('dashboard.negativeBalanceWarning')}</h3>
                    <p className="text-sm text-red-700">{t('dashboard.negativeBalanceMessage')}</p>
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <SummaryCard 
                    title={t('dashboard.totalIncome')} 
                    amount={analytics.income || 0} 
                     cardType="income"
                  />
                  <SummaryCard 
                    title={t('dashboard.totalExpense')} 
                    amount={analytics.expense || 0} 
                    cardType="expense"
                  />
                  <SummaryCard 
                    title={t('dashboard.currentBalance')} 
                    amount={analytics.balance || 0} 
                   cardType="balance" 
                  />
                </div>

                {activeBudgetAdjustments.length > 0 && (
                  <div className="bg-yellow-100 p-4 rounded-lg mb-6">
                    <h3 className="text-lg font-medium text-gray-900">{t('dashboard.activeBudgetRules')}</h3>
                    <ul className="mt-2">
                      {activeBudgetAdjustments.map((rule) => (
                        <li key={rule.ruleId} className="text-sm text-gray-700">
                          {t('settings.category')}: {rule.Category?.name || 'Không xác định'} -{' '}
                          {rule.adjustmentType === 'percentage'
                            ? `${rule.adjustmentValue}% ${t('settings.adjustment')}`
                           : `${formatTooltipValue(rule.adjustmentValue)} ${t('settings.adjustment')}`} 
                          {rule.eventType === 'custom'
                            ? ` (${new Date(rule.startDate).toLocaleDateString()} - ${new Date(rule.endDate).toLocaleDateString()})`
                            : ` (${t(`settings.${rule.eventType}`)})`}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-6">
                  <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">{t('dashboard.expenseByCategory')}</h3>
                    {analytics.categoryExpenses && Object.keys(analytics.categoryExpenses).length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={Object.entries(analytics.categoryExpenses).map(([categoryId, total]) => ({
                              name: categoryMap.get(parseInt(categoryId)) || t('transactions.categoryWithId', { id: categoryId }),
    total,
  }))}
  dataKey="total"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={100}
                            fill="#8884d8"
                            label
                          >
                            {Object.keys(analytics.categoryExpenses).map((_, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={formatTooltipValue} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="text-center text-gray-500 mt-10">{t('dashboard.noExpenseData')}</p>
                    )}
                  </div>
                  <div className="lg:col-span-3 bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">{t('dashboard.cashFlow')}</h3>
                    {lineChartData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={lineChartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip formatter={formatTooltipValue} />
                          <Line 
                            type="monotone" 
                            dataKey="total" 
                            stroke={analytics.isNegativeBalance ? '#EF4444' : '#8884d8'} 
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="text-center text-gray-500 mt-10">{t('dashboard.noCashFlowData')}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">{t('dashboard.budgetProgress')}</h3>
                    {analytics.budgetProgress && analytics.budgetProgress.length > 0 ? (
                      analytics.budgetProgress.map((bp) => {

                        const isAdjusted = bp.adjustedAmount !== null && bp.adjustedAmount !== undefined;
                        const budgetLimit = isAdjusted ? bp.adjustedAmount : bp.amount;
                        const progressPercentage = budgetLimit > 0 ? (bp.spent / budgetLimit) * 100 : 0;

                        return (
                                            <div key={bp.budgetId} className="mb-4">

                                              {bp.isHarvestBudget ? (
            // Giao diện cho Ngân sách Thu thập
            <div>
                <p className="text-sm font-medium text-gray-900">
                    {bp.categoryName}
                    <span className="ml-2 text-xs font-semibold text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                        {t('dashboard.harvesting')}
                    </span>
                </p>
                <p className="text-lg font-bold text-green-700 mt-1">
                    {formatTooltipValue(bp.harvestedAmount)}
                </p>
            </div>
        ) : (
                                              <div>
                                                <div className="flex justify-between items-center mb-1">
                                                    <p className="text-sm font-medium text-gray-900">
                                                        {bp.categoryName || t('dashboard.budgetWithId', { id: bp.budgetId })}
                                                        {/* Hiển thị tag (đã điều chỉnh) nếu có */}
                                                        {isAdjusted && <span className="ml-2 text-xs font-semibold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">{t('dashboard.adjusted')}</span>}
                                                    </p>
                                                    <p className="text-sm text-gray-600">
                                                        {formatTooltipValue(bp.spent)} / {formatTooltipValue(budgetLimit)}
                                                    </p>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2.5">
                                                    <div
                                                        className={`h-2.5 rounded-full ${progressPercentage > 100 ? 'bg-red-500' : 'bg-blue-600'}`}
                                                        style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                                                    ></div>
                                                </div>
                                                <p className="text-right text-sm text-gray-500 mt-1">{progressPercentage.toFixed(1)}%</p>
                                            </div>
                                            )}
    </div>
                                        );
                                    })
                                ) : (
                                    <p className="text-sm text-gray-500">{t('dashboard.noBudgetProgress')}</p>
                                )}
                            </div>
                  <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">{t('dashboard.savingGoalsProgress')}</h3>
                    {analytics.goals && analytics.goals.length > 0 ? (
                      analytics.goals.map((goal) => (
                        <div key={goal.goalId} className="mb-4">
                          <p className="text-sm font-medium text-gray-900">{goal.name}</p>
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div
                              className="bg-green-600 h-2.5 rounded-full"
                              style={{ width: `${Math.min(goal.progressPercentage || 0, 100)}%` }}
                            ></div>
                          </div>
                          <p className="text-sm text-gray-500">{(goal.progressPercentage || 0).toFixed(2)}%</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">{t('dashboard.noSavingGoals')}</p>
                    )}
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow mt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">{t('dashboard.recentTransactions')}</h3>
                  <ul className="divide-y divide-gray-200">
                    {transactions.length > 0 ? (
                      transactions.slice(0, 10).map((transaction) => {
                        const rule = activeBudgetAdjustments.find((r) => r.categoryId === transaction.categoryId);
                        return (
                          <li key={transaction.transactionId} className="py-3 flex justify-between items-center">
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {transaction.Category?.name || 'Không xác định'}
                                {rule && <span className="text-yellow-600 ml-2">({t('dashboard.adjusted')})</span>}
                              </p>
                              <p className="text-sm text-gray-500">{new Date(transaction.transactionDate).toLocaleDateString()}</p>
                            </div>
                            <div className="flex space-x-2">
                              <p className={`text-sm font-semibold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                                {transaction.type === 'income' ? '+' : '-'}{formatTooltipValue(parseFloat(transaction.amount || 0))}
                              </p>
                              <button
                                onClick={() => {
                                  setSelectedTransaction(transaction);
                                  setIsModalOpen(true);
                                }}
                                className="text-blue-600 hover:text-blue-800"
                              >
                                {t('transactions.editButton')}
                              </button>
                              <button
                                onClick={() => handleDeleteTransaction(transaction.transactionId)}
                                className="text-red-600 hover:text-red-800"
                              >
                                {t('transactions.delete')}
                              </button>
                            </div>
                          </li>
                        );
                      })
                    ) : (
                      <p className="text-sm text-gray-500">{t('dashboard.noTransactions')}</p>
                    )}
                  </ul>
                </div>
              </>
            )}
          </div>
        </main>

        <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setSelectedTransaction(null); }}>
          <TransactionForm
            onSuccess={handleTransactionSuccess}
            onCancel={() => { setIsModalOpen(false); setSelectedTransaction(null); }}
            transaction={selectedTransaction}
          />
        </Modal>
      </div>
    </div>
  );
}