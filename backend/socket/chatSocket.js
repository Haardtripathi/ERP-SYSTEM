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
                hasImage: !!messageData.image,
                imageContentType: messageData.imageContentType,
                imageDataLength: messageData.image?.data?.length
            });

            try {
                // Create message data object
                const messageToSave = {
                    sender: messageData.sender,
                    receiver: messageData.receiver,
                    group: messageData.group,
                    message: messageData.message,
                    imageContentType: messageData.imageContentType
                };

                // Handle image data if present
                if (messageData.image?.data) {
                    console.log('Backend - Processing image data:', {
                        dataLength: messageData.image.data.length,
                        contentType: messageData.imageContentType
                    });

                    try {
                        // Convert array to Buffer
                        const imageBuffer = Buffer.from(messageData.image.data);

                        // Verify buffer
                        if (!Buffer.isBuffer(imageBuffer) || imageBuffer.length === 0) {
                            throw new Error('Invalid image buffer created');
                        }

                        messageToSave.image = imageBuffer;
                        console.log('Backend - Image buffer created successfully:', {
                            bufferLength: imageBuffer.length,
                            isBuffer: Buffer.isBuffer(imageBuffer)
                        });
                    } catch (error) {
                        console.error('Backend - Error creating image buffer:', error);
                        if (callback) callback({ error: 'Failed to process image data' });
                        return;
                    }
                }

                // Save message to database
                const savedMessage = await ChatMessage.create(messageToSave);
                console.log('Backend - Message saved to database:', {
                    id: savedMessage._id,
                    message: savedMessage.message,
                    hasImage: !!savedMessage.image,
                    imageContentType: savedMessage.imageContentType,
                    imageSize: savedMessage.image?.length
                });

                // Send the message to the appropriate recipients
                if (messageData.group) {
                    io.to(messageData.group).emit("receive-message", savedMessage);
                } else {
                    io.to(messageData.receiver).emit("receive-message", savedMessage);
                    io.to(messageData.sender).emit("receive-message", savedMessage);
                }

                // Send success callback
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


