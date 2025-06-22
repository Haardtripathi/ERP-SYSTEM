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










// Utility to safely escape regex characters
const escapeRegex = (input) => {
    return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

exports.getAllWorkbookData = async (req, res) => {
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
        const isNumeric = !isNaN(rawSearch);
        const regexSafeSearch = escapeRegex(rawSearch);

        // Base query
        const query = { isDeleted: false };

        if (user.role !== "Admin") {
            query["agent_name.value"] = user.agent_name;
        }

        if (filter === "true") query.is_sent_to_pending = true;
        else if (filter === "false") query.is_sent_to_pending = false;

        // Apply search
        if (rawSearch) {
            if (searchColumn) {
                console.log(searchColumn)
                const isNested = ["agent_name", "state", "language", "disease", "remark", "source"].includes(searchColumn);
                const field = isNested ? `${searchColumn}.value` : searchColumn;
                console.log("FIELD", field)
                if (["cm_phone", "alternate_phone", "age", "height", "weight"].includes(field) && isNumeric) {
                    query[field] = Number(rawSearch);
                } else {
                    query[field] = { $regex: regexSafeSearch, $options: "i" };
                }
            } else {
                query["$or"] = [
                    { "cm_first_name": { $regex: regexSafeSearch, $options: "i" } },
                    { "cm_last_name": { $regex: regexSafeSearch, $options: "i" } },
                    ...(isNumeric ? [{ "cm_phone": Number(rawSearch) }] : []),
                    ...(isNumeric ? [{ "alternate_phone": Number(rawSearch) }] : []),
                    { "agent_name.value": { $regex: regexSafeSearch, $options: "i" } },
                    { "language.value": { $regex: regexSafeSearch, $options: "i" } },
                    { "disease.value": { $regex: regexSafeSearch, $options: "i" } },
                    ...(isNumeric ? [{ "age": Number(rawSearch) }] : []),
                    ...(isNumeric ? [{ "height": Number(rawSearch) }] : []),
                    ...(isNumeric ? [{ "weight": Number(rawSearch) }] : []),
                    { "state.value": { $regex: regexSafeSearch, $options: "i" } },
                    { "remark.value": { $regex: regexSafeSearch, $options: "i" } },
                    { "comment": { $regex: regexSafeSearch, $options: "i" } },
                    { "city": { $regex: regexSafeSearch, $options: "i" } },
                    { "date": { $regex: regexSafeSearch, $options: "i" } },
                    { "source.value": { $regex: regexSafeSearch, $options: "i" } }
                ];
            }
        }
        console.log(query)
        const workbookData = await Workbook.find()
            .populate({
                path: 'dataId',
                match: query
            })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const transformArrayToSchema = (dataArray) => {
            return dataArray
                .filter(item => item.dataId)
                .map(({ data, dataId }) => ({
                    _id: dataId._id,
                    data: {
                        dropdown_data: data?.dropdown_data || null,
                        value: data?.value || null,
                    },
                    source: {
                        dropdown_data: dataId.source?.dropdown_data || null,
                        value: dataId.source?.value || null,
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
                }));
        };

        const transformedData = transformArrayToSchema(workbookData);

        const totalCount = await Lead.countDocuments(query);

        return res.status(200).json({
            message: "Workbook data fetched successfully.",
            data: transformedData,
            totalCount,
            totalPages: Math.ceil(totalCount / limit),
            currentPage: page,
            filter: filter || null,
            search: rawSearch,
            searchColumn: searchColumn || null,
        });

    } catch (error) {
        console.error('Error fetching workbook data:', error);
        return res.status(500).json({ error: 'An error occurred while fetching workbook data' });
    }
};
