import React, { useState, useEffect } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { getAuthUserAccessPages } from "@/services/adminService";

// navGroups logic from Sidenav.jsx
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

const SectionNav = () => {
    const [allowedPages, setAllowedPages] = useState([]);
    const [openSection, setOpenSection] = useState(null); // null means no section open
    const location = useLocation();
    const navigate = useNavigate();

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

    // Filter groups by allowedPages
    const filteredGroups = navGroups
        .map(group => group.filter(item => allowedPages.includes(item.to)))
        .filter(group => group.length > 0);

    // If the open section is filtered out (e.g. after allowedPages changes), reset to null
    useEffect(() => {
        if (openSection !== null && openSection >= filteredGroups.length) {
            setOpenSection(null);
        }
    }, [filteredGroups.length, openSection]);

    // When opening a section, auto-navigate to its first link
    useEffect(() => {
        if (openSection !== null && filteredGroups[openSection] && filteredGroups[openSection][0]) {
            navigate(filteredGroups[openSection][0].to);
        }
        // Only run when openSection changes
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [openSection]);

    const handleSectionClick = (idx) => {
        if (openSection === idx) {
            setOpenSection(null); // close if already open
        } else {
            setOpenSection(idx); // open and auto-navigate
        }
    };

    // Find which section contains the current route
    const activeSectionIdx = filteredGroups.findIndex(group =>
        group.some(item => location.pathname === item.to)
    );

    return (
        <div className="fixed top-16 left-0 w-full z-20 bg-white shadow">
            {/* Section Tabs */}
            <div className="border-b border-gray-200 flex items-center px-4 h-12">
                {filteredGroups.map((_, idx) => {
                    const isActive = openSection === idx || (openSection === null && activeSectionIdx === idx);
                    return (
                        <button
                            key={idx}
                            className={`px-4 py-2 rounded-t-md font-medium transition-colors duration-150 mr-2 ${isActive
                                ? "bg-blue-100 text-blue-700 border-b-2 border-blue-500"
                                : "text-gray-600 hover:bg-gray-100"
                                }`}
                            onClick={() => handleSectionClick(idx)}
                        >
                            Section {idx + 1}
                        </button>
                    );
                })}
            </div>
            {/* Section Links (only if openSection is not null) */}
            {openSection !== null && filteredGroups[openSection] && (
                <div className="border-b border-gray-200 flex items-center px-4 h-12 space-x-2 bg-white">
                    {filteredGroups[openSection].map(item => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            className={({ isActive }) =>
                                `px-4 py-2 rounded-md font-medium transition-colors duration-150 ${isActive || location.pathname === item.to
                                    ? "bg-blue-500 text-white"
                                    : "text-gray-700 hover:bg-blue-100"
                                }`
                            }
                        >
                            {item.label}
                        </NavLink>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SectionNav; 