
import React from 'react';
import { Navigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
// import Loader from './Loader';
import { Loader2 } from "lucide-react"

const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuthStore();

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
    return user ? children : <Navigate to="/login" />;
};

export default ProtectedRoute;


// import React, { useEffect, useState } from 'react';
// import { Navigate } from 'react-router-dom';
// import useAuthStore from '../store/authStore';
// import { Loader2 } from "lucide-react";

// const ProtectedRoute = ({ children }) => {
//     const { user, loading, checkAuth } = useAuthStore();
//     const [authChecked, setAuthChecked] = useState(false); // ✅ Prevent infinite calls

//     useEffect(() => {
//         if (!authChecked) { // ✅ Only call once
//             checkAuth().then(() => setAuthChecked(true));
//         }
//     }, [authChecked, checkAuth]); // ✅ No infinite loop

//     console.log("ProtectedRoute user:", user);

//     if (loading || !authChecked) {
//         return (
//             <div className="min-h-[400px] flex flex-col items-center justify-center bg-gradient-to-b from-stone-50 to-stone-100">
//                 <div className="flex flex-col items-center space-y-4">
//                     <Loader2 className="h-12 w-12 animate-spin text-stone-600" />
//                     <p className="text-lg font-medium text-stone-700">Loading your content...</p>
//                     <p className="text-sm text-stone-500">This may take a few moments</p>
//                 </div>
//             </div>
//         );
//     }

//     return user ? children : <Navigate to="/login" />;
// };

// export default ProtectedRoute;
