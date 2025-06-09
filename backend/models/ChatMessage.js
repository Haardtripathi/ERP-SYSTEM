const mongoose = require("mongoose");

const chatMessageSchema = new mongoose.Schema({
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    group: { type: mongoose.Schema.Types.ObjectId, ref: "ChatGroup" },
    message: { type: String },
    images: [{
        data: { type: Buffer },
        contentType: { type: String }
    }],
    replyTo: { type: mongoose.Schema.Types.ObjectId, ref: "ChatMessage" },
    seenBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }]
}, { timestamps: true });

// Add indexes for better query performance
chatMessageSchema.index({ sender: 1, receiver: 1, createdAt: -1 });
chatMessageSchema.index({ group: 1, createdAt: -1 });
chatMessageSchema.index({ createdAt: -1 }); // Add index for createdAt for pagination

const ChatMessage = mongoose.model("ChatMessage", chatMessageSchema);

module.exports = ChatMessage;
