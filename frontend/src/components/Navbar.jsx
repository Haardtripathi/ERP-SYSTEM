

// import React from "react";
// import { Link, useNavigate, useLocation } from "react-router-dom";
// import useAuthStore from "../store/authStore";
// import { LogOut, Home, Menu } from 'lucide-react';
// import { NavLink } from "react-router-dom";
// import useNavStore from '../store/navStore';

// const Navbar = () => {
//     const { user, logout } = useAuthStore();
//     const navigate = useNavigate();
//     const location = useLocation();

//     const handleLogout = () => {
//         logout();
//         navigate("/login");
//     };

//     const handleAddIncoming = () => {
//         navigate("/add-incoming-data");
//     };

//     const handleAddLead = () => {
//         navigate("/add-lead-data");
//     };

//     return (
//         <nav className="bg-white shadow-md border-b border-gray-200 h-16 fixed w-full z-10 flex items-center justify-between px-6">

//             <h1 className="text-lg font-semibold text-gray-800">
//                 <Link to="/" className="flex items-center">
//                     <Home className="mr-2 text-gray-600" size={20} />
//                     ERP System
//                 </Link>
//             </h1>

//             <ul className="flex items-center space-x-6 flex-grow justify-end">
//                 {location.pathname === "/incoming" && (
//                     <li>
//                         <button
//                             onClick={handleAddIncoming}
//                             className="px-4 py-2 text-sm font-medium text-white bg-black rounded hover:bg-blue-600 transition"
//                         >
//                             Add Incoming
//                         </button>
//                     </li>
//                 )}
//                 {location.pathname === "/leads" && (
//                     <li>
//                         <button
//                             onClick={handleAddLead}
//                             className="px-4 py-2 text-sm font-medium text-white bg-black rounded hover:bg-blue-600 transition"
//                         >
//                             Add Lead
//                         </button>
//                     </li>
//                 )}

//                 {user ? (
//                     <>
//                         <li>
//                             <NavLink
//                                 to="/dashboard"
//                                 className={({ isActive }) =>
//                                     `flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 ${isActive
//                                         ? "bg-blue-50 text-blue-600 font-medium"
//                                         : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
//                                     }`
//                                 }
//                             >
//                                 <span>Dashboard</span>
//                             </NavLink>
//                         </li>
//                         {/* <li className="text-sm font-medium text-gray-700"> */}
//                         {user && user.user ? (
//                             <li className="text-sm font-medium text-gray-700">
//                                 {user.user.email}
//                             </li>
//                         ) : (
//                             <li className="text-sm font-medium text-gray-700">Loading...</li>
//                         )}
//                         <NavLink
//                             to="/profile"
//                             className={({ isActive }) =>
//                                 `flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 ${isActive
//                                     ? "bg-blue-50 text-blue-600 font-medium"
//                                     : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
//                                 }`
//                             }
//                         >
//                             <span>Profile</span>
//                         </NavLink>

//                         {/* </li> */}

//                         <li
//                             className="flex items-center text-gray-700 cursor-pointer hover:text-red-500 transition-colors"
//                             onClick={handleLogout}
//                         >
//                             <LogOut className="mr-1" size={20} />
//                             Logout
//                         </li>
//                     </>
//                 ) : (
//                     <>
//                         <li>
//                             <Link
//                                 to="/login"
//                                 className="text-sm font-medium text-gray-700 hover:text-blue-500 transition-colors"
//                             >
//                                 Login
//                             </Link>
//                         </li>
//                         <li>
//                             <Link
//                                 to="/signup"
//                                 className="text-sm font-medium text-gray-700 hover:text-blue-500 transition-colors"
//                             >
//                                 Signup
//                             </Link>
//                         </li>
//                     </>
//                 )}
//             </ul>
//         </nav>
//     );
// };

// export default Navbar;





import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation, NavLink } from "react-router-dom";
import useAuthStore from "../store/authStore";
import { LogOut, Home } from "lucide-react";
import { getAuthUserAccessPages } from "@/services/adminService";

const Navbar = () => {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();
    const location = useLocation();
    const [allowedPages, setAllowedPages] = useState([]);

    // Fetch allowed pages on mount
    useEffect(() => {
        if (!user) return; // 🚫 Don't run if no user
        const fetchPages = async () => {
            try {
                const response = await getAuthUserAccessPages();
                // Expected response format:
                // { pages: ["/leads", "/payment", "/dashboard", "/users", "/settings", "/add-lead-data", "/edit-lead-data", "/add-incoming-data"] }
                if (response && response.pages) {
                    setAllowedPages(response.pages);
                }
            } catch (error) {
                console.error("Error fetching allowed pages", error);
            }
        };
        fetchPages();
    }, []);

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const handleAddIncoming = () => {
        navigate("/add-incoming-data");
    };

    const handleAddLead = () => {
        navigate("/add-lead-data");
    };

    return (
        <nav className="bg-white shadow-md border-b border-gray-200 h-16 fixed w-full z-10 flex items-center justify-between px-6">
            <h1 className="text-lg font-semibold text-gray-800">
                <Link to="/" className="flex items-center">
                    <Home className="mr-2 text-gray-600" size={20} />
                    ERP System
                </Link>
            </h1>

            <ul className="flex items-center space-x-6 flex-grow justify-end">
                {/* Render Add Incoming button only if on /incoming route and allowedPages has "/add-incoming-data" */}
                {location.pathname === "/incoming" &&
                    allowedPages.includes("/add-incoming-data") && (
                        <li>
                            <button
                                onClick={handleAddIncoming}
                                className="px-4 py-2 text-sm font-medium text-white bg-black rounded hover:bg-blue-600 transition"
                            >
                                Add Incoming
                            </button>
                        </li>
                    )}

                {/* Render Add Lead button only if on /leads route and allowedPages has either "/add-lead-data" or "/edit-lead-data" */}
                {location.pathname === "/leads" &&
                    (allowedPages.includes("/add-lead-data") || allowedPages.includes("/edit-lead-data")) && (
                        <li>
                            <button
                                onClick={handleAddLead}
                                className="px-4 py-2 text-sm font-medium text-white bg-black rounded hover:bg-blue-600 transition"
                            >
                                Add Lead
                            </button>
                        </li>
                    )}

                {user ? (
                    <>
                        <li>
                            <NavLink
                                to="/dashboard"
                                className={({ isActive }) =>
                                    `flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 ${isActive
                                        ? "bg-blue-50 text-blue-600 font-medium"
                                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                    }`
                                }
                            >
                                <span>Dashboard</span>
                            </NavLink>
                        </li>
                        {user && user.user ? (
                            <li className="text-sm font-medium text-gray-700">
                                {user.user.email}
                            </li>
                        ) : (
                            <li className="text-sm font-medium text-gray-700">Loading...</li>
                        )}
                        <NavLink
                            to="/profile"
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 ${isActive
                                    ? "bg-blue-50 text-blue-600 font-medium"
                                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                }`
                            }
                        >
                            <span>Profile</span>
                        </NavLink>
                        <li
                            className="flex items-center text-gray-700 cursor-pointer hover:text-red-500 transition-colors"
                            onClick={handleLogout}
                        >
                            <LogOut className="mr-1" size={20} />
                            Logout
                        </li>
                    </>
                ) : (
                    <>
                        <li>
                            <Link
                                to="/login"
                                className="text-sm font-medium text-gray-700 hover:text-blue-500 transition-colors"
                            >
                                Login
                            </Link>
                        </li>
                        <li>
                            <Link
                                to="/signup"
                                className="text-sm font-medium text-gray-700 hover:text-blue-500 transition-colors"
                            >
                                Signup
                            </Link>
                        </li>
                    </>
                )}
            </ul>
        </nav>
    );
};

export default Navbar;
