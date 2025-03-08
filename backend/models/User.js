

// const mongoose = require("mongoose")

// const Schema = mongoose.Schema;

// const UserSchema = new Schema({
//     email: {
//         type: String,
//         required: true,
//         unique: true,
//     },
//     company_number: {
//         type: String,
//         required: true,
//         unique: true,
//     },
//     phone_number: {
//         type: String,
//         required: true,
//         unique: true,
//     },
//     photo: {
//         data: Buffer, // This will hold the binary data of the image
//         contentType: String // This will hold the MIME type of the image
//     },
//     agent_name: {
//         type: String,
//         required: true,
//         unique: true,
//     },
//     password: {
//         type: String,
//         required: true,
//     },
//     address: {
//         type: String,
//         required: true,
//     },
//     local_address: {
//         type: String,
//         required: true,
//     },
//     aadhar_number: {
//         type: String,
//         required: true,
//         unique: true,
//     },

//     bank_name: {
//         type: String,
//         required: true
//     },
//     branch_name: {
//         type: String,
//         required: true
//     },
//     account_number: {
//         type: String,
//         required: true
//     },
//     ifsc_code: {
//         type: String,
//         required: true
//     },


// }, { timestamps: true })

// module.exports = mongoose.model("User", UserSchema);


const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const UserSchema = new Schema({
    email: { type: String, required: true, unique: true },
    company_number: { type: String, required: true, unique: true },
    phone_number: { type: String, required: true, unique: true },
    photo: { data: Buffer, contentType: String },
    agent_name: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    address: { type: String, required: true },
    local_address: { type: String, required: true },
    aadhar_number: { type: String, required: true, unique: true },
    bank_name: { type: String, required: true },
    branch_name: { type: String, required: true },
    account_number: { type: String, required: true },
    ifsc_code: { type: String, required: true },

    // 🔥 Add Role Reference
    role: { type: mongoose.Schema.Types.ObjectId, ref: 'Role', required: true }

}, { timestamps: true });

module.exports = mongoose.model("User", UserSchema);
