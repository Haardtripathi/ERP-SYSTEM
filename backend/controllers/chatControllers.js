const ChatMessage = require("../models/ChatMessage");
const ChatGroup = require("../models/ChatGroup");
const User = require("../models/User");
const mongoose = require('mongoose');

exports.sendMessage = async (req, res) => {
    try {
        const { sender, receiver, group, message, images } = req.body;
        console.log('Received message data:', {
            sender,
            receiver,
            group,
            message,
            imagesCount: images?.length || 0
        });

        // Create message data object
        const messageData = {
            sender,
            receiver,
            group,
            message
        };

        // Handle images if present
        if (images && images.length > 0) {
            messageData.images = images.map(img => ({
                data: Buffer.from(img.data),
                contentType: img.contentType
            }));
        }

        // Create the message
        const newMsg = await ChatMessage.create(messageData);
        console.log('Message saved to database:', {
            id: newMsg._id,
            message: newMsg.message,
            imagesCount: newMsg.images?.length || 0
        });

        res.status(200).json(newMsg);
    } catch (error) {
        console.error('Error in sendMessage:', error);
        res.status(500).json({ error: error.message });
    }
};

exports.getPrivateChat = async (req, res) => {
    try {
        const { userId1, userId2 } = req.params;
        const { limit = 15, beforeId } = req.query;

        // Build the query
        let query = {
            $or: [
                { sender: userId1, receiver: userId2 },
                { sender: userId2, receiver: userId1 }
            ]
        };

        // If beforeId is provided, get messages before that ID
        if (beforeId) {
            const beforeMessage = await ChatMessage.findById(beforeId);
            if (beforeMessage) {
                query.createdAt = { $lt: beforeMessage.createdAt };
            }
        }

        // Get total count for this chat
        const totalCount = await ChatMessage.countDocuments({
            $or: [
                { sender: userId1, receiver: userId2 },
                { sender: userId2, receiver: userId1 }
            ]
        });

        // Execute query with pagination - sort by newest first
        const messages = await ChatMessage.find(query)
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .populate('replyTo');

        // Calculate if there are more messages to load
        const hasMore = beforeId ?
            await ChatMessage.countDocuments({ ...query, createdAt: { $lt: messages[messages.length - 1]?.createdAt } }) > 0 :
            totalCount > messages.length;

        // Add metadata to response
        res.json({
            messages: messages.reverse(), // Reverse to get oldest first for display
            hasMore,
            totalCount
        });
    } catch (error) {
        console.error('Error in getPrivateChat:', error);
        res.status(500).json({ error: error.message });
    }
};

exports.createGroup = async (req, res) => {
    const { name, members, visibleTo, createdBy } = req.body;
    const group = await ChatGroup.create({ name, members, visibleTo, createdBy });
    res.status(201).json(group);
};

exports.getGroupMessages = async (req, res) => {
    try {
        const { groupId } = req.params;
        const { limit = 15, beforeId } = req.query;

        // Build the query
        let query = { group: groupId };

        // If beforeId is provided, get messages before that ID
        if (beforeId) {
            const beforeMessage = await ChatMessage.findById(beforeId);
            if (beforeMessage) {
                query.createdAt = { $lt: beforeMessage.createdAt };
            }
        }

        // Get total count for this group
        const totalCount = await ChatMessage.countDocuments({ group: groupId });

        // Execute query with pagination - sort by newest first
        const messages = await ChatMessage.find(query)
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .populate('replyTo');

        // Calculate if there are more messages to load
        const hasMore = beforeId ?
            await ChatMessage.countDocuments({ ...query, createdAt: { $lt: messages[messages.length - 1]?.createdAt } }) > 0 :
            totalCount > messages.length;

        // Add metadata to response
        res.json({
            messages: messages.reverse(), // Reverse to get oldest first for display
            hasMore,
            totalCount
        });
    } catch (error) {
        console.error('Error in getGroupMessages:', error);
        res.status(500).json({ error: error.message });
    }
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
    // Log current user ID
    const users = await User.find({ _id: { $ne: currentUserId } }, "_id agent_name email image_url");
    // Log fetched users
    res.json(users);
};
