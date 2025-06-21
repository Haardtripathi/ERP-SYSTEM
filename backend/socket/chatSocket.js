const { Server } = require("socket.io");
const ChatMessage = require("../models/ChatMessage");
const ChatGroup = require("../models/ChatGroup");
const MAX_FILE_SIZE = 1000 * 1024 * 1024; // 100MB in bytes

let io;

function setupSocket(server) {
    io = new Server(server, {
        cors: {
            origin: "http://localhost:3000",
            methods: ["GET", "POST"],
            credentials: true
        },
        maxHttpBufferSize: MAX_FILE_SIZE, // Increase buffer size to 100MB
        pingTimeout: 60000, // Increase timeout to 60 seconds
        pingInterval: 25000, // Increase ping interval
        transports: ['websocket', 'polling']
    });

    const onlineUsers = new Map();

    io.on("connection", (socket) => {
        console.log('New socket connection:', socket.id);

        socket.on("join", (userId) => {
            console.log('User joined chat:', userId, 'Socket ID:', socket.id);
            socket.join(userId);
            onlineUsers.set(userId, socket.id);
            io.emit("update-online-users", [...onlineUsers.keys()]);
        });

        socket.on("send-message", async (messageData, callback) => {
            // Log the raw message data first
            console.log('Backend - Raw message data received:', {
                sender: messageData.sender,
                receiver: messageData.receiver,
                group: messageData.group,
                hasMessage: !!messageData.message,
                hasAttachments: !!messageData.attachments?.length
            });

            try {
                // Create message data object
                const messageToSave = {
                    sender: messageData.sender,
                    receiver: messageData.receiver,
                    group: messageData.group,
                    message: messageData.message,
                    replyTo: messageData.replyTo?._id // Include replyTo ID if present
                };

                // Handle attachments if present
                if (messageData.attachments && messageData.attachments.length > 0) {
                    console.log('Backend - Processing attachments:', {
                        count: messageData.attachments.length
                    });

                    try {
                        // Process each attachment
                        messageToSave.attachments = messageData.attachments.map(attachment => ({
                            data: Buffer.from(attachment.data),
                            contentType: attachment.contentType,
                            fileName: attachment.fileName,
                            fileSize: attachment.fileSize,
                            fileType: attachment.fileType
                        }));

                        console.log('Backend - Attachments processed successfully:', {
                            count: messageToSave.attachments.length
                        });
                    } catch (error) {
                        console.error('Backend - Error processing attachments:', error);
                        if (callback) callback({ error: 'Failed to process attachments' });
                        return;
                    }
                }

                // Save message to database
                let savedMessage = await ChatMessage.create(messageToSave);

                // Populate the replyTo field before sending
                savedMessage = await savedMessage.populate('replyTo');

                console.log('Backend - Message saved to database and populated:', {
                    id: savedMessage._id,
                    message: savedMessage.message,
                    attachmentsCount: savedMessage.attachments?.length || 0
                });

                // Emit to the appropriate room(s)
                if (savedMessage.group) {
                    io.to(savedMessage.group.toString()).emit('receive-message', savedMessage);

                    // Emit unread count update to all group members except the sender
                    const groupMembers = await ChatGroup.findById(savedMessage.group).select('members');
                    if (groupMembers) {
                        groupMembers.members.forEach(memberId => {
                            if (memberId.toString() !== savedMessage.sender.toString()) {
                                // Calculate unread count for this specific member
                                ChatMessage.countDocuments({
                                    group: savedMessage.group,
                                    seenBy: { $ne: memberId },
                                    sender: { $ne: memberId }
                                }).then(unreadCount => {
                                    io.to(memberId.toString()).emit('unread-count-update', {
                                        groupId: savedMessage.group,
                                        count: unreadCount
                                    });
                                });
                            }
                        });
                    }
                } else {
                    // For private messages, emit to both sender and receiver
                    io.to(savedMessage.sender.toString()).emit('receive-message', savedMessage);
                    io.to(savedMessage.receiver.toString()).emit('receive-message', savedMessage);

                    // Emit unread count update to the receiver
                    ChatMessage.countDocuments({
                        receiver: savedMessage.receiver,
                        seenBy: { $ne: savedMessage.receiver },
                        group: null
                    }).then(unreadCount => {
                        io.to(savedMessage.receiver.toString()).emit('unread-count-update', {
                            userId: savedMessage.sender,
                            count: unreadCount
                        });
                    });
                }

                if (callback) callback({ success: true, message: savedMessage });
            } catch (error) {
                console.error('Backend - Error saving message:', error);
                if (callback) callback({ error: error.message });
            }
        });

        socket.on("join-group", (groupId) => {
            console.log('User joined group:', groupId, 'Socket ID:', socket.id);
            socket.join(groupId);
            console.log('User rooms after joining group:', socket.rooms);
        });

        socket.on("message-seen", async (data) => {
            console.log('Message seen event received:', data);
            const { messageId, seenBy } = data;

            try {
                // Update the message in the database
                const message = await ChatMessage.findById(messageId);
                if (message) {
                    // Ensure seenBy is an array and contains unique values
                    const uniqueSeenBy = [...new Set([...message.seenBy, ...seenBy])];
                    message.seenBy = uniqueSeenBy;
                    await message.save();

                    console.log('Message updated in DB:', messageId, 'new seenBy:', uniqueSeenBy);

                    // Broadcast the update to all relevant users
                    if (message.group) {
                        // For group messages, emit to all group members
                        console.log('Emitting to group room:', message.group.toString());
                        io.to(message.group.toString()).emit('message-seen', {
                            messageId,
                            seenBy: uniqueSeenBy
                        });
                    } else {
                        // For private messages, emit to both sender and receiver
                        console.log('Emitting to user rooms:', message.sender.toString(), message.receiver.toString());
                        io.to(message.sender.toString()).emit('message-seen', {
                            messageId,
                            seenBy: uniqueSeenBy
                        });
                        io.to(message.receiver.toString()).emit('message-seen', {
                            messageId,
                            seenBy: uniqueSeenBy
                        });
                    }
                } else {
                    console.log('Message not found:', messageId);
                }
            } catch (error) {
                console.error('Error updating message seen status:', error);
            }
        });

        socket.on("disconnect", (reason) => {
            console.log('Socket disconnected:', socket.id, 'Reason:', reason);
            for (let [id, sockId] of onlineUsers.entries()) {
                if (sockId === socket.id) {
                    onlineUsers.delete(id);
                    break;
                }
            }
            io.emit("update-online-users", [...onlineUsers.keys()]);
        });
    });
}

function getIo() {
    return io;
}

module.exports = { setupSocket, getIo };


