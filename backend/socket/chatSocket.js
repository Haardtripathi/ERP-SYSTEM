const { Server } = require("socket.io");
const ChatMessage = require("../models/ChatMessage");

let io;

function setupSocket(server) {
    io = new Server(server, {
        cors: {
            origin: "http://localhost:5173",
            credentials: true
        }
    });

    const onlineUsers = new Map();

    io.on("connection", (socket) => {
        socket.on("join", (userId) => {
            socket.join(userId);
            onlineUsers.set(userId, socket.id);
            io.emit("update-online-users", [...onlineUsers.keys()]);
        });

        socket.on("send-message", async ({ sender, receiver, group, message, image, imageContentType }) => {
            console.log('Received message on backend:', {
                sender,
                receiver,
                group,
                message,
                hasImage: !!image,
                imageContentType,
                imageDataLength: image?.data?.length,
                imageDataType: image?.data ? typeof image.data : 'none'
            });
            try {
                // Convert image data to Buffer if present
                let imageBuffer = null;
                if (image && image.data) {
                    console.log('Processing image data:', {
                        dataLength: image.data.length,
                        contentType: imageContentType,
                        isArray: Array.isArray(image.data),
                        firstFewBytes: image.data.slice(0, 10)
                    });

                    try {
                        // Convert the array to a Buffer
                        imageBuffer = Buffer.from(image.data);

                        // Verify the buffer
                        if (!Buffer.isBuffer(imageBuffer)) {
                            throw new Error('Failed to create valid buffer from image data');
                        }

                        console.log('Created image buffer:', {
                            bufferLength: imageBuffer.length,
                            isBuffer: Buffer.isBuffer(imageBuffer),
                            firstFewBytes: Array.from(imageBuffer.slice(0, 10))
                        });

                        // Verify the buffer contains valid image data
                        if (imageBuffer.length === 0) {
                            throw new Error('Created buffer is empty');
                        }
                    } catch (bufferError) {
                        console.error('Error creating buffer:', bufferError);
                        throw bufferError;
                    }
                }

                // Create the message document
                const messageData = {
                    sender,
                    receiver,
                    group,
                    message,
                    imageContentType
                };

                // Only add image if we have a valid buffer
                if (imageBuffer) {
                    messageData.image = imageBuffer;
                }

                const msg = await ChatMessage.create(messageData);

                console.log('Message saved to database:', {
                    id: msg._id,
                    hasImage: !!msg.image,
                    imageSize: msg.image?.length,
                    imageContentType: msg.imageContentType
                });

                // Send the message to the appropriate recipients
                if (group) {
                    io.to(group).emit("receive-message", msg);
                } else {
                    io.to(receiver).emit("receive-message", msg);
                    io.to(sender).emit("receive-message", msg);
                }
            } catch (error) {
                console.error('Error saving message to DB:', error);
                // Log more details about the error
                if (error.name === 'ValidationError') {
                    console.error('Validation error details:', error.errors);
                }
                // Send error back to client
                socket.emit('message-error', { error: 'Failed to save message: ' + error.message });
            }
        });

        socket.on("join-group", (groupId) => {
            socket.join(groupId);
        });

        socket.on("disconnect", () => {
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
