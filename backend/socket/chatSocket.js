const { Server } = require("socket.io");
const ChatMessage = require("../models/ChatMessage");

let io;

function setupSocket(server) {
    io = new Server(server, {
        cors: {
            origin: "http://localhost:5173",
            credentials: true
        },
        maxHttpBufferSize: 1e8, // Increase buffer size to 100MB
        pingTimeout: 60000, // Increase ping timeout to 60 seconds
        pingInterval: 25000, // Increase ping interval to 25 seconds
        transports: ['websocket', 'polling']
    });

    const onlineUsers = new Map();

    io.on("connection", (socket) => {
        console.log('New socket connection:', socket.id);

        socket.on("join", (userId) => {
            console.log('User joined:', userId);
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
                imagesCount: messageData.images?.length || 0
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

                // Handle images if present
                if (messageData.images && messageData.images.length > 0) {
                    console.log('Backend - Processing images:', {
                        count: messageData.images.length
                    });

                    try {
                        // Process each image
                        messageToSave.images = messageData.images.map(img => ({
                            data: Buffer.from(img.data),
                            contentType: img.contentType
                        }));

                        console.log('Backend - Images processed successfully:', {
                            count: messageToSave.images.length
                        });
                    } catch (error) {
                        console.error('Backend - Error processing images:', error);
                        if (callback) callback({ error: 'Failed to process images' });
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
                    imagesCount: savedMessage.images?.length || 0,
                    replyTo: savedMessage.replyTo ? { _id: savedMessage.replyTo._id, message: savedMessage.replyTo.message } : null
                });

                // Emit to the appropriate room(s)
                if (savedMessage.group) {
                    io.to(savedMessage.group.toString()).emit('receive-message', savedMessage);
                } else {
                    // For private messages, emit to both sender and receiver
                    io.to(savedMessage.sender.toString()).emit('receive-message', savedMessage);
                    io.to(savedMessage.receiver.toString()).emit('receive-message', savedMessage);
                }

                if (callback) callback({ success: true, message: savedMessage });
            } catch (error) {
                console.error('Backend - Error saving message:', error);
                if (callback) callback({ error: error.message });
            }
        });

        socket.on("join-group", (groupId) => {
            console.log('User joined group:', groupId);
            socket.join(groupId);
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

module.exports = { setupSocket };


