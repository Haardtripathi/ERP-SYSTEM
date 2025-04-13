const GroupMessage = require("../models/GroupMessage");
const OneOnOneMessage = require("../models/OneOnOneMessage");
const GroupChat = require("../models/GroupChat"); // required for pinMessage handling

module.exports = function registerSocketHandlers(io) {
    io.on("connection", (socket) => {
        console.log("✅ User connected:", socket.id);

        // 🏠 User joins a chat room (group or private) by chatId.
        socket.on("joinRoom", ({ chatId }) => {
            socket.join(chatId);
            console.log(`📦 User joined room: ${chatId}`);
        });

        // ✉️ Send message event with optional reply support.
        socket.on("sendMessage", async (data) => {
            try {
                // Destructure data with replyTo added
                const { chatId, senderId, content, type, isGroup, file, replyTo } = data;

                // 1️⃣ Build message data to save to the database.
                const messageData = {
                    chatId,
                    sender: senderId,
                    content,
                    type,
                    replyTo: replyTo || null, // supports replying to a message
                    createdAt: new Date()
                };

                // Handle file upload (if any); file.data must be base64 encoded from the frontend.
                if (file) {
                    messageData.file = {
                        data: Buffer.from(file.data, "base64"),
                        contentType: file.contentType,
                        fileName: file.fileName
                    };
                }

                let newMessage;

                if (isGroup) {
                    newMessage = await GroupMessage.create(messageData);
                } else {
                    newMessage = await OneOnOneMessage.create({
                        ...messageData,
                        seen: false,
                        delivered: false
                    });
                }

                // 2️⃣ Emit the new message to all users in the chat room.
                io.to(chatId).emit("receiveMessage", newMessage);
            } catch (error) {
                console.error("❌ sendMessage error:", error);
                socket.emit("errorMessage", { error: "Failed to send message." });
            }
        });

        // 👁️ Mark message as seen.
        socket.on("messageSeen", async ({ messageId, isGroup, userId }) => {
            try {
                if (isGroup) {
                    await GroupMessage.findByIdAndUpdate(messageId, {
                        $addToSet: { seenBy: userId }
                    });
                } else {
                    await OneOnOneMessage.findByIdAndUpdate(messageId, {
                        seen: true
                    });
                }
            } catch (error) {
                console.error("❌ messageSeen error:", error);
                socket.emit("errorMessage", { error: "Failed to update seen status." });
            }
        });

        // ✅ Mark message as delivered.
        socket.on("messageDelivered", async ({ messageId, isGroup, userId }) => {
            try {
                if (isGroup) {
                    await GroupMessage.findByIdAndUpdate(messageId, {
                        $addToSet: { deliveredTo: userId }
                    });
                } else {
                    await OneOnOneMessage.findByIdAndUpdate(messageId, {
                        delivered: true
                    });
                }
            } catch (error) {
                console.error("❌ messageDelivered error:", error);
                socket.emit("errorMessage", { error: "Failed to update delivered status." });
            }
        });

        // 📌 Pin a message in a group (admin action).
        socket.on("pinMessage", async ({ groupId, messageId }) => {
            try {
                const group = await GroupChat.findByIdAndUpdate(
                    groupId,
                    { pinnedMessage: messageId },
                    { new: true }
                ).populate("pinnedMessage");

                // Notify all users in the group room about the pin update.
                io.to(groupId).emit("pinnedMessageUpdated", group.pinnedMessage);
            } catch (err) {
                console.error("❌ Pin message failed:", err);
                socket.emit("errorMessage", { error: "Failed to pin message" });
            }
        });

        // Log disconnect events.
        socket.on("disconnect", () => {
            console.log("❌ User disconnected:", socket.id);
        });
    });
};
