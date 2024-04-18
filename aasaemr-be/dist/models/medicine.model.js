"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const medicineSchema = new mongoose_1.Schema({
    productName: {
        type: String,
    },
    productComposition: {
        type: String,
    },
    packagingDetail: {
        type: String,
    },
    typeOfPackaging: {
        type: String,
    },
    productPrice: {
        type: Number,
    },
    productBrand: {
        type: String,
    },
    usage: {
        type: String,
    },
    pregnancyInteraction: {
        type: String,
    },
    medicineInteraction: {
        type: String,
    },
    sideEffects: {
        type: String,
    },
    description: {
        type: String,
    },
    manufacturerName: {
        type: String,
    },
});
const Medicine = (0, mongoose_1.model)("Medicine", medicineSchema);
exports.default = Medicine;
