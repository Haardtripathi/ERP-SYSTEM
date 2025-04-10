const Payment = require('../../models/Payment')
const Delivered = require('../../models/Delivered')


exports.addPayment = async (req, res) => {
    try {

        const data = req.body.data
        const deliveredItem = await Delivered.findOne({ dispatchedId: data.dispatchedId })
        deliveredItem.payment_received = true

        await deliveredItem.save()
        const payment = new Payment({
            payment_id: data.payment_id,
            dispatchedId: data.dispatchedId,
            date: data.date,
            deposit_date: data.deposit_date || null,
            fund_type: data.fund_type,
            referenceId: data.referenceId,
        })

        await payment.save()
        return res.status(201).json({ message: "Payment data added successfully.", payment });
    }
    catch (err) {
        return res.status(500).json({ message: "Failed to add payment data" });
    }
}

// exports.getAllPaymentData = async (req, res) => {
//     try {
//         const page = parseInt(req.query.page, 10) || 1;
//         const limit = parseInt(req.query.limit, 10) || 10;

//         // Calculate the number of items to skip
//         const skip = (page - 1) * limit;

//         // Fetch data with pagination, including only records where awb_number is "" or null
//         const paymentData = await Payment.find({ isDeleted: false }).sort({ createdAt: -1 })
//             .populate({
//                 path: 'dispatchedId',
//                 populate: {
//                     path: 'confirmedId', // Populate `confirmedId` inside `dispatchId`
//                 }
//             });

//         const totalCount = await Payment.countDocuments({ isDeleted: false })
//         return res.status(200).json({
//             message: "Payment data fetched successfully.",
//             paymentData,
//             totalCount,
//             totalPages: Math.ceil(totalCount / limit),
//             currentPage: page,
//         });
//     }
//     catch (err) {
//         return res.status(500).json({ message: "Failed to get confirmed data" });
//     }

// }





exports.getAllPaymentData = async (req, res) => {
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
            "fund_type",
            "payment_id",
            "deposit_date",
            "ref",
            "address",
            "district",
            "city",
            "state",
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
                        { "dispatchedId.reference": { $regex: regexSafeSearch, $options: "i" } },
                        { "dispatchedId.date": { $regex: regexSafeSearch, $options: "i" } },
                    ];
                } else if (plainStringFields.includes(searchColumn)) {
                    // Plain text search
                    query[searchColumn] = { $regex: regexSafeSearch, $options: "i" };
                } else if (dropdownFields.includes(searchColumn)) {
                    // Dropdown field search
                    query[`${searchColumn}.value`] = { $regex: regexSafeSearch, $options: "i" };
                } else if (numberFields.includes(searchColumn)) {
                    // Numeric search
                    const num = Number(rawSearch);
                    if (!isNaN(num)) {
                        query[searchColumn] = num;
                    }
                }
            } else {
                // 6C. "All columns" search across every relevant field
                query.$or = [];

                // Add payment-specific fields
                query.$or.push({ "fund_type": { $regex: regexSafeSearch, $options: "i" } });
                query.$or.push({ "payment_id": { $regex: regexSafeSearch, $options: "i" } });
                query.$or.push({ "deposit_date": { $regex: regexSafeSearch, $options: "i" } });

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
        const paymentData = await Payment.find(query)
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
        const totalCount = await Payment.countDocuments(query);

        // 9. Return the data in the desired format
        return res.status(200).json({
            message: "Payment data fetched successfully.",
            paymentData,
            totalCount,
            totalPages: Math.ceil(totalCount / limit),
            currentPage: page,
            search: rawSearch,
            searchColumn: searchColumn || null,
        });
    } catch (err) {
        console.error("Error in getAllPaymentData:", err);
        return res.status(500).json({ message: "Failed to get payment data" });
    }
};