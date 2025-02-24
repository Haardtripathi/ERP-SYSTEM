const User = require('../models/User')

const jwt = require('jsonwebtoken');

const bcrypt = require('bcryptjs');



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
            return res.status(404).json({ error: 'User  not found' });
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
    try {
        const {
            email,
            password,
            agentName,
            companyNumber,
            phoneNumber,
            address,
            localAddress,
            aadharNumber,
            bankName,
            bankBranch,
            IFSC_Code,
            accountNumber,
            photo
        } = req.body.formData;
        const hashedPassword = await bcrypt.hash(password, 10);


        // Create update object with mapped field names
        const updateData = {
            email,
            company_number: companyNumber,
            phone_number: phoneNumber,
            agent_name: agentName,
            address,
            local_address: localAddress,
            aadhar_number: aadharNumber,
            bank_name: bankName,
            branch_name: bankBranch,
            account_number: accountNumber,
            ifsc_code: IFSC_Code
        };

        // Only include password if it's provided
        if (password) {
            updateData.password = hashedPassword;
        }

        // Handle photo if provided
        if (photo && photo.startsWith('data:image')) {
            // Extract MIME type and base64 data
            const matches = photo.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);

            if (matches && matches.length === 3) {
                updateData.photo = {
                    data: Buffer.from(matches[2], 'base64'),
                    contentType: matches[1]
                };
            }
        }

        // Remove any undefined fields
        Object.keys(updateData).forEach(key =>
            updateData[key] === undefined && delete updateData[key]
        );

        // Update the user
        const updatedUser = await User.findByIdAndUpdate(
            req.body.data, // Assuming the ID is passed in params
            updateData,
            {
                new: true, // Return the updated document
                runValidators: true // Run schema validators
            }
        );

        if (!updatedUser) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "User updated successfully",
            data: updatedUser
        });

    } catch (error) {
        console.error("Error updating user:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Error updating user",
            error: error
        });
    }
};