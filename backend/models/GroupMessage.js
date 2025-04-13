const mongoose = require("mongoose");

const GroupMessageSchema = new mongoose.Schema({
    chatId: { type: mongoose.Schema.Types.ObjectId, ref: "GroupChat" },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    content: { type: String }, // optional if file is there
    file: {
        data: Buffer,
        contentType: String,
        fileName: String
    },
    type: {
        type: String,
        enum: ["text", "image", "file", "video", "audio"],
        default: "text"
    },
    replyTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "GroupMessage",
        default: null
    },
    deliveredTo: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    seenBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("GroupMessage", GroupMessageSchema);
