const Lead = require('../../models/Lead')
const Workbook = require('../../models/Workbook')
const Incoming = require('../../models/Incoming')
const Dropdown = require('../../models/Dropdown')
const mongoose = require("mongoose")
const fs = require("fs");
const csv = require('csv-parser')

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

// exports.getAllWorkbookData = async (req, res) => {
//     try {
//         const { page, limit = 10 } = req.query; // Get page and limit from request query
//         const pageNumber = Math.max(1, parseInt(page, 10) || 1);
//         const limitNumber = Math.max(1, parseInt(limit, 10) || 10);

//         const totalRecords = await Workbook.countDocuments(); // Count total records

//         const workbookData = await Workbook.find()
//             .populate('dataId')
//             .sort({ createdAt: -1 })
//             .skip((pageNumber - 1) * limitNumber)
//             .limit(limitNumber);

//         console.log(workbookData.length)
//         // Transform the data
//         const transformedData = workbookData.map((dataObject) => {
//             const { data, dataId } = dataObject;

//             return {
//                 _id: dataId._id,
//                 data: {
//                     dropdown_data: data.dropdown_data,
//                     value: data.value,
//                 },
//                 source: {
//                     dropdown_data: dataId.source?.dropdown_data,
//                     value: dataId.source?.value,
//                 },
//                 date: dataId.date || new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }),
//                 cm_first_name: dataId.cm_first_name,
//                 cm_last_name: dataId.cm_last_name,
//                 cm_phone: dataId.cm_phone,
//                 alternate_phone: dataId.alternate_phone || null,
//                 agent_name: {
//                     dropdown_data: dataId.agent_name?.dropdown_data || null,
//                     value: dataId.agent_name?.value || null,
//                 },
//                 language: {
//                     dropdown_data: dataId.language?.dropdown_data || null,
//                     value: dataId.language?.value || null,
//                 },
//                 disease: {
//                     dropdown_data: dataId.disease?.dropdown_data || null,
//                     value: dataId.disease?.value || null,
//                 },
//                 age: dataId.age,
//                 height: dataId.height,
//                 weight: dataId.weight,
//                 state: {
//                     dropdown_data: dataId.state?.dropdown_data || null,
//                     value: dataId.state?.value || null,
//                 },
//                 city: dataId.city,
//                 remark: {
//                     dropdown_data: dataId.remark?.dropdown_data || null,
//                     value: dataId.remark?.value || null,
//                 },
//                 comment: dataId.comment,
//                 isDeleted: dataId.isDeleted ?? false,
//                 is_sent_to_pending: dataId.is_sent_to_pending ?? false,
//             };
//         });

//         // Filter out deleted items
//         const filteredData = transformedData.filter((item) => !item.isDeleted);

//         res.status(200).json({
//             totalRecords, // Total records count for frontend
//             totalPages: Math.ceil(totalRecords / limitNumber), // Calculate total pages
//             currentPage: pageNumber,
//             data: filteredData,
//         });
//     } catch (error) {
//         console.error('Error fetching workbook data:', error);
//         res.status(500).json({ error: 'An error occurred while fetching workbook data' });
//     }
// };


exports.getAllWorkbookData = async (req, res) => {

    try {

        let { page, limit } = req.query;

        console.log(page, limit)
        page = parseInt(page) || 1;
        limit = parseInt(limit) || 10;
        const skip = ((page - 1) * limit);

        // console.log(`📌 Backend Received Request: page=${page}, limit=${limit}, skip=${skip}`);

        // Get total count BEFORE pagination
        const totalRecords = await Workbook.countDocuments();

        // Fetch only the requested page's data
        const workbookData = await Workbook.find()
            .populate("dataId")
            .sort({ createdAt: -1 })
            .skip(skip) // ✅ Skip previous pages
            .limit(limit); // ✅ Limit to `limit` items per page

        // console.log(`📌 Backend Fetching Page ${page}: Found ${workbookData.length} records`);

        // Transform response for frontend
        const transformedData = workbookData.map((dataObject) => {
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

        // **Filter out deleted records**
        const filteredData = transformedData.filter((item) => !item.isDeleted);

        // console.log(`📌 Backend Sending ${filteredData.length} records for page ${page}`);

        res.status(200).json({
            data: filteredData,
            currentPage: page,  // ✅ FIX: Return the correct currentPage
            totalPages: Math.ceil(totalRecords / limit), // ✅ Correct total pages calculation
            totalRecords,
        });
    } catch (error) {
        console.error("❌ Error fetching workbook data:", error);
        res.status(500).json({ error: "An error occurred while fetching workbook data" });
    }
};
