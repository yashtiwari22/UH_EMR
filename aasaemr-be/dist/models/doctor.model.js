"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Doctor = void 0;
const mongoose_1 = require("mongoose");
const doctorSchema = new mongoose_1.Schema({
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
        address: {
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
        Specialization: {
            type: mongoose_1.Schema.Types.String,
        },
        MRN: {
            type: mongoose_1.Schema.Types.String,
        },
        MedicalId: {
            type: mongoose_1.Schema.Types.String,
        },
        DOB: {
            type: mongoose_1.Schema.Types.Date,
        },
        Council: {
            type: mongoose_1.Schema.Types.String,
        },
        degrees: [
            new mongoose_1.Schema({
                degreeName: {
                    type: mongoose_1.Schema.Types.String,
                    required: true,
                },
                collegeName: {
                    type: mongoose_1.Schema.Types.String,
                    required: true,
                },
                passingYear: {
                    type: mongoose_1.Schema.Types.String,
                    required: true,
                },
            }, {
                _id: false,
            }),
        ],
        clinics: {
            type: [mongoose_1.Schema.Types.ObjectId],
            ref: "Clinic",
        },
        userReceptionist: {
            type: [mongoose_1.Schema.Types.ObjectId],
            ref: "Receptionist",
        },
        docPhoto: {
            type: mongoose_1.Schema.Types.String,
            required: true,
        },
        docSign: {
            type: mongoose_1.Schema.Types.String,
            required: true,
        },
    },
    settings: {
        rxTemplates: [
            new mongoose_1.Schema({
                condition: {
                    id: {
                        type: mongoose_1.Schema.Types.ObjectId,
                        ref: "Condition",
                    },
                    conditionName: {
                        type: mongoose_1.Schema.Types.String,
                    },
                },
                medication: [
                    new mongoose_1.Schema({
                        id: {
                            type: mongoose_1.Schema.Types.ObjectId,
                        },
                        grade: {
                            type: mongoose_1.Schema.Types.String,
                            enum: ["Grade 1", "Grade 2", "Grade 3"],
                            default: "Grade 1",
                        },
                        medicineDetails: [
                            new mongoose_1.Schema({
                                id: {
                                    type: mongoose_1.Schema.Types.ObjectId,
                                    ref: "Medicine",
                                },
                                medicineName: {
                                    type: mongoose_1.Schema.Types.String,
                                },
                                medicineType: {
                                    type: mongoose_1.Schema.Types.String,
                                    enum: [
                                        "Tablet",
                                        "Capsule",
                                        "Syrup",
                                        "Injection",
                                        "Powder",
                                    ],
                                    default: "Tablet",
                                },
                                intakeDetails: {
                                    intake: {
                                        type: [mongoose_1.Schema.Types.String],
                                        enum: ["morning", "noon", "night"],
                                        default: ["morning", "noon", "night"],
                                    },
                                    days: {
                                        type: mongoose_1.Schema.Types.String,
                                        enum: ["1 Day", "7 Days", "14 Days", "21 Days"],
                                        default: "1 Day",
                                    },
                                    amount: {
                                        type: mongoose_1.Schema.Types.String,
                                        enum: [
                                            "Once per Week",
                                            "Twice per Week",
                                            "Thrice per Week",
                                        ],
                                        default: "Once per Week",
                                    },
                                    foodTime: {
                                        type: mongoose_1.Schema.Types.String,
                                        enum: ["Before Food", "After Food"],
                                        default: "After Food",
                                    },
                                },
                                message: {
                                    type: mongoose_1.Schema.Types.String,
                                },
                            }, {
                                _id: false,
                            }),
                        ],
                    }, {
                        _id: false,
                    }),
                ],
            }, {
                _id: false,
            }),
        ],
        rxFormat: {
            patientVitals: {
                bodyTemperature: {
                    type: mongoose_1.Schema.Types.Boolean,
                    default: false,
                },
                bloodPressure: {
                    type: mongoose_1.Schema.Types.Boolean,
                    default: false,
                },
                respirationRate: {
                    type: mongoose_1.Schema.Types.Boolean,
                    default: false,
                },
                pulseRate: {
                    type: mongoose_1.Schema.Types.Boolean,
                    default: false,
                },
                height: {
                    type: mongoose_1.Schema.Types.Boolean,
                    default: false,
                },
                weight: {
                    type: mongoose_1.Schema.Types.Boolean,
                    default: false,
                },
                age: {
                    type: mongoose_1.Schema.Types.Boolean,
                    default: false,
                },
            },
            rxHeaderInfo: {
                clinicAddress: {
                    type: mongoose_1.Schema.Types.Boolean,
                    default: false,
                },
                contactNo: {
                    type: mongoose_1.Schema.Types.Boolean,
                    default: false,
                },
                emailId: {
                    type: mongoose_1.Schema.Types.Boolean,
                    default: false,
                },
                logo: {
                    type: mongoose_1.Schema.Types.Boolean,
                    default: false,
                },
            },
            rxInfo: {
                symptoms: {
                    type: mongoose_1.Schema.Types.Boolean,
                    default: false,
                },
                diagnosis: {
                    type: mongoose_1.Schema.Types.Boolean,
                    default: false,
                },
                types: {
                    type: mongoose_1.Schema.Types.Boolean,
                    default: false,
                },
                medicines: {
                    type: mongoose_1.Schema.Types.Boolean,
                    default: false,
                },
            },
            footerInfo: {
                message: {
                    type: mongoose_1.Schema.Types.String,
                    default: "Get Well Soon 😇",
                },
                signatureColor: {
                    type: mongoose_1.Schema.Types.String,
                    enum: ["Black", "Blue"],
                    default: "Black",
                },
            },
        },
    },
});
exports.Doctor = (0, mongoose_1.model)("Doctor", doctorSchema);
