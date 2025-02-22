import React from 'react';
import { Navigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import { Loader2 } from "lucide-react"


const AuthOnlyRoute = ({ children }) => {
    const { user, loading, isAdmin } = useAuthStore();
    if (loading) {
        return (
            <div className="min-h-[400px] flex flex-col items-center justify-center bg-gradient-to-b from-stone-50 to-stone-100">
                <div className="flex flex-col items-center space-y-4">
                    <Loader2 className="h-12 w-12 animate-spin text-stone-600" />
                    <p className="text-lg font-medium text-stone-700">Loading your content...</p>
                    <p className="text-sm text-stone-500">This may take a few moments</p>
                </div>
            </div>
        );
    }
    return user ? <Navigate to="/dashboard" /> : children;
};

export default AuthOnlyRoute;
