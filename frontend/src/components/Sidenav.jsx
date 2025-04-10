

// import React from "react";
// import { NavLink } from "react-router-dom";
// import { Users } from "lucide-react";
// import useAuthStore from "@/store/authStore";
// import { getAuthUserAccessPages } from "@/services/adminService";

// const Sidenav = () => {
//     const { isAdmin } = useAuthStore();

//     return (
//         <div className="fixed top-16 left-0 h-[calc(100vh-4rem)] bg-white/80 backdrop-blur-sm border-r border-gray-200 w-64 lg:w-56 md:w-48 sm:w-40">
//             <div className="flex flex-col h-full">
//                 <nav className="flex-1 p-4 overflow-y-auto">
//                     <NavLink
//                         to="/workbook"
//                         className={({ isActive }) =>
//                             `flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 ${isActive
//                                 ? "bg-blue-50 text-blue-600 font-medium"
//                                 : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
//                             }`
//                         }
//                     >
//                         <span>Workbook</span>
//                     </NavLink>

//                     <NavLink
//                         to="/leads"
//                         className={({ isActive }) =>
//                             `flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 ${isActive
//                                 ? "bg-blue-50 text-blue-600 font-medium"
//                                 : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
//                             }`
//                         }
//                     >
//                         <span>Lead</span>
//                     </NavLink>

//                     <NavLink
//                         to="/incoming"
//                         className={({ isActive }) =>
//                             `flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 ${isActive
//                                 ? "bg-blue-50 text-blue-600 font-medium"
//                                 : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
//                             }`
//                         }
//                     >
//                         <span>Incoming</span>
//                     </NavLink>

//                     <div className="my-2 border-t border-gray-200"></div>

//                     <NavLink
//                         to="/pending"
//                         className={({ isActive }) =>
//                             `flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 ${isActive
//                                 ? "bg-blue-50 text-blue-600 font-medium"
//                                 : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
//                             }`
//                         }
//                     >
//                         <span>Pending</span>
//                     </NavLink>

//                     <NavLink
//                         to="/confirmed"
//                         className={({ isActive }) =>
//                             `flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 ${isActive
//                                 ? "bg-blue-50 text-blue-600 font-medium"
//                                 : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
//                             }`
//                         }
//                     >
//                         <span>Confirmed</span>
//                     </NavLink>

//                     <div className="my-2 border-t border-gray-200"></div>

//                     <NavLink
//                         to="/sheet-generator"
//                         className={({ isActive }) =>
//                             `flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 ${isActive
//                                 ? "bg-blue-50 text-blue-600 font-medium"
//                                 : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
//                             }`
//                         }
//                     >
//                         <span>Sheets</span>
//                     </NavLink>

//                     <NavLink
//                         to="/labels-generator"
//                         className={({ isActive }) =>
//                             `flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 ${isActive
//                                 ? "bg-blue-50 text-blue-600 font-medium"
//                                 : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
//                             }`
//                         }
//                     >
//                         <span>Labels</span>
//                     </NavLink>

//                     <div className="my-2 border-t border-gray-200"></div>

//                     <NavLink
//                         to="/dispatched"
//                         className={({ isActive }) =>
//                             `flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 ${isActive
//                                 ? "bg-blue-50 text-blue-600 font-medium"
//                                 : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
//                             }`
//                         }
//                     >
//                         <span>Dispatched</span>
//                     </NavLink>

//                     <NavLink
//                         to="/complain"
//                         className={({ isActive }) =>
//                             `flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 ${isActive
//                                 ? "bg-blue-50 text-blue-600 font-medium"
//                                 : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
//                             }`
//                         }
//                     >
//                         <span>Complain</span>
//                     </NavLink>

//                     <div className="my-2 border-t border-gray-200"></div>

//                     <NavLink
//                         to="/return"
//                         className={({ isActive }) =>
//                             `flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 ${isActive
//                                 ? "bg-blue-50 text-blue-600 font-medium"
//                                 : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
//                             }`
//                         }
//                     >
//                         <span>Return</span>
//                     </NavLink>
//                     <NavLink
//                         to="/delivered"
//                         className={({ isActive }) =>
//                             `flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 ${isActive
//                                 ? "bg-blue-50 text-blue-600 font-medium"
//                                 : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
//                             }`
//                         }
//                     >
//                         <span>Delivered</span>
//                     </NavLink>
//                     <NavLink
//                         to="/payment"
//                         className={({ isActive }) =>
//                             `flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 ${isActive
//                                 ? "bg-blue-50 text-blue-600 font-medium"
//                                 : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
//                             }`
//                         }
//                     >
//                         <span>Payments</span>
//                     </NavLink>

//                 </nav>



//                 {isAdmin && (

//                     <>
//                         <div className="p-4 mt-auto border-t border-gray-200">
//                             <NavLink
//                                 to="/roles"
//                                 className={({ isActive }) =>
//                                     `flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 ${isActive
//                                         ? "bg-blue-50 text-blue-600 font-medium"
//                                         : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
//                                     }`
//                                 }
//                             >
//                                 <Users className="w-5 h-5" />
//                                 <span>Roles</span>
//                             </NavLink>
//                             <NavLink
//                                 to="/add-role"
//                                 className={({ isActive }) =>
//                                     `flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 ${isActive
//                                         ? "bg-blue-50 text-blue-600 font-medium"
//                                         : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
//                                     }`
//                                 }
//                             >
//                                 <Users className="w-5 h-5" />
//                                 <span>Add Role</span>
//                             </NavLink>
//                         </div>
//                         <div className="p-4 mt-auto border-t border-gray-200">
//                             <NavLink
//                                 to="/users"
//                                 className={({ isActive }) =>
//                                     `flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 ${isActive
//                                         ? "bg-blue-50 text-blue-600 font-medium"
//                                         : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
//                                     }`
//                                 }
//                             >
//                                 <Users className="w-5 h-5" />
//                                 <span>Users</span>
//                             </NavLink>
//                             <NavLink
//                                 to="/add-user"
//                                 className={({ isActive }) =>
//                                     `flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 ${isActive
//                                         ? "bg-blue-50 text-blue-600 font-medium"
//                                         : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
//                                     }`
//                                 }
//                             >
//                                 <Users className="w-5 h-5" />
//                                 <span>Add User</span>
//                             </NavLink>
//                         </div>
//                     </>
//                 )}
//             </div>
//         </div>
//     );
// };

// export default Sidenav;



import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { Users } from "lucide-react";
import useAuthStore from "@/store/authStore";
import { getAuthUserAccessPages } from "@/services/adminService";

const Sidenav = () => {
    const { isAdmin } = useAuthStore();
    const [allowedPages, setAllowedPages] = useState([]);

    // Fetch allowed pages when the component mounts
    useEffect(() => {
        const fetchPages = async () => {
            try {
                const response = await getAuthUserAccessPages();
                // Expected response: { pages: ["/leads", "/payment", "/dashboard", "/users", "/settings"] }
                if (response && response.pages) {
                    setAllowedPages(response.pages);
                }
            } catch (error) {
                console.error("Error fetching allowed pages", error);
            }
        };
        fetchPages();
    }, []);

    // Define your nav links grouped as they appear in the sidenav
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

    // Filter nav groups to include only allowed links
    const filteredGroups = navGroups
        .map(group => group.filter(item => allowedPages.includes(item.to)))
        .filter(group => group.length > 0);

    return (
        <div className="fixed top-16 left-0 h-[calc(100vh-4rem)] bg-white/80 backdrop-blur-sm border-r border-gray-200 w-64 lg:w-56 md:w-48 sm:w-40">
            <div className="flex flex-col h-full">
                <nav className="flex-1 p-4 overflow-y-auto">
                    {filteredGroups.map((group, index) => (
                        <div key={index}>
                            {/* Add separator before groups except the first */}
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
                </nav>

                {/* Admin links remain in their fixed location */}
                {isAdmin && (
                    <>
                        <div className="p-4 mt-auto border-t border-gray-200">
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
                        </div>
                        <div className="p-4 mt-auto border-t border-gray-200">
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
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default Sidenav;
