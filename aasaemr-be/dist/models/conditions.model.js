"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Condition = void 0;
const mongoose_1 = require("mongoose");
const conditionsSchema = new mongoose_1.Schema({
    doctorId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Doctor",
    },
    condition: [
        new mongoose_1.Schema({
            conditionNames: {
                type: mongoose_1.Schema.Types.String,
            },
        }, {
            _id: false,
        }),
    ],
});
exports.Condition = (0, mongoose_1.model)("Conditions", conditionsSchema);
