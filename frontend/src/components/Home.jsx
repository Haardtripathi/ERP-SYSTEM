import React from 'react';
import { Link } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import Loader from './Loader';

const Home = () => {
    const { user, loading } = useAuthStore();

    if (loading) return <Loader />;

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4">
            <div className="max-w-4xl mx-auto text-center">
                <h1 className="text-4xl font-bold text-gray-900 mb-8">
                    Welcome to Auth App
                </h1>
                <div className="bg-white rounded-lg shadow-md p-8">
                    {user ? (
                        <div className="space-y-6">
                            <p className="text-lg text-gray-600">
                                You are successfully logged in! Check out your dashboard for more features.
                            </p>
                            <Link
                                to="/dashboard"
                                className="inline-block bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
                            >
                                Go to Dashboard
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <p className="text-lg text-gray-600">
                                Join us to access exclusive features and manage your account.
                            </p>
                            <div className="flex justify-center gap-4">
                                <Link
                                    to="/login"
                                    className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
                                >
                                    Login
                                </Link>
                                <Link
                                    to="/signup"
                                    className="bg-gray-600 text-white px-6 py-3 rounded-md hover:bg-gray-700 transition-colors"
                                >
                                    Register
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Home;
