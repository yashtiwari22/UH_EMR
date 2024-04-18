"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Dropdown = void 0;
const mongoose_1 = require("mongoose");
const dropdownItemSchema = new mongoose_1.Schema({
    value: String,
});
const dropdownSchema = new mongoose_1.Schema({
    medicineType: {
        type: [dropdownItemSchema],
        default: [
            { value: "Tablet" },
            { value: "Capsule" },
            { value: "Syrup" },
            { value: "Injection" },
            { value: "Powder" },
        ],
    },
    intake: {
        type: [dropdownItemSchema],
        default: [
            { value: "morning" },
            { value: "noon" },
            { value: "night" },
        ],
    },
    amount: {
        type: [dropdownItemSchema],
        default: [
            { value: "Every day" },
            { value: "Alternate days" },
            { value: "Once a week" },
            { value: "Once in 15 days" },
            { value: "Once a Month" },
            { value: "None" },
        ],
    },
    foodTime: {
        type: [dropdownItemSchema],
        default: [
            { value: "Before Food" },
            { value: "After Food" },
        ],
    },
});
exports.Dropdown = (0, mongoose_1.model)("Dropdown", dropdownSchema);
