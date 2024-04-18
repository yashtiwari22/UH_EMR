// /importing dependencies
import express from "express";
import createHttpError from "http-errors";
import morgan from "morgan";
import { dbConnect } from "./config/dataBase";
import dotenv from "dotenv";
import { Request, Response, NextFunction } from "express";
import receptionistRoutes from "./routes/receptionistRoutes";
import doctorRoutes from "./routes/doctorRoutes";
import commonRoutes from "./routes/commonRoutes";
import cors from "cors";
import { verification } from "./middlewares/authJwt";
import {
  seedPatientData,
  seedClinicData,
  seedAppointmentData,
} from "./utils/seedData";
import { setDefaultAutoSelectFamily } from "net";

const port = process.env.PORT || 3000;

//initializing express
const app = express();

// loading environment variables
dotenv.config();

// Set up CORS
let corsOptions = {
  origin: ["127.0.0.1", "http://localhost:3001", "https://dev.be.aasa.ai"],
};

app.use(cors(corsOptions));

// middlewares
app.use(morgan("dev"));
app.use(express.json());

//database connection
dbConnect();

//testing
app.get("/", (req: Request, res: Response) => {
  res.send("umeed backend server is running...");
});

// app.use(verification);
// routes for receptionist routes
app.use("/api/v1/aasa/receptionist", receptionistRoutes);
// routes for doctor routes
app.use("/api/v1/aasa/doctor", doctorRoutes);
// routes for common routes
app.use("/api/v1/aasa/common", commonRoutes);

app.use((req: Request, res: Response, next: NextFunction) => {
  next(createHttpError(404));
});

app.use(
  (
    err: createHttpError.HttpError,
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    err.status = err.status || 500;
    res.status(err.status).send(err.message);
  }
);

// seedPatientData();
// seedClinicData();
// seedAppointmentData();

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
