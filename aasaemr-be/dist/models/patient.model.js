"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Patient = void 0;
const mongoose_1 = require("mongoose");
const patientSchema = new mongoose_1.Schema({
    name: {
        type: mongoose_1.Schema.Types.String,
        required: true,
    },
    email: {
        type: mongoose_1.Schema.Types.String,
        required: true,
        unique: true,
    },
    phone: {
        phoneNumber: {
            type: mongoose_1.Schema.Types.String,
            validate: {
                validator: function (v) {
                    return v.length >= 10;
                },
                message: (props) => `${props.value} is not a valid phone number!`,
            },
        },
        countryCode: {
            type: mongoose_1.Schema.Types.String,
        },
    },
    dob: {
        type: mongoose_1.Schema.Types.Date,
        required: true,
    },
    patientVitals: {
        height: {
            type: mongoose_1.Schema.Types.String,
        },
        weight: {
            type: mongoose_1.Schema.Types.String,
        },
        age: {
            type: mongoose_1.Schema.Types.String,
        },
        bodyTemperature: {
            type: mongoose_1.Schema.Types.String,
        },
        bloodPressure: {
            type: mongoose_1.Schema.Types.String,
        },
        respirationRate: {
            type: mongoose_1.Schema.Types.String,
        },
        pulseRate: {
            type: mongoose_1.Schema.Types.String,
        },
    },
    symptoms: {
        type: [mongoose_1.Schema.Types.String],
    },
    address: {
        type: mongoose_1.Schema.Types.String,
    },
    doctorIDs: {
        type: [mongoose_1.Schema.Types.ObjectId],
        ref: "Doctor",
        required: true,
    },
});
exports.Patient = (0, mongoose_1.model)("Patient", patientSchema);
