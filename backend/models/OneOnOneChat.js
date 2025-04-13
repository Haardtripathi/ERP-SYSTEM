const mongoose = require("mongoose");

const OneOnOneChatSchema = new mongoose.Schema({
    participants: [
        { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
    ],
    lastMessage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "OneOnOneMessage"
    },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("OneOnOneChat", OneOnOneChatSchema);
