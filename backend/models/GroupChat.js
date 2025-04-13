const mongoose = require("mongoose");

const GroupChatSchema = new mongoose.Schema({
    name: { type: String, required: true },
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    admin: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    lastMessage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "GroupMessage"
    },
    pinnedMessage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "GroupMessage",
        default: null
    },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("GroupChat", GroupChatSchema);
