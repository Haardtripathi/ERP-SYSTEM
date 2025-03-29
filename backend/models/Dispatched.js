// const mongoose = require("mongoose");

// const Schema = mongoose.Schema;

// const dispatchedSchema = new Schema(
//     {
//         confirmedId: {
//             type: Schema.Types.ObjectId,
//             required: true,
//             ref: 'Confirmed',

//         },
//         date: {
//             type: String,
//             default: () => {
//                 const now = new Date();
//                 const options = { timeZone: "Asia/Kolkata" };
//                 const istDate = new Intl.DateTimeFormat("en-GB", options).format(now);
//                 return istDate; // Returns in DD/MM/YYYY format
//             },
//             immutable: true, // Prevents the date from being modified
//         },
//         time: {
//             type: String,
//             required: true,
//             default: () =>
//                 new Intl.DateTimeFormat('en-US', {
//                     hour: '2-digit',
//                     minute: '2-digit',
//                     second: '2-digit',
//                     hour12: true,
//                     timeZone: 'Asia/Kolkata',
//                 }).format(new Date()),
//             immutable: true,
//         },
//         location_and_date: {
//             type: Object,

//         },
//         isDeleted: {
//             type: Boolean,
//             default: 0, // Set default to 0 (closed)
//         },
//         isDelivered: {
//             type: Boolean,
//             default: false,
//         },
//         deliveredDate:{

//         },
//         isComplain: {
//             type: Boolean,
//             default: false,
//         },
//         isReturn: {
//             type: Boolean,
//             default: false,
//         }
//     },
//     { timestamps: true }
// );

// dispatchedSchema.index({ isDeleted: 1, createdAt: -1 });


// module.exports = mongoose.model("Dispatched", dispatchedSchema);

const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const dispatchedSchema = new Schema(
    {
        confirmedId: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: 'Confirmed',
        },
        date_dispatched: {
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
        location_and_date: {
            type: Object,
        },
        isDeleted: {
            type: Boolean,
            default: false, // Set default to false
        },
        isDelivered: {
            type: Boolean,
            default: false,
        },
        deliveredDate: {
            type: String, // Store date as a string in DD/MM/YYYY format
            default: null, // Initially null
        },
        returnDate: {
            type: String, // Store date as a string in DD/MM/YYYY format
            default: null, // Initially null
        },
        isComplain: {
            type: Boolean,
            default: false,
        },
        isReturn: {
            type: Boolean,
            default: false,
        }
    },
    { timestamps: true }
);

// 🔹 Middleware: Set `deliveredDate` when `isDelivered` changes to `true`
dispatchedSchema.pre("save", function (next) {
    if (this.isModified("isDelivered") && this.isDelivered) {
        const now = new Date();
        const options = { timeZone: "Asia/Kolkata" };
        this.deliveredDate = new Intl.DateTimeFormat("en-GB", options).format(now); // Format: DD/MM/YYYY
    }
    next();
});

dispatchedSchema.pre("save", function (next) {
    if (this.isModified("isReturn") && this.isReturn) {
        const now = new Date();
        const options = { timeZone: "Asia/Kolkata" };
        this.return = new Intl.DateTimeFormat("en-GB", options).format(now); // Format: DD/MM/YYYY
    }
    next();
});

// 🔹 Create an index for efficient queries
dispatchedSchema.index({ isDeleted: 1, createdAt: -1 });

module.exports = mongoose.model("Dispatched", dispatchedSchema);
