const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Dropdown = require("../models/Dropdown")
const Role = require("../models/Role")
const Permission = require("../models/Permission")
const ChatGroup = require("../models/ChatGroup");

const path = require('path');
const multer = require('multer');

require("dotenv").config()

exports.getAgentList = async (req, res) => {
    try {
        const agentList = await Dropdown.find({ name: "Agent Name" })
        res.status(200).json({ agentList })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

exports.getRoleList = async (req, res) => {
    try {
        const roleList = await Role.find()
        res.status(200).json({ roleList })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

// Configure multer for handling file uploads
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only JPEG, PNG and JPG are allowed.'));
        }
    },
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB file size limit
    },
});

exports.register = [
    upload.single('photo'),
    async (req, res) => {

        const token = req.header('Authorization').split(" ")[1];
        const {
            email,
            agentName,
            password,
            companyNumber,
            phoneNumber,
            role,
            address,
            localAddress,
            aadharNumber,
            bankName,
            bankBranch,
            accountNumber,
            IFSC_Code,

        } = req.body;
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = decoded.role
            if (user !== "Admin") {
                return res.status(403).json({ message: 'Only Admin is allowed to register users' });
            }

            const existingUser = await User.findOne({
                $or: [
                    { email: email },
                    // { company_number: companyNumber },
                    { agent_name: agentName },
                    // { aadhar_number: aadharNumber },
                    // { phone_number: phoneNumber }
                ]
            });


            if (existingUser) {
                let conflictField = '';
                if (existingUser.email === email) conflictField = 'email';
                // else if (existingUser.company_number === companyNumber) conflictField = 'company number';
                else if (existingUser.agent_name === agentName) conflictField = 'agent name';
                // else if (existingUser.aadhar_number === aadharNumber) conflictField = 'Aadhar number';
                // else if (existingUser.phone_number === phoneNumber) conflictField = 'phone number';

                return res.status(400).json({
                    message: `User with this ${conflictField} already exists`
                });
            }


            const hashedPassword = await bcrypt.hash(password, 10);
            const newUser = new User({
                email,
                agent_name: agentName,
                password: hashedPassword,
                company_number: companyNumber,
                phone_number: phoneNumber,
                role: role,
                address,
                local_address: localAddress,
                aadhar_number: aadharNumber,
                bank_name: bankName,
                branch_name: bankBranch,
                account_number: accountNumber,
                ifsc_code: IFSC_Code,

            });
            if (req.file) {
                newUser.photo = {
                    data: req.file.buffer,
                    contentType: req.file.mimetype
                };
            }
            await newUser.save();

            // --- GROUP CREATION/UPDATE LOGIC ---
            // 1. Get the role name
            const roleDoc = await Role.findById(role);
            const roleName = roleDoc.name;
            const groupName = `${roleName}-Group`;

            // 2. Find all users with this role
            const usersWithRole = await User.find({ role: roleDoc._id });

            // 3. Find the admin user (assuming role name is 'Admin')
            const adminRole = await Role.findOne({ name: 'Admin' });
            const adminUser = await User.findOne({ role: adminRole._id });

            // 4. Check if group exists
            let group = await ChatGroup.findOne({ name: groupName });

            if (usersWithRole.length === 2 && !group) {
                // Create group with admin + both users
                const memberIds = [adminUser._id, ...usersWithRole.map(u => u._id)];
                group = new ChatGroup({
                    name: groupName,
                    members: memberIds,
                    visibleTo: memberIds,
                    createdBy: adminUser._id
                });
                await group.save();
            } else if (usersWithRole.length > 2 && group) {
                // Add new user to group if not already present
                if (!group.members.some(id => id.equals(newUser._id))) {
                    group.members.push(newUser._id);
                    group.visibleTo.push(newUser._id);
                    await group.save();
                }
            }
            // --- END GROUP LOGIC ---

            res.status(201).json({ message: 'User registered successfully' });
        } catch (error) {
            console.error('Registration error:', error);
            res.status(500).json({
                message: 'Error registering user',
                error: error.message
            });
        }
    }
];
exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email: email });
        if (!user) return res.status(404).json({ message: 'User not found' });
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });
        const role = await Role.findOne({ _id: user.role })
        const permissions = await Permission.findOne({ role: user.role })
        const userRole = role.name
        const token = jwt.sign({ _id: user._id.toString(), email: user.email, agent_name: user.agent_name, role: userRole }, process.env.JWT_SECRET, { expiresIn: '1h' });
        // const token = jwt.sign({ _id: user._id.toString(), email: user.email, agent_name: user.agent_name, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.checkAuth = async (req, res) => {
    const token = req.header('Authorization').split(" ")[1];
    if (!token) return res.status(401).json({ message: 'No token, authorization denied' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        res.json({ user: decoded });
    } catch (error) {
        res.status(401).json({ message: 'Token is not valid' });
    }
};
