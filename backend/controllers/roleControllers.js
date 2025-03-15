const User = require('../models/User')

const jwt = require('jsonwebtoken');

const bcrypt = require('bcryptjs');

const Role = require("../models/Role");
const Permission = require("../models/Permission");
const Lead = require("../models/Lead");
const Incoming = require("../models/Incoming");
const Workbook = require("../models/Workbook");

// exports.getPermissions = async (req, res) => {
//     try {
//         console.log("ABC")
//         const permissions = await Permission.populate("role").findOne({ "role.name": req.user.role });
//         console.log(permissions)
//     }
//     catch (error) {
//         res.status(500).json({ message: "Error fetching permissions", error });

//     }
// }


exports.getPermissions = async (req, res) => {
    try {
        console.log("ABC")
        const page = req.query.page; // Get page parameter from request
        console.log(page)
        console.log("Fetching permissions for page:", page);

        const role = await Role.findOne({ name: req.user.role });

        if (!role) {
            return res.status(403).json({ message: "Invalid role" });
        }

        // Now, find the permissions document using the role's ObjectId
        const permissionsDoc = await Permission.findOne({ role: role._id });

        if (!permissionsDoc) {
            return res.status(403).json({ message: "No permissions found for this role" });
        }

        // Find the specific page permissions inside the permissions array
        const pagePermissions = permissionsDoc.permissions.find(p => p.page === page);

        if (!pagePermissions) {
            return res.status(403).json({ message: "No permissions found for this page" });
        }

        console.log("Permissions found:", pagePermissions);
        res.status(200).json(pagePermissions);
    } catch (error) {
        console.error("Error fetching permissions:", error);
        res.status(500).json({ message: "Error fetching permissions", error });
    }
};
