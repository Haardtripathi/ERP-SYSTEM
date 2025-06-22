const jwt = require("jsonwebtoken");
const Role = require("../models/Role")
const Permission = require("../models/Permission");

// module.exports.checkPermission = async (req, res, next) => {
//     try {

//         const userRole = req.user.role; // This is now a string (e.g., "Admin")
//         if (!userRole) {
//             return res.status(400).json({ message: "Role not found in token" });
//         }

//         const roleObject = await Role.findOne({ name: userRole })
//         const roleId = roleObject._id
//         console.log(roleId)
//         // 🔥 Find role permissions using the role name (string)
//         const permission = await Permission.findOne({ role: roleId });
//         console.log(permission)
//         if (!permission) {
//             return res.status(403).json({ message: `Access Denied: No permissions found for role '${userRole}'` });
//         }

//         // 🔥 Check if the requested page has permissions
//         const { page } = req.params;
//         const pagePermission = permission.permissions.find((p) => p.page === page);

//         if (!pagePermission) {
//             return res.status(403).json({ message: `Access Denied: No permission for page '${page}'` });
//         }

//         req.allowedColumns = pagePermission.columns; // Store allowed columns for further use
//         next(); // Proceed to the next middleware

//     } catch (error) {
//         return res.status(401).json({ message: "Invalid or expired token", error: error.message });
//     }
// };








// module.exports.checkPermission = async (req, res, next) => {
//     try {


//         const userRole = req.user?.role; // Check if role exists
//         if (!userRole) {

//             return res.status(400).json({ message: "Role not found in token" });
//         }



//         // Fetch the role object
//         const roleObject = await Role.findOne({ name: userRole });
//         if (!roleObject) {

//             return res.status(403).json({ message: `Role '${userRole}' not found` });
//         }

//         const roleId = roleObject._id;


//         // Fetch the permissions for the role
//         const permission = await Permission.findOne({ role: roleId });
//         if (!permission) {

//             return res.status(403).json({ message: `Access Denied: No permissions for role '${userRole}'` });
//         }

//         // Extract the requested API path
//         console.log(req)
//         const requestedPage = req.baseUrl + req.route.path;



//         // Find matching permission
//         const pagePermission = permission.permissions.find((p) => p.page === requestedPage);
//         if (!pagePermission) {

//             return res.status(403).json({ message: `Access Denied: No permission for page '${requestedPage}'` });
//         }

//         req.allowedColumns = pagePermission.columns || []; // Store allowed columns


//         next(); // Proceed to the next middleware

//     } catch (error) {
//         console.error("❌ Error in permission check:", error);
//         return res.status(401).json({ message: "Invalid or expired token", error: error.message });
//     }
// };





module.exports.checkPermission = async (req, res, next) => {
    try {


        // 🛑 Log frontend page URL for tracking
        const frontendPageUrl = req.header("X-Page-URL") || "Not provided";


        // 🔥 Ensure user exists in request
        const userRole = req.user?.role;
        if (!userRole) {

            return res.status(400).json({ message: "Role not found in token" });
        }



        // 🔍 Fetch role object from database
        const roleObject = await Role.findOne({ name: userRole });
        if (!roleObject) {

            return res.status(403).json({ message: `Role '${userRole}' not found` });
        }

        const roleId = roleObject._id;


        // 🔥 Fetch permissions associated with this role
        const permission = await Permission.findOne({ role: roleId });
        if (!permission) {

            return res.status(403).json({ message: `Access Denied: No permissions for role '${userRole}'` });
        }

        // 🔍 Normalize and extract the requested API route
        const requestedPage = req.baseUrl + req.route.path;


        // 🛠 Fix: Normalize paths if frontend uses different names
        const normalizedPage = requestedPage.replace(/^\/api\/lead/, "/leads"); // Convert `/api/lead/*` to `/leads`


        // 🔥 Check if user has permission for this page
        const pagePermission = permission.permissions.find((p) => p.page === normalizedPage);
        if (!pagePermission) {

            return res.status(403).json({ message: `Access Denied: No permission for '${normalizedPage}'` });
        }

        // ✅ Store allowed columns in request object for further processing
        req.allowedColumns = pagePermission.columns || [];


        next(); // Proceed to the next middleware

    } catch (error) {
        console.error("❌ Error in permission check:", error);
        return res.status(401).json({ message: "Invalid or expired token", error: error.message });
    }
};
