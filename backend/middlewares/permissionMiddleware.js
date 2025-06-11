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
//         console.log("🔍 Checking Permissions...");

//         const userRole = req.user?.role; // Check if role exists
//         if (!userRole) {
//             console.log("❌ Role not found in token");
//             return res.status(400).json({ message: "Role not found in token" });
//         }

//         console.log(`🔹 User Role: ${userRole}`);

//         // Fetch the role object
//         const roleObject = await Role.findOne({ name: userRole });
//         if (!roleObject) {
//             console.log(`❌ Role '${userRole}' not found in database`);
//             return res.status(403).json({ message: `Role '${userRole}' not found` });
//         }

//         const roleId = roleObject._id;
//         console.log(`🔹 Role ID: ${roleId}`);

//         // Fetch the permissions for the role
//         const permission = await Permission.findOne({ role: roleId });
//         if (!permission) {
//             console.log(`❌ No permissions found for role '${userRole}'`);
//             return res.status(403).json({ message: `Access Denied: No permissions for role '${userRole}'` });
//         }

//         // Extract the requested API path
//         console.log(req)
//         const requestedPage = req.baseUrl + req.route.path;

//         console.log(`🔹 Requested Page: ${requestedPage}`);

//         // Find matching permission
//         const pagePermission = permission.permissions.find((p) => p.page === requestedPage);
//         if (!pagePermission) {
//             console.log(`❌ Access Denied: No permission for page '${requestedPage}'`);
//             return res.status(403).json({ message: `Access Denied: No permission for page '${requestedPage}'` });
//         }

//         req.allowedColumns = pagePermission.columns || []; // Store allowed columns
//         console.log(`✅ Allowed Columns: ${req.allowedColumns}`);

//         next(); // Proceed to the next middleware

//     } catch (error) {
//         console.error("❌ Error in permission check:", error);
//         return res.status(401).json({ message: "Invalid or expired token", error: error.message });
//     }
// };





module.exports.checkPermission = async (req, res, next) => {
    try {
        console.log("\n🔍 Checking Permissions...");

        // 🛑 Log frontend page URL for tracking
        const frontendPageUrl = req.header("X-Page-URL") || "Not provided";
        console.log(`🌍 Frontend Page URL: ${frontendPageUrl}`);

        // 🔥 Ensure user exists in request
        const userRole = req.user?.role;
        if (!userRole) {
            console.log("❌ Role not found in token");
            return res.status(400).json({ message: "Role not found in token" });
        }

        console.log(`🔹 User Role: ${userRole}`);

        // 🔍 Fetch role object from database
        const roleObject = await Role.findOne({ name: userRole });
        if (!roleObject) {
            console.log(`❌ Role '${userRole}' not found in database`);
            return res.status(403).json({ message: `Role '${userRole}' not found` });
        }

        const roleId = roleObject._id;
        console.log(`🔹 Role ID: ${roleId}`);

        // 🔥 Fetch permissions associated with this role
        const permission = await Permission.findOne({ role: roleId });
        if (!permission) {
            console.log(`❌ No permissions found for role '${userRole}'`);
            return res.status(403).json({ message: `Access Denied: No permissions for role '${userRole}'` });
        }

        // 🔍 Normalize and extract the requested API route
        const requestedPage = req.baseUrl + req.route.path;
        console.log(`🔹 Requested API Page: ${requestedPage}`);

        // 🛠 Fix: Normalize paths if frontend uses different names
        const normalizedPage = requestedPage.replace(/^\/api\/lead/, "/leads"); // Convert `/api/lead/*` to `/leads`
        console.log(`🔄 Normalized Page for Permission Check: ${normalizedPage}`);

        // 🔥 Check if user has permission for this page
        const pagePermission = permission.permissions.find((p) => p.page === normalizedPage);
        if (!pagePermission) {
            console.log(`❌ Access Denied: No permission for '${normalizedPage}'`);
            return res.status(403).json({ message: `Access Denied: No permission for '${normalizedPage}'` });
        }

        // ✅ Store allowed columns in request object for further processing
        req.allowedColumns = pagePermission.columns || [];
        console.log(`✅ Allowed Columns for User: ${req.allowedColumns.join(", ") || "None"}`);

        next(); // Proceed to the next middleware

    } catch (error) {
        console.error("❌ Error in permission check:", error);
        return res.status(401).json({ message: "Invalid or expired token", error: error.message });
    }
};
