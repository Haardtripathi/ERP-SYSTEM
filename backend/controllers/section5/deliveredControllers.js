const Confirmed = require('../../models/Confirmed')
const Dispatched = require('../../models/Dispatched')
const Return = require('../../models/Return')
const Delivered = require('../../models/Delivered')


exports.getAllDeliveredData = async (req, res) => {
    console.log(req.query)
    try {
        // 1. Escape special characters in the search term to avoid regex errors
        const escapeRegex = (input) => {
            return input ? input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") : "";
        };

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
        const plainStringFields = [
            "date",
            "time",
            "address",
            "district",
            "city",
            "state",
            "ref",
            "awb_number",
        ];

        // If you have any dropdown fields that store objects like { value: "SomeValue" }, list them here:
        const dropdownFields = [
            "payment_type",
            "sale_type",
            "agent_name",
            "shipment_type",
            "state"
        ];

        // Numeric fields
        const numberFields = [
            "cm_phone",
            "alternate_phone",
            "pincode",
            "amount"
        ];

        // 5. Build the query object
        const query = { isDeleted: false };

        // 6. Handle user-provided search text
        if (rawSearch) {
            if (searchColumn) {
                // 6A. If user wants to search in one specific column
                if (searchColumn === "dispatchedId") {
                    // Search inside dispatchedId
                    query["dispatchedId"] = { $ne: null };
                    query.$or = [
                        { "dispatchedId.ref": { $regex: regexSafeSearch, $options: "i" } },
                        { "dispatchedId.date": { $regex: regexSafeSearch, $options: "i" } },
                    ];
                } else {
                    // 6B. Regular field search
                    const dbField = dropdownFields.includes(searchColumn)
                        ? `${searchColumn}.value`
                        : searchColumn;

                    if (plainStringFields.includes(searchColumn) || dropdownFields.includes(searchColumn)) {
                        // e.g. { date: { $regex: "...", $options: "i" } }
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

                // Search inside dispatchedId
                query.$or.push({ "dispatchedId.reference": { $regex: regexSafeSearch, $options: "i" } });
                query.$or.push({ "dispatchedId.date": { $regex: regexSafeSearch, $options: "i" } });
            }
        }

        // 7. Fetch data with pagination
        const deliveredData = await Delivered.find(query)
            .populate({
                path: 'dispatchedId',
                populate: {
                    path: 'confirmedId', // Populate `confirmedId` inside `dispatchId`
                }
            })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        // 8. Count total documents matching the same query
        const totalCount = await Delivered.countDocuments(query);

        // 9. Return the data in the desired format
        return res.status(200).json({
            message: "Delivered data fetched successfully.",
            deliveredData,
            totalCount,
            totalPages: Math.ceil(totalCount / limit),
            currentPage: page,
            search: rawSearch,
            searchColumn: searchColumn || null,
        });
    } catch (err) {
        console.error("Error in getAllDeliveredData:", err);
        return res.status(500).json({ message: "Failed to get delivered data" });
    }
};