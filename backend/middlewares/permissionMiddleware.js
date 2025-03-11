const jwt = require("jsonwebtoken");
const Permission = require("../models/Permission");

module.exports.checkPermission = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ message: "Authorization header is missing" });
        }

        const token = authHeader.split(" ")[1]; // Extract token
        if (!token) {
            return res.status(401).json({ message: "Token is missing" });
        }

        // Verify the token
        const secretKey = process.env.JWT_SECRET || "yourSecretKey"; // Use your actual secret
        const decoded = jwt.verify(token, secretKey);
        const userRole = decoded.role; // This is now a string (e.g., "Admin")

        if (!userRole) {
            return res.status(400).json({ message: "Role not found in token" });
        }

        const roleObject = await role.findOne({ name: userRole })
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
