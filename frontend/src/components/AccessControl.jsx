// "use client";

// import { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import axiosInstance from "../axiosInstance.js"

// const useAccessControl = (page) => {
//     const navigate = useNavigate();
//     const [permissions, setPermissions] = useState(null);
//     const [loading, setLoading] = useState(true);

//     useEffect(() => {
//         const fetchPermissions = async () => {
//             try {
//                 const token = localStorage.getItem("token");
//                 if (!token) {
//                     navigate("/login"); // Redirect if no token
//                     return;
//                 }
//                 console.log("ABC")
//                 const response = await axiosInstance.get("/admin/permissions");
//                 console.log(response)

//                 const userPermissions = response.data; // Array of permissions from backend

//                 // Check if the user has access to this page
//                 const hasPageAccess = userPermissions.some((perm) => perm.page === page);

//                 if (!hasPageAccess) {
//                     navigate("/not-authorized"); // Redirect if no access
//                     return;
//                 }

//                 // Find the specific page permissions
//                 const pagePermissions = userPermissions.find((perm) => perm.page === page);
//                 setPermissions(pagePermissions ? pagePermissions.columns : []);
//             } catch (error) {
//                 console.error("Error fetching permissions:", error);
//                 navigate("/login"); // Redirect on error
//             } finally {
//                 setLoading(false);
//             }
//         };

//         fetchPermissions();
//     }, [page, navigate]);

//     return { permissions, loading };
// };

// export default useAccessControl;












// import { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import axiosInstance from "../axiosInstance.js";

// const useAccessControl = (page) => {
//     const navigate = useNavigate();
//     const [permissions, setPermissions] = useState(null);
//     const [loading, setLoading] = useState(true);

//     useEffect(() => {
//         const fetchPermissions = async () => {
//             try {
//                 const token = localStorage.getItem("token");
//                 if (!token) {
//                     navigate("/login"); // Redirect if no token
//                     return;
//                 }
//                 console.log("ABC");

//                 const response = await axiosInstance.get(`/permissions?page=${page}`);
//                 console.log(response);

//                 if (response.status === 403) {
//                     navigate("/not-authorized"); // Redirect if no access
//                     return;
//                 }

//                 setPermissions(response.data); // Store full object
//             } catch (error) {
//                 console.error("Error fetching permissions:", error);
//                 navigate("/login"); // Redirect on error
//             } finally {
//                 setLoading(false);
//             }
//         };

//         fetchPermissions();
//     }, [page, navigate]);

//     return { permissions, loading };
// };

// export default useAccessControl;

















import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../axiosInstance.js";

const useAccessControl = (page = null) => {
    const navigate = useNavigate();
    const [permissions, setPermissions] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPermissions = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    navigate("/login"); // Redirect if no token
                    return;
                }
                console.log("Fetching permissions for:", page || "ALL");

                const url = page ? `/permissions?page=${page}` : `/permissions`; // Handle both cases
                const response = await axiosInstance.get(url);

                if (response.status === 403) {
                    navigate("/not-authorized"); // Redirect if no access
                    return;
                }

                setPermissions(response.data); // Store full object
            } catch (error) {
                console.error("Error fetching permissions:", error);
                navigate("/login"); // Redirect on error
            } finally {
                setLoading(false);
            }
        };

        fetchPermissions();
    }, [page, navigate]);

    return { permissions, loading };
};

export default useAccessControl;
