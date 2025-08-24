import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import * as api from '../api/api';
import toast from 'react-hot-toast';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import TransactionForm from '../components/TransactionForm';
import Modal from '../components/Modal';
import { useCurrency } from '../contexts/CurrencyContext';
import { formatAndConvertCurrency } from '../utils/formatCurrency';

const TransactionsPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { currency, exchangeRate } = useCurrency();
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    type: '',
    categoryId: '',
    startDate: '',
    endDate: '',
   
  });
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0,
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.fetchTransactions({ ...filters, page: pagination.page, pageSize: pagination.pageSize });
      setTransactions(data.transactions || data);
      setPagination((prev) => ({ ...prev, total: data.total || data.length }));
    } catch (err) {
      toast.error(t('errors.fetchTransactions'));
      if (err.response?.status === 401) {
        localStorage.removeItem('userInfo');
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.page, pagination.pageSize, navigate, t]);

  const fetchCategories = useCallback(async () => {
    try {
      const { data } = await api.fetchCategories();
      setCategories(data);
    } catch (err) {
      toast.error(t('errors.fetchCategories'));
    }
  }, [t]);

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    if (!userInfo) {
      navigate('/login');
      return;
    }
    fetchCategories();
    fetchData();
  }, [navigate, fetchData, fetchCategories]);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
    setPagination((prev) => ({ ...prev, page: 1 })); // Reset về trang đầu khi thay đổi bộ lọc
  };

  const applyFilters = () => {
    fetchData();
  };

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const handleTransactionSuccess = () => {
    setIsModalOpen(false);
    setSelectedTransaction(null);
    fetchData();
  };

  const handleDeleteTransaction = async (id) => {
    if (window.confirm(t('transactions.confirmDelete'))) {
      try {
        await api.deleteTransaction(id);
        toast.success(t('transactions.deleted'));
        fetchData();
      } catch (err) {
        toast.error(err.response?.data?.message || t('errors.operationFailed'));
      }
    }
  };

  const totalPages = Math.ceil(pagination.total / pagination.pageSize);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <div className="flex-1 md:pl-64 pt-16">
        <Header />
        <main className="py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-gray-900">{t('transactions.title')}</h2>
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-4 py-2 font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-blue-300"
                disabled={loading}
              >
                {t('transactions.addTransaction')}
              </button>
            </div>

            {/* Form lọc */}
            <div className="bg-white p-6 rounded-lg shadow mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">{t('transactions.filterTransactions')}</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <select
                  name="type"
                  value={filters.type}
                  onChange={handleFilterChange}
                  className="px-4 py-2 border rounded-lg"
                  disabled={loading}
                >
                  <option value="">{t('transactions.allTypes')}</option>
                  <option value="income">{t('settings.income')}</option>
                  <option value="expense">{t('settings.expense')}</option>
                </select>
                <select
                  name="categoryId"
                  value={filters.categoryId}
                  onChange={handleFilterChange}
                  className="px-4 py-2 border rounded-lg"
                  disabled={loading}
                >
                  <option value="">{t('transactions.allCategories')}</option>
                  {categories.map((cat) => (
                    <option key={cat.categoryId} value={cat.categoryId}>
                      {cat.name} ({t(`settings.${cat.type}`)})
                    </option>
                  ))}
                </select>
                <input
                  name="startDate"
                  type="date"
                  value={filters.startDate}
                  onChange={handleFilterChange}
                  className="px-4 py-2 border rounded-lg"
                  disabled={loading}
                />
                <input
                  name="endDate"
                  type="date"
                  value={filters.endDate}
                  onChange={handleFilterChange}
                  className="px-4 py-2 border rounded-lg"
                  disabled={loading}
                />
               
                <button
                  onClick={applyFilters}
                  className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-blue-300"
                  disabled={loading}
                >
                  {t('transactions.applyFilters')}
                </button>
              </div>
            </div>

            {/* Danh sách giao dịch */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-4">{t('transactions.list')}</h3>
              {loading ? (
                <p className="text-center text-gray-500">{t('loading')}</p>
              ) : transactions.length === 0 ? (
                <p className="text-center text-gray-500">{t('transactions.noTransactions')}</p>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {transactions.map((transaction) => (
                    <li key={transaction.transactionId} className="py-4 flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{transaction.Category?.name || 'Unknown'}</p>
                        <p className="text-sm text-gray-500">{new Date(transaction.transactionDate).toLocaleDateString('vi-VN')}</p>
                        <p className="text-sm text-gray-500">{transaction.note || '-'}</p>
                        {transaction.receiptImageUrl && (
                          <a
                            href={transaction.receiptImageUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:underline"
                          >
                            {t('transactions.viewReceipt')}
                          </a>
                        )}
                      </div>
                      <div className="flex items-center space-x-4">
                        <p className={`text-sm font-semibold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                          {transaction.type === 'income' ? '+' : '-'}
                          {exchangeRate 
                            ? formatAndConvertCurrency(parseFloat(transaction.amount), currency, exchangeRate)
                            : `${parseFloat(transaction.amount).toLocaleString('vi-VN')} VND`
                          }
                        </p>
                        <button
                          onClick={() => {
                            setSelectedTransaction(transaction);
                            setIsModalOpen(true);
                          }}
                          className="text-blue-600 hover:text-blue-800"
                          disabled={loading}
                        >
                          {t('transactions.editButton')}
                        </button>
                        <button
                          onClick={() => handleDeleteTransaction(transaction.transactionId)}
                          className="text-red-600 hover:text-red-800"
                          disabled={loading}
                        >
                          {t('transactions.delete')}
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Phân trang */}
            {totalPages > 1 && (
              <div className="mt-6 flex justify-center space-x-2">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1 || loading}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:bg-gray-100"
                >
                  {t('pagination.previous')}
                </button>
                <span className="px-4 py-2 text-sm text-gray-700">
                  {t('pagination.page', { current: pagination.page, total: totalPages })}
                </span>
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === totalPages || loading}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:bg-gray-100"
                >
                  {t('pagination.next')}
                </button>
              </div>
            )}
          </div>
        </main>

        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedTransaction(null);
          }}
        >
          <TransactionForm
            onSuccess={handleTransactionSuccess}
            onCancel={() => {
              setIsModalOpen(false);
              setSelectedTransaction(null);
            }}
            transaction={selectedTransaction}
          />
        </Modal>
      </div>
    </div>
  );
};

export default TransactionsPage;