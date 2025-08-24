import React from 'react';
import { useNavigate } from 'react-router-dom';
import * as api from '../api/api';
import toast from 'react-hot-toast';
import AuthForm from '../components/AuthForm';

export default function RegisterPage() {
    const navigate = useNavigate();

    const handleRegister = async (formData) => {
        if (!formData.fullName || !formData.email || !formData.password) {
            toast.error("Please fill in all fields.");
            return;
        }
        try {
            const { data } = await api.register(formData);
            localStorage.setItem('userInfo', JSON.stringify(data));
            toast.success('Registration successful! Welcome!');
            navigate('/'); 
        } catch (error) {
            toast.error(error.response?.data?.message || 'Registration failed!');
        }
    };

    return <AuthForm onSubmit={handleRegister} isRegister={true} />;
}