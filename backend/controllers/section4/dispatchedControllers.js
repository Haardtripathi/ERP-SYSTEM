const Confirmed = require('../../models/Confirmed')
const Dispatched = require('../../models/Dispatched')
const Return = require('../../models/Return')
const Complain = require('../../models/Complain')
const Delivered = require('../../models/Delivered')


// module.exports.getAllDispatchedData = async (req, res) => {
//     try {
//         const page = parseInt(req.query.page, 10) || 1;
//         const limit = parseInt(req.query.limit, 10) || 10;

//         // Fetch data without sorting
//         let data = await Dispatched.find({ isDeleted: false })
//             .populate('confirmedId');

//         // Split data into two categories
//         let notDeliveredOrReturned = data.filter(item => !item.isDelivered && !item.isReturn);
//         let deliveredOrReturned = data.filter(item => item.isDelivered || item.isReturn);

//         // Sort them accordingly
//         notDeliveredOrReturned.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)); // Oldest first

//         deliveredOrReturned.sort((a, b) => {
//             const dateA = new Date(a.deliveredDate || a.returnDate); // Pick the available date
//             const dateB = new Date(b.deliveredDate || b.returnDate);
//             return dateB - dateA; // Newest first
//         });

//         // Merge sorted data: Not Delivered/Returned → Delivered/Returned (Newest First)
//         let sortedData = [...notDeliveredOrReturned, ...deliveredOrReturned];

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

const escapeRegex = (input) => {
    return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

module.exports.getAllDispatchedData = async (req, res) => {
    try {
        const page = Number.parseInt(req.query.page, 10) || 1
        const limit = Number.parseInt(req.query.limit, 10) || 10
        const skip = (page - 1) * limit

        const rawSearch = req.query.search || ""
        const searchColumn = req.query.searchColumn || ""
        const isNumeric = !isNaN(rawSearch)
        const regexSafeSearch = escapeRegex(rawSearch)

        const plainStringFields = ["ref", "date", "time", "comment", "address", "post", "district", "city", "pincode"]
        const dropdownFields = [
            "agent_name",
            "source",
            "data",
            "remark",
            "status",
            "state",
            "disease",
            "post_type",
            "payment_type",
            "sale_type",
        ]
        const numberFields = ["cm_phone", "alternate_phone", "amount"]

        const query = { isDeleted: false }

        if (rawSearch) {
            if (searchColumn) {
                // If searching in a specific column
                if (searchColumn === "confirmedId") {
                    // Special handling for confirmedId fields
                    query["confirmedId"] = { $ne: null }
                    const confirmedFields = [
                        "ref",
                        "cm_first_name",
                        "cm_last_name",
                        "email",
                        "comment",
                        "address",
                        "post",
                        "district",
                        "city",
                        "pincode",
                        "cm_phone",
                        "alternate_phone",
                    ]

                    query.$or = confirmedFields.map((field) => ({
                        [`confirmedId.${field}`]: { $regex: regexSafeSearch, $options: "i" },
                    }))

                    // Add dropdown fields from confirmedId
                    dropdownFields.forEach((field) => {
                        query.$or.push({ [`confirmedId.${field}.value`]: { $regex: regexSafeSearch, $options: "i" } })
                    })
                } else {
                    // Regular field search
                    const dbField = dropdownFields.includes(searchColumn) ? `${searchColumn}.value` : searchColumn

                    if (plainStringFields.includes(searchColumn) || dropdownFields.includes(searchColumn)) {
                        query[dbField] = { $regex: regexSafeSearch, $options: "i" }
                    } else if (numberFields.includes(searchColumn)) {
                        const num = Number(rawSearch)
                        if (!isNaN(num)) query[dbField] = num
                    } else if (searchColumn === "location_and_date") {
                        // Search in location_and_date object values
                        query["location_and_date"] = { $ne: null }
                        query.$or = [
                            { "location_and_date.STATE": { $regex: regexSafeSearch, $options: "i" } },
                            { "location_and_date.DISTRICT": { $regex: regexSafeSearch, $options: "i" } },
                            { "location_and_date.CITY": { $regex: regexSafeSearch, $options: "i" } },
                        ]
                    }
                }
            } else {
                // Search across all fields
                query.$or = []

                // Search in direct fields
                plainStringFields.forEach((field) => {
                    query.$or.push({ [field]: { $regex: regexSafeSearch, $options: "i" } })
                })

                dropdownFields.forEach((field) => {
                    query.$or.push({ [`${field}.value`]: { $regex: regexSafeSearch, $options: "i" } })
                })

                if (isNumeric) {
                    numberFields.forEach((field) => {
                        query.$or.push({ [field]: Number(rawSearch) })
                    })
                }

                // Search in confirmedId fields
                query.$or.push({ "confirmedId.ref": { $regex: regexSafeSearch, $options: "i" } })
                query.$or.push({ "confirmedId.cm_first_name": { $regex: regexSafeSearch, $options: "i" } })
                query.$or.push({ "confirmedId.cm_last_name": { $regex: regexSafeSearch, $options: "i" } })
                query.$or.push({
                    "confirmedId.cm_phone": isNumeric ? Number(rawSearch) : { $regex: regexSafeSearch, $options: "i" },
                })

                // Search in location_and_date values
                query.$or.push({ "location_and_date.STATE": { $regex: regexSafeSearch, $options: "i" } })
                query.$or.push({ "location_and_date.DISTRICT": { $regex: regexSafeSearch, $options: "i" } })
                query.$or.push({ "location_and_date.CITY": { $regex: regexSafeSearch, $options: "i" } })
            }
        }

        // Fetch data with pagination
        const data = await Dispatched.find(query).populate("confirmedId").sort({ createdAt: -1 }).skip(skip).limit(limit)

        // Split data into two categories
        const notDeliveredOrReturned = data.filter((item) => !item.isDelivered && !item.isReturn)
        const deliveredOrReturned = data.filter((item) => item.isDelivered || item.isReturn)

        // Sort them accordingly
        notDeliveredOrReturned.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)) // Oldest first

        deliveredOrReturned.sort((a, b) => {
            const dateA = new Date(a.deliveredDate || a.returnDate) // Pick the available date
            const dateB = new Date(b.deliveredDate || b.returnDate)
            return dateB - dateA // Newest first
        })

        // Merge sorted data: Not Delivered/Returned → Delivered/Returned (Newest First)
        const sortedData = [...notDeliveredOrReturned, ...deliveredOrReturned]

        const totalCount = await Dispatched.countDocuments(query)

        return res.status(200).json({
            message: "Dispatch data fetched successfully.",
            data: sortedData,
            totalCount,
            totalPages: Math.ceil(totalCount / limit),
            currentPage: page,
            search: rawSearch,
            searchColumn: searchColumn || null,
        })
    } catch (err) {
        console.error("Error in getAllDispatchedData:", err)
        return res.status(500).json({ message: "Failed to get dispatch data" })
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