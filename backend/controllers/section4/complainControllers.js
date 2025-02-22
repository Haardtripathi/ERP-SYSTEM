
const Complain = require('../../models/Complain')



module.exports.getAllComplainData = async (req, res) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;

        // Calculate the number of items to skip
        const skip = (page - 1) * limit;

        // Fetch data with pagination, including only records where awb_number is "" or null
        const complainData = await Complain.find({})
            .populate({
                path: 'dispatchedId',
                populate: {
                    path: 'confirmedId', // Populate `confirmedId` inside `dispatchId`
                }
            });


        const totalCount = await Complain.countDocuments({})
        return res.status(200).json({
            message: "Complain data fetched successfully.",
            complainData,
            totalCount,
            totalPages: Math.ceil(totalCount / limit),
            currentPage: page,
        });
    }
    catch (err) {
        return res.status(500).json({ message: "Failed to get confirmed data" });
    }


}

exports.editComplainId = async (req, res) => {
    try {
        const data = req.body.data
        const complainData = await Complain.findOne({ _id: data.id })
        if (!complainData) {
            return res.status(404).json({ message: "Complain not found." })
        }

        complainData.complain_id = data.editValue
        await complainData.save()
        return res.status(200).json({ message: "Complain ID updated successfully." })
    }
    catch (err) {
        return res.status(500).json({ message: "Failed to update complain ID." })
    }
}