"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// /importing dependencies
const express_1 = __importDefault(require("express"));
const http_errors_1 = __importDefault(require("http-errors"));
const morgan_1 = __importDefault(require("morgan"));
const dataBase_1 = require("./config/dataBase");
const dotenv_1 = __importDefault(require("dotenv"));
const receptionistRoutes_1 = __importDefault(require("./routes/receptionistRoutes"));
const doctorRoutes_1 = __importDefault(require("./routes/doctorRoutes"));
const commonRoutes_1 = __importDefault(require("./routes/commonRoutes"));
const cors_1 = __importDefault(require("cors"));
const authJwt_1 = require("./middlewares/authJwt");
const port = process.env.PORT || 3000;
//initializing express
const app = (0, express_1.default)();
// loading environment variables
dotenv_1.default.config();
// Set up CORS
let corsOptions = {
    origin: ["127.0.0.1", "http://localhost:3001", "https://dev.be.aasa.ai"],
};
app.use((0, cors_1.default)(corsOptions));
// middlewares
app.use((0, morgan_1.default)("dev"));
app.use(express_1.default.json());
//database connection
(0, dataBase_1.dbConnect)();
//testing
app.get("/", (req, res) => {
    res.send("umeed backend server is running...");
});
app.use(authJwt_1.verification);
// routes for receptionist routes
app.use("/api/v1/aasa/receptionist", receptionistRoutes_1.default);
// routes for doctor routes
app.use("/api/v1/aasa/doctor", doctorRoutes_1.default);
// routes for common routes
app.use("/api/v1/aasa/common", commonRoutes_1.default);
app.use((req, res, next) => {
    next((0, http_errors_1.default)(404));
});
app.use((err, req, res, next) => {
    err.status = err.status || 500;
    res.status(err.status).send(err.message);
});
// seedPatientData();
// seedClinicData();
// seedAppointmentData();
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
