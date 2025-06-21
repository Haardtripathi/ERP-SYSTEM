const ChatMessage = require("../models/ChatMessage");
const ChatGroup = require("../models/ChatGroup");
const User = require("../models/User");
const mongoose = require('mongoose');
const { getIo } = require("../socket/chatSocket");

exports.sendMessage = async (req, res) => {
    try {
        const { sender, receiver, group, message, attachments } = req.body;

        // Create message data object
        const messageData = {
            sender,
            receiver,
            group,
            message,
            // Initialize seenBy array with sender's ID for group messages
            // For private chats, only add sender to seenBy if they are the receiver
            seenBy: group ? [sender] : []
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
    try {
        const { name, members, visibleTo, createdBy } = req.body;
        const group = await ChatGroup.create({ name, members, visibleTo, createdBy });

        // Populate the group with member details for socket emission
        const populatedGroup = await ChatGroup.findById(group._id)
            .populate({
                path: 'members',
                select: 'agent_name _id email photo role',
                populate: {
                    path: 'role',
                    select: 'name'
                }
            })
            .populate({
                path: 'createdBy',
                select: 'agent_name _id email photo role',
                populate: {
                    path: 'role',
                    select: 'name'
                }
            });

        // Emit socket event to all group members
        const io = getIo();
        if (io && populatedGroup) {
            // Emit to all group members
            populatedGroup.members.forEach(member => {
                io.to(member._id.toString()).emit('group-created', populatedGroup);
            });

            // Also emit to the creator
            io.to(createdBy.toString()).emit('group-created', populatedGroup);
        }

        res.status(201).json(populatedGroup);
    } catch (error) {
        console.error('Error in createGroup:', error);
        res.status(500).json({ error: error.message });
    }
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

    // Find groups where the userId is either in the members array or visibleTo array
    const groups = await ChatGroup.find({
        $or: [
            { members: userId },
            { visibleTo: userId }
        ]
    }).populate({
        path: 'members',
        select: 'agent_name _id email photo role',
        populate: {
            path: 'role',
            select: 'name'
        }
    }).populate({
        path: 'createdBy',
        select: 'agent_name _id email photo role',
        populate: {
            path: 'role',
            select: 'name'
        }
    });

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

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: "Invalid user ID" });
        }

        const user = await User.findById(userId).select('-password');

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

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


        // Validate user IDs
        if (!mongoose.Types.ObjectId.isValid(userId1) || !mongoose.Types.ObjectId.isValid(userId2)) {
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

        // Apply pagination to the main pipeline
        const mediaPipeline = [
            ...pipeline,
            { $skip: skip },
            { $limit: limit }
        ];

        const mediaItems = await ChatMessage.aggregate(mediaPipeline);

        // Calculate total pages
        const totalPages = Math.ceil(totalCount / limit);
        const hasMoreCalculated = (page * limit) < totalCount;


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
            .populate({
                path: 'members',
                select: 'agent_name _id email photo role',
                populate: {
                    path: 'role',
                    select: 'name'
                }
            })
            .populate({
                path: 'createdBy',
                select: 'agent_name _id email photo role',
                populate: {
                    path: 'role',
                    select: 'name'
                }
            });

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

        // Fetch the updated messages to return the latest seenBy status
        // Use a different query to get messages that were just updated
        const updatedMessagesQuery = isGroup
            ? { group: chatId, seenBy: userId }
            : {
                $or: [
                    { sender: chatId, receiver: userId },
                    { sender: userId, receiver: chatId }
                ],
                seenBy: userId
            };

        const updatedMessages = await ChatMessage.find(updatedMessagesQuery).select('_id seenBy');

        // Emit socket event for each updated message
        const io = getIo();
        console.log('Socket IO instance:', !!io, 'Updated messages count:', updatedMessages?.length);
        if (updatedMessages && updatedMessages.length > 0 && io) {
            updatedMessages.forEach(msg => {
                if (isGroup) {
                    console.log('Emitting message-seen for', msg._id, 'to group', chatId, 'seenBy:', msg.seenBy);
                    io.to(chatId.toString()).emit('message-seen', {
                        messageId: msg._id,
                        seenBy: msg.seenBy
                    });

                    // Emit unread count update for the user who marked messages as seen
                    ChatMessage.countDocuments({
                        group: chatId,
                        seenBy: { $ne: userId },
                        sender: { $ne: userId }
                    }).then(unreadCount => {
                        io.to(userId.toString()).emit('unread-count-update', {
                            groupId: chatId,
                            count: unreadCount
                        });
                    });
                } else {
                    console.log('Emitting message-seen for', msg._id, 'to users', userId, chatId, 'seenBy:', msg.seenBy);
                    io.to(userId.toString()).emit('message-seen', {
                        messageId: msg._id,
                        seenBy: msg.seenBy
                    });
                    io.to(chatId.toString()).emit('message-seen', {
                        messageId: msg._id,
                        seenBy: msg.seenBy
                    });

                    // Emit unread count update for the user who marked messages as seen
                    ChatMessage.countDocuments({
                        receiver: userId,
                        seenBy: { $ne: userId },
                        group: null
                    }).then(unreadCount => {
                        io.to(userId.toString()).emit('unread-count-update', {
                            userId: chatId,
                            count: unreadCount
                        });
                    });
                }
            });
        } else {
            console.log('No socket events emitted. IO:', !!io, 'Messages:', updatedMessages?.length);
        }

        res.status(200).json({
            success: true,
            updatedCount: result.modifiedCount,
            messages: updatedMessages
        });
    } catch (error) {
        console.error('Error in markMessagesAsSeen:', error);
        res.status(500).json({ error: error.message });
    }
};

exports.updateGroup = async (req, res) => {
    try {
        const { groupId } = req.params;
        const { name, members } = req.body;

        // Check if user is admin of the group
        const group = await ChatGroup.findById(groupId);
        if (!group) {
            return res.status(404).json({ error: 'Group not found' });
        }

        if (group.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: 'Only group admin can update group details' });
        }

        // Get previous members to determine who was removed/added
        const previousMembers = group.members.map(m => m.toString());
        const newMembers = members.map(m => m.toString());

        const removedMembers = previousMembers.filter(m => !newMembers.includes(m));
        const addedMembers = newMembers.filter(m => !previousMembers.includes(m));

        // Update group
        const updatedGroup = await ChatGroup.findByIdAndUpdate(
            groupId,
            { name, members },
            { new: true }
        ).populate({
            path: 'members',
            select: 'agent_name _id email photo role',
            populate: {
                path: 'role',
                select: 'name'
            }
        }).populate({
            path: 'createdBy',
            select: 'agent_name _id email photo role',
            populate: {
                path: 'role',
                select: 'name'
            }
        });

        // Emit socket events
        const io = getIo();
        if (io && updatedGroup) {
            // Emit group update to all current members
            updatedGroup.members.forEach(member => {
                io.to(member._id.toString()).emit('group-updated', {
                    group: updatedGroup,
                    action: 'updated',
                    removedMembers,
                    addedMembers
                });
            });

            // Emit group removal to removed members
            removedMembers.forEach(memberId => {
                io.to(memberId).emit('group-removed', {
                    groupId: groupId,
                    action: 'removed'
                });
            });

            // Emit group addition to newly added members
            addedMembers.forEach(memberId => {
                io.to(memberId).emit('group-added', {
                    group: updatedGroup,
                    action: 'added'
                });
            });
        }

        res.json(updatedGroup);
    } catch (error) {
        console.error('Error in updateGroup:', error);
        res.status(500).json({ error: error.message });
    }
};

exports.getGroupMedia = async (req, res) => {
    try {
        const { groupId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 12;
        const skip = (page - 1) * limit;

        console.log('Getting group media with params:', { groupId, page, limit, skip });

        // Aggregation pipeline to get individual attachments with pagination
        const pipeline = [
            {
                $match: {
                    group: new mongoose.Types.ObjectId(groupId),
                    attachments: { $exists: true, $ne: [] }
                }
            },
            { $unwind: "$attachments" }, // Deconstruct the attachments array into separate documents
            { $sort: { createdAt: -1 } }, // Sort by message creation date (newest first)
            {
                $project: {
                    _id: 0, // Exclude _id of the message
                    id: "$_id", // Use message _id as media item id
                    data: "$attachments.data",
                    contentType: "$attachments.contentType",
                    fileName: "$attachments.fileName",
                    fileSize: "$attachments.fileSize",
                    fileType: "$attachments.fileType",
                    timestamp: "$createdAt"
                }
            }
        ];

        // Get total count of all attachments matching the query
        const totalCountPipeline = [
            {
                $match: {
                    group: new mongoose.Types.ObjectId(groupId),
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
        const hasMore = (page * limit) < totalCount;

        console.log('Group media response:', {
            mediaCount: mediaItems.length,
            totalCount,
            totalPages,
            hasMore
        });

        res.json({
            media: mediaItems,
            pagination: {
                currentPage: page,
                totalPages,
                totalItems: totalCount,
                hasMore
            }
        });
    } catch (error) {
        console.error('Error in getGroupMedia:', error);
        res.status(500).json({ error: error.message });
    }
};

exports.getUnreadCounts = async (req, res) => {
    const userId = req.params.userId;
    if (!userId) return res.status(400).json({ error: "Missing userId" });
    const userObjectId = new mongoose.Types.ObjectId(userId);

    // 1-1 chats: Only count messages where user is the receiver
    const userUnreadAgg = await ChatMessage.aggregate([
        {
            $match: {
                receiver: userObjectId,
                seenBy: { $ne: userObjectId },
                group: null // Only private chats
            }
        },
        {
            $group: {
                _id: "$sender",
                count: { $sum: 1 }
            }
        }
    ]);

    // Groups: Only count messages not sent by the user and not seen by the user
    const groupUnreadAgg = await ChatMessage.aggregate([
        {
            $match: {
                group: { $ne: null },
                seenBy: { $ne: userObjectId },
                sender: { $ne: userObjectId } // Don't count user's own messages
            }
        },
        {
            $group: {
                _id: "$group",
                count: { $sum: 1 }
            }
        }
    ]);

    const userUnread = {};
    userUnreadAgg.forEach(row => { userUnread[row._id] = row.count; });

    const groupUnread = {};
    groupUnreadAgg.forEach(row => { groupUnread[row._id] = row.count; });

    console.log('Unread counts - Users:', userUnread, 'Groups:', groupUnread);

    res.json({ userUnread, groupUnread });
};

exports.getGroupUnreadCount = async (req, res) => {
    try {
        const { groupId, userId } = req.params;
        if (!groupId || !userId) {
            return res.status(400).json({ error: "Missing groupId or userId" });
        }

        const userObjectId = new mongoose.Types.ObjectId(userId);
        const groupObjectId = new mongoose.Types.ObjectId(groupId);

        // Count unread messages in this group for this user
        const unreadCount = await ChatMessage.countDocuments({
            group: groupObjectId,
            seenBy: { $ne: userObjectId },
            sender: { $ne: userObjectId } // Don't count user's own messages
        });

        res.json({ groupId, unreadCount });
    } catch (error) {
        console.error('Error in getGroupUnreadCount:', error);
        res.status(500).json({ error: error.message });
    }
};
