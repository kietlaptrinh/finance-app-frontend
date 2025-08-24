// src/components/BudgetRuleForm.js
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import * as api from '../api/api';
import toast from 'react-hot-toast';

const BudgetRuleForm = ({ onSuccess, onCancel }) => {
    const { t } = useTranslation();
    const [formData, setFormData] = useState({
        categoryId: '',
        eventType: 'exam_week',
        adjustmentType: 'percentage',
        adjustmentValue: '',
        startDate: '',
        endDate: '',
    });
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchCategories = async () => {
            const { data } = await api.fetchCategories();
            setCategories(data.filter(c => c.type === 'expense'));
        };
        fetchCategories();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const dataToSend = { ...formData };

        // Nếu không phải là quy tắc tùy chỉnh, xóa ngày tháng để tránh lỗi
    if (dataToSend.eventType !== 'custom') {
        dataToSend.startDate = null;
        dataToSend.endDate = null;
    }

        try {
            await api.createBudgetRule(dataToSend);
        toast.success('Đã tạo quy tắc thành công!');
        onSuccess();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Tạo quy tắc thất bại.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="text-xl font-bold">{t('settings.rules.createTitle')}</h2>
            {/* Category */}
            <div>
                <label>{t('settings.rules.affectedCategory')}</label>
                <select name="categoryId" value={formData.categoryId} onChange={handleChange} required className="mt-1 w-full p-2 border rounded">
                    <option value="">{t('settings.rules.selectCategory')}</option>
                    {categories.map(cat => <option key={cat.categoryId} value={cat.categoryId}>{cat.name}</option>)}
                </select>
            </div>
            {/* Event Type */}
            <div>
                <label>{t('settings.rules.whenEventOccurs')}</label>
                <select name="eventType" value={formData.eventType} onChange={handleChange} required className="mt-1 w-full p-2 border rounded">
                    <option value="exam_week">{t('settings.eventTypes.exam_week')}</option>
                    <option value="summer_break">{t('settings.eventTypes.summer_break')}</option>
                    <option value="custom">{t('settings.eventTypes.custom')}</option>
                </select>
            </div>
            {/* Custom Date Range */}
            {formData.eventType === 'custom' && (
                <div className="flex space-x-2">
                    <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} required className="p-2 border rounded"/>
                    <input type="date" name="endDate" value={formData.endDate} onChange={handleChange} required className="p-2 border rounded"/>
                </div>
            )}
            {/* Adjustment */}
            <div>
                <label>{t('settings.rules.adjustBudget')}</label>
                <div className="flex items-center space-x-2">
                    <select name="adjustmentType" value={formData.adjustmentType} onChange={handleChange} className="p-2 border rounded">
                        <option value="percentage">{t('settings.rules.byPercentage')}</option>
                        <option value="fixed_amount">{t('settings.rules.byFixedAmount')}</option>
                    </select>
                    <input name="adjustmentValue" type="number" value={formData.adjustmentValue} onChange={handleChange} required placeholder={t('settings.rules.adjustmentPlaceholder')} className="p-2 border rounded w-full"/>
                </div>
                <p className="text-xs text-gray-500">{t('settings.rules.adjustmentHelper')}</p>
            </div>
            {/* Buttons */}
            <div className="flex justify-end space-x-2">
                <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-200 rounded">{t('settings.rules.cancel')}</button>
                <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded disabled:bg-blue-300">
                    {loading ? t('settings.rules.saving') : t('settings.rules.createRule')}
                </button>
            </div>
        </form>
    );
};

export default BudgetRuleForm;