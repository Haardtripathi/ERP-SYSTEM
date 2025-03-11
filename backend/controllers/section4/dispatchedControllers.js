const Confirmed = require('../../models/Confirmed')
const Dispatched = require('../../models/Dispatched')
const Return = require('../../models/Return')
const Complain = require('../../models/Complain')
const Delivered = require('../../models/Delivered')



// module.exports.getAllDispatchedData = async (req, res) => {
//     try {
//         const page = parseInt(req.query.page, 10) || 1;
//         const limit = parseInt(req.query.limit, 10) || 10;

//         // Calculate the number of items to skip
//         const skip = (page - 1) * limit;

//         // Fetch data with pagination, including only records where awb_number is "" or null
//         let data = await Dispatched.find({ isDeleted: false }).populate('confirmedId')

//         const totalCount = await Dispatched.countDocuments({
//             isDeleted: false
//         });
//         return res.status(200).json({
//             message: "Dispatch data fetched successfully.",
//             data,
//             totalCount,
//             totalPages: Math.ceil(totalCount / limit),
//             currentPage: page,
//         });
//     }
//     catch (err) {
//         return res.status(500).json({ message: "Failed to get confirmed data" });
//     }


// }
// module.exports.getAllDispatchedData = async (req, res) => {
//     try {
//         const page = parseInt(req.query.page, 10) || 1;
//         const limit = parseInt(req.query.limit, 10) || 10;

//         // Fetch data without sorting
//         let data = await Dispatched.find({ isDeleted: false })
//             .populate('confirmedId');

//         // Split data into three categories
//         let notDeliveredOrReturned = data.filter(item => !item.isDelivered && !item.isReturn);
//         let deliveredData = data.filter(item => item.isDelivered);
//         let returnedData = data.filter(item => item.isReturn);

//         // Sort them accordingly
//         notDeliveredOrReturned.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)); // Oldest first
//         deliveredData.sort((a, b) => new Date(b.deliveredDate) - new Date(a.deliveredDate)); // Newest first
//         returnedData.sort((a, b) => new Date(b.returnDate) - new Date(a.returnDate)); // Newest first

//         // Merge sorted data: Not Delivered/Returned → Delivered → Returned
//         let sortedData = [...notDeliveredOrReturned, ...deliveredData, ...returnedData];

//         const totalCount = await Dispatched.countDocuments({ isDeleted: false });

//         return res.status(200).json({
//             message: "Dispatch data fetched successfully.",
//             data: sortedData,
//             totalCount,
//             totalPages: Math.ceil(totalCount / limit),
//             currentPage: page,
//         });
//     } catch (err) {
//         return res.status(500).json({ message: "Failed to get dispatch data" });
//     }
// };

module.exports.getAllDispatchedData = async (req, res) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;

        // Fetch data without sorting
        let data = await Dispatched.find({ isDeleted: false })
            .populate('confirmedId');

        // Split data into two categories
        let notDeliveredOrReturned = data.filter(item => !item.isDelivered && !item.isReturn);
        let deliveredOrReturned = data.filter(item => item.isDelivered || item.isReturn);

        // Sort them accordingly
        notDeliveredOrReturned.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)); // Oldest first

        deliveredOrReturned.sort((a, b) => {
            const dateA = new Date(a.deliveredDate || a.returnDate); // Pick the available date
            const dateB = new Date(b.deliveredDate || b.returnDate);
            return dateB - dateA; // Newest first
        });

        // Merge sorted data: Not Delivered/Returned → Delivered/Returned (Newest First)
        let sortedData = [...notDeliveredOrReturned, ...deliveredOrReturned];

        const totalCount = await Dispatched.countDocuments({ isDeleted: false });

        return res.status(200).json({
            message: "Dispatch data fetched successfully.",
            data: sortedData,
            totalCount,
            totalPages: Math.ceil(totalCount / limit),
            currentPage: page,
        });
    } catch (err) {
        return res.status(500).json({ message: "Failed to get dispatch data" });
    }
};


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
        res.status(200).json({ message: "Position updated successfully", data: dispatchedEntry });
    } catch (error) {
        console.error("Error updating position:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};



exports.returnData = async (req, res) => {
    try {
        const ID = req.body.value; // Get ID from request body
        if (!ID) {
            return res.status(400).json({ message: "ID is required" });
        }
        let dispatchRow
        const confirmedRow = await Confirmed.findOne({
            $or: [{ awb_number: ID }, { ref: ID }]
        });

        if (!confirmedRow) {
            console.error("No matching confirmedId found");
        } else {
            dispatchRow = await Dispatched.findOne({ confirmedId: confirmedRow._id })
                .populate('confirmedId'); // Populate to get full Confirmed document if needed

        }




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


exports.raiseComplain = async (req, res) => {
    try {
        const value = req.body.value

        let dispatchedData = await Dispatched.findOne({ _id: value.itemId })
        dispatchedData.isComplain = true
        await dispatchedData.save()


        const complain = new Complain({
            dispatchedId: value.itemId,
            complain_id: value.complain_id || null,
            complain_detail: value.complain_detail,
            complain_comment: value.complain_comment

        })

        await complain.save()

        res.status(200).json({ message: "Complain raised successfully", data: complain });
    }
    catch (error) {
        console.error("Error raising complain:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }

}


exports.deliverItem = async (req, res) => {
    try {
        const data = req.body
        const dispatchedData = await Dispatched.findOne({ _id: data.id })

        dispatchedData.isDelivered = true

        await dispatchedData.save()


        const deliveredData = new Delivered({
            dispatchedId: data.id
        })

        deliveredData.save()
        res.status(200).json({ message: "Item delivered successfully", data: dispatchedData });
    }
    catch (error) {
        console.error("Error delivering item:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
}