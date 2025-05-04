const mongoose = require("mongoose");

const urlSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
        unique: true,
    },
    url: {
        type: String,
        required: true,
    },
    shortCode: {
        type: String,
        required: true,
        unique: true,
    },
    createdAt: {
        type: String,
        required: true,
    },
    updatedAt: {
        type: String,
        required: true,
    },
    accessCount: {
        type: Number,
        default: 0,
    },
});

module.exports = mongoose.model("Url", urlSchema);
