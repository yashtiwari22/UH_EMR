import express, { Request, Response, NextFunction } from "express";
import { getDoctorList } from "../controllers/receptionist.controller";
const router = express.Router();

router.get("/getDoctorsForReceptionist/:id", getDoctorList);

export default router;
