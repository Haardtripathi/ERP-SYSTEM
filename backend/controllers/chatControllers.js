const ChatMessage = require("../models/ChatMessage");
const ChatGroup = require("../models/ChatGroup");
const User = require("../models/User");
const mongoose = require('mongoose');

exports.sendMessage = async (req, res) => {
    const { sender, receiver, group, message } = req.body;
    const newMsg = await ChatMessage.create({ sender, receiver, group, message });
    res.status(200).json(newMsg);
};

exports.getPrivateChat = async (req, res) => {
    const { userId1, userId2 } = req.params;
    const messages = await ChatMessage.find({
        $or: [
            { sender: userId1, receiver: userId2 },
            { sender: userId2, receiver: userId1 }
        ]
    }).sort({ createdAt: 1 });
    res.json(messages);
};

exports.createGroup = async (req, res) => {
    const { name, members, visibleTo, createdBy } = req.body;
    const group = await ChatGroup.create({ name, members, visibleTo, createdBy });
    res.status(201).json(group);
};

exports.getGroupMessages = async (req, res) => {
    const messages = await ChatMessage.find({ group: req.params.groupId }).sort({ createdAt: 1 });
    res.json(messages);
};

exports.getGroupsForUser = async (req, res) => {
    const userId = req.params.userId;

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
    }

    // Find groups where the userId is in the members array
    const groups = await ChatGroup.find({ members: userId });
    res.json(groups);
};

exports.getAllUsers = async (req, res) => {
    // Exclude the current user from the list
    // Assuming authenticated user ID is available in req.user._id
    const currentUserId = req.user._id;
    console.log('Fetching all users excluding user ID:', currentUserId); // Log current user ID
    const users = await User.find({ _id: { $ne: currentUserId } }, "_id agent_name email image_url");
    console.log('Fetched users (excluding current user):', users); // Log fetched users
    res.json(users);
};
