import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import useAuthStore from "../store/authStore";
import { LogOut, Home } from "lucide-react";
import { NavLink } from "react-router-dom";

const Navbar = () => {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();
    const location = useLocation(); // Get current location

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const handleAddIncoming = () => {
        // Add your logic for "Add Incoming" button here
        navigate("/add-incoming-data");
    };

    const handleAddLead = () => {
        // Add your logic for "Add Incoming" button here
        navigate("/add-lead-data");
    };

    return (
        <nav className="bg-white shadow-md border-b border-gray-200 h-16 fixed w-full z-10">
            <div className="container mx-auto flex justify-between items-center h-full px-6">
                {/* Logo and App Name */}
                <h1 className="text-lg font-semibold text-gray-800">
                    <Link to="/" className="flex items-center">
                        <Home className="mr-2 text-gray-600" size={20} />
                        App
                    </Link>
                </h1>

                {/* Navigation Links */}
                <ul className="flex items-center space-x-6">
                    {/* Conditionally Render the Add Incoming Button */}
                    {location.pathname === "/incoming" && (
                        <li>
                            <button
                                onClick={handleAddIncoming}
                                className="px-4 py-2 text-sm font-medium text-white bg-black rounded hover:bg-blue-600 transition"
                            >
                                Add Incoming
                            </button>
                        </li>
                    )}
                    {location.pathname === "/lead" && (
                        <li>
                            <button
                                onClick={handleAddLead}
                                className="px-4 py-2 text-sm font-medium text-white bg-black rounded hover:bg-blue-600 transition"
                            >
                                Add Lead
                            </button>
                        </li>
                    )}

                    {/* User Info and Logout */}
                    {user ? (
                        <><li>
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
                            <li className="text-sm font-medium text-gray-700">{user.email}</li>
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
            </div>
        </nav>
    );
};

export default Navbar;
