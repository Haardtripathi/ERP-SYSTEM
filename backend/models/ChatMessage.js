const mongoose = require("mongoose");

const ChatMessageSchema = new mongoose.Schema({
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    group: { type: mongoose.Schema.Types.ObjectId, ref: "ChatGroup" },
    message: { type: String },
    image: { type: Buffer },
    imageContentType: { type: String },
    seenBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }]
}, { timestamps: true });

module.exports = mongoose.model("ChatMessage", ChatMessageSchema);
