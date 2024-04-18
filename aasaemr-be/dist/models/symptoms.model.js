"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Symptom = void 0;
const mongoose_1 = require("mongoose");
const symptomSchema = new mongoose_1.Schema({});
exports.Symptom = (0, mongoose_1.model)("Symptom", symptomSchema);
