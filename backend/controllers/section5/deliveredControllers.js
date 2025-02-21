const Confirmed = require('../../models/Confirmed')
const Dispatched = require('../../models/Dispatched')
const Return = require('../../models/Return')
const Delivered = require('../../models/Delivered')


exports.getAllDeliveredData = async (req, res) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;

        // Calculate the number of items to skip
        const skip = (page - 1) * limit;

        // Fetch data with pagination, including only records where awb_number is "" or null
        const deliveredData = await Delivered.find({ isDeleted: false })
            .populate({
                path: 'dispatchedId',
                populate: {
                    path: 'confirmedId', // Populate `confirmedId` inside `dispatchId`
                }
            });

        const totalCount = await Return.countDocuments({ isDeleted: false })
        return res.status(200).json({
            message: "Dispatch data fetched successfully.",
            deliveredData,
            totalCount,
            totalPages: Math.ceil(totalCount / limit),
            currentPage: page,
        });
    }
    catch (err) {
        return res.status(500).json({ message: "Failed to get confirmed data" });
    }

}
