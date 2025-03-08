const Permission = require("../models/Permission");

const checkPermission = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ message: "Authorization header is missing" });
    }

    const token = authHeader.split(" ")[1]; // Extract the token (e.g., "Bearer <token>")
    if (!token) {
        return res.status(401).json({ message: "Token is missing" });
    }

    // Verify the token
    const secretKey = process.env.JWT_SECRET || "yourSecretKey"; // Use your secret key
    const decoded = jwt.verify(token, secretKey);
    const userRole = decoded.role
    const { page } = req.params; // Extract requested page

    // Find allowed columns for this role
    const permission = await Permission.findOne({ role: userRole, page });

    if (!permission) {
        return res.status(403).json({ message: "Access Denied" });
    }

    req.allowedColumns = permission.columns; // Attach allowed columns to request
    next();
};

module.exports = checkPermission;
