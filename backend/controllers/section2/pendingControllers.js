const Lead = require('../../models/Lead')
const Workbook = require('../../models/Workbook')
const Incoming = require('../../models/Incoming')
const Confirmed = require('../../models/Confirmed')
const Dropdown = require('../../models/Dropdown')
const Pending = require('../../models/Pending')
const mongoose = require("mongoose")
const jwt = require('jsonwebtoken');

// exports.getAllPendingData = async (req, res) => {
//     // const token = req.header('Authorization').split(" ")[1];
//     try {
//         console.log(req.query)
//         // const decoded = jwt.verify(token, process.env.JWT_SECRET);
//         // const user = decoded.agent_name
//         const page = parseInt(req.query.page, 10) || 1;
//         const limit = parseInt(req.query.limit, 10) || 10;
//         const skip = (page - 1) * limit;
//         const data = await Pending.find({ isDeleted: false }).sort({ createdAt: -1 });

//         // let data
//         // let totalCount
//         // if (user == "Panchved") {
//         //     data = await Pending.find({ isDeleted: false })
//         // }
//         // else {
//         //     data = await Pending.find({ isDeleted: false, "agent_name.value": user });
//         // }
//         const totalCount = await Pending.countDocuments({ isDeleted: false });

//         // if (user == "Panchved") {
//         //     totalCount = await Pending.countDocuments({ isDeleted: false });
//         // }
//         // else {
//         //     totalCount = await Pending.countDocuments({ isDeleted: false, "agent_name.value": user })
//         // }
//         return res.status(200).json({
//             message: "Pending data fetched successfully.",
//             data,
//             totalCount,
//             totalPages: Math.ceil(totalCount / limit),
//             currentPage: page,
//         });
//     }
//     catch (err) {
//         return res.status(500).json({ message: "Failed to get pending data" })
//     }
// }

// Regex sanitizer
const escapeRegex = (input) => {
    return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

exports.getAllPendingData = async (req, res) => {
    console.log('DEBUG req.user (pending):', req.user);
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const skip = (page - 1) * limit;

        const rawSearch = req.query.search || "";
        const searchColumn = req.query.searchColumn || "";
        const isNumeric = !isNaN(rawSearch);
        const regexSafeSearch = escapeRegex(rawSearch);

        const plainStringFields = ['cm_first_name', 'cm_last_name', 'email', 'comment', 'address', 'post', 'district', 'city', 'pincode', 'ref'];
        const dropdownFields = ['agent_name', 'source', 'data', 'remark', 'status', 'state', 'disease', 'post_type', 'payment_type', 'sale_type'];
        const numberFields = ['cm_phone', 'alternate_phone', 'amount'];

        let query = { isDeleted: false };

        // Add remote user filtering for remote users
        if (req.user && req.user.isRemote) {
            query["agent_name.value"] = req.user.agent_name;
        }

        if (rawSearch) {
            if (searchColumn) {
                let dbField = dropdownFields.includes(searchColumn)
                    ? `${searchColumn}.value`
                    : searchColumn;

                if (plainStringFields.includes(searchColumn) || dropdownFields.includes(searchColumn)) {
                    query[dbField] = { $regex: regexSafeSearch, $options: 'i' };
                } else if (numberFields.includes(searchColumn)) {
                    const num = Number(rawSearch);
                    if (!isNaN(num)) query[dbField] = num;
                }
            } else {
                query.$or = [];

                plainStringFields.forEach(field => {
                    query.$or.push({ [field]: { $regex: regexSafeSearch, $options: 'i' } });
                });

                dropdownFields.forEach(field => {
                    query.$or.push({ [`${field}.value`]: { $regex: regexSafeSearch, $options: 'i' } });
                });

                if (isNumeric) {
                    numberFields.forEach(field => {
                        query.$or.push({ [field]: Number(rawSearch) });
                    });
                }

                // Product-based search (array of objects)
                query.$or.push({ "products.value": { $elemMatch: { product: { $regex: regexSafeSearch, $options: 'i' } } } });
                query.$or.push({ "products.value": { $elemMatch: { product_id: { $regex: regexSafeSearch, $options: 'i' } } } });
            }
        }

        const totalCount = await Pending.countDocuments(query);

        const data = await Pending.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        return res.status(200).json({
            message: "Pending data fetched successfully.",
            data,
            totalCount,
            totalPages: Math.ceil(totalCount / limit),
            currentPage: page,
            search: rawSearch,
            searchColumn: searchColumn || null,
        });

    } catch (err) {
        console.error("Error in getAllPendingData:", err);
        return res.status(500).json({ message: "Failed to get pending data" });
    }
};



exports.getEditPendingData = async (req, res) => {
    const id = req.params.id
    // (id)
    try {
        // const data = await Lead.findOne({ _id: id }, { isDeleted: false });
        const data = await Pending.findOne({ _id: id, isDeleted: false });

        if (!data) {
            return res.status(404).json({
                message: "Data not found or it has been deleted.",
            });
        }

        return res.status(200).json({
            message: "Data fetched successfully.",
            data,
        });
    }
    catch {
        return res.status(500).json({
            message: "An error occurred while editing data.",
        });
    }
}

exports.getDropdownData = async (req, res) => {
    try {
        const data = await Dropdown.find();

        const toSnakeCase = (str) => {
            return str
                .toLowerCase()
                .replace(/\s+/g, "_"); // Replace spaces with underscores
        };

        const formattedData = data.reduce((acc, item) => {
            if (item.name && item.values && item._id) {
                const formattedName = toSnakeCase(item.name); // Convert name to snake_case
                acc[formattedName] = {
                    values: item.values,
                    id: item._id,
                    ...(item.name === "Products" && { productExtra: item.productExtra }), // Conditional property
                    ...(item.name === "Shipment Type" && { shipmentExtra: item.shipmentExtra }) // Conditional property

                };
            }
            return acc;
        }, {});


        res.json({ dropdowns: formattedData });
    } catch (err) {
        res.status(500).json({ error: "Internal Server Error" });
    }
}

exports.putEditPendingData = async (req, res) => {
    const { id } = req.params; // Extract Pending ID
    const updateData = req.body; // Extract update data from request body
    const { dataId, data } = updateData; // Extract dataId and data type

    try {
        // Validate `dataId` and `data`
        if (!dataId || !data || (data !== "Lead" && data !== "Incoming")) {
            return res.status(400).json({
                message: "Invalid dataId or data type. Ensure 'data' is either 'Lead' or 'Incoming'.",
            });
        }

        // Step 1: Update the Pending document
        const updatedPending = await Pending.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true, runValidators: true }
        );

        if (!updatedPending) {
            return res.status(404).json({ message: "Pending document not found." });
        }

        // Step 2: Check and update the corresponding Lead or Incoming model
        let relatedModel;
        if (data === "Lead") {
            relatedModel = await Lead.findByIdAndUpdate(
                dataId,
                { $set: updateData },
                { new: true, runValidators: true }
            );
        } else if (data === "Incoming") {
            relatedModel = await Incoming.findByIdAndUpdate(
                dataId,
                { $set: updateData },
                { new: true, runValidators: true }
            );
        }

        // If no matching document is found in the related model
        if (!relatedModel) {
            return res.status(404).json({
                message: `No document found in ${data} model with the given dataId.`,
            });
        }

        // Step 3: Respond with success
        return res.status(200).json({
            message: "Pending and related data updated successfully.",
            pending: updatedPending,
            related: relatedModel,
        });
    } catch (error) {
        console.error("Error updating pending or related data:", error);
        return res.status(500).json({
            message: "Server error while updating pending or related data.",
            error: error.message,
        });
    }
};

exports.deletePendingData = async (req, res) => {

    const { id } = req.params; // Extract Pending ID
    const dataId = req.body.dataId;
    const data = req.body.data;


    try {
        const deletePending = await Pending.deleteOne({ _id: id })
        if (data == "Lead") {
            await Lead.updateOne({ _id: dataId }, { isDeleted: true, is_sent_to_pending: false });

        }

        if (data == "Incoming") {
            await Incoming.updateOne({ _id: dataId }, { isDeleted: true, is_sent_to_pending: false });

        }
        return res.status(200).json({
            message: "Deleted successfully.",
        });
    } catch (e) {
        return res.status(500).json({
            message: "An error occurred while deleting data.",
        });
    }



}

function getFormattedDate() {
    const options = {
        timeZone: 'Asia/Kolkata',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    };
    const formatter = new Intl.DateTimeFormat([], options);
    return formatter.format(new Date());
}

exports.issuePendingData = async (req, res) => {
    const { id } = req.params; // Extract Pending ID
    const dataId = req.body.dataId;
    const data = req.body.data;


    try {
        const deletePending = await Pending.deleteOne({ _id: id })
        if (data == "Lead") {
            await Lead.updateOne({ _id: dataId }, { is_sent_to_pending: false, date: getFormattedDate() });

        }

        if (data == "Incoming") {
            await Incoming.updateOne({ _id: dataId }, { is_sent_to_pending: false, date: getFormattedDate() });

        }
        return res.status(200).json({
            message: "Updated successfully.",
        });
    } catch (e) {
        return res.status(500).json({
            message: "An error occurred while deleting data.",
        });
    }
}


exports.sendPendingDataToConfirmed = async (req, res) => {
    const { id } = req.params; // Extract Pending ID

    try {
        // Find the specific Pending document by ID
        const pendingData = await Pending.findById(id);

        if (!pendingData) {
            return res.status(404).json({
                message: "Pending data not found.",
            });
        }

        // Exclude the `status` and `date` fields from the document
        const { status, date, ...confirmedData } = pendingData.toObject();
        if (confirmedData.shipment_type.value == "F2F") {
            confirmedData.awb_number = confirmedData.ref;
        }
        else {
            confirmedData.awb_number = "";

        }
        // Insert the data into the Confirmed collection
        const newConfirmed = new Confirmed(confirmedData);
        await newConfirmed.save();

        // Optionally delete the Pending document after transferring
        await Pending.findByIdAndDelete(id);

        return res.status(200).json({
            message: "Data successfully transferred to Confirmed.",
            data: newConfirmed,
        });
    } catch (e) {
        console.error("Error transferring data:", e);
        return res.status(500).json({
            message: "Internal server error.",
            error: e.message,
        });
    }
};
