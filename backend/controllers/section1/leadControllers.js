const Lead = require('../../models/Lead')
const Workbook = require('../../models/Workbook')
const Dropdown = require('../../models/Dropdown')
const Pending = require('../../models/Pending')
const mongoose = require("mongoose")
const fs = require("fs");
const jwt = require('jsonwebtoken');


const csv = require('csv-parser')


exports.postAddLeadData = async (req, res) => {
    try {
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

        const fileContent = req.file.buffer.toString("utf-8"); // Read file content
        let rows = [];
        const headerMapping = {}; // Map lowercase/underscored headers to schema fields

        // Parse CSV content
        fileContent.split("\n").forEach((line, index) => {
            const columns = line.split(",");
            if (index === 0) {
                // First line: Headers
                columns.forEach((col, i) => {
                    const cleanHeader = col.trim().toLowerCase().replace(/[^a-z0-9]/g, "_");
                    headerMapping[i] = cleanHeader;
                });
            } else {
                // Map data to headers
                const rowData = {};
                columns.forEach((col, i) => {
                    rowData[headerMapping[i]] = col.trim();
                });
                rows.push(rowData);
            }
        });

        rows.pop(); // Remove empty row if present at the end

        // Transform rows to match schema
        const leads = rows.map((row) => {
            const getDropdownValue = (key) => {
                if (formattedData[key]) {
                    return {
                        dropdown_data: new mongoose.Types.ObjectId(formattedData[key].id),
                        value: row[key] || "",
                    };
                }
                return { dropdown_data: null, value: row[key] || null };
            };

            return {
                source: getDropdownValue("source"),
                cm_first_name: row.cm_first_name,
                cm_last_name: row.cm_last_name,
                cm_phone: parseInt(row.cm_phone) || null,
                alternate_phone: parseInt(row.alternate_phone) || null,
                agent_name: getDropdownValue("agent_name"),
                language: getDropdownValue("language"),
                disease: getDropdownValue("disease"),
                age: parseInt(row.age) || null,
                height: parseFloat(row.height) || null,
                weight: parseFloat(row.weight) || null,
                state: getDropdownValue("state"),
                city: row.city,
                remark: getDropdownValue("remark"),
                comment: row.comment,
            };
        });

        // Save all leads to the database
        const savedLeads = await Lead.insertMany(leads);

        // Map leads to workbook entries
        const workbooks = savedLeads.map((lead) => {
            return {
                data: {
                    dropdown_data: new mongoose.Types.ObjectId(formattedData.data.id), // Reference dropdown data
                    value: "Lead",
                },
                dataId: lead._id,
            };
        });

        // Save workbook entries to the database
        await Workbook.insertMany(workbooks);

        res.status(200).json({ message: "Leads and workbooks uploaded successfully", leads, workbooks });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error uploading leads and workbooks", error });
    }
};

// Escape regex characters to avoid MongoDB crash
const escapeRegex = (input) => {
    return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

exports.getAllLeadData = async (req, res) => {
    const token = req.header("Authorization").split(" ")[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = decoded;

        const page = Number.parseInt(req.query.page, 10) || 1;
        const limit = Number.parseInt(req.query.limit, 10) || 10;
        const skip = (page - 1) * limit;

        const filter = req.query.status;
        const rawSearch = req.query.search || "";
        const searchColumn = req.query.searchColumn || "";
        // Instead of doing a numeric check, treat all as strings since we store phone and similar as strings
        const regexSafeSearch = escapeRegex(rawSearch);

        const query = { isDeleted: false };

        // If user is not an Admin, filter by the agent's name
        if (user.role !== "Admin") {
            query["agent_name.value"] = user.agent_name;
        }

        if (filter === "true") query.is_sent_to_pending = true;
        else if (filter === "false") query.is_sent_to_pending = false;

        if (rawSearch) {
            if (searchColumn) {
                // Determine if the field is nested so we can reference the correct property
                const isNested = ["agent_name", "state", "language", "disease", "remark", "source"].includes(searchColumn);
                const searchField = isNested ? `${searchColumn}.value` : searchColumn;

                // For columns that were previously numeric but are now strings, use regex for partial matches.
                if (["cm_phone", "alternate_phone", "age", "height", "weight"].includes(searchField)) {
                    query[searchField] = { $regex: regexSafeSearch, $options: "i" };
                } else {
                    // Regular regex search for non-numeric fields.
                    query[searchField] = { $regex: regexSafeSearch, $options: "i" };
                }
            } else {
                // When no specific search column is provided, search multiple fields using $or
                query["$or"] = [
                    { "cm_first_name": { $regex: regexSafeSearch, $options: "i" } },
                    { "cm_last_name": { $regex: regexSafeSearch, $options: "i" } },
                    // For phone and similar fields, assume stored as strings for partial matching
                    { "cm_phone": { $regex: regexSafeSearch, $options: "i" } },
                    { "alternate_phone": { $regex: regexSafeSearch, $options: "i" } },
                    { "agent_name.value": { $regex: regexSafeSearch, $options: "i" } },
                    { "language.value": { $regex: regexSafeSearch, $options: "i" } },
                    { "disease.value": { $regex: regexSafeSearch, $options: "i" } },
                    { "age": { $regex: regexSafeSearch, $options: "i" } },
                    { "height": { $regex: regexSafeSearch, $options: "i" } },
                    { "weight": { $regex: regexSafeSearch, $options: "i" } },
                    { "state.value": { $regex: regexSafeSearch, $options: "i" } },
                    { "city": { $regex: regexSafeSearch, $options: "i" } },
                    { "remark.value": { $regex: regexSafeSearch, $options: "i" } },
                    { "comment": { $regex: regexSafeSearch, $options: "i" } },
                    { "date": { $regex: regexSafeSearch, $options: "i" } },
                    { "source.value": { $regex: regexSafeSearch, $options: "i" } }
                ];
            }
        }

        const data = await Lead.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit);
        const totalCount = await Lead.countDocuments(query);

        return res.status(200).json({
            message: "Lead data fetched successfully.",
            data,
            totalCount,
            totalPages: Math.ceil(totalCount / limit),
            currentPage: page,
            filter: filter || null,
            search: rawSearch,
            searchColumn: searchColumn || null,
        });

    } catch (error) {
        console.error("Error fetching lead data:", error);
        return res.status(500).json({
            message: "An error occurred while fetching lead data.",
        });
    }
};







exports.deleteLeadData = async (req, res) => {
    const dataId = req.params.id
    // (dataId)
    const data = await Lead.findOne({ _id: dataId });
    if (data.is_sent_to_pending || data.isDeleted) {
        return res.status(400).json({
            message: "Data already sent to pending or already deleted.",
        });
    }

    try {
        await Lead.updateOne({ _id: dataId }, { isDeleted: true });
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


exports.getLeadDropdownData = async (req, res, next) => {
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

        // (formattedData)
        res.json({ dropdowns: formattedData });
    } catch (err) {
        (err);
        res.status(500).json({ error: "Internal Server Error" });
    }
};


exports.getEditLeadData = async (req, res) => {
    const id = req.params.id
    // (id)
    try {
        // const data = await Lead.findOne({ _id: id }, { isDeleted: false });
        const data = await Lead.findOne({ _id: id, isDeleted: false });

        if (!data) {
            return res.status(404).json({
                message: "Data not found or it has been deleted.",
            });
        }

        // Check if the data is already sent to pending
        // if (data.is_sent_to_pending) {
        //     return res.status(400).json({
        //         message: "Data already sent to pending.",
        //     });
        // }

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

exports.putEditLeadData = async (req, res) => {
    const id = new mongoose.Types.ObjectId(req.params.id)
    const data = req.body
    if (data.is_sent_to_pending) {
        return res.status(400).json({
            message: "Data already sent to pending.",
        });
    }

    try {
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
        const formattedDate = formatter.format(new Date());

        // Add the formatted date to the data object
        data.date = formattedDate;
        const updatedLead = await Lead.findByIdAndUpdate(
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


const transformLeadToPending = (leadData) => {
    return {
        data: "Lead",
        dataId: leadData._id,
        payment_type: null, // No equivalent in leadData
        sale_type: null, // No equivalent in leadData
        source: leadData.source || { dropdown_data: null, value: null },
        agent_name: leadData.agent_name || { dropdown_data: null, value: null },
        cm_first_name: leadData.cm_first_name || null,
        cm_last_name: leadData.cm_last_name || null,
        cm_phone: leadData.cm_phone || null,
        alternate_phone: leadData.alternate_phone || null,
        email: null, // No equivalent in leadData
        status: null,
        remark: leadData.remark || { dropdown_data: null, value: null },
        comment: leadData.comment || null,
        shipment_type: null, // No equivalent in leadData
        address: null, // No equivalent in leadData
        post_type: null, // No equivalent in leadData
        post: null, // No equivalent in leadData
        district: null, // No equivalent in leadData
        city: leadData.city || null,
        pincode: null, // No equivalent in leadData
        state: leadData.state || { dropdown_data: null, value: null },
        disease: leadData.disease || { dropdown_data: null, value: null },
        amount: null, // No equivalent in leadData
        products: null, // No equivalent in leadData
        quantity: null, // No equivalent in leadData
        isDeleted: leadData.isDeleted || false,
    };
};

exports.sendLeadDataToPending = async (req, res) => {
    ("Lead")
    try {
        const id = new mongoose.Types.ObjectId(req.params.id)
        // (id)

        const leadData = await Lead.findOne({ _id: id })
        // (leadData)
        await Lead.updateOne({ _id: id }, { is_sent_to_pending: true })

        const pendingData = transformLeadToPending(leadData);
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