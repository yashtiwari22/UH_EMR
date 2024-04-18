import express from "express";
import {
  getUserDetails,
  getAppointments,
  uploadMedicineDetails,
  editAppointments,
  editPatientDetails,
  getPatient,
  uploadImage,
  getClinics,
  sendRxToPatient,
  getPatientAppointments,
  getAppointmentRx,
  getDateAppointments,
  updateDropdown,
  getDropdown,
  addDropdown,
} from "../controllers/common.controller";
import { excelUploads, upload } from "../utils/uploadData";

const router = express.Router();

router.get("/getUser", getUserDetails);

router.post("/getAppointments", getAppointments);

router.post("/getDateAppointments", getDateAppointments);

router.post(
  "/uploadMedicineDetails",
  excelUploads.single("csvFile"),
  uploadMedicineDetails
);

router.put("/editAppointment", editAppointments);

router.put("/updatePatient/:id", editPatientDetails);

router.post("/getPatient", getPatient);

router.get("/getClinics", getClinics);

router.post("/upload", upload.array("file"), uploadImage);

router.post("/sendRxToPatient", upload.array("file"), sendRxToPatient);

router.get("/getPatientAppointments/:patientId", getPatientAppointments);

router.get("/getAppointmentRx/:id", getAppointmentRx);

router.put("/updateDropdown", updateDropdown);

router.get("/getDropdown", getDropdown);

router.post("/addDropdown", addDropdown);


export default router;
