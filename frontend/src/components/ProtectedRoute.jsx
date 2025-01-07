
import React from 'react';
import { Navigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import Loader from './Loader';

const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuthStore();

    if (loading) return <Loader />;
    return user ? children : <Navigate to="/login" />;
};

export default ProtectedRoute;
