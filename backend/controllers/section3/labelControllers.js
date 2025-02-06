const Confirmed = require("../../models/Confirmed")

module.exports.getAllLabelData = async (req, res) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;

        // Calculate the number of items to skip
        const skip = (page - 1) * limit;

        // Fetch data with pagination, filtering out awb_number that is "" or null
        const data = await Confirmed.find({
            isDeleted: false,
            awb_number: { $nin: ["", null] }
        })

        // Get total count of filtered documents
        const totalCount = await Confirmed.countDocuments({
            isDeleted: false,
            awb_number: { $nin: ["", null] }
        });

        return res.status(200).json({
            message: "Confirmed data fetched successfully.",
            data,
            totalCount,
            totalPages: Math.ceil(totalCount / limit),
            currentPage: page,
        });
    }
    catch (err) {
        return res.status(500).json({ message: "Failed to get confirmed data" });
    }

}