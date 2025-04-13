const OneOnOneChat = require("../../models/OneOnOneChat")
const OneOnOneMessage = require("../../models/OneOnOneMessage");

// Create a one-on-one chat (Admin initiates chat with a user)
exports.createOneOnOneChat = async (req, res) => {
    try {
        const { userId } = req.body; // The user to chat with
        const adminId = req.user._id;  // Admin's ID

        // Check if a chat between admin and this user already exists
        let chat = await OneOnOneChat.findOne({
            participants: { $all: [adminId, userId] }
        });

        if (!chat) {
            chat = await OneOnOneChat.create({
                participants: [adminId, userId],
                createdAt: new Date()
            });
        }

        res.status(201).json(chat);
    } catch (error) {
        console.error("Error creating one-on-one chat:", error);
        res.status(500).json({ error: "Failed to create one-on-one chat" });
    }
};

// Get one-on-one chat details
exports.getOneOnOneChat = async (req, res) => {
    try {
        const { chatId } = req.params;
        const chat = await OneOnOneChat.findById(chatId).populate("participants", "-password");
        res.json(chat);
    } catch (error) {
        console.error("Error fetching one-on-one chat:", error);
        res.status(500).json({ error: "Failed to fetch chat details" });
    }
};

// Get messages for a one-on-one chat
exports.getOneOnOneMessages = async (req, res) => {
    try {
        const { chatId } = req.params;
        // Sort messages chronologically (oldest first)
        const messages = await OneOnOneMessage.find({ chatId }).sort({ createdAt: 1 });
        res.json(messages);
    } catch (error) {
        console.error("Error fetching one-on-one messages:", error);
        res.status(500).json({ error: "Failed to fetch messages" });
    }
};
