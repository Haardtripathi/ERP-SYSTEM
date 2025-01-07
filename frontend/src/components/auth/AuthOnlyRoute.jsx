import React from 'react';
import { Navigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import Loader from '../Loader';

const AuthOnlyRoute = ({ children }) => {
    const { user, loading } = useAuthStore();

    if (loading) return <Loader />;
    return user ? <Navigate to="/dashboard" /> : children;
};

export default AuthOnlyRoute;
