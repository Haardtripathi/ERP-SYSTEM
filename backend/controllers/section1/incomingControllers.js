
const Incoming = require('../../models/Incoming')
const Dropdown = require('../../models/Dropdown')
const Workbook = require('../../models/Workbook')
const Pending = require('../../models/Pending')
const mongoose = require("mongoose")

require("dotenv").config()


exports.getAddIncomingData = async (req, res, next) => {
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

        // console.log(formattedData)
        res.json({ dropdowns: formattedData });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Internal Server Error" });
    }
};


exports.postAddIncomingData = async (req, res) => {
    const data = await Dropdown.find(); // Fetch dropdown data

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

    try {
        const {
            source,
            cm_first_name,
            cm_last_name,
            cm_phone,
            alternate_phone,
            agent_name,
            language,
            disease,
            age,
            height,
            weight,
            state,
            city,
            remark,
            comment,
        } = req.body;

        // Validate required fields
        if (
            !source?.value ||
            !source?.dropdown_data ||
            !cm_first_name ||
            !cm_last_name ||
            !cm_phone ||
            !agent_name?.value ||
            !agent_name?.dropdown_data ||
            !language?.value ||
            !language?.dropdown_data ||
            !disease?.value ||
            !disease?.dropdown_data ||
            !age ||
            !height ||
            !weight ||
            !state?.value ||
            !state?.dropdown_data ||
            !city ||
            !remark?.value ||
            !remark?.dropdown_data ||
            !comment
        ) {
            return res.status(400).json({ message: "All fields are required." });
        }

        // Create the new Incoming document
        const newIncoming = new Incoming({
            source: {
                value: source.value,
                dropdown_data: new mongoose.Types.ObjectId(source.dropdown_data),
            },
            cm_first_name,
            cm_last_name,
            cm_phone,
            alternate_phone,
            agent_name: {
                value: agent_name.value,
                dropdown_data: new mongoose.Types.ObjectId(agent_name.dropdown_data),
            },
            language: {
                value: language.value,
                dropdown_data: new mongoose.Types.ObjectId(language.dropdown_data),
            },
            disease: {
                value: disease.value,
                dropdown_data: new mongoose.Types.ObjectId(disease.dropdown_data),
            },
            age,
            height,
            weight,
            state: {
                value: state.value,
                dropdown_data: new mongoose.Types.ObjectId(state.dropdown_data),
            },
            city,
            remark: {
                value: remark.value,
                dropdown_data: new mongoose.Types.ObjectId(remark.dropdown_data),
            },
            comment,
        });

        // Save the document in the database
        await newIncoming.save();

        const workbookData = new Workbook({
            data: {
                dropdown_data: new mongoose.Types.ObjectId(formattedData.data.id), // Reference dropdown data
                value: "Incoming",
            },
            dataId: newIncoming._id,
        })

        await workbookData.save();

        return res.status(201).json({
            message: "Incoming data created successfully.",
            data: newIncoming,
        });
    } catch (error) {
        console.error("Error creating incoming data:", error);
        return res.status(500).json({
            message: "An error occurred while creating incoming data.",
        });
    }
};



exports.getAllIncomingData = async (req, res) => {
    try {
        // Get page and limit from query parameters (default values are 1 and 10)
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;

        // Calculate the number of items to skip
        const skip = (page - 1) * limit;

        // Fetch data with pagination
        // const data = await Incoming.find({ is_sent_to_pending: false, isDeleted: false })
        const data = await Incoming.find({ isDeleted: false })


        // Get total count of documents
        // const totalCount = await Incoming.countDocuments({ is_sent_to_pending: false, isDeleted: false });
        const totalCount = await Incoming.countDocuments({ isDeleted: false });


        return res.status(200).json({
            message: "Incoming data fetched successfully.",
            data,
            totalCount,
            totalPages: Math.ceil(totalCount / limit),
            currentPage: page,
        });
    } catch (error) {
        console.error("Error fetching incoming data:", error);
        return res.status(500).json({
            message: "An error occurred while fetching incoming data.",
        });
    }
};


exports.deleteIncomingData = async (req, res) => {
    // console.log(req.params)
    const dataId = new mongoose.Types.ObjectId(req.params.id)

    try {
        await Incoming.updateOne({ _id: dataId }, { isDeleted: true });
        return res.status(200).json({
            message: "Deleted successfully.",
        });
    }
    catch {
        return res.status(500).json({
            message: "An error occurred while deleting data.",
        });
    }
}

exports.getEditIncomingData = async (req, res) => {
    // console.log(req.params)
    const id = new mongoose.Types.ObjectId(req.params.id)

    try {
        const data = await Incoming.findOne({ _id: id }, { isDeleted: false });
        // console.log(data)
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

exports.putEditIncomingData = async (req, res) => {
    const id = new mongoose.Types.ObjectId(req.params.id)
    const data = req.body
    // console.log(id)
    // console.log(data)

    try {
        const updatedIncoming = await Incoming.findByIdAndUpdate(
            id, // ID to match
            { $set: data }, // Data to update
            { new: true, runValidators: true } // Options: return updated document, run validation
        );

        return res.status(200).json({
            message: "Data updated successfully."
        });
    }
    catch {
        return res.status(500).json({
            message: "An error occurred while updating data.",
        });
    }


}



const transformIncomingToPending = (incomingData) => {
    return {
        payment_type: null, // No equivalent in incomingData
        sale_type: null, // No equivalent in incomingData
        agent_name: incomingData.agent_name || { dropdown_data: null, value: "" },
        cm_first_name: incomingData.cm_first_name || "",
        cm_last_name: incomingData.cm_last_name || "",
        cm_phone: incomingData.cm_phone || null,
        alternate_phone: incomingData.alternate_phone || null,
        email: "", // No equivalent in incomingData
        status: null,
        remark: incomingData.remark || { dropdown_data: null, value: "" },
        comment: incomingData.comment || "",
        shipment_type: null, // No equivalent in incomingData
        address: "", // No equivalent in incomingData
        post_type: null, // No equivalent in incomingData
        post: "", // No equivalent in incomingData
        sub_district_taluka: "", // No equivalent in incomingData
        city: incomingData.city || "",
        pincode: "", // No equivalent in incomingData
        state: incomingData.state || { dropdown_data: null, value: "" },
        disease: incomingData.disease || { dropdown_data: null, value: "" },
        amount: null, // No equivalent in incomingData
        products: null, // No equivalent in incomingData
        quantity: "", // No equivalent in incomingData
        isDeleted: incomingData.isDeleted || false,
    };
};

exports.sendIncomingDataToPending = async (req, res) => {
    try {
        const id = new mongoose.Types.ObjectId(req.params.id)
        // console.log(id)

        const incomingData = await Incoming.findOne({ _id: id })
        // console.log(incomingData)

        const pendingData = transformIncomingToPending(incomingData);
        console.log(pendingData)
        // Save to the Pending collection
        const newPending = new Pending(pendingData);
        await newPending.save();

        return res.status(200).json({
            message: "Data sent successfully."
        });
    }
    catch {
        return res.status(500).json({
            message: "An error occurred while sending data.",
        });
    }
}