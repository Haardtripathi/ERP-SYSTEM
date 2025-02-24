const Lead = require('../../models/Lead')
const Workbook = require('../../models/Workbook')
const Incoming = require('../../models/Incoming')
const Confirmed = require('../../models/Confirmed')
const Dropdown = require('../../models/Dropdown')
const Pending = require('../../models/Pending')
const mongoose = require("mongoose")
const jwt = require('jsonwebtoken');


exports.getAllConfirmedData = async (req, res) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;

        // Calculate the number of items to skip
        const skip = (page - 1) * limit;

        // Fetch data with pagination
        const data = await Confirmed.find({ isDeleted: false }).sort({ createdAt: -1 });



        // Get total count of documents
        const totalCount = await Confirmed.countDocuments({ isDeleted: false });

        return res.status(200).json({
            message: "Confirmed data fetched successfully.",
            data,
            totalCount,
            totalPages: Math.ceil(totalCount / limit),
            currentPage: page,
        });
    }
    catch (err) {
        return res.status(500).json({ message: "Failed to get confirmed data" })
    }
}



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