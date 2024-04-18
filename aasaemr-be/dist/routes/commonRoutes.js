"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const common_controller_1 = require("../controllers/common.controller");
const uploadData_1 = require("../utils/uploadData");
const router = express_1.default.Router();
router.get("/getUser", common_controller_1.getUserDetails);
router.post("/getAppointments", common_controller_1.getAppointments);
router.post("/getDateAppointments", common_controller_1.getDateAppointments);
router.post("/uploadMedicineDetails", uploadData_1.excelUploads.single("csvFile"), common_controller_1.uploadMedicineDetails);
router.put("/editAppointment", common_controller_1.editAppointments);
router.put("/updatePatient/:id", common_controller_1.editPatientDetails);
router.post("/getPatient", common_controller_1.getPatient);
router.get("/getClinics", common_controller_1.getClinics);
router.post("/upload", uploadData_1.upload.array("file"), common_controller_1.uploadImage);
router.post("/sendRxToPatient", uploadData_1.upload.array("file"), common_controller_1.sendRxToPatient);
router.get("/getPatientAppointments/:patientId", common_controller_1.getPatientAppointments);
router.get("/getAppointmentRx/:id", common_controller_1.getAppointmentRx);
router.put("/updateDropdown", common_controller_1.updateDropdown);
router.get("/getDropdown", common_controller_1.getDropdown);
router.post("/addDropdown", common_controller_1.addDropdown);
exports.default = router;