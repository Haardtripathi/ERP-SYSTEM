const User = require('../models/User')

const jwt = require('jsonwebtoken');




exports.getAllUserData = async (req, res) => {
    try {
        const users = await User.find({});

        // Process each user in the array
        const userData = users.map((user) => {
            // Convert the Mongoose document to a plain object
            let userObj = user.toObject();

            // Convert photo data to base64 if available
            if (userObj.photo?.data) {
                userObj.photo.data = userObj.photo.data.toString("base64");
            }
            return userObj;
        });

        return res.status(200).json({ users: userData });
    }
    catch (error) {
        console.error(error);
        return res.status(403).json({ error: 'Invalid token' });
    }
}


exports.getUserById = async (req, res) => {
    const { id } = req.params

    try {
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        // Convert the Mongoose document to a plain object
        let userObj = user.toObject();
        // Convert photo data to base64 if available
        const userData = user.toObject()
        if (userData.photo?.data) {
            userData.photo.data = userData.photo.data.toString("base64")
        }

        return res.status(200).json({ user: userData })


    } catch (error) {
        console.error(error);
        return res.status(403).json({ error: 'Invalid token' });

    }

}

exports.editUserData = async (req, res) => {
    console.log(req.body)
}