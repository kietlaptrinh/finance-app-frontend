// import axios from 'axios';

// const API = axios.create({
//   baseURL: process.env.REACT_APP_API_URL,
// });

// // Interceptor để gắn token vào header
// API.interceptors.request.use((req) => {
//   const userInfo = localStorage.getItem('userInfo');
//   console.log('userInfo:', userInfo);
//   if (userInfo) {
//     const token = JSON.parse(userInfo).token;
//     console.log('Setting Authorization header with token:', token);
//     req.headers.Authorization = `Bearer ${token}`;
//   } else {
//     console.log('No userInfo found in localStorage');
//   }
//   return req;
// });

// // Auth endpoints
// export const login = (formData) => API.post('/auth/login', formData);
// export const register = (formData) => API.post('/auth/register', formData);
// export const forgotPassword = (email) => API.post('/auth/forgot-password', { email });
// export const resetPassword = (token, password) => API.post(`/auth/reset-password/${token}`, { password });
// export const updateProfile = (data) => {
//   console.log('Sending updateProfile request with data:', data); 
//   return API.put('/auth/profile', data);
// };
// export const fetchUserProfile = () => API.get('/auth/profile');

// // Transactions
// export const fetchTransactions = (filters = {}) => API.get('/transactions', { params: filters });
// export const createTransaction = (newTransaction) => API.post('/transactions', newTransaction);
// export const updateTransaction = (id, data) => API.put(`/transactions/${id}`, data);
// export const deleteTransaction = (id) => API.delete(`/transactions/${id}`);
// export const convertPointsToBalance = (points) => API.post('/settings/convert-points', { points });

// // Categories
// export const fetchCategories = () => API.get('/settings/category');

// // Budgets
// export const fetchBudgets = () => API.get('/budgets');
// export const createBudget = (newBudget) => API.post('/budgets', newBudget);
// export const updateBudget = (id, data) => API.put(`/budgets/${id}`, data);
// export const deleteBudget = (id) => API.delete(`/budgets/${id}`);

// // Saving Goals
// export const fetchSavingGoals = () => API.get('/saving-goals');
// export const createSavingGoal = (newGoal) => API.post('/saving-goals', newGoal);
// export const updateSavingGoal = (id, data) => API.put(`/saving-goals/${id}`, data);
// export const deleteSavingGoal = (id) => API.delete(`/saving-goals/${id}`);
// export const depositToSavingGoal = (id, data) => API.post(`/saving-goals/${id}/deposit`, data);

// // Piggy Bank
// export const fetchPiggyBank = () => API.get('/piggy-bank');
// export const depositToPiggy = (data) => {
//   console.log('Sending deposit request with data:', data);
//   return API.post('/piggy-bank/deposit', { amount: Number(data.amount) });
// };
// export const updatePiggyDecorations = (decorations) => API.put('/piggy-bank/decorations', { decorations });

// // Challenges
// export const fetchRandomChallenge = () => API.get('/challenges/random');
// export const deleteChallenge = (userChallengeId) => API.delete('/settings/challenges/delete', { data: { userChallengeId } });
// export const startChallenge = (challengeId) => API.post('/challenges/start', { challengeId });
// export const completeChallenge = (userChallengeId) => API.post('/settings/challenges/complete', { userChallengeId });
// export const fetchUserChallenges = () => API.get('/challenges/user');

// // Currency Converter
// export const convertCurrency = (data) => API.post('/currency/convert', data);
// export const fetchHistoricalRates = (params) => API.get('/currency/historical', { params });
// export const fetchConversionsHistory = () => API.get('/currency/history');

// // Settings
// export const fetchSettings = () => API.get('/settings');
// export const updateSettings = (data) => API.put('/settings', data);
// export const createCategory = (data) => API.post('/settings/category', data);
// export const exportData = () => API.get('/settings/export');
// export const deleteAccount = () => API.delete('/settings/account');
// export const fetchChallenges = () => API.get('/settings/challenges');
// export const createBudgetRule = (data) => API.post('/settings/budget-rule', data);
// export const fetchBudgetRules = () => API.get('/settings/budget-rules');
// export const deleteBudgetRule = (ruleId) => API.delete(`/settings/budget-rule/${ruleId}`);
// export const syncGoogleCalendar = (code) => API.post('/settings/google-calendar-sync', { code });
// export const fetchCalendarEvents = (calendarSyncUrl) => API.get('/settings/calendar-events', { params: { calendarSyncUrl } });


// export const fetchLeaderboard = () => API.get('/settings/leaderboard');
// export const fetchLeaderboardHistory = (userId) => API.get(`/settings/leaderboard/history/${userId}`);

// // Dashboard
// export const fetchDashboardSummary = (month, year) => API.get('/dashboard/summary', { params: { month, year } });

// export default API;
