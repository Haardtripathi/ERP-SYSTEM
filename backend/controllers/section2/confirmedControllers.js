const Lead = require('../../models/Lead')
const Workbook = require('../../models/Workbook')
const Incoming = require('../../models/Incoming')
const Confirmed = require('../../models/Confirmed')
const Dropdown = require('../../models/Dropdown')
const Pending = require('../../models/Pending')
const mongoose = require("mongoose")
const jwt = require('jsonwebtoken');

// Escape regex helper to avoid crashes
const escapeRegex = (input) => {
    return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

exports.getAllConfirmedData = async (req, res) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const skip = (page - 1) * limit;

        const rawSearch = req.query.search || "";
        const searchColumn = req.query.searchColumn || "";
        const isNumeric = !isNaN(rawSearch);
        const regexSafeSearch = escapeRegex(rawSearch);

        const plainStringFields = ['cm_first_name', 'cm_last_name', 'email', 'comment', 'address', 'post', 'district', 'city', 'pincode', 'ref'];
        const dropdownFields = ['agent_name', 'source', 'data', 'remark', 'status', 'state', 'disease', 'post_type', 'payment_type', 'sale_type'];
        const numberFields = ['cm_phone', 'alternate_phone', 'amount'];

        let query = { isDeleted: false };

        if (rawSearch) {
            if (searchColumn) {
                let dbField = dropdownFields.includes(searchColumn)
                    ? `${searchColumn}.value`
                    : searchColumn;

                if (plainStringFields.includes(searchColumn) || dropdownFields.includes(searchColumn)) {
                    query[dbField] = { $regex: regexSafeSearch, $options: 'i' };
                } else if (numberFields.includes(searchColumn)) {
                    const num = Number(rawSearch);
                    if (!isNaN(num)) query[dbField] = num;
                }
            } else {
                query.$or = [];

                plainStringFields.forEach(field => {
                    query.$or.push({ [field]: { $regex: regexSafeSearch, $options: 'i' } });
                });

                dropdownFields.forEach(field => {
                    query.$or.push({ [`${field}.value`]: { $regex: regexSafeSearch, $options: 'i' } });
                });

                if (isNumeric) {
                    numberFields.forEach(field => {
                        query.$or.push({ [field]: Number(rawSearch) });
                    });
                }

                // Product-based search (array of objects)
                query.$or.push({ "products.value": { $elemMatch: { product: { $regex: regexSafeSearch, $options: 'i' } } } });
                query.$or.push({ "products.value": { $elemMatch: { product_id: { $regex: regexSafeSearch, $options: 'i' } } } });
            }
        }

        const data = await Confirmed.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit);
        const totalCount = await Confirmed.countDocuments(query);

        return res.status(200).json({
            message: "Confirmed data fetched successfully.",
            data,
            totalCount,
            totalPages: Math.ceil(totalCount / limit),
            currentPage: page,
            search: rawSearch,
            searchColumn: searchColumn || null,
        });

    } catch (err) {
        console.error("Error in getAllConfirmedData:", err);
        return res.status(500).json({ message: "Failed to get confirmed data" });
    }
};



exports.editAwbNumber = async (req, res) => {
    try {
        const { id, ref, newAwbNumber } = req.body;
        if (!id || !ref) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        // Find and update the awb_number for the given _id and ref
        const updatedEntry = await Confirmed.findOneAndUpdate(
            { _id: id, ref: ref },
            { $set: { awb_number: newAwbNumber || "" } },
            { new: true } // Return the updated document
        );

        if (!updatedEntry) {
            return res.status(404).json({ message: "Entry not found" });
        }

        res.status(200).json({ message: "AWB Number updated successfully", updatedEntry });
    } catch (error) {
        console.error("Error updating AWB Number:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};





exports.handleStateChange = async (req, res) => {
    try {
        const { id, ref, value } = req.body;

        // Validate request
        if (!id || !ref || !value || (typeof value !== 'object')) {
            return res.status(400).json({ message: "Invalid request. ID, Ref, and a valid update value are required." });
        }

        // Find and update the document
        const updatedRow = await Confirmed.findOneAndUpdate(
            { _id: id, ref },
            { $set: value },
            { new: true } // Return the updated document
        );

        if (!updatedRow) {
            return res.status(404).json({ message: "Record not found." });
        }

        res.status(200).json({ message: "Update successful", data: updatedRow });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
}