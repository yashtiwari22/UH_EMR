"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Clinic = void 0;
const mongoose_1 = require("mongoose");
const clinicSchema = new mongoose_1.Schema({
    userDoctor: [
        new mongoose_1.Schema({
            docID: {
                type: mongoose_1.Schema.Types.ObjectId,
            },
            name: {
                type: mongoose_1.Schema.Types.String,
            },
        }, {
            _id: false,
        }),
    ],
    userReceptionist: [
        new mongoose_1.Schema({
            receptionistID: {
                type: mongoose_1.Schema.Types.ObjectId,
            },
            name: {
                type: mongoose_1.Schema.Types.String,
            },
        }, {
            _id: false,
        }),
    ],
    address: {
        type: mongoose_1.Schema.Types.String,
    },
    logo: {
        type: mongoose_1.Schema.Types.String,
    },
    name: {
        type: mongoose_1.Schema.Types.String,
    },
    isActive: {
        type: mongoose_1.Schema.Types.Boolean,
        required: true,
        default: false,
    },
});
exports.Clinic = (0, mongoose_1.model)("Clinic", clinicSchema);
