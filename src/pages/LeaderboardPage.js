import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import * as api from '../api/api';
import toast from 'react-hot-toast';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

const LeaderboardPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [leaderboard, setLeaderboard] = useState([]);
  const [history, setHistory] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [loading, setLoading] = useState(false);

  // Tính mùa hiện tại và thời gian reset
  const getCurrentSeason = () => {
    const now = new Date();
    const startDate = new Date('2025-01-01');
    const daysSinceStart = Math.floor((now - startDate) / (1000 * 60 * 60 * 24));
    return Math.floor(daysSinceStart / 30) + 1;
  };

  const getDaysUntilReset = () => {
    const now = new Date();
    const startDate = new Date('2025-01-01');
    const daysSinceStart = Math.floor((now - startDate) / (1000 * 60 * 60 * 24));
    const daysInSeason = 30;
    return daysInSeason - (daysSinceStart % daysInSeason);
  };

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        const { data } = await api.fetchLeaderboard();
        setLeaderboard(data);
      } catch (err) {
        toast.error(t('errors.fetchLeaderboard'));
        if (err.response?.status === 401) {
          localStorage.removeItem('userInfo');
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, [navigate, t]);

  const handleUserClick = (userId) => {
    if (selectedUserId === userId) {
      // Nhấn lần nữa để đóng lịch sử
      setSelectedUserId(null);
      setHistory([]);
    } else {
      // Nhấn lần đầu để hiển thị lịch sử
      setSelectedUserId(userId);
      fetchUserHistory(userId);
    }
  };

  const fetchUserHistory = async (userId) => {
    setLoading(true);
    try {
      const { data } = await api.fetchLeaderboardHistory(userId);
      setHistory(data);
    } catch (err) {
      toast.error(t('errors.fetchLeaderboardHistory'));
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
              <h2 className="text-3xl font-bold text-gray-900">{t('leaderboard.title')}</h2>
              <div className="text-sm text-gray-500">
                {t('leaderboard.currentSeason')}: {getCurrentSeason()} |{' '}
                {t('leaderboard.resetIn')}: {getDaysUntilReset()} {t('leaderboard.days')}
              </div>
            </div>
            {loading ? (
              <p className="text-center text-gray-500">{t('loading')}</p>
            ) : (
              <>
                <div className="bg-white shadow rounded-lg p-6 mb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">{t('leaderboard.top10')}</h3>
                  {leaderboard.length === 0 ? (
                    <div className="text-center py-8">
                      <span className="text-4xl">🎉</span>
                      <p className="text-sm text-gray-500 mt-2">{t('leaderboard.noData')}</p>
                      <button
                        onClick={() => navigate('/challenges')}
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                      >
                        {t('leaderboard.startChallenge')}
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-1">
                      {leaderboard.map((entry, index) => (
                        <div
                          key={entry.userId}
                          className={`flex items-center p-4 rounded-lg cursor-pointer transition ${
                            index === 0
                              ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white'
                              : index === 1
                              ? 'bg-gray-200'
                              : index === 2
                              ? 'bg-amber-200'
                              : 'bg-gray-50 hover:bg-gray-100'
                          }`}
                          onClick={() => handleUserClick(entry.userId)}
                        >
                          <span className="text-lg font-bold mr-4">
                            {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                          </span>
                          <img
                            src={entry.profilePictureUrl || 'https://cdn-icons-png.freepik.com/512/3607/3607444.png'}
                            alt={entry.fullName}
                            className="w-10 h-10 rounded-full mr-4"
                          />
                          <div className="flex-1">
                            <p className={`text-sm font-medium ${index === 0 ? 'text-white' : 'text-gray-900'}`}>
                              {entry.fullName}
                            </p>
                            <p className={`text-sm ${index === 0 ? 'text-yellow-100' : 'text-gray-500'}`}>
                              {t('leaderboard.rankScore')}: {entry.rankScore} |{' '}
                              {t('leaderboard.points')}: {entry.totalPoints} |{' '}
                              {t('leaderboard.challenges')}: {entry.completedChallenges} |{' '}
                              {t('leaderboard.avgStarRating')}: {entry.avgStarRating} ⭐
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {selectedUserId && (
                  <div className="bg-white shadow rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">{t('leaderboard.history')}</h3>
                    {history.length === 0 ? (
                      <div className="text-center py-8">
                        <span className="text-4xl">📜</span>
                        <p className="text-sm text-gray-500 mt-2">{t('leaderboard.noHistory')}</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {history.map((entry) => (
                          <div
                            key={entry.season}
                            className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-md transition"
                          >
                            <p className="text-sm font-medium text-gray-900">
                              {t('leaderboard.season')}: {entry.season}
                            </p>
                            <p className="text-sm text-gray-500">
                              {t('leaderboard.rankScore')}: {entry.rankScore} |{' '}
                              {t('leaderboard.points')}: {entry.totalPoints} |{' '}
                              {t('leaderboard.challenges')}: {entry.completedChallenges}
                            </p>
                            <p className="text-sm text-gray-500">
                              {t('leaderboard.speedScore')}: {entry.speedScore} |{' '}
                              {t('leaderboard.starRating')}: {entry.starRating} ⭐
                            </p>
                            <p className="text-sm text-gray-400">
                              {t('leaderboard.date')}: {new Date(entry.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default LeaderboardPage;