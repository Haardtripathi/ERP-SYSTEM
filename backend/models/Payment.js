
const mongoose = require("mongoose")

const Schema = mongoose.Schema;

const PaymentSchema = new Schema({
    date: {
        type: String,
        immutable: true, // Prevents the date from being modified
    },
    deposit_date: {
        type: String,
        immutable: true, // Prevents the date from being modified
    },
    dispatchedId: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: 'Dispatched'
    },
    payment_id: {
        type: String,
    },
    fund_type: {
        type: String,
    },
    referenceId: {
        type: String,

    },
    isDeleted: {
        type: Boolean,
        default: false,
    }
}, { timestamps: true })


PaymentSchema.index({ isDeleted: 1, createdAt: -1 });


module.exports = mongoose.model("Payment", PaymentSchema);
