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

// exports.getAllLeadData = async (req, res) => {
//     const token = req.header('Authorization').split(" ")[1];

//     try {
//         // Get page and limit from query parameters (default values are 1 and 10)
//         const decoded = jwt.verify(token, process.env.JWT_SECRET);
//         const user = decoded.role
//         const page = parseInt(req.query.page, 10) || 1;
//         const limit = parseInt(req.query.limit, 10) || 10;

//         // Calculate the number of items to skip
//         const skip = (page - 1) * limit;

//         // Fetch data with pagination
//         let data
//         let totalCount
//         // const data = await Lead.find({ is_sent_to_pending: false, isDeleted: false })
//         if (user == "Admin") {
//             data = await Lead.find({ isDeleted: false }).sort({ createdAt: -1 });

//         }
//         else {
//             data = await Lead.find({ isDeleted: false, "agent_name.value": user }).sort({ createdAt: -1 });

//         }

//         // (data);

//         // Get total count of documents
//         if (user == "Admin") {
//             totalCount = await Lead.countDocuments({ isDeleted: false });


//         }
//         else {
//             totalCount = await Lead.countDocuments({ isDeleted: false, "agent_name.value": user });


//         }

//         return res.status(200).json({
//             message: "Lead data fetched successfully.",
//             data,
//             totalCount,
//             totalPages: Math.ceil(totalCount / limit),
//             currentPage: page,
//         });
//     } catch (error) {
//         console.error("Error fetching incoming data:", error);
//         return res.status(500).json({
//             message: "An error occurred while fetching incoming data.",
//         });
//     }
// };


// exports.getAllLeadData = async (req, res) => {
//     try {
//         const token = req.header("Authorization").split(" ")[1];
//         const decoded = jwt.verify(token, process.env.JWT_SECRET);
//         const userRole = decoded.role;
//         const { page = 1, limit = 10 } = req.query;
//         const skip = (page - 1) * limit;

//         // Use `req.allowedColumns` to restrict returned fields
//         const selectFields = req.allowedColumns.join(" ");

//         let data, totalCount;

//         if (userRole === "Admin") {
//             data = await Lead.find({ isDeleted: false }).sort({ createdAt: -1 }).select(selectFields);
//             totalCount = await Lead.countDocuments({ isDeleted: false });
//         } else {
//             data = await Lead.find({ isDeleted: false, "agent_name.value": userRole }).sort({ createdAt: -1 }).select(selectFields);
//             totalCount = await Lead.countDocuments({ isDeleted: false, "agent_name.value": userRole });
//         }

//         res.status(200).json({
//             message: "Lead data fetched successfully.",
//             data,
//             totalCount,
//             totalPages: Math.ceil(totalCount / limit),
//             currentPage: page,
//         });
//     } catch (error) {
//         console.error("Error fetching lead data:", error);
//         res.status(500).json({ message: "An error occurred while fetching lead data." });
//     }
// };


exports.getAllLeadData = async (req, res) => {
    const token = req.header("Authorization").split(" ")[1]

    try {
        // Get page and limit from query parameters (default values are 1 and 10)
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const user = decoded.role
        const page = Number.parseInt(req.query.page, 10) || 1
        const limit = Number.parseInt(req.query.limit, 10) || 10
        const search = req.query.search || ""
        const searchColumn = req.query.searchColumn || "all"
        const status = req.query.status // 'true' for sent to pending, 'false' for not sent

        // Calculate the number of items to skip
        const skip = (page - 1) * limit

        // Build the query based on user role and filters
        const query = { isDeleted: false }

        // Add user role filter
        if (user !== "Admin") {
            query["agent_name.value"] = user
        }

        // Add status filter if provided
        if (status === "true") {
            query.is_sent_to_pending = true
        } else if (status === "false") {
            query.is_sent_to_pending = false
        }

        // Add search filter if provided
        if (search && search.trim() !== "") {
            if (searchColumn === "all") {
                // Search across multiple fields
                query.$or = [
                    { "source.value": { $regex: search, $options: "i" } },
                    { cm_first_name: { $regex: search, $options: "i" } },
                    { cm_last_name: { $regex: search, $options: "i" } },
                    { cm_phone: { $regex: search, $options: "i" } },
                    { "agent_name.value": { $regex: search, $options: "i" } },
                    { "language.value": { $regex: search, $options: "i" } },
                    { "disease.value": { $regex: search, $options: "i" } },
                    { "state.value": { $regex: search, $options: "i" } },
                    { city: { $regex: search, $options: "i" } },
                    { "remark.value": { $regex: search, $options: "i" } },
                    { comment: { $regex: search, $options: "i" } },
                    { date: { $regex: search, $options: "i" } },
                ]
            } else {
                // Search in specific column
                // Handle nested fields like "agent_name.value"
                if (searchColumn.includes(".")) {
                    query[searchColumn] = { $regex: search, $options: "i" }
                } else if (searchColumn === "data") {
                    // Special case for data field
                    query.data = { $regex: search, $options: "i" }
                } else {
                    // Handle regular fields and fields with .value
                    const fieldParts = searchColumn.split(".")
                    if (fieldParts.length === 1) {
                        // Check if this field might be a nested object with .value
                        if (["source", "agent_name", "language", "disease", "state", "remark"].includes(searchColumn)) {
                            query[`${searchColumn}.value`] = { $regex: search, $options: "i" }
                        } else {
                            query[searchColumn] = { $regex: search, $options: "i" }
                        }
                    }
                }
            }
        }

        // Get total count of documents matching the query
        const totalCount = await Lead.countDocuments(query)

        // Fetch data with pagination
        const data = await Lead.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit)

        return res.status(200).json({
            message: "Lead data fetched successfully.",
            data,
            totalCount,
            totalPages: Math.ceil(totalCount / limit),
            currentPage: page,
        })
    } catch (error) {
        console.error("Error fetching incoming data:", error)
        return res.status(500).json({
            message: "An error occurred while fetching incoming data.",
            error: error.message,
        })
    }
}



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