
const Incoming = require('../../models/Incoming')
const Dropdown = require('../../models/Dropdown')
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
        const data = await Incoming.find({ is_sent_to_pending: false })
            .skip(skip)
            .limit(limit);

        // Get total count of documents
        const totalCount = await Incoming.countDocuments({ is_sent_to_pending: false });

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
