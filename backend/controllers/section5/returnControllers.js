const Confirmed = require('../../models/Confirmed')
const Dispatched = require('../../models/Dispatched')
const Return = require('../../models/Return')



module.exports.getAllReturnData = async (req, res) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;

        // Calculate the number of items to skip
        const skip = (page - 1) * limit;

        // Fetch data with pagination, including only records where awb_number is "" or null
        const returnData = await Return.find({ isDeleted: false })
            .populate({
                path: 'dispatchedId',
                populate: {
                    path: 'confirmedId', // Populate `confirmedId` inside `dispatchId`
                }
            });

        // console.log(returnData);

        // console.log(data);
        // data.confirmedId.location_and_date = data.location_and_date || null
        // console.log(data);

        // data.confirmedId.location_and_date = data.location_and_date || null
        // Get total count of filtered documents
        const totalCount = await Return.countDocuments({ isDeleted: false })
        // console.log(totalCount);
        return res.status(200).json({
            message: "Dispatch data fetched successfully.",
            returnData,
            totalCount,
            totalPages: Math.ceil(totalCount / limit),
            currentPage: page,
        });
    }
    catch (err) {
        return res.status(500).json({ message: "Failed to get confirmed data" });
    }


}