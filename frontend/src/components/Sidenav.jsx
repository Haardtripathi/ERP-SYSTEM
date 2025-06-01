import React from "react";
import { NavLink } from "react-router-dom";
import { Users, MessageSquare, Eye } from "lucide-react";
import useAuthStore from "@/store/authStore";

const Sidenav = () => {
    const { isAdmin } = useAuthStore();

    return (
        <div className="fixed top-16 left-0 h-[calc(100vh-4rem)] bg-white/80 backdrop-blur-sm border-r border-gray-200 w-64 lg:w-56 md:w-48 sm:w-40">
            <div className="flex flex-col h-full">
                <nav className="flex-1 p-4 overflow-y-auto">
                    <NavLink
                        to="/workbook"
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 ${isActive
                                ? "bg-blue-50 text-blue-600 font-medium"
                                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                            }`
                        }
                    >
                        <span>Workbook</span>
                    </NavLink>

                    <NavLink
                        to="/lead"
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 ${isActive
                                ? "bg-blue-50 text-blue-600 font-medium"
                                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                            }`
                        }
                    >
                        <span>Lead</span>
                    </NavLink>

                    <NavLink
                        to="/incoming"
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 ${isActive
                                ? "bg-blue-50 text-blue-600 font-medium"
                                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                            }`
                        }
                    >
                        <span>Incoming</span>
                    </NavLink>

                    <div className="my-2 border-t border-gray-200"></div>

                    <NavLink
                        to="/pending"
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 ${isActive
                                ? "bg-blue-50 text-blue-600 font-medium"
                                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                            }`
                        }
                    >
                        <span>Pending</span>
                    </NavLink>

                    <NavLink
                        to="/confirmed"
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 ${isActive
                                ? "bg-blue-50 text-blue-600 font-medium"
                                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                            }`
                        }
                    >
                        <span>Confirmed</span>
                    </NavLink>

                    <div className="my-2 border-t border-gray-200"></div>

                    <NavLink
                        to="/sheet-generator"
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 ${isActive
                                ? "bg-blue-50 text-blue-600 font-medium"
                                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                            }`
                        }
                    >
                        <span>Sheets</span>
                    </NavLink>

                    <NavLink
                        to="/labels-generator"
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 ${isActive
                                ? "bg-blue-50 text-blue-600 font-medium"
                                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                            }`
                        }
                    >
                        <span>Labels</span>
                    </NavLink>

                    <div className="my-2 border-t border-gray-200"></div>

                    <NavLink
                        to="/dispatched"
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 ${isActive
                                ? "bg-blue-50 text-blue-600 font-medium"
                                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                            }`
                        }
                    >
                        <span>Dispatched</span>
                    </NavLink>

                    <NavLink
                        to="/complain"
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 ${isActive
                                ? "bg-blue-50 text-blue-600 font-medium"
                                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                            }`
                        }
                    >
                        <span>Complain</span>
                    </NavLink>

                    <div className="my-2 border-t border-gray-200"></div>

                    <NavLink
                        to="/return"
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 ${isActive
                                ? "bg-blue-50 text-blue-600 font-medium"
                                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                            }`
                        }
                    >
                        <span>Return</span>
                    </NavLink>

                    <NavLink
                        to="/delivered"
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 ${isActive
                                ? "bg-blue-50 text-blue-600 font-medium"
                                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                            }`
                        }
                    >
                        <span>Delivered</span>
                    </NavLink>

                    <NavLink
                        to="/payment"
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 ${isActive
                                ? "bg-blue-50 text-blue-600 font-medium"
                                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                            }`
                        }
                    >
                        <span>Payments</span>
                    </NavLink>

                    <div className="my-2 border-t border-gray-200"></div>

                    {/* Chat Section */}
                    <NavLink
                        to="/chat"
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 ${isActive
                                ? "bg-blue-50 text-blue-600 font-medium"
                                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                            }`
                        }
                    >
                        <MessageSquare className="w-5 h-5" />
                        <span>Chat</span>
                    </NavLink>

                    {isAdmin && (
                        <>
                            <NavLink
                                to="/admin/chat"
                                className={({ isActive }) =>
                                    `flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 ${isActive
                                        ? "bg-blue-50 text-blue-600 font-medium"
                                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                    }`
                                }
                            >
                                <Eye className="w-5 h-5" />
                                <span>Monitor Chats</span>
                            </NavLink>

                            <NavLink
                                to="/add-user"
                                className={({ isActive }) =>
                                    `flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 ${isActive
                                        ? "bg-blue-50 text-blue-600 font-medium"
                                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                    }`
                                }
                            >
                                <Users className="w-5 h-5" />
                                <span>Add User</span>
                            </NavLink>

                            <NavLink
                                to="/users"
                                className={({ isActive }) =>
                                    `flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 ${isActive
                                        ? "bg-blue-50 text-blue-600 font-medium"
                                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                    }`
                                }
                            >
                                <Users className="w-5 h-5" />
                                <span>Users</span>
                            </NavLink>
                        </>
                    )}
                </nav>
            </div>
        </div>
    );
};

export default Sidenav;