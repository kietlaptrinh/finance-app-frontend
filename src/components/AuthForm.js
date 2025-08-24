import React, { useState } from 'react';
import { Link } from 'react-router-dom';

// Simple spinner component
const Spinner = () => (
    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

export default function AuthForm({ isRegister = false, onSubmit }) {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        // onSubmit là hàm được truyền từ LoginPage hoặc RegisterPage
        await onSubmit(formData);
        setLoading(false);
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-100 p-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
                {/* Logo or Icon */}
                <div className="text-center mb-6">
                    <div className="inline-block bg-blue-100 p-3 rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01" />
                        </svg>
                    </div>
                </div>
                
                <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">
                    {isRegister ? 'Create Your Account' : 'Welcome Back!'}
                </h2>
                <p className="text-center text-gray-500 mb-8">
                    {isRegister ? 'Join us now!' : 'Please enter your details to sign in.'}
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {isRegister && (
                        <div>
                            <label className="text-sm font-medium text-gray-700" htmlFor="fullName">Full Name</label>
                            <input
                                id="fullName" name="fullName" type="text" required
                                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="John Doe"
                                value={formData.fullName}
                                onChange={handleChange}
                            />
                        </div>
                    )}
                    <div>
                        <label className="text-sm font-medium text-gray-700" htmlFor="email">Email</label>
                        <input
                            id="email" name="email" type="email" required
                            className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="you@example.com"
                            value={formData.email}
                            onChange={handleChange}
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-700" htmlFor="password">Password</label>
                        <input
                            id="password" name="password" type="password" required
                            className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={handleChange}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
                    >
                        {loading && <Spinner />}
                        {isRegister ? 'Register' : 'Login'}
                    </button>
                </form>

                <p className="text-center text-sm text-gray-600 mt-6">
                    {isRegister ? "Already have an account? " : "Don't have an account? "}
                    <Link to={isRegister ? "/login" : "/register"} className="font-medium text-blue-600 hover:text-blue-500">
                        {isRegister ? "Sign in" : "Sign up"}
                    </Link>
                </p>
            </div>
        </div>
    );
}