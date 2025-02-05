// const mongoose = require('mongoose');

// const Schema = mongoose.Schema;

// const dropdownSchema = new Schema({
//     name: {
//         type: String,
//         required: true
//     },
//     values: {
//         type: [String],
//         required: true
//     }

// }, { timestamps: true })


// module.exports = mongoose.model('Dropdown', dropdownSchema);


// // if name=="Shipment Type" i want another object of type { String: String }

// // and if name=="Products" i want another object of type {product:{product_id:price}}


const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const dropdownSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
        },
        values: {
            type: [String], // Keep default values as an array of strings
            required: true,
        },
        shipmentExtra: {
            type: Map,
            of: String, // Example: { "Express": "1 Day", "Standard": "3-5 Days" }
            required: function () {
                return this.name === "Shipment Type";
            },
        },
        productExtra: {
            type: Map,
            of: new Schema({
                product_id: { type: String, required: true },
                price: { type: Number, required: true },
            }),
            required: function () {
                return this.name === "Products";
            },
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Dropdown", dropdownSchema);
