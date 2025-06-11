const Confirmed = require('../../models/Confirmed')
const Dispatched = require('../../models/Dispatched')
const Return = require('../../models/Return')



// module.exports.getAllReturnData = async (req, res) => {
//     try {
//         const page = parseInt(req.query.page, 10) || 1;
//         const limit = parseInt(req.query.limit, 10) || 10;

//         // Calculate the number of items to skip
//         const skip = (page - 1) * limit;

//         // Fetch data with pagination, including only records where awb_number is "" or null
//         const returnData = await Return.find({ isDeleted: false })
//             .populate({
//                 path: 'dispatchedId',
//                 populate: {
//                     path: 'confirmedId', // Populate `confirmedId` inside `dispatchId`
//                 }
//             });

//         const totalCount = await Return.countDocuments({ isDeleted: false })
//         return res.status(200).json({
//             message: "Dispatch data fetched successfully.",
//             returnData,
//             totalCount,
//             totalPages: Math.ceil(totalCount / limit),
//             currentPage: page,
//         });
//     }
//     catch (err) {
//         return res.status(500).json({ message: "Failed to get confirmed data" });
//     }


// }



const escapeRegex = (input) => {
    return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

module.exports.getAllReturnData = async (req, res) => {
    try {
        // 2. Pagination logic
        const page = Number.parseInt(req.query.page, 10) || 1
        const limit = Number.parseInt(req.query.limit, 10) || 10
        const skip = (page - 1) * limit

        // 3. Search-related variables
        const rawSearch = req.query.search || ""
        const searchColumn = req.query.searchColumn || ""
        const isNumeric = !isNaN(rawSearch)
        const regexSafeSearch = escapeRegex(rawSearch)

        // 4. Define which fields are plain text, which are numeric, etc.
        const plainStringFields = [
            "ref",
            "date",
            "time",
            "date_dispatched",
            "address",
            "district",
            "city",
            "pincode",
            "state",
            "shipment_type",
        ]

        // If you have any dropdown fields that store objects like { value: "SomeValue" }, list them here:
        const dropdownFields = ["payment_type", "sale_type", "agent_name", "state", "amount", "products"]

        // Numeric fields
        const numberFields = ["cm_phone", "alternate_phone"]

        // 5. Build the query object
        const query = {}

        // Set isDeleted to false to exclude soft-deleted records
        query.isDeleted = false

        // 6. Handle user-provided search text
        if (rawSearch) {
            if (searchColumn) {
                // 6A. If user wants to search in one specific column
                if (searchColumn === "dispatchedId") {
                    // Example logic: search inside dispatchedId if you store references or fields in it
                    query["dispatchedId"] = { $ne: null }
                    query.$or = [
                        { "dispatchedId.reference": { $regex: regexSafeSearch, $options: "i" } },
                        { "dispatchedId.firstName": { $regex: regexSafeSearch, $options: "i" } },
                        { "dispatchedId.lastName": { $regex: regexSafeSearch, $options: "i" } },
                    ]
                } else {
                    // 6B. Regular field search
                    const dbField = dropdownFields.includes(searchColumn) ? `${searchColumn}.value` : searchColumn

                    if (plainStringFields.includes(searchColumn) || dropdownFields.includes(searchColumn)) {
                        // e.g. { returnComment: { $regex: "...", $options: "i" } }
                        query[dbField] = { $regex: regexSafeSearch, $options: "i" }
                    } else if (numberFields.includes(searchColumn)) {
                        // Numeric search
                        const num = Number(rawSearch)
                        if (!isNaN(num)) {
                            query[dbField] = num
                        }
                    }
                }
            } else {
                // 6C. "All columns" search across every relevant field
                query.$or = []

                // Add plain text fields
                plainStringFields.forEach((field) => {
                    query.$or.push({ [field]: { $regex: regexSafeSearch, $options: "i" } })
                })

                // Add dropdown fields
                dropdownFields.forEach((field) => {
                    query.$or.push({ [`${field}.value`]: { $regex: regexSafeSearch, $options: "i" } })
                })

                // Add numeric fields (only if rawSearch is numeric)
                if (isNumeric) {
                    numberFields.forEach((field) => {
                        query.$or.push({ [field]: Number(rawSearch) })
                    })
                }

                // If you want to search inside dispatchedId by default as well:
                query.$or.push({ "dispatchedId.reference": { $regex: regexSafeSearch, $options: "i" } })
                query.$or.push({ "dispatchedId.firstName": { $regex: regexSafeSearch, $options: "i" } })
                query.$or.push({ "dispatchedId.lastName": { $regex: regexSafeSearch, $options: "i" } })
            }
        }

        // 7. Fetch data with pagination
        const returnData = await Return.find(query)
            .populate({
                path: "dispatchedId",
                populate: {
                    path: "confirmedId", // If you need to populate this as well
                },
            })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)

        // 8. Count total documents matching the same query
        const totalCount = await Return.countDocuments(query)

        // 9. Return the data in the desired format
        return res.status(200).json({
            message: "Return data fetched successfully.",
            returnData,
            totalCount,
            totalPages: Math.ceil(totalCount / limit),
            currentPage: page,
            search: rawSearch,
            searchColumn: searchColumn || null,
        })
    } catch (err) {
        console.error("Error in getAllReturnData:", err)
        return res.status(500).json({ message: "Failed to get return data" })
    }
}
