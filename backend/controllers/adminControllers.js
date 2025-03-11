const User = require('../models/User')

const jwt = require('jsonwebtoken');

const bcrypt = require('bcryptjs');

const Role = require("../models/Role");
const Permission = require("../models/Permission");
const Lead = require("../models/Lead");
const Incoming = require("../models/Incoming");
const Workbook = require("../models/Workbook");

exports.getAllRoles = async (req, res) => {
    try {
        const roles = await Role.find().lean();

        const rolesWithPermissions = await Promise.all(
            roles.map(async (role) => {
                const permissions = await Permission.findOne({ role: role._id }).lean();
                return { ...role, permissions: permissions ? permissions.permissions : [] };
            })
        );

        res.status(200).json(rolesWithPermissions);
    } catch (error) {
        res.status(500).json({ message: "Error fetching roles", error });
    }
};

// Add a new role
exports.addRole = async (req, res) => {
    try {

        const { roleName, permissions } = req.body;

        // Create a new role
        const role = new Role({ name: roleName });
        await role.save();

        // Save permissions
        await Permission.create({
            role: role._id,
            permissions: permissions,
        });

        res.status(201).json({ message: "Role created successfully" });
    } catch (error) {
        res.status(500).json({ error: "Error creating role" });
    }
};

// // Fetch available pages and columns dynamically
// exports.getPagesAndColumns = async (req, res) => {
//     try {
//         const models = {
//             Lead: Lead.schema.paths,
//             Incoming: Incoming.schema.paths,

//         };

//         const pages = Object.keys(models).map((page) => ({
//             name: page,
//             columns: Object.keys(models[page]).filter((col) => !["_id", "__v", "timestamps", "createdAt", "updatedAt", "isDeleted"].includes(col))
//         }));

//         res.status(200).json(pages);
//     } catch (error) {
//         res.status(500).json({ error: "Error fetching pages and columns" });
//     }
// };

exports.getPagesAndColumns = async (req, res) => {
    try {
        // Define all sections and related database models
        const sections = [
            {
                section: "Lead Management",
                models: { Lead: Lead.schema.paths },
                extraPages: ["leads", "add-lead-data", "edit-lead-data"],
            },
            {
                section: "Incoming Management",
                models: { Incoming: Incoming.schema.paths },
                extraPages: ["incoming", "add-incoming-data", "edit-incoming-data"],
            },
        ];

        // Generate the response dynamically
        const pages = sections.map((section) => ({
            section: section.section,
            pages: [
                // Fetch database models dynamically
                ...Object.keys(section.models).map((page) => ({
                    name: page,
                    columns: Object.keys(section.models[page]).filter(
                        (col) => !["_id", "__v", "timestamps", "createdAt", "updatedAt", "isDeleted"].includes(col)
                    ),
                })),
                // Include extra pages that don’t have models
                ...section.extraPages.map((page) => ({ name: page, columns: [] })),
            ],
        }));

        res.status(200).json(pages);
    } catch (error) {
        console.error("Error fetching pages and columns:", error);
        res.status(500).json({ error: "Error fetching pages and columns" });
    }
};


exports.getAllUserData = async (req, res) => {
    try {
        const users = await User.find({}).populate('role');

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
    console.log(req.params)

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
            role,
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
            role,
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