const Lead = require('../../models/Lead')
const Workbook = require('../../models/Workbook')
const Incoming = require('../../models/Incoming')
const Confirmed = require('../../models/Confirmed')
const Dropdown = require('../../models/Dropdown')
const Pending = require('../../models/Pending')
const mongoose = require("mongoose")

exports.getAllConfirmedData = async (req, res) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;

        // Calculate the number of items to skip
        const skip = (page - 1) * limit;

        // Fetch data with pagination
        const data = await Confirmed.find({ isDeleted: false })

        // (data);

        // Get total count of documents
        const totalCount = await Confirmed.countDocuments({ isDeleted: false });
        console.log(totalCount)

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