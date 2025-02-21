const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const deliveredSchema = new Schema(
    {
        dispatchedId: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: 'Dispatched',

        },
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
        time: {
            type: String,
            required: true,
            default: () =>
                new Intl.DateTimeFormat('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    hour12: true,
                    timeZone: 'Asia/Kolkata',
                }).format(new Date()),
            immutable: true,
        },

        isDeleted: {
            type: Boolean,
            default: 0, // Set default to 0 (closed)
        },
    },
    { timestamps: true }
);

deliveredSchema.index({ isDeleted: 1, createdAt: -1 });


module.exports = mongoose.model("Delivered", deliveredSchema);
