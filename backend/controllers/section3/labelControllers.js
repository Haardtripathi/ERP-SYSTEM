const Confirmed = require("../../models/Confirmed")

// module.exports.getAllLabelData = async (req, res) => {
//     try {
//         const page = parseInt(req.query.page, 10) || 1;
//         const limit = parseInt(req.query.limit, 10) || 10;

//         // Calculate the number of items to skip
//         const skip = (page - 1) * limit;

//         // Fetch data with pagination, filtering out awb_number that is "" or null
//         const data = await Confirmed.find({
//             isDeleted: false,
//             awb_number: { $nin: ["", null] },
//             isDispatched: false,
//             isCancelled: false,
//             isHold: false
//         }).sort({ createdAt: -1 });

//         // Get total count of filtered documents
//         const totalCount = await Confirmed.countDocuments({
//             isDeleted: false,
//             awb_number: { $nin: ["", null] },
//             isDispatched: false,
//             isCancelled: false,
//             isHold: false

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



// 1) Escape regex helper
const escapeRegex = (input) => {
    return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

module.exports.getAllLabelData = async (req, res) => {
    try {
        // Optional if you want to require a token
        // const token = req.header("Authorization").split(" ")[1];
        // const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // const user = decoded;

        // 2) Pagination
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const skip = (page - 1) * limit;

        // 3) Search logic
        const rawSearch = req.query.search || "";
        const searchColumn = req.query.searchColumn || "";
        const isNumeric = !isNaN(rawSearch);
        const regexSafeSearch = escapeRegex(rawSearch);

        // 4) Base query for label data
        const query = {
            isDeleted: false,
            awb_number: { $nin: ["", null] },
            isDispatched: false,
            isCancelled: false,
            isHold: false,
        };

        // 5) If your app needs role-based filtering (like user.role !== "Admin")
        /*
        if (user.role !== "Admin") {
          query["agent_name.value"] = user.agent_name;
        }
        */

        // 6) Searchable fields
        const stringFieldsNested = ["agent_name", "language", "disease", "remark", "source", "state"];
        const numericFields = ["cm_phone", "alternate_phone", "age", "height", "weight"];
        // Typical direct string fields
        // (Add any extra direct string fields from your Confirmed schema)
        // e.g. cm_first_name, cm_last_name, city, comment, date, etc.

        // 7) Apply search
        if (rawSearch) {
            if (searchColumn) {
                // Searching a single column
                const isNested = stringFieldsNested.includes(searchColumn);
                const field = isNested ? `${searchColumn}.value` : searchColumn;

                // If numeric field & input is numeric, do exact match. Else do regex
                if (numericFields.includes(field) && isNumeric) {
                    query[field] = Number(rawSearch);
                } else {
                    query[field] = { $regex: regexSafeSearch, $options: "i" };
                }
            } else {
                // Searching across all relevant fields
                query.$or = [
                    // cm_first_name + cm_last_name
                    { "cm_first_name": { $regex: regexSafeSearch, $options: "i" } },
                    { "cm_last_name": { $regex: regexSafeSearch, $options: "i" } },
                    // numeric fields (if numeric input)
                    ...(isNumeric ? [{ "cm_phone": Number(rawSearch) }] : []),
                    ...(isNumeric ? [{ "alternate_phone": Number(rawSearch) }] : []),
                    ...(isNumeric ? [{ "age": Number(rawSearch) }] : []),
                    ...(isNumeric ? [{ "height": Number(rawSearch) }] : []),
                    ...(isNumeric ? [{ "weight": Number(rawSearch) }] : []),

                    // nested string fields
                    { "agent_name.value": { $regex: regexSafeSearch, $options: "i" } },
                    { "language.value": { $regex: regexSafeSearch, $options: "i" } },
                    { "disease.value": { $regex: regexSafeSearch, $options: "i" } },
                    { "state.value": { $regex: regexSafeSearch, $options: "i" } },
                    { "remark.value": { $regex: regexSafeSearch, $options: "i" } },
                    { "source.value": { $regex: regexSafeSearch, $options: "i" } },

                    // direct string fields (city, comment, date, etc.)
                    { "city": { $regex: regexSafeSearch, $options: "i" } },
                    { "comment": { $regex: regexSafeSearch, $options: "i" } },
                    { "date": { $regex: regexSafeSearch, $options: "i" } },
                ];
            }
        }

        // 8) Fetch results with skip/limit
        const data = await Confirmed.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        // 9) Count total
        const totalCount = await Confirmed.countDocuments(query);

        // 10) Return
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
