"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Rx = void 0;
const mongoose_1 = __importStar(require("mongoose"));
// Create Mongoose Schema
const RxSchema = new mongoose_1.Schema({
    doctorId: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true,
    },
    patientId: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true,
    },
    appointmentId: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true,
    },
    patientBasicDetail: {
        name: {
            type: mongoose_1.Schema.Types.String,
        },
        visit: {
            type: mongoose_1.Schema.Types.String,
        },
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
    diagnosis: [
        new mongoose_1.Schema({
            condition: {
                id: {
                    type: mongoose_1.Schema.Types.ObjectId,
                },
                conditionName: {
                    type: mongoose_1.Schema.Types.String,
                },
            },
            grade: {
                id: {
                    type: mongoose_1.Schema.Types.ObjectId,
                },
                gradeName: {
                    type: mongoose_1.Schema.Types.String,
                },
            },
        }, {
            _id: false,
        }),
    ],
    medication: [
        new mongoose_1.Schema({
            id: {
                type: mongoose_1.Schema.Types.ObjectId,
            },
            medicine: {
                type: mongoose_1.Schema.Types.String,
            },
            medicineType: {
                type: mongoose_1.Schema.Types.String,
                enum: ["Tablet", "Capsule", "Syrup", "Injection", "Powder"],
                default: "Tablet",
            },
            intake: {
                type: [mongoose_1.Schema.Types.String],
                enum: ["morning", "noon", "night"],
                default: [],
            },
            days: {
                type: mongoose_1.Schema.Types.String,
            },
            foodTime: {
                type: mongoose_1.Schema.Types.String,
            },
            frequency: {
                type: mongoose_1.Schema.Types.String,
            },
            note: {
                type: mongoose_1.Schema.Types.String,
            },
        }, {
            _id: false,
        }),
    ],
    test: [
        new mongoose_1.Schema({
            id: {
                type: mongoose_1.Schema.Types.ObjectId,
            },
            testName: {
                type: mongoose_1.Schema.Types.String,
            },
            note: {
                type: mongoose_1.Schema.Types.String,
            },
        }, {
            _id: false,
        }),
    ],
    symptoms: {
        type: [mongoose_1.Schema.Types.String],
    },
    additionalNotes: {
        type: mongoose_1.Schema.Types.String,
        default: "",
    },
    nextVisit: {
        type: mongoose_1.Schema.Types.Date,
    },
});
// Create Mongoose Model
exports.Rx = mongoose_1.default.model("Rx", RxSchema);
