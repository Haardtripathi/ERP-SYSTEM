const Lead = require('../../models/Lead')
const Workbook = require('../../models/Workbook')
const Incoming = require('../../models/Incoming')
const Confirmed = require('../../models/Confirmed')
const Dropdown = require('../../models/Dropdown')
const Pending = require('../../models/Pending')
const mongoose = require("mongoose")

exports.getAllPendingData = async (req, res) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;

        // Calculate the number of items to skip
        const skip = (page - 1) * limit;

        // Fetch data with pagination
        const data = await Pending.find({ isDeleted: false })

        // (data);

        // Get total count of documents
        const totalCount = await Pending.countDocuments({ isDeleted: false });
        console.log(totalCount)

        return res.status(200).json({
            message: "Pending data fetched successfully.",
            data,
            totalCount,
            totalPages: Math.ceil(totalCount / limit),
            currentPage: page,
        });
    }
    catch (err) {
        return res.status(500).json({ message: "Failed to get pending data" })
    }
}

exports.getEditPendingData = async (req, res) => {
    const id = req.params.id
    // (id)
    console.log(id)
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
    // const { id } = req.params; // Extract the ID from the route parameter
    // const updateData = req.body; // Extract the data to update from the request body
    // console.log(updateData)
    // try {
    //     // Find and update the document by ID
    //     const updatedPending = await Pending.findByIdAndUpdate(
    //         id,
    //         { $set: updateData }, // Set only the fields passed in the request
    //         { new: true, runValidators: true } // Return the updated document, validate data
    //     );

    //     // Check if the document exists
    //     if (!updatedPending) {
    //         return res.status(404).json({ message: "Pending data not found" });
    //     }

    //     // Respond with the updated document
    //     return res.status(200).json({
    //         message: "Pending data updated successfully",
    //         data: updatedPending,
    //     });
    // } catch (error) {
    //     console.error("Error updating pending data:", error);
    //     return res.status(500).json({ message: "Server error", error: error.message });
    // }

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

exports.issuePendingData = async (req, res) => {
    const { id } = req.params; // Extract Pending ID
    const dataId = req.body.dataId;
    const data = req.body.data;


    try {
        const deletePending = await Pending.deleteOne({ _id: id })
        if (data == "Lead") {
            await Lead.updateOne({ _id: dataId }, { is_sent_to_pending: false });

        }

        if (data == "Incoming") {
            await Incoming.updateOne({ _id: dataId }, { is_sent_to_pending: false });

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
