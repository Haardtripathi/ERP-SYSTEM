const ChatMessage = require("../models/ChatMessage");
const ChatGroup = require("../models/ChatGroup");
const User = require("../models/User");
const mongoose = require('mongoose');

exports.sendMessage = async (req, res) => {
    try {
        const { sender, receiver, group, message, attachments } = req.body;
        console.log('Received message data:', {
            sender,
            receiver,
            group,
            hasMessage: !!message,
            attachmentsCount: attachments?.length || 0
        });

        // Create message data object
        const messageData = {
            sender,
            receiver,
            group,
            message
        };

        // Handle attachments if present
        if (attachments && attachments.length > 0) {
            messageData.attachments = attachments.map(attachment => ({
                data: Buffer.from(attachment.data),
                contentType: attachment.contentType,
                fileName: attachment.fileName,
                fileSize: attachment.fileSize,
                fileType: attachment.fileType
            }));
        }

        // Create the message
        const newMsg = await ChatMessage.create(messageData);
        console.log('Message saved to database:', {
            id: newMsg._id,
            message: newMsg.message,
            attachmentsCount: newMsg.attachments?.length || 0
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
            totalCount,
            oldestMessageId: messages[0]?._id || null
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
    const users = await User.find({ _id: { $ne: currentUserId } }, "_id agent_name email photo phone_number address");
    // Log fetched users
    res.json(users);
};

exports.getUserInfo = async (req, res) => {
    try {
        const { userId } = req.params;
        console.log('getUserInfo request:', { userId });

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            console.log('Invalid user ID:', userId);
            return res.status(400).json({ message: "Invalid user ID" });
        }

        const user = await User.findById(userId).select('-password');
        console.log('Found user:', user ? 'yes' : 'no');

        if (!user) {
            console.log('User not found:', userId);
            return res.status(404).json({ message: "User not found" });
        }

        console.log('Sending user info response');
        res.json(user);
    } catch (error) {
        console.error('Error in getUserInfo:', error);
        res.status(500).json({ error: error.message });
    }
};

exports.getChatMedia = async (req, res) => {
    try {
        const { userId1, userId2 } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 12;
        const skip = (page - 1) * limit;

        console.log('Getting chat media with params:', { userId1, userId2, page, limit, skip });

        // Validate user IDs
        if (!mongoose.Types.ObjectId.isValid(userId1) || !mongoose.Types.ObjectId.isValid(userId2)) {
            console.error('Invalid user IDs:', { userId1, userId2 });
            return res.status(400).json({ error: 'Invalid user IDs' });
        }

        // Aggregation pipeline to get individual attachments with pagination
        const pipeline = [
            {
                $match: {
                    $or: [
                        { sender: new mongoose.Types.ObjectId(userId1), receiver: new mongoose.Types.ObjectId(userId2) },
                        { sender: new mongoose.Types.ObjectId(userId2), receiver: new mongoose.Types.ObjectId(userId1) }
                    ],
                    attachments: { $exists: true, $ne: [] } // Only messages with attachments
                }
            },
            { $unwind: "$attachments" }, // Deconstruct the attachments array into separate documents
            { $sort: { createdAt: -1 } }, // Sort by message creation date (newest message first)
            {
                $project: {
                    _id: 0, // Exclude _id of the message
                    id: "$_id", // Use message _id as media item id
                    data: "$attachments.data",
                    contentType: "$attachments.contentType",
                    fileName: "$attachments.fileName",
                    fileSize: "$attachments.fileSize",
                    fileType: "$attachments.fileType",
                    timestamp: "$createdAt",
                    sender: "$sender", // Store sender for population
                }
            },
            {
                $lookup: {
                    from: "users", // The collection name for the User model
                    localField: "sender",
                    foreignField: "_id",
                    as: "senderInfo"
                }
            },
            { $unwind: "$senderInfo" }, // Deconstruct senderInfo array
            { $addFields: { sender: "$senderInfo.agent_name" } }, // Replace sender ID with agent_name
            { $project: { senderInfo: 0 } } // Remove senderInfo field
        ];

        // Get total count of all attachments matching the query
        const totalCountPipeline = [
            {
                $match: {
                    $or: [
                        { sender: new mongoose.Types.ObjectId(userId1), receiver: new mongoose.Types.ObjectId(userId2) },
                        { sender: new mongoose.Types.ObjectId(userId2), receiver: new mongoose.Types.ObjectId(userId1) }
                    ],
                    attachments: { $exists: true, $ne: [] }
                }
            },
            { $unwind: "$attachments" },
            { $count: "totalAttachments" }
        ];

        const totalAttachmentsResult = await ChatMessage.aggregate(totalCountPipeline);
        const totalCount = totalAttachmentsResult.length > 0 ? totalAttachmentsResult[0].totalAttachments : 0;
        console.log('Total individual attachments:', totalCount);

        // Apply pagination to the main pipeline
        const mediaPipeline = [
            ...pipeline,
            { $skip: skip },
            { $limit: limit }
        ];

        const mediaItems = await ChatMessage.aggregate(mediaPipeline);
        console.log('Found media items for current page:', mediaItems.length);

        // Calculate total pages
        const totalPages = Math.ceil(totalCount / limit);
        const hasMoreCalculated = (page * limit) < totalCount;

        console.log('Pagination Info:', { currentPage: page, totalPages, totalItems: totalCount, hasMore: hasMoreCalculated });

        // Return response with pagination info
        res.json({
            media: mediaItems,
            pagination: {
                currentPage: page,
                totalPages,
                totalItems: totalCount,
                hasMore: hasMoreCalculated
            }
        });
    } catch (error) {
        console.error('Error in getChatMedia:', error);
        res.status(500).json({ error: 'Failed to fetch chat media' });
    }
};

exports.getGroupDetails = async (req, res) => {
    try {
        const { groupId } = req.params;
        const group = await ChatGroup.findById(groupId)
            .populate('members', 'agent_name _id')
            .populate('createdBy', 'agent_name _id');

        if (!group) {
            return res.status(404).json({ error: 'Group not found' });
        }

        res.json(group);
    } catch (error) {
        console.error('Error in getGroupDetails:', error);
        res.status(500).json({ error: error.message });
    }
};

exports.markMessagesAsSeen = async (req, res) => {
    try {
        const { userId, chatId, isGroup } = req.body;

        // Build the query based on whether it's a group chat or private chat
        const query = isGroup
            ? { group: chatId, seenBy: { $ne: userId } }
            : {
                $or: [
                    { sender: chatId, receiver: userId },
                    { sender: userId, receiver: chatId }
                ],
                seenBy: { $ne: userId }
            };

        // Update all unread messages
        const result = await ChatMessage.updateMany(
            query,
            { $addToSet: { seenBy: userId } }
        );

        res.status(200).json({
            success: true,
            updatedCount: result.modifiedCount
        });
    } catch (error) {
        console.error('Error in markMessagesAsSeen:', error);
        res.status(500).json({ error: error.message });
    }
};
