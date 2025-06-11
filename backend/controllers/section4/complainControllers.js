
const Complain = require('../../models/Complain')



// module.exports.getAllComplainData = async (req, res) => {
//     try {
//         console.log(req.query)
//         const page = parseInt(req.query.page, 10) || 1;
//         const limit = parseInt(req.query.limit, 10) || 10;

//         // Calculate the number of items to skip
//         const skip = (page - 1) * limit;

//         // Fetch data with pagination, including only records where awb_number is "" or null
//         const complainData = await Complain.find({}).sort({ createdAt: -1 })
//             .populate({
//                 path: 'dispatchedId',
//                 populate: {
//                     path: 'confirmedId', // Populate `confirmedId` inside `dispatchId`
//                 }
//             });


//         const totalCount = await Complain.countDocuments({})
//         return res.status(200).json({
//             message: "Complain data fetched successfully.",
//             complainData,
//             totalCount,
//             totalPages: Math.ceil(totalCount / limit),
//             currentPage: page,
//         });
//     }
//     catch (err) {
//         return res.status(500).json({ message: "Failed to get confirmed data" });
//     }


// }




// 1. Escape special characters in the search term to avoid regex errors
const escapeRegex = (input) => {
    return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

module.exports.getAllComplainData = async (req, res) => {
    try {
        // 2. Pagination logic
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const skip = (page - 1) * limit;

        // 3. Search-related variables
        const rawSearch = req.query.search || "";
        const searchColumn = req.query.searchColumn || "";
        const isNumeric = !isNaN(rawSearch);
        const regexSafeSearch = escapeRegex(rawSearch);

        // 4. Define which fields are plain text, which are numeric, etc.
        //    You can adjust these as needed, based on your "complain" schema fields.
        const plainStringFields = [
            "complainDetail",
            "complainComment",
            "reference",
            "address",
            "district",
            "city",
            "pincode",
            "state",
            // If you store a manual "Complain ID" or "Date" as a string, add it here
        ];

        // If you have any dropdown fields that store objects like { value: "SomeValue" }, list them here:
        const dropdownFields = [
            // e.g. "status", "type"
        ];

        // Numeric fields
        const numberFields = [
            "phone",
            "alternatePhone",
            // If "complainId" or "awb_number" is numeric, add them here
        ];

        // 5. Build the query object
        const query = {};

        // Example: if your "complain" documents are not soft-deleted, remove the isDeleted check.
        // If you have an "isDeleted" flag, you can use:  query.isDeleted = false;

        // 6. Handle user-provided search text
        if (rawSearch) {
            if (searchColumn) {
                // 6A. If user wants to search in one specific column
                if (searchColumn === "dispatchedId") {
                    // Example logic: search inside dispatchedId if you store references or fields in it
                    // Adjust fields below to match your "dispatchedId" schema
                    query["dispatchedId"] = { $ne: null };
                    query.$or = [
                        { "dispatchedId.reference": { $regex: regexSafeSearch, $options: "i" } },
                        { "dispatchedId.firstName": { $regex: regexSafeSearch, $options: "i" } },
                        { "dispatchedId.lastName": { $regex: regexSafeSearch, $options: "i" } },
                        // ...and so on, depending on the fields in "dispatchedId"
                    ];
                } else {
                    // 6B. Regular field search
                    const dbField = dropdownFields.includes(searchColumn)
                        ? `${searchColumn}.value`
                        : searchColumn;

                    if (plainStringFields.includes(searchColumn) || dropdownFields.includes(searchColumn)) {
                        // e.g. { complainComment: { $regex: "...", $options: "i" } }
                        query[dbField] = { $regex: regexSafeSearch, $options: "i" };
                    } else if (numberFields.includes(searchColumn)) {
                        // Numeric search
                        const num = Number(rawSearch);
                        if (!isNaN(num)) {
                            query[dbField] = num;
                        }
                    }
                }
            } else {
                // 6C. "All columns" search across every relevant field
                query.$or = [];

                // Add plain text fields
                plainStringFields.forEach((field) => {
                    query.$or.push({ [field]: { $regex: regexSafeSearch, $options: "i" } });
                });

                // Add dropdown fields
                dropdownFields.forEach((field) => {
                    query.$or.push({ [`${field}.value`]: { $regex: regexSafeSearch, $options: "i" } });
                });

                // Add numeric fields (only if rawSearch is numeric)
                if (isNumeric) {
                    numberFields.forEach((field) => {
                        query.$or.push({ [field]: Number(rawSearch) });
                    });
                }

                // If you want to search inside dispatchedId by default as well:
                query.$or.push({ "dispatchedId.reference": { $regex: regexSafeSearch, $options: "i" } });
                query.$or.push({ "dispatchedId.firstName": { $regex: regexSafeSearch, $options: "i" } });
                query.$or.push({ "dispatchedId.lastName": { $regex: regexSafeSearch, $options: "i" } });
                // ...add more if you have them
            }
        }

        // 7. Fetch data with pagination
        //    Make sure to populate any references you need.
        const complainData = await Complain.find(query)
            .populate({
                path: "dispatchedId",
                populate: {
                    path: "confirmedId", // If you need to populate this as well
                },
            })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        // 8. Count total documents matching the same query
        const totalCount = await Complain.countDocuments(query);

        // 9. Return the data in the desired format
        return res.status(200).json({
            message: "Complain data fetched successfully.",
            complainData,
            totalCount,
            totalPages: Math.ceil(totalCount / limit),
            currentPage: page,
            search: rawSearch,
            searchColumn: searchColumn || null,
        });
    } catch (err) {
        console.error("Error in getAllComplainData:", err);
        return res.status(500).json({ message: "Failed to get complain data" });
    }
};



exports.editComplainId = async (req, res) => {
    try {
        const data = req.body.data
        console.log(data)
        const complainData = await Complain.findOne({ _id: data.id })
        // console.log(complainData)
        if (!complainData) {
            return res.status(404).json({ message: "Complain not found." })
        }

        complainData.complain_id = data.editValue
        // console.log(complainData)
        await complainData.save()
        console.log("ABC")
        console.log(complainData)
        return res.status(200).json({ message: "Complain ID updated successfully." })
    }
    catch (err) {
        return res.status(500).json({ message: "Failed to update complain ID." })
    }
}