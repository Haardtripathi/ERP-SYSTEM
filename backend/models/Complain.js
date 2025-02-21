
const mongoose = require("mongoose")

const Schema = mongoose.Schema;

const ComplainSchema = new Schema({
    date: {
        type: String,
        default: () => {
            const now = new Date();
            const options = { timeZone: "Asia/Kolkata" };
            const istDate = new Intl.DateTimeFormat("en-GB", options).format(now);
            return istDate; // Returns in DD/MM/YYYY format
        },
        immutable: true, // Prevents the date from being modified
    },
    dispatchedId: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: 'Dispatched'
    },
    complain_id: {
        type: String,
        unique: true,
    },
    complain_detail: {
        type: String,
    },
    complain_comment: {
        type: String,

    },
    isDeleted: {
        type: Boolean,
        default: false,
    }
}, { timestamps: true })


ComplainSchema.index({ isDeleted: 1, createdAt: -1 });


module.exports = mongoose.model("Complain", ComplainSchema);
