const User = require('../models/User')

const jwt = require('jsonwebtoken');



// exports.getAllUserData = async (req, res) => {

//     try {
//         console.log('abc')

//         const user = await User.find({})
//         console.log(user)
//         // const userData = user.toObject()

//         // Convert the photo to base64 format if it exists

//         if (userData.photo?.data) {
//             userData.photo.data = userData.photo.data.toString("base64")
//         }

//         return res.status(200).json({ user: userData })
//     }
//     catch {
//         return res.status(403).json({ error: 'Invalid token' });
//     }
// }

exports.getAllUserData = async (req, res) => {
    try {
        console.log('abc');
        const users = await User.find({});
        console.log(users);

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
