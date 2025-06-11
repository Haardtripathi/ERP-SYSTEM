const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const PermissionSchema = new Schema({
    role: { type: mongoose.Schema.Types.ObjectId, ref: 'Role', required: true },
    permissions: [
        {
            page: { type: String, required: true },  // Example: "Users"
            columns: [{ type: String }]  // Example: ["email", "phone_number"]
        }
    ]
});

module.exports = mongoose.model("Permission", PermissionSchema);
