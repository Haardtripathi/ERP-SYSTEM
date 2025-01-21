const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const pendingSchema = new Schema(
    {
        dataId: {
            type: Schema.Types.ObjectId,
            required: true,
        },
        ref: {
            type: String,
            required: true,
            unique: true,
            immutable: true,
        },
        date: {
            type: String,
            default: () => {
                const now = new Date();
                const options = { timeZone: 'Asia/Kolkata' };
                const istDate = new Intl.DateTimeFormat('en-GB', options).format(now);
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
        data: {
            type: Object,
            dropdown_data: {
                type: Schema.Types.ObjectId,
                ref: 'Dropdown',
            },
            value: {
                type: String,
                required: true,
                enum: ['Lead', 'Incoming'],
            },
            required: true,
        },
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
        payment_type: {
            type: Object,
            dropdown_data: {
                type: Schema.Types.ObjectId,
                ref: "Dropdown",
            },
            value: {
                type: String,
            },
        },
        sale_type: {
            type: Object,
            dropdown_data: {
                type: Schema.Types.ObjectId,
                ref: "Dropdown",
            },
            value: {
                type: String,
            },
        },
        agent_name: {
            type: Object,
            dropdown_data: {
                type: Schema.Types.ObjectId,
                ref: "Dropdown",
            },
            value: {
                type: String,
            },
        },
        cm_first_name: {
            type: String,
        },
        cm_last_name: {
            type: String,
        },
        cm_phone: {
            type: Number,
        },
        alternate_phone: {
            type: Number,
        },
        email: {
            type: String,
        },
        status: {
            type: Object,
            dropdown_data: {
                type: Schema.Types.ObjectId,
                ref: "Dropdown",
            },
            value: {
                type: String,
            },
        },
        remark: {
            type: Object,
            dropdown_data: {
                type: Schema.Types.ObjectId,
                ref: "Dropdown",
            },
            value: {
                type: String,
            },
        },
        comment: {
            type: String,
        },
        shipment_type: {
            type: Object,
            dropdown_data: {
                type: Schema.Types.ObjectId,
                ref: "Dropdown",
            },
            value: {
                type: String,
            },
        },
        address: {
            type: String,
        },
        post_type: {
            type: Object,
            dropdown_data: {
                type: Schema.Types.ObjectId,
                ref: "Dropdown",
            },
            value: {
                type: String,
            },
        },
        post: {
            type: String,
        },
        sub_district_taluka: {
            type: String,
        },
        city: {
            type: String,
        },
        pincode: {
            type: String,
        },
        state: {
            type: Object,
            dropdown_data: {
                type: Schema.Types.ObjectId,
                ref: "Dropdown",
            },
            value: {
                type: String,
            },
        },
        disease: {
            type: Object,
            dropdown_data: {
                type: Schema.Types.ObjectId,
                ref: "Dropdown",
            },
            value: {
                type: String,
            },
        },
        amount: {
            type: Object,
            dropdown_data: {
                type: Schema.Types.ObjectId,
                ref: "Dropdown",
            },
            value: {
                type: String,
            },
        },
        products: {
            type: Object,
            dropdown_data: {
                type: Schema.Types.ObjectId,
                ref: "Dropdown",
            },
            value: {
                type: String,
            },
        },
        quantity: {
            type: String,
        },
        isDeleted: {
            type: Boolean,
            default: 0, // Set default to 0 (closed)
        },
    },
    { timestamps: true }
);

pendingSchema.pre("validate", async function (next) {
    if (!this.ref) {
        const currentDate = new Date();
        const year = currentDate.getFullYear();
        const month = (currentDate.getMonth() + 1).toString().padStart(2, "0");

        const lastDocument = await this.constructor.findOne(
            { ref: new RegExp(`^${year}${month}`) },
            { ref: 1 },
            { sort: { ref: -1 } }
        );

        let newId = "001";
        if (lastDocument) {
            const lastId = parseInt(lastDocument.ref.slice(-3));
            newId = (lastId + 1).toString().padStart(3, "0");
        }

        this.ref = `${year}${month}${newId}`;
    }
    next();
});

module.exports = mongoose.model("Pending", pendingSchema);
