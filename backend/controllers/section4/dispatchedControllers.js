const Confirmed = require('../../models/Confirmed')
const Dispatched = require('../../models/Dispatched')
const Return = require('../../models/Return')



module.exports.getAllDispatchedData = async (req, res) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;

        // Calculate the number of items to skip
        const skip = (page - 1) * limit;

        // Fetch data with pagination, including only records where awb_number is "" or null
        let data = await Dispatched.find({ isDeleted: false }).populate('confirmedId')
        // console.log(data);
        // data.confirmedId.location_and_date = data.location_and_date || null
        // console.log(data);

        // data.confirmedId.location_and_date = data.location_and_date || null
        // Get total count of filtered documents
        const totalCount = await Dispatched.countDocuments({
            isDeleted: false
        });
        // console.log(totalCount);
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

        if (confirmedRow.isDispatched == true) {
            return res.status(400).json({ message: "Dispatch status is already true for this ID" });
        }

        // Update isDispatched to true
        confirmedRow.isDispatched = true;
        await confirmedRow.save();

        // Create a new Dispatched entry
        const dispatchedEntry = new Dispatched({
            confirmedId: confirmedRow._id,

        });

        await dispatchedEntry.save();


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
        let dispatchedEntry = await Dispatched.findById(id);
        if (!dispatchedEntry) {
            return res.status(404).json({ message: "Entry not found" });
        }

        // Replace location_and_date field with new data
        dispatchedEntry.location_and_date = updateData.locationHistory;

        // Save the updated document
        await dispatchedEntry.save();
        console.log(dispatchedEntry)
        res.status(200).json({ message: "Position updated successfully", data: dispatchedEntry });
    } catch (error) {
        console.error("Error updating position:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};



exports.returnData = async (req, res) => {
    try {
        const ID = req.body.value; // Get ID from request body
        console.log(ID)
        if (!ID) {
            return res.status(400).json({ message: "ID is required" });
        }

        // Find the row where ID matches awb_number or ref
        const dispatchRow = await Dispatched.findOne()
            .populate({
                path: 'confirmedId',
                match: { $or: [{ awb_number: ID }, { ref: ID }] } // Find only matching confirmedId
            });
        console.log(dispatchRow)


        if (!dispatchRow) {
            return res.status(404).json({ message: "No matching record found" });
        }

        if (dispatchRow.isReturn == true) {
            return res.status(400).json({ message: "Return status is already true for this ID" });
        }

        // Update isDispatched to true
        dispatchRow.isReturn = true;
        await dispatchRow.save();

        // Create a new Dispatched entry
        const returnEntry = new Return({
            dispatchedId: dispatchRow._id,

        });

        await returnEntry.save();


        res.status(200).json({ message: "Retrn status updated successfully", data: dispatchRow });

    } catch (error) {
        console.error("Error updating dispatch status:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};