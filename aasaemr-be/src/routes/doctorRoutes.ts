import express from "express";
import {
  getPatientList,
  createPatient,
  createAppointment,
  editSettings,
  createDoctor,
  getConditions,
  getMedicationDetails,
  createRx,
  createReceptionist,
  getMedicines,
  createClinic,
  updateClinic,
  deleteClinic,
  updateReceptionist,
  deleteReceptionist,
  getReceptionist,
  getAllReceptionist,
} from "../controllers/doctor.controller";

const router = express.Router();

router.get("/getPatientList", getPatientList);

// ---------------------------------------------
router.post("/createPatient", createPatient);
router.post("/createAppointment", createAppointment);
router.put("/editSettings/:id", editSettings);
router.post("/createDoctor", createDoctor);
router.get("/getConditions/:id", getConditions);
router.get("/getMedicationDetails/:id", getMedicationDetails);
router.post("/createRx", createRx);
router.post("/createReceptionist", createReceptionist);
router.put("/updateReceptionist/:receptionistId", updateReceptionist);
router.delete("/deleteReceptionist", deleteReceptionist);
router.get("/getReceptionist/:receptionistId", getReceptionist);
router.get("/getAllReceptionist", getAllReceptionist);
router.get("/getMedicines", getMedicines);
router.post("/createClinic", createClinic);
router.put("/updateClinic/:id", updateClinic);
router.delete("/deleteClinic", deleteClinic);

export default router;
