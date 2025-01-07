import React from "react";
import { NavLink } from "react-router-dom";

const Sidenav = () => {
    return (
        <div
            className="bg-gray-100 h-screen fixed top-16 left-0 shadow-md transition-all duration-300
                       w-64 lg:w-56 md:w-48 sm:w-40 xs:w-32"
        >
            <ul className="p-4">
                <li className="mb-4">
                    <NavLink
                        to="/dashboard"
                        className={({ isActive }) =>
                            isActive
                                ? "text-blue-600 font-bold"
                                : "text-gray-700 hover:text-blue-500"
                        }
                    >
                        Dashboard
                    </NavLink>
                </li>
                <li className="mb-4">
                    <NavLink
                        to="/incoming"
                        className={({ isActive }) =>
                            isActive
                                ? "text-blue-600 font-bold"
                                : "text-gray-700 hover:text-blue-500"
                        }
                    >
                        Incoming
                    </NavLink>
                </li>
            </ul>
        </div>
    );
};

export default Sidenav;
