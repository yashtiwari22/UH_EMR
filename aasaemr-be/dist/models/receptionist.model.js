"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Receptionist = void 0;
const mongoose_1 = require("mongoose");
const receptionistSchema = new mongoose_1.Schema({
    _id: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true,
    },
    profile: {
        name: {
            type: mongoose_1.Schema.Types.String,
        },
        email: {
            type: mongoose_1.Schema.Types.String,
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
    },
    listOfDoctors: {
        type: [mongoose_1.Schema.Types.ObjectId],
        ref: "Doctor",
        required: true,
    },
});
exports.Receptionist = (0, mongoose_1.model)("Receptionist", receptionistSchema);
