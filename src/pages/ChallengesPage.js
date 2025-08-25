import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as api from '../api/api';
import toast from 'react-hot-toast';
import Sidebar from '../components/Sidebar';
import { useTranslation } from 'react-i18next';
import Header from '../components/Header';


export default function ChallengesPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [challenges, setChallenges] = useState([]);
  const [randomChallenge, setRandomChallenge] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    if (!userInfo) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        const [userChallengesRes, randomChallengeRes] = await Promise.all([
          api.fetchUserChallenges(),
          api.fetchRandomChallenge(),
        ]);
        setChallenges(userChallengesRes.data);
        setRandomChallenge(randomChallengeRes.data);
      } catch (err) {
        toast.error(t('errors.fetchChallenges'));
        if (err.response?.status === 401) {
          localStorage.removeItem('userInfo');
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate, t]);

  const handleStartChallenge = async () => {
    setLoading(true);
    try {
      await api.startChallenge(randomChallenge.challengeId);
      toast.success(t('challenges.started'));
      await Promise.all([
        api.fetchUserChallenges().then(({ data }) => setChallenges(data)),
        api.fetchRandomChallenge().then(({ data }) => setRandomChallenge(data)).catch(() => setRandomChallenge(null)),
      ]);
    } catch (err) {
      toast.error(err.response?.data?.message || t('errors.operationFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteChallenge = async (userChallengeId) => {
    setLoading(true);
    try {
      console.log('Attempting to complete challenge with userChallengeId:', userChallengeId);
      await api.completeChallenge(userChallengeId); // Truyền trực tiếp userChallengeId thay vì object
      toast.success(t('challenges.completed'));
      await Promise.all([
        api.fetchUserChallenges().then(({ data }) => setChallenges(data)),
        api.fetchSettings().then(({ data }) => {
          localStorage.setItem('settings', JSON.stringify(data));
          if (data.moodBasedTheme) {
            document.body.className = `theme-${data.currentMood || 'productive'}`;
          } else {
            document.body.className = '';
          }
        }),
      ]);
    } catch (err) {
      console.error('Complete challenge error:', err);
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
          <h2 className="text-3xl font-bold text-gray-900 mb-6">{t('challenges.title')}</h2>
          {loading ? (
            <p className="text-center text-gray-500">{t('loading')}</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">{t('challenges.newChallenge')}</h3>
                {randomChallenge ? (
                  <>
                    <p className="text-sm text-gray-500">{randomChallenge.description}</p>
                    <p className="text-sm text-gray-500">
                      {t('challenges.reward')}: {randomChallenge.rewardPoints} {t('challenges.points')}
                    </p>
                    <p className="text-sm text-gray-500">
                      {t('challenges.duration')}: {randomChallenge.durationDays} {t('challenges.days')}
                    </p>
                    <button
                      onClick={handleStartChallenge}
                      className="mt-4 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-blue-300"
                      disabled={loading}
                    >
                      {t('challenges.startChallenge')}
                    </button>
                  </>
                ) : (
                  <p className="text-sm text-gray-500">{t('challenges.noChallenges')}</p>
                )}
              </div>
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">{t('challenges.yourChallenges')}</h3>
                {challenges.length === 0 ? (
                  <p className="text-sm text-gray-500">{t('challenges.noChallenges')}</p>
                ) : (
                  <ul className="divide-y divide-gray-200">
                    {challenges.map((challenge) => (
                      <li key={challenge.userChallengeId} className="py-4 flex justify-between items-center">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{challenge.Challenge?.description || 'Unknown'}</p>
                          <p className="text-sm text-gray-500">
                            {t('challenges.status')}: {t(`challenges.statuses.${challenge.status}`)}
                          </p>
                        </div>
                        {challenge.status === 'pending' && (
                          <button
                            onClick={() => handleCompleteChallenge(challenge.userChallengeId)}
                            className="text-blue-600 hover:text-blue-800"
                            disabled={loading}
                          >
                            {t('challenges.complete')}
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
        </div>
        </main>
      </div>
    </div>
  );
}