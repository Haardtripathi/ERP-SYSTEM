const Lead = require('../../models/Lead')
const Workbook = require('../../models/Workbook')
const Incoming = require('../../models/Incoming')
const Dropdown = require('../../models/Dropdown')
const mongoose = require("mongoose")
const fs = require("fs");
const csv = require('csv-parser')
const jwt = require("jsonwebtoken")
// exports.getAllWorkbookData = async (req, res) => {
//     try {
//         const workbookData = await Workbook.find().populate('dataId').sort({ createdAt: -1 });;

//         const transformArrayToSchema = (dataArray) => {
//             return dataArray.map((dataObject) => {
//                 const { data, dataId } = dataObject;

//                 return {
//                     _id: dataId._id, // Use dataId._id as the _id for the transformed object
//                     data: {
//                         dropdown_data: data.dropdown_data,
//                         value: data.value,
//                     },
//                     source: {
//                         dropdown_data: dataId.source?.dropdown_data,
//                         value: dataId.source?.value,
//                     },
//                     date: dataId.date || new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }),
//                     cm_first_name: dataId.cm_first_name,
//                     cm_last_name: dataId.cm_last_name,
//                     cm_phone: dataId.cm_phone,
//                     alternate_phone: dataId.alternate_phone || null,
//                     agent_name: {
//                         dropdown_data: dataId.agent_name?.dropdown_data || null,
//                         value: dataId.agent_name?.value || null,
//                     },
//                     language: {
//                         dropdown_data: dataId.language?.dropdown_data || null,
//                         value: dataId.language?.value || null,
//                     },
//                     disease: {
//                         dropdown_data: dataId.disease?.dropdown_data || null,
//                         value: dataId.disease?.value || null,
//                     },
//                     age: dataId.age,
//                     height: dataId.height,
//                     weight: dataId.weight,
//                     state: {
//                         dropdown_data: dataId.state?.dropdown_data || null,
//                         value: dataId.state?.value || null,
//                     },
//                     city: dataId.city,
//                     remark: {
//                         dropdown_data: dataId.remark?.dropdown_data || null,
//                         value: dataId.remark?.value || null,
//                     },
//                     comment: dataId.comment,
//                     isDeleted: dataId.isDeleted ?? false,
//                     is_sent_to_pending: dataId.is_sent_to_pending ?? false
//                     // status: dataId.status || 'active',
//                 };
//             });
//         };

//         // Transform the data
//         const transformedData = transformArrayToSchema(workbookData);

//         // Filter out items where isDeleted
//         const filteredData = transformedData.filter(
//             (item) => !item.isDeleted
//         );

//         res.status(200).json(filteredData);
//     } catch (error) {
//         console.error('Error fetching workbook data:', error);
//         res.status(500).json({ error: 'An error occurred while fetching workbook data' });
//     }
// };










exports.getAllWorkbookData = async (req, res) => {
    const token = req.header("Authorization").split(" ")[1];

    try {
        // Decode JWT token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = decoded;

        // Pagination
        const page = Number.parseInt(req.query.page, 10) || 1;
        const limit = Number.parseInt(req.query.limit, 10) || 10;
        const skip = (page - 1) * limit;

        // Status filter
        const filter = req.query.status;

        // Build query
        const query = { isDeleted: false };

        if (user.role !== "Admin") {
            query["agent_name.value"] = user.agent_name;
        }

        if (filter === "true") {
            query.is_sent_to_pending = true;
        } else if (filter === "false") {
            query.is_sent_to_pending = false;
        }

        // Find matching workbook entries and populate dataId
        const workbookData = await Workbook.find()
            .populate({
                path: 'dataId',
                match: query // Apply the query directly to populated dataId
            })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        // Transform only populated entries (skip null dataIds)
        const transformArrayToSchema = (dataArray) => {
            return dataArray
                .filter(item => item.dataId) // Remove entries where population failed
                .map((dataObject) => {
                    const { data, dataId } = dataObject;

                    return {
                        _id: dataId._id,
                        data: {
                            dropdown_data: data.dropdown_data,
                            value: data.value,
                        },
                        source: {
                            dropdown_data: dataId.source?.dropdown_data,
                            value: dataId.source?.value,
                        },
                        date: dataId.date || new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }),
                        cm_first_name: dataId.cm_first_name,
                        cm_last_name: dataId.cm_last_name,
                        cm_phone: dataId.cm_phone,
                        alternate_phone: dataId.alternate_phone || null,
                        agent_name: {
                            dropdown_data: dataId.agent_name?.dropdown_data || null,
                            value: dataId.agent_name?.value || null,
                        },
                        language: {
                            dropdown_data: dataId.language?.dropdown_data || null,
                            value: dataId.language?.value || null,
                        },
                        disease: {
                            dropdown_data: dataId.disease?.dropdown_data || null,
                            value: dataId.disease?.value || null,
                        },
                        age: dataId.age,
                        height: dataId.height,
                        weight: dataId.weight,
                        state: {
                            dropdown_data: dataId.state?.dropdown_data || null,
                            value: dataId.state?.value || null,
                        },
                        city: dataId.city,
                        remark: {
                            dropdown_data: dataId.remark?.dropdown_data || null,
                            value: dataId.remark?.value || null,
                        },
                        comment: dataId.comment,
                        isDeleted: dataId.isDeleted ?? false,
                        is_sent_to_pending: dataId.is_sent_to_pending ?? false,
                    };
                });
        };

        const transformedData = transformArrayToSchema(workbookData);

        // Get total count for pagination (from Lead model)
        const totalCount = await Lead.countDocuments(query);

        return res.status(200).json({
            message: "Workbook data fetched successfully.",
            data: transformedData,
            totalCount,
            totalPages: Math.ceil(totalCount / limit),
            currentPage: page,
            filter: filter,
        });

    } catch (error) {
        console.error('Error fetching workbook data:', error);
        return res.status(500).json({ error: 'An error occurred while fetching workbook data' });
    }
};
