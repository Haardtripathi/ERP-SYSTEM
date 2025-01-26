const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const IncomingSchema = new Schema(
    {
        source: {
            type: Object,
            dropdown_data: {
                type: Schema.Types.ObjectId,
                ref: 'Dropdown',
            },
            value: {
                type: String,
            },
            required: true,
        },
        date: {
            type: String,
            default: () => {
                // Get the current date and time in Indian timezone
                const options = {
                    timeZone: 'Asia/Kolkata',
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                };
                const formatter = new Intl.DateTimeFormat([], options);
                return formatter.format(new Date());
            },
        },
        cm_first_name: {
            type: String,
            required: true,
        },
        cm_last_name: {
            type: String,
            required: true,
        },
        cm_phone: {
            type: Number,
            required: true,
        },
        alternate_phone: {
            type: Number,
        },
        agent_name: {
            type: Object,
            dropdown_data: {
                type: Schema.Types.ObjectId,
                ref: 'Dropdown',
            },
            value: {
                type: String,
            },
            required: true,
        },
        language: {
            type: Object,
            dropdown_data: {
                type: Schema.Types.ObjectId,
                ref: 'Dropdown',
            },
            value: {
                type: String,
            },
            required: true,
        },
        disease: {
            type: Object,
            dropdown_data: {
                type: Schema.Types.ObjectId,
                ref: 'Dropdown',
            },
            value: {
                type: String,
            },
            required: true,
        },
        age: {
            type: Number,
            required: true,
        },
        height: {
            type: Number,
            required: true,
        },
        weight: {
            type: Number,
            required: true,
        },
        state: {
            type: Object,
            dropdown_data: {
                type: Schema.Types.ObjectId,
                ref: 'Dropdown',
            },
            value: {
                type: String,
            },
            required: true,
        },
        city: {
            type: String,
            required: true,
        },
        remark: {
            type: Object,
            dropdown_data: {
                type: Schema.Types.ObjectId,
                ref: 'Dropdown',
            },
            value: {
                type: String,
            },
            required: true,
        },
        comment: {
            type: String,
            required: true,
        },
        isDeleted: {
            type: Boolean,
            default: false, // Set default to false (not deleted)
        },
        is_sent_to_pending: {
            type: Boolean,
            default: false,
        },
        // status: {
        //     type: String,
        //     default: 'active', // Set default to 'active'
        // },
    },
    { timestamps: true }
);

IncomingSchema.index({ isDeleted: 1, createdAt: -1 });



module.exports = mongoose.model('Incoming', IncomingSchema);
