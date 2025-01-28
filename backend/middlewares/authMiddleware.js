const jwt = require("jsonwebtoken"); // Install this library: npm install jsonwebtoken

module.exports.isAuthenticated = (req, res, next) => {
    try {
        // Get the token from the Authorization header
        const authHeader = req.headers.authorization;
        // (authHeader);
        console.log(authHeader)

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

        // Attach user data to the request for further use
        req.user = decoded;

        next(); // Pass control to the next middleware or route handler
    } catch (error) {
        return res.status(401).json({ message: "Invalid or expired token" });
    }
};

