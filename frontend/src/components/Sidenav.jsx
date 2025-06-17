import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { Users, MessageSquare, Eye } from "lucide-react";
import useAuthStore from "@/store/authStore";
import useChatStore from "@/store/chatStore";
import { getAuthUserAccessPages } from "@/services/adminService";

const Sidenav = () => {
    const { isAdmin } = useAuthStore();
    const { unreadChats } = useChatStore();
    const [allowedPages, setAllowedPages] = useState([]);

    useEffect(() => {
        const fetchPages = async () => {
            try {
                const response = await getAuthUserAccessPages();
                if (response && response.pages) {
                    setAllowedPages(response.pages);
                }
            } catch (error) {
                console.error("Error fetching allowed pages", error);
            }
        };
        fetchPages();
    }, []);

    const navGroups = [
        [
            { to: "/workbook", label: "Workbook" },
            { to: "/leads", label: "Lead" },
            { to: "/incoming", label: "Incoming" }
        ],
        [
            { to: "/pending", label: "Pending" },
            { to: "/confirmed", label: "Confirmed" }
        ],
        [
            { to: "/sheet-generator", label: "Sheets" },
            { to: "/labels-generator", label: "Labels" }
        ],
        [
            { to: "/dispatched", label: "Dispatched" },
            { to: "/complain", label: "Complain" }
        ],
        [
            { to: "/return", label: "Return" },
            { to: "/delivered", label: "Delivered" },
            { to: "/payment", label: "Payments" }
        ]
    ];

    const filteredGroups = navGroups
        .map(group => group.filter(item => allowedPages.includes(item.to)))
        .filter(group => group.length > 0);

    return (
        <div className="fixed top-16 left-0 h-[calc(100vh-4rem)] bg-white/80 backdrop-blur-sm border-r border-gray-200 w-64 lg:w-56 md:w-48 sm:w-40">
            <div className="flex flex-col h-full">
                <nav className="flex-1 p-4 overflow-y-auto">
                    {filteredGroups.map((group, index) => (
                        <div key={index}>
                            {index !== 0 && (
                                <div className="my-2 border-t border-gray-200"></div>
                            )}
                            {group.map(item => (
                                <NavLink
                                    key={item.to}
                                    to={item.to}
                                    className={({ isActive }) =>
                                        `flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 ${isActive
                                            ? "bg-blue-50 text-blue-600 font-medium"
                                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                        }`
                                    }
                                >
                                    <span>{item.label}</span>
                                </NavLink>
                            ))}
                        </div>
                    ))}

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
                        <div className="relative">
                            <MessageSquare className="w-5 h-5" />
                            {unreadChats > 0 && (
                                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                    {unreadChats}
                                </span>
                            )}
                        </div>
                        <span>Chat</span>
                    </NavLink>
                </nav>

                {/* Admin Section - Fixed at bottom */}
                {isAdmin && (
                    <div className="p-4 border-t border-gray-200">
                        <NavLink
                            to="/roles"
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 ${isActive
                                    ? "bg-blue-50 text-blue-600 font-medium"
                                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                }`
                            }
                        >
                            <Users className="w-5 h-5" />
                            <span>Roles</span>
                        </NavLink>
                        <NavLink
                            to="/add-role"
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 ${isActive
                                    ? "bg-blue-50 text-blue-600 font-medium"
                                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                }`
                            }
                        >
                            <Users className="w-5 h-5" />
                            <span>Add Role</span>
                        </NavLink>
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
                    </div>
                )}
            </div>
        </div>
    );
};

export default Sidenav;
