const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const workbookSchema = new Schema(
    {
        data: {
            type: Object,
            dropdown_data: {
                type: Schema.Types.ObjectId,
                ref: 'Dropdown',
            },
            value: {
                type: String,
                required: true,
                enum: ['Lead', 'Incoming'],
            },
            required: true,
        },
        dataId: {
            type: Schema.Types.ObjectId,
            required: true,
            refPath: 'data.value',
        },
    },
    { timestamps: true }
);


module.exports = mongoose.model('Workbook', workbookSchema);
