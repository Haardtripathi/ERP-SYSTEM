import { React, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import { Loader2 } from "lucide-react"
import { Link, useNavigate, useLocation } from "react-router-dom";





const AdminOnlyRoute = ({ children }) => {
    const isAdmin = useAuthStore(state => state.isAdmin);
    const navigate = useNavigate();

    useEffect(() => {
        if (!isAdmin) {
            navigate('/dashboard');
        }
    }, [isAdmin, navigate]);

    if (!isAdmin) {
        return null;
    }

    return <>{children}</>;
};

export default AdminOnlyRoute;