// src/components/DepositToGoalForm.js
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as api from '../api/api';
import toast from 'react-hot-toast';

const DepositToGoalForm = ({ goal, onSuccess, onCancel }) => {
    const { t } = useTranslation();
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.depositToSavingGoal(goal.goalId, { amount: parseFloat(amount) });
            toast.success(t('savingGoals.depositSuccess', { name: goal.name }));
            onSuccess();
        } catch (err) {
            toast.error(err.response?.data?.message || t('savingGoals.depositFailed'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="text-xl font-bold">{t('savingGoals.depositFor', { name: goal.name })}</h2>
            <div>
                <label className="text-sm font-medium text-gray-700">{t('savingGoals.amountToDeposit')}</label>
                <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                    min="1"
                    className="mt-1 w-full p-2 border rounded-lg"
                    placeholder={t('savingGoals.amountPlaceholder')}
                />
            </div>
            <div className="flex justify-end space-x-2">
                <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-200 rounded">{t('savingGoals.cancel')}</button>
                <button type="submit" disabled={loading} className="px-4 py-2 bg-pink-500 text-white rounded disabled:bg-pink-300">
                    {loading ? t('savingGoals.depositing') : t('savingGoals.confirm')}
                </button>
            </div>
        </form>
    );
};

export default DepositToGoalForm;