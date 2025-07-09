const Confirmed = require('../../models/Confirmed')


// module.exports.getAllSheetData = async (req, res) => {
//     console.log(req.query)
//     try {
//         const page = parseInt(req.query.page, 10) || 1;
//         const limit = parseInt(req.query.limit, 10) || 10;

//         // Calculate the number of items to skip
//         const skip = (page - 1) * limit;

//         // Fetch data with pagination, including only records where awb_number is "" or null
//         const data = await Confirmed.find({
//             isDeleted: false,
//             $or: [{ awb_number: "" }, { awb_number: null }],
//             isCancelled: false,
//             isDispatched: false,
//             isHold: false
//         }).sort({ createdAt: -1 });

//         // Get total count of filtered documents
//         const totalCount = await Confirmed.countDocuments({
//             isDeleted: false,
//             $or: [{ awb_number: "" }, { awb_number: null }], isCancelled: false,
//             isHold: false,
//             isDispatched: false
//         });

//         return res.status(200).json({
//             message: "Confirmed data fetched successfully.",
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




// Escape regex special characters
const escapeRegex = (input) => {
    return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

module.exports.getAllSheetData = async (req, res) => {
    console.log('DEBUG req.user (sheet):', req.user);
    try {
        // Pagination setup
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const skip = (page - 1) * limit;

        // Search setup
        const rawSearch = req.query.search || "";
        const searchColumn = req.query.searchColumn || "";
        const isNumeric = !isNaN(rawSearch);
        const regexSafeSearch = escapeRegex(rawSearch);

        // Base query
        const query = {
            isDeleted: false,
            $or: [{ awb_number: "" }, { awb_number: null }],
            isCancelled: false,
            isDispatched: false,
            isHold: false,
        };

        // Add remote user filtering for remote users
        if (req.user && req.user.isRemote) {
            query["agent_name.value"] = req.user.agent_name;
        }

        // Searchable fields
        const stringFieldsNested = ["agent_name", "language", "disease", "remark", "source", "state"];
        const numericFields = ["cm_phone", "alternate_phone", "age", "height", "weight"];

        // Apply search
        if (rawSearch) {
            if (searchColumn) {
                const isNested = stringFieldsNested.includes(searchColumn);
                const field = isNested ? `${searchColumn}.value` : searchColumn;

                if (numericFields.includes(field) && isNumeric) {
                    query[field] = Number(rawSearch);
                } else {
                    query[field] = { $regex: regexSafeSearch, $options: "i" };
                }
            } else {
                // Search all fields if no specific column
                query.$or = [
                    { "cm_first_name": { $regex: regexSafeSearch, $options: "i" } },
                    { "cm_last_name": { $regex: regexSafeSearch, $options: "i" } },
                    ...(isNumeric ? [{ "cm_phone": Number(rawSearch) }] : []),
                    ...(isNumeric ? [{ "alternate_phone": Number(rawSearch) }] : []),
                    ...(isNumeric ? [{ "age": Number(rawSearch) }] : []),
                    ...(isNumeric ? [{ "height": Number(rawSearch) }] : []),
                    ...(isNumeric ? [{ "weight": Number(rawSearch) }] : []),

                    { "agent_name.value": { $regex: regexSafeSearch, $options: "i" } },
                    { "language.value": { $regex: regexSafeSearch, $options: "i" } },
                    { "disease.value": { $regex: regexSafeSearch, $options: "i" } },
                    { "state.value": { $regex: regexSafeSearch, $options: "i" } },
                    { "remark.value": { $regex: regexSafeSearch, $options: "i" } },
                    { "source.value": { $regex: regexSafeSearch, $options: "i" } },

                    { "city": { $regex: regexSafeSearch, $options: "i" } },
                    { "comment": { $regex: regexSafeSearch, $options: "i" } },
                    { "date": { $regex: regexSafeSearch, $options: "i" } },
                ];
            }
        }

        // Fetch paginated data
        const data = await Confirmed.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        // Total count for pagination
        const totalCount = await Confirmed.countDocuments(query);

        return res.status(200).json({
            message: "Confirmed data fetched successfully.",
            data,
            totalCount,
            totalPages: Math.ceil(totalCount / limit),
            currentPage: page,
            search: rawSearch,
            searchColumn: searchColumn || null,
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Failed to get confirmed data" });
    }
};
