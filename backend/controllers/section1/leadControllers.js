const Lead = require('../../models/Lead')
const Workbook = require('../../models/Workbook')
const Dropdown = require('../../models/Dropdown')
const mongoose = require("mongoose")
const fs = require("fs");
const csv = require('csv-parser')

// exports.postAddLeadData = async (req, res) => {
//     try {
//         const data = await Dropdown.find();

//         const toSnakeCase = (str) => {
//             return str
//                 .toLowerCase()
//                 .replace(/\s+/g, "_"); // Replace spaces with underscores
//         };

//         const formattedData = data.reduce((acc, item) => {
//             if (item.name && item.values && item._id) {
//                 const formattedName = toSnakeCase(item.name); // Convert name to snake_case
//                 acc[formattedName] = {
//                     values: item.values,
//                     id: item._id,
//                 };
//             }
//             return acc;
//         }, {});

//         // console.log(formattedData)

//         const fileContent = req.file.buffer.toString('utf-8'); // Read file content
//         let rows = [];

//         // Parse CSV content (adjust for your file format if needed)
//         const headerMapping = {}; // To map lowercase or underscored headers to schema fields

//         fileContent.split('\n').forEach((line, index) => {
//             const columns = line.split(',');
//             if (index === 0) {
//                 // First line is the header
//                 columns.forEach((col, i) => {
//                     // Map headers to match schema (lowercase and replace spaces or underscores)
//                     const cleanHeader = col.trim().toLowerCase().replace(/[^a-z0-9]/g, '_');
//                     // console.log(cleanHeader);
//                     headerMapping[i] = cleanHeader;
//                 });
//             } else {
//                 // Map data based on headerMapping
//                 const rowData = {};
//                 columns.forEach((col, i) => {
//                     rowData[headerMapping[i]] = col.trim();
//                 });
//                 rows.push(rowData);
//             }
//         });
//         const x = rows.pop()
//         // console.log(rows)    

//         // console.log(headerMapping)
//         // Transform rows to match schema and insert into MongoDB
//         const leads = rows.map(row => ({
//             date: row.date,
//             source: { value: row.source },
//             cm_first_name: row.cm_first_name,
//             cm_last_name: row.cm_last_name,
//             cm_phone: parseInt(row.cm_phone) || null,
//             alternate_phone: parseInt(row.alternate_phone) || null,
//             agent_name: { value: row.agent_name },
//             language: { value: row.language },
//             disease: { value: row.disease },
//             age: parseInt(row.age) || null,
//             height: parseFloat(row.height) || null,
//             weight: parseFloat(row.weight) || null,
//             state: { value: row.state },
//             city: row.city,
//             remark: { value: row.remark },
//             comment: row.comment,
//         }));

//         // console.log(leads)
//         // Save all leads to the database
//         await Lead.insertMany(leads);

//         res.status(200).json({ message: 'Leads uploaded successfully', leads });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'Error uploading leads', error });
//     }
// }

// exports.postAddLeadData = async (req, res) => {
//     try {
//         const data = await Dropdown.find(); // Fetch dropdown data

//         const toSnakeCase = (str) => {
//             return str
//                 .toLowerCase()
//                 .replace(/\s+/g, "_"); // Replace spaces with underscores
//         };

//         const formattedData = data.reduce((acc, item) => {
//             if (item.name && item.values && item._id) {
//                 const formattedName = toSnakeCase(item.name); // Convert name to snake_case
//                 acc[formattedName] = {
//                     values: item.values,
//                     id: item._id,
//                 };
//             }
//             return acc;
//         }, {});

//         const fileContent = req.file.buffer.toString("utf-8"); // Read file content
//         let rows = [];
//         const headerMapping = {}; // Map lowercase/underscored headers to schema fields

//         // Parse CSV content
//         fileContent.split("\n").forEach((line, index) => {
//             const columns = line.split(",");
//             if (index === 0) {
//                 // First line: Headers
//                 columns.forEach((col, i) => {
//                     const cleanHeader = col.trim().toLowerCase().replace(/[^a-z0-9]/g, "_");
//                     headerMapping[i] = cleanHeader;
//                 });
//             } else {
//                 // Map data to headers
//                 const rowData = {};
//                 columns.forEach((col, i) => {
//                     rowData[headerMapping[i]] = col.trim();
//                 });
//                 rows.push(rowData);
//             }
//         });

//         rows.pop(); // Remove empty row if present at the end

//         // Transform rows to match schema
//         const leads = rows.map((row) => {
//             const getDropdownValue = (key) => {
//                 if (formattedData[key]) {
//                     return {
//                         dropdown_data: new mongoose.Types.ObjectId(formattedData[key].id),
//                         value: row[key] || null,
//                     };
//                 }
//                 return { dropdown_data: null, value: row[key] || null };
//             };

//             return {
//                 source: getDropdownValue("source"),
//                 cm_first_name: row.cm_first_name,
//                 cm_last_name: row.cm_last_name,
//                 cm_phone: parseInt(row.cm_phone) || null,
//                 alternate_phone: parseInt(row.alternate_phone) || null,
//                 agent_name: getDropdownValue("agent_name"),
//                 language: getDropdownValue("language"),
//                 disease: getDropdownValue("disease"),
//                 age: parseInt(row.age) || null,
//                 height: parseFloat(row.height) || null,
//                 weight: parseFloat(row.weight) || null,
//                 state: getDropdownValue("state"),
//                 city: row.city,
//                 remark: getDropdownValue("remark"),
//                 comment: row.comment,
//             };
//         });

//         // Save all leads to the database
//         await Lead.insertMany(leads);

//         res.status(200).json({ message: "Leads uploaded successfully", leads });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: "Error uploading leads", error });
//     }
// };


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
                        value: row[key] || null,
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

exports.getAllLeadData = async (req, res) => {
    try {
        // Get page and limit from query parameters (default values are 1 and 10)
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;

        // Calculate the number of items to skip
        const skip = (page - 1) * limit;

        // Fetch data with pagination
        const data = await Lead.find({ is_sent_to_pending: false, isDeleted: false })
        // console.log(data);

        // Get total count of documents
        const totalCount = await Lead.countDocuments({ is_sent_to_pending: false, isDeleted: false });

        return res.status(200).json({
            message: "Lead data fetched successfully.",
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

exports.deleteLeadData = async (req, res) => {
    const dataId = req.params.id
    // console.log(dataId)
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

        // console.log(formattedData)
        res.json({ dropdowns: formattedData });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Internal Server Error" });
    }
};


exports.getEditLeadData = async (req, res) => {
    const id = req.params.id
    // console.log(id)
    try {
        const data = await Lead.findOne({ _id: id }, { isDeleted: false });
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

exports.putEditLeadData = async (req, res) => {
    const id = new mongoose.Types.ObjectId(req.params.id)
    const data = req.body
    // console.log(id)
    // console.log(data)

    try {
        const updatedIncoming = await Lead.findByIdAndUpdate(
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