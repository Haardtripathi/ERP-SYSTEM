const User = require('../models/User')

const jwt = require('jsonwebtoken');



exports.getProfileData = async (req, res) => {
    const token = req.header('Authorization').split(" ")[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findOne({ agent_name: decoded.agent_name })
        const userData = user.toObject()
        if (userData.photo?.data) {
            userData.photo.data = userData.photo.data.toString("base64")
        }

        return res.status(200).json({ user: userData })
    }
    catch {
        return res.status(403).json({ error: 'Invalid token' });
    }
}
