import React, { useState, useEffect } from 'react';
import * as api from '../api/api';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

const TransactionForm = ({ onSuccess, onCancel, transaction = null }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    categoryId: '',
    amount: '',
    transactionDate: new Date().toISOString().split('T')[0],
    note: '',
    type: 'expense',
    receiptImageUrl: '',
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    if (transaction) {
      setFormData({
        categoryId: transaction.categoryId,
        amount: transaction.amount,
        transactionDate: transaction.transactionDate.split('T')[0],
        note: transaction.note || '',
        type: transaction.type,
        receiptImageUrl: transaction.receiptImageUrl || '',
      });
    }
    const fetchCategories = async () => {
      setLoading(true);
      try {
        const { data } = await api.fetchCategories();
        setCategories(data);
      } catch (err) {
        toast.error(t('errors.fetchCategories'));
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, [transaction, t]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'receiptImage') {
      const file = files[0];
      setFormData({ ...formData, receiptImage: file });
      if (file) {
        setPreviewImage(URL.createObjectURL(file));
      } else {
        setPreviewImage(null);
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (transaction) {
        await api.updateTransaction(transaction.transactionId, formData);
        toast.success(t('transactions.updated'));
      } else {
        await api.createTransaction(formData);
        toast.success(t('transactions.created'));
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
      <h2 className="text-xl font-bold">{transaction ? t('transactions.edit') : t('transactions.create')}</h2>
      <div>
        <label className="text-sm font-medium text-gray-700">{t('transactions.category')}</label>
        <select
          name="categoryId"
          value={formData.categoryId}
          onChange={handleChange}
          required
          className="mt-1 w-full px-4 py-2 border rounded-lg"
          disabled={loading}
        >
          <option value="">{t('transactions.selectCategory')}</option>
          {categories.map((cat) => (
            <option key={cat.categoryId} value={cat.categoryId}>
              {cat.name} ({t(`settings.${cat.type}`)})
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700">{t('transactions.amount')}</label>
        <input
          name="amount"
          type="number"
          value={formData.amount}
          onChange={handleChange}
          required
          min="0"
          className="mt-1 w-full px-4 py-2 border rounded-lg"
          disabled={loading}
        />
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700">{t('transactions.date')}</label>
        <input
          name="transactionDate"
          type="date"
          value={formData.transactionDate}
          onChange={handleChange}
          required
          className="mt-1 w-full px-4 py-2 border rounded-lg"
          disabled={loading}
        />
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700">{t('transactions.type')}</label>
        <select
          name="type"
          value={formData.type}
          onChange={handleChange}
          className="mt-1 w-full px-4 py-2 border rounded-lg"
          disabled={loading}
        >
          <option value="expense">{t('settings.expense')}</option>
          <option value="income">{t('settings.income')}</option>
        </select>
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700">{t('transactions.note')}</label>
        <textarea
          name="note"
          value={formData.note}
          onChange={handleChange}
          className="mt-1 w-full px-4 py-2 border rounded-lg"
          disabled={loading}
        />
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700">{t('transactions.receiptImageUrl')}</label>
        <input
          name="receiptImageUrl"
          type="url"
          value={formData.receiptImageUrl}
          onChange={handleChange}
          className="mt-1 w-full px-4 py-2 border rounded-lg"
          disabled={loading}
        />
      </div>
      <div className="flex justify-end space-x-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
          disabled={loading}
        >
          {t('transactions.cancel')}
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-blue-300"
        >
          {loading ? t('transactions.saving') : transaction ? t('transactions.update') : t('transactions.create')}
        </button>
      </div>
    </form>
  );
};

export default TransactionForm;