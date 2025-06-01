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
            console.log('Received message on backend:', { sender, receiver, group, message, image: image ? '[Image Data]' : null, imageContentType });
            try {
                const msg = await ChatMessage.create({ sender, receiver, group, message, image, imageContentType });
                if (group) {
                    io.to(group).emit("receive-message", msg);
                } else {
                    io.to(receiver).emit("receive-message", msg);
                    io.to(sender).emit("receive-message", msg);
                }
            } catch (error) {
                console.error('Error saving message to DB:', error);
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
