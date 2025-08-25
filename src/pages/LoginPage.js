import React from 'react';
import { useNavigate } from 'react-router-dom';
import * as api from '../api/api';
import toast from 'react-hot-toast';
import AuthForm from '../components/AuthForm';

export default function LoginPage() {
    const navigate = useNavigate();

    const handleLogin = async (formData) => {
        try {
            const { data } = await api.login(formData);
            const userInfoToSave = {
                ...data.user, 
                token: data.token
            };
            localStorage.setItem('userInfo', JSON.stringify(userInfoToSave));
            toast.success('Login successful!');
            navigate('/'); // Chuyển hướng đến Dashboard
        } catch (error) {
            toast.error(error.response?.data?.message || 'Login failed!');
        }
    };

    return <AuthForm onSubmit={handleLogin} />;
}