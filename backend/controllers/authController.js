const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

require("dotenv").config()

exports.register = async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email });
    if (user) return res.status(404).json({ message: 'User already exists' });
    try {

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ email: email, password: hashedPassword });
        console.l
        await user.save();
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email: email });
        if (!user) return res.status(404).json({ message: 'User not found' });
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });
        const token = jwt.sign({ _id: user._id.toString(), email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });

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
