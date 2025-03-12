const jwt = require("jsonwebtoken");
const Role = require("../models/Role")
const Permission = require("../models/Permission");

module.exports.checkPermission = async (req, res, next) => {
    try {

        const userRole = req.user.role; // This is now a string (e.g., "Admin")
        if (!userRole) {
            return res.status(400).json({ message: "Role not found in token" });
        }

        const roleObject = await Role.findOne({ name: userRole })
        const roleId = roleObject._id
        // 🔥 Find role permissions using the role name (string)
        const permission = await Permission.findOne({ role: roleId });

        if (!permission) {
            return res.status(403).json({ message: `Access Denied: No permissions found for role '${userRole}'` });
        }

        // 🔥 Check if the requested page has permissions
        const { page } = req.params;
        const pagePermission = permission.permissions.find((p) => p.page === page);

        if (!pagePermission) {
            return res.status(403).json({ message: `Access Denied: No permission for page '${page}'` });
        }

        req.allowedColumns = pagePermission.columns; // Store allowed columns for further use
        next(); // Proceed to the next middleware

    } catch (error) {
        return res.status(401).json({ message: "Invalid or expired token", error: error.message });
    }
};
