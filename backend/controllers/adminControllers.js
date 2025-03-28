const User = require('../models/User')

const jwt = require('jsonwebtoken');

const bcrypt = require('bcryptjs');

const Role = require("../models/Role");
const Permission = require("../models/Permission");
const Lead = require("../models/Lead");
const Incoming = require("../models/Incoming");
const Workbook = require("../models/Workbook");
const Pending = require("../models/Pending");
const Confirmed = require("../models/Confirmed");
// const SheetGenerator = require("../models/Confirmed");
// const LabelGenerator = require("../models/Confirmed");
const Dispatched = require("../models/Dispatched");
const Complain = require("../models/Complain");
const Return = require("../models/Return");
const Delivered = require("../models/Delivered");
const Payment = require("../models/Payment");






exports.getAllRolesAndPermissions = async (req, res) => {
    try {
        const roles = await Role.find().lean();

        const rolesWithPermissions = await Promise.all(
            roles.map(async (role) => {
                const permissions = await Permission.findOne({ role: role._id }).lean();
                return { ...role, permissions: permissions ? permissions.permissions : [] };
            })
        );
        // console.log(rolesWithPermissions)
        console.log("ABC")
        const roleName = req.user.role

        const userRole = await Role.findOne({ name: roleName })
        const permissions = await Permission.findOne({ role: userRole._id })

        console.log(permissions)

        res.status(200).json(rolesWithPermissions);
    } catch (error) {
        res.status(500).json({ message: "Error fetching roles", error });
    }
};

exports.getAllPermissionsOfRole = async (req, res) => {
    try {
        const roleName = req.user.role

        const userRole = await Role.findOne({ name: roleName })

        const permissions = await Permission.findOne({ role: userRole._id })

        res.status(200).json(permissions)
    }
    catch (error) {
        res.status(500).json({ message: "Error fetching permissions", error });

    }
}




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


// exports.getPagesAndColumns = async (req, res) => {
//     try {
//         // Define all sections and related database models
//         const sections = [
//             {
//                 section: "Lead Management",
//                 models: { Lead: Lead.schema.paths },
//                 pages: ["/leads", "/add-lead-data", "/edit-lead-data/:id"],
//             },
//             {
//                 section: "Incoming Management",
//                 models: { Incoming: Incoming.schema.paths },
//                 pages: ["/incoming", "/add-incoming-data", "/edit-incoming-data/:id"],
//             },
//         ];

//         // Generate the response dynamically
//         const pages = sections.map((section) => {
//             // First, collect all unique columns from all models in this section
//             const allColumnsInSection = new Set();

//             // Extract columns from all models in this section
//             Object.values(section.models).forEach(modelPaths => {
//                 Object.keys(modelPaths).forEach(col => {
//                     if (!["__v", "timestamps", "createdAt", "updatedAt"].includes(col)) {
//                         allColumnsInSection.add(col);
//                     }
//                 });
//             });

//             // Convert Set to Array for consistent ordering
//             const sectionColumns = Array.from(allColumnsInSection);

//             return {
//                 section: section.section,
//                 pages: [
//                     // Apply the same columns to all database model pages
//                     // ...Object.keys(section.models).map((page) => ({
//                     //     name: page,
//                     //     columns: sectionColumns,
//                     // })),
//                     // Include extra pages with the same columns
//                     ...section.pages.map((page) => ({
//                         name: page,
//                         columns: sectionColumns
//                     })),
//                 ],
//             };
//         });

//         res.status(200).json(pages);
//     } catch (error) {
//         console.error("Error fetching pages and columns:", error);
//         res.status(500).json({ error: "Error fetching pages and columns" });
//     }
// };


exports.getUpdateRole = async (req, res) => {
    const { id } = req.params
    const role = await Role.find({ _id: id }).lean();

    const rolesWithPermissions = await Promise.all(
        role.map(async (role) => {
            const permissions = await Permission.findOne({ role: role._id }).lean();
            return { ...role, permissions: permissions ? permissions.permissions : [] };
        })
    );

    res.status(200).json(rolesWithPermissions);
}

exports.postUpdateRole = async (req, res) => {
    const roleData = req.body
    // console.log(roleData)
    const roleName = roleData.name
    const rolePermissions = roleData.permissions
    // console.log(roleName, rolePermissions)
    const role = await Role.findOne({ _id: roleData._id })
    role.name = roleName
    await role.save()

    const permission = await Permission.findOne({ role: roleData._id })
    permission.permissions = rolePermissions

    await permission.save()

    res.status(201).json({ message: "Role updated successfully" });


}


exports.deleteRole = async (req, res) => {
    console.log(req.body)
    try {
        const { roleID } = req.body;

        if (!roleID) {
            return res.status(400).json({ success: false, message: "Role ID is required" });
        }
        // // console.log("ABc")

        const roleResult = await Role.deleteOne({ _id: roleID });
        // console.log("ABc")

        const permissionResult = await Permission.deleteOne({ role: roleID });

        // console.log("ABc")

        res.status(200).json({
            success: true,
            message: "Role and its permissions deleted successfully",
        });
    } catch (error) {
        console.error("Error deleting role:", error);
        res.status(500).json({ success: false, message: "Server error while deleting role" });
    }
};


exports.getPagesAndColumns = async (req, res) => {
    try {
        // Define all sections and related database models
        const sections = [
            {
                section: "Lead Management",
                models: { Lead: Lead.schema.paths, },
                view: { pages: ["/leads"] },
                edit: { pages: ["/add-lead-data", "/edit-lead-data/:id"] }
            },
            {
                section: "Incoming Management",
                models: { Incoming: Incoming.schema.paths },
                view: { pages: ["/incoming"] },
                edit: { pages: ["/add-incoming-data", "/edit-incoming-data/:id"] }
            },
            {
                section: "Workbook Management",
                models: {
                    // Workbook fields (including nested 'data')
                    Workbook: Object.keys(Workbook.schema.paths).filter(key =>
                        !["__v", "createdAt", "updatedAt"].includes(key)
                    ),

                    // Lead fields (shared with Incoming)
                    Lead: Object.keys(Lead.schema.paths).filter(key =>
                        !["__v", "createdAt", "updatedAt"].includes(key)
                    )
                },
                view: { pages: ["/workbook"] },
                edit: { pages: [] }
            },
            {
                section: "Pending Management",
                models: {
                    Pending: Object.keys(Pending.schema.paths).filter(
                        key => !["__v", "createdAt", "updatedAt"].includes(key)
                    )
                },
                view: {
                    pages: ["/pending"] // ✅ Add more if needed
                },
                edit: {
                    pages: ["/edit-pending-data/:id"] // ✅ Optional: add more here
                }
            },
            {
                section: "Confirmed Management",
                models: {
                    Confirmed: Object.keys(Confirmed.schema.paths).filter(
                        key => !["__v", "createdAt", "updatedAt", "location_and_date"].includes(key)
                    )
                },
                view: {
                    pages: ["/confirmed"] // ✅ Add more if needed
                },
                edit: {
                    pages: [] // ✅ Optional: add more here
                }
            },
            {
                section: "Sheet Generator Management",
                models: {
                    Confirmed: Object.keys(Confirmed.schema.paths).filter(
                        key => !["__v", "createdAt", "updatedAt", "isHold", "isCancelled", "isDispatched", "location_and_date", "awb_number"].includes(key)
                    )
                },
                view: {
                    pages: ["/sheet-generator"] // ✅ Add more if needed
                },
                edit: {
                    pages: [] // ✅ Optional: add more here
                }
            },
            {
                section: "Label Generator Management",
                models: {
                    Confirmed: Object.keys(Confirmed.schema.paths).filter(
                        key => !["__v", "createdAt", "updatedAt", "isHold", "isCancelled", "isDispatched", "location_and_date"].includes(key)
                    )
                },
                view: {
                    pages: ["/labels-generator"] // ✅ Add more if needed
                },
                edit: {
                    pages: [] // ✅ Optional: add more here
                }
            },
            {
                section: "Dispatched Management",
                models: {
                    // Workbook fields (including nested 'data')
                    Dispatched: Object.keys(Dispatched.schema.paths).filter(key =>
                        !["__v", "createdAt", "updatedAt"].includes(key)
                    ),

                    // Lead fields (shared with Incoming)
                    Confirmed: Object.keys(Confirmed.schema.paths).filter(key =>
                        !["__v", "createdAt", "updatedAt", "isHold", "isCancelled",].includes(key)
                    )
                },
                view: { pages: ["/confirmed"] },
                edit: { pages: [] }
            },
            {
                section: "Complain Management",
                models: {
                    Complain: Object.keys(Complain.schema.paths).filter(
                        key => !["__v", "createdAt", "updatedAt"].includes(key)
                    )
                },
                view: {
                    pages: ["/complain"] // ✅ Add more if needed
                },
                edit: {
                    pages: [] // ✅ Optional: add more here
                }
            },
            {
                section: "Return Management",
                models: {
                    Return: Object.keys(Return.schema.paths).filter(
                        key => !["__v", "createdAt", "updatedAt"].includes(key)
                    )
                },
                view: {
                    pages: ["/return"] // ✅ Add more if needed
                },
                edit: {
                    pages: [] // ✅ Optional: add more here
                }
            },
            {
                section: "Delivered Management",
                models: {
                    Delivered: Object.keys(Delivered.schema.paths).filter(
                        key => !["__v", "createdAt", "updatedAt"].includes(key)
                    )
                },
                view: {
                    pages: ["/delivered"] // ✅ Add more if needed
                },
                edit: {
                    pages: [] // ✅ Optional: add more here
                }
            },
            {
                section: "Payment Management",
                models: {
                    Payment: Object.keys(Payment.schema.paths).filter(
                        key => !["__v", "createdAt", "updatedAt"].includes(key)
                    )
                },
                view: {
                    pages: ["/payment"] // ✅ Add more if needed
                },
                edit: {
                    pages: [] // ✅ Optional: add more here
                }
            },




        ];

        // Generate the response dynamically
        const pages = sections.map((section) => {
            // Collect all unique columns from all models in this section
            const allColumnsInSection = new Set();

            // Extract columns from all models in this section
            Object.values(section.models).forEach((model) => {
                if (Array.isArray(model)) {
                    model.forEach((col) => allColumnsInSection.add(col));
                } else {
                    Object.keys(model).forEach((col) => {
                        if (!["__v", "timestamps", "createdAt", "updatedAt"].includes(col)) {
                            allColumnsInSection.add(col);
                        }
                    });
                }
            });
            // allColumnsInSection.add("delete");
            // allColumnsInSection.add("update");




            // Convert Set to Array for consistent ordering
            const sectionColumns = Array.from(allColumnsInSection);

            return {
                section: section.section,
                pages: [
                    ...section.view.pages.map((page) => ({
                        name: page,
                        type: "view",
                        columns: sectionColumns
                    })),
                    ...section.edit.pages.map((page) => ({
                        name: page,
                        type: "edit",
                        columns: sectionColumns
                    }))
                ],
            };
        });

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

    try {
        const user = await User.findById(id).populate('role')
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