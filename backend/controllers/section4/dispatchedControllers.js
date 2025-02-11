const Confirmed = require('../../models/Confirmed')


module.exports.getAllDispatchedData = async (req, res) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;

        // Calculate the number of items to skip
        const skip = (page - 1) * limit;

        // Fetch data with pagination, including only records where awb_number is "" or null
        const data = await Confirmed.find({
            isDeleted: false,
            isDispatched: true
        })

        // Get total count of filtered documents
        const totalCount = await Confirmed.countDocuments({
            isDeleted: false,
            isDispatched: true

        });

        return res.status(200).json({
            message: "Dispatch data fetched successfully.",
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

exports.dispatchedData = async (req, res) => {
    try {
        const ID = req.body.value; // Get ID from request body

        if (!ID) {
            return res.status(400).json({ message: "ID is required" });
        }

        // Find the row where ID matches awb_number or ref
        const confirmedRow = await Confirmed.findOne({
            $or: [{ awb_number: ID }, { ref: ID }]
        });

        if (!confirmedRow) {
            return res.status(404).json({ message: "No matching record found" });
        }

        // Update isDispatched to true
        confirmedRow.isDispatched = true;
        await confirmedRow.save();

        res.status(200).json({ message: "Dispatched status updated successfully", data: confirmedRow });

    } catch (error) {
        console.error("Error updating dispatch status:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};



exports.updatePosition = async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;

    try {
        // Find the document by ID
        let confirmedEntry = await Confirmed.findById(id);
        if (!confirmedEntry) {
            return res.status(404).json({ message: "Entry not found" });
        }

        // Replace location_and_date field with new data
        confirmedEntry.location_and_date = updateData;

        // Save the updated document
        await confirmedEntry.save();

        res.status(200).json({ message: "Position updated successfully", data: confirmedEntry });
    } catch (error) {
        console.error("Error updating position:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};