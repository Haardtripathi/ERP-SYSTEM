const mongoose = require("mongoose");

const OneOnOneMessageSchema = new mongoose.Schema({
    chatId: { type: mongoose.Schema.Types.ObjectId, ref: "OneOnOneChat" },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    content: { type: String },
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
        ref: "OneOnOneMessage",
        default: null
    },
    delivered: { type: Boolean, default: false },
    seen: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("OneOnOneMessage", OneOnOneMessageSchema);
