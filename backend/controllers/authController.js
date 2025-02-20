const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Dropdown = require("../models/Dropdown")
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
        console.log('Received form data:', req.body);
        console.log('Received file:', req.file);
        const token = req.header('Authorization').split(" ")[1];

        const {
            email,
            agentName,
            password,
            companyNumber,
            address,
            localAddress,
            aadharNumber
        } = req.body;

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = decoded.agent_name
            if (user.agent_name !== "Panchved") {
                return res.status(403).json({ message: 'Only Admin is allowed to register users' });
            }

            const existingUser = await User.findOne({
                $or: [
                    { email },
                    { company_number: companyNumber },
                    { agent_name: agentName },
                    { aadhar_number: aadharNumber }
                ]
            });

            if (existingUser) {
                return res.status(400).json({ message: 'User with this email, company number, agent name, or Aadhar number already exists' });
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            const newUser = new User({
                email,
                agent_name: agentName,
                password: hashedPassword,
                company_number: companyNumber,
                address,
                local_address: localAddress,
                aadhar_number: aadharNumber,
            });

            if (req.file) {
                newUser.photo = {
                    data: req.file.buffer,
                    contentType: req.file.mimetype
                };
            }

            await newUser.save();
            res.status(201).json({ message: 'User registered successfully' });
        } catch (error) {
            console.error('Registration error:', error);
            res.status(500).json({ error: error.message });
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
        const token = jwt.sign({ _id: user._id.toString(), email: user.email, agent_name: user.agent_name }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.json({ token });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.checkAuth = async (req, res) => {
    const token = req.header('Authorization').split(" ")[1];;
    if (!token) return res.status(401).json({ message: 'No token, authorization denied' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        res.json({ user: decoded });
    } catch (error) {
        res.status(401).json({ message: 'Token is not valid' });
    }
};
