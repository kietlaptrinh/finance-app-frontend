import React, { useState, useEffect } from 'react';
   import { useNavigate } from 'react-router-dom';
   import * as api from '../api/api';
   import toast from 'react-hot-toast';
   import Sidebar from '../components/Sidebar';
   import Header from '../components/Header';
   import { useTranslation } from 'react-i18next';

   const ProfilePage = () => {
     const { t } = useTranslation();
     const navigate = useNavigate();
     const [user, setUser] = useState({
       fullName: '',
       email: '',
       profilePictureUrl: '',
     });
     const [loading, setLoading] = useState(false);
     const [error, setError] = useState(null);

     useEffect(() => {
       const fetchProfile = async () => {
         const userInfo = JSON.parse(localStorage.getItem('userInfo'));
         if (!userInfo) {
           navigate('/login');
           return;
         }
         setLoading(true);
         try {
           const { data } = await api.fetchUserProfile();
           setUser({
             fullName: data.fullName || '',
             email: data.email || '',
             profilePictureUrl: data.profilePictureUrl || '',
           });
           // Cập nhật localStorage
           localStorage.setItem('userInfo', JSON.stringify({
             ...userInfo,
             fullName: data.fullName,
             email: data.email,
             profilePictureUrl: data.profilePictureUrl
           }));
           setError(null);
         } catch (err) {
           console.error('Fetch profile error:', err.message, err.response?.data);
           setError(err.response?.data?.message || t('errors.operationFailed'));
           if (err.response?.status === 401) {
             localStorage.removeItem('userInfo');
             navigate('/login');
           }
         } finally {
           setLoading(false);
         }
       };
       fetchProfile();
     }, [navigate, t]);

     const handleChange = (e) => {
       setUser({ ...user, [e.target.name]: e.target.value });
     };

     const handleSubmit = async (e) => {
       e.preventDefault();
       setLoading(true);
       try {
         const { data } = await api.updateProfile(user);
         toast.success(t('profile.updated'));
         // Cập nhật localStorage
         const updatedUserInfo = { ...JSON.parse(localStorage.getItem('userInfo')), ...data };
         localStorage.setItem('userInfo', JSON.stringify(updatedUserInfo));
         // Cập nhật state
         setUser({
           fullName: data.fullName,
           email: data.email,
           profilePictureUrl: data.profilePictureUrl,
         });
         setError(null);
       } catch (err) {
         console.error('Update profile error:', err.message, err.response?.data);
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
               <h2 className="text-3xl font-bold text-gray-900 mb-6">{t('profile.title')}</h2>
               {loading ? (
                 <p className="text-center text-gray-500">{t('loading')}</p>
               ) : error ? (
                 <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
                   <p>{error}</p>
                   <button
                     onClick={() => navigate('/login')}
                     className="mt-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                   >
                     {t('profile.backToLogin')}
                   </button>
                 </div>
               ) : (
                 <div className="bg-white shadow rounded-lg p-6">
                   <form onSubmit={handleSubmit} className="space-y-6">
                     <div>
                       <label className="text-sm font-medium text-gray-700">{t('profile.fullName')}</label>
                       <input
                         name="fullName"
                         type="text"
                         value={user.fullName}
                         onChange={handleChange}
                         required
                         className="mt-1 w-full px-4 py-2 border rounded-lg"
                       />
                     </div>
                     <div>
                       <label className="text-sm font-medium text-gray-700">{t('profile.email')}</label>
                       <input
                         name="email"
                         type="email"
                         value={user.email}
                         onChange={handleChange}
                         required
                         className="mt-1 w-full px-4 py-2 border rounded-lg"
                       />
                     </div>
                     <div>
                       {user.profilePictureUrl && (
                         <img
                           src={user.profilePictureUrl}
                           alt="Avatar"
                           className="w-24 h-24 rounded-full object-cover mb-2"
                         />
                       )}
                       <input
                         name="profilePictureUrl"
                         type="url"
                         value={user.profilePictureUrl}
                         onChange={handleChange}
                         className="mt-1 w-full px-4 py-2 border rounded-lg"
                       />
                     </div>
                     <div className="flex justify-end">
                       <button
                         type="submit"
                         disabled={loading}
                         className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-blue-300"
                       >
                         {loading ? t('profile.saving') : t('profile.save')}
                       </button>
                     </div>
                   </form>
                 </div>
               )}
             </div>
           </main>
         </div>
       </div>
     );
   };

   export default ProfilePage;