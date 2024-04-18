"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const receptionist_controller_1 = require("../controllers/receptionist.controller");
const router = express_1.default.Router();
router.get("/getDoctorsForReceptionist/:id", receptionist_controller_1.getDoctorList);
exports.default = router;
