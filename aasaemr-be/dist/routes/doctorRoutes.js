"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const doctor_controller_1 = require("../controllers/doctor.controller");
const router = express_1.default.Router();
router.get("/getPatientList", doctor_controller_1.getPatientList);
// ---------------------------------------------
router.post("/createPatient", doctor_controller_1.createPatient);
router.post("/createAppointment", doctor_controller_1.createAppointment);
router.put("/editSettings/:id", doctor_controller_1.editSettings);
router.post("/createDoctor", doctor_controller_1.createDoctor);
router.get("/getConditions/:id", doctor_controller_1.getConditions);
router.get("/getMedicationDetails/:id", doctor_controller_1.getMedicationDetails);
router.post("/createRx", doctor_controller_1.createRx);
router.post("/createReceptionist", doctor_controller_1.createReceptionist);
router.put("/updateReceptionist/:receptionistId", doctor_controller_1.updateReceptionist);
router.delete("/deleteReceptionist", doctor_controller_1.deleteReceptionist);
router.get("/getReceptionist/:receptionistId", doctor_controller_1.getReceptionist);
router.get("/getAllReceptionist", doctor_controller_1.getAllReceptionist);
router.get("/getMedicines", doctor_controller_1.getMedicines);
router.post("/createClinic", doctor_controller_1.createClinic);
router.put("/updateClinic/:id", doctor_controller_1.updateClinic);
router.delete("/deleteClinic", doctor_controller_1.deleteClinic);
exports.default = router;
