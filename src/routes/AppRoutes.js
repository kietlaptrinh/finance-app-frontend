import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import DashboardPage from '../pages/DashboardPage';
import BudgetsPage from '../pages/BudgetsPage';
import SavingGoalsPage from '../pages/SavingGoalsPage';
import PiggyBankPage from '../pages/PiggyBankPage';
import ChallengesPage from '../pages/ChallengesPage';
import CurrencyConverterPage from '../pages/CurrencyConverterPage';
import SettingsPage from '../pages/SettingsPage';
import ProfilePage from '../pages/ProfilePage';
import TransactionsPage from '../pages/TransactionsPage';
import LeaderboardPage from '../pages/LeaderboardPage';

export default function AppRoutes() {
  return (
    
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/" element={<DashboardPage />} />
        <Route path="/transactions" element={<TransactionsPage />} />
        <Route path="/budgets" element={<BudgetsPage />} />
        <Route path="/saving-goals" element={<SavingGoalsPage />} />
        <Route path="/piggy-bank" element={<PiggyBankPage />} />
        <Route path="/challenges" element={<ChallengesPage />} />
        <Route path="/currency" element={<CurrencyConverterPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
      </Routes>
    
  );
}