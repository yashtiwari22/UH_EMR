"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addDropdown = exports.getDropdown = exports.updateDropdown = exports.getAppointmentRx = exports.getPatientAppointments = exports.sendRxToPatient = exports.uploadImage = exports.getClinics = exports.getPatient = exports.editAppointments = exports.uploadMedicineDetails = exports.editPatientDetails = exports.getUserDetails = exports.getDateAppointments = exports.getAppointments = void 0;
const asyncHandler_1 = __importDefault(require("../utils/asyncHandler"));
const doctor_model_1 = require("../models/doctor.model");
const logger_1 = __importDefault(require("../logger"));
const appointment_model_1 = require("../models/appointment.model");
const patient_model_1 = require("../models/patient.model");
const medicine_model_1 = __importDefault(require("../models/medicine.model"));
const csvtojson_1 = __importDefault(require("csvtojson"));
const receptionist_model_1 = require("../models/receptionist.model");
const clinic_model_1 = require("../models/clinic.model");
const sendFile_1 = require("../utils/sendFile");
const rx_model_1 = require("../models/rx.model");
const apiError_1 = __importDefault(require("../utils/apiError"));
const apiResponse_1 = __importDefault(require("../utils/apiResponse"));
const s3Service_1 = require("../utils/s3Service");
const mongoose_1 = __importDefault(require("mongoose"));
const dropdown_model_1 = require("../models/dropdown.model");
const getUserDetails = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const user = req.user;
        console.log(user === null || user === void 0 ? void 0 : user.user.role.roleName);
        const role = user === null || user === void 0 ? void 0 : user.user.role.roleName;
        if (role === "doctor") {
            const result = yield doctor_model_1.Doctor.findById(user === null || user === void 0 ? void 0 : user.user._id);
            if (!result) {
                return res.status(200).json((0, apiResponse_1.default)(200, {}, "Doctor not found"));
            }
            else {
                if (((_a = result === null || result === void 0 ? void 0 : result.profile) === null || _a === void 0 ? void 0 : _a.userReceptionist) &&
                    result.profile.userReceptionist.length > 0) {
                    yield result.populate("profile.userReceptionist");
                }
                return res
                    .status(200)
                    .json((0, apiResponse_1.default)(200, Object.assign(Object.assign({}, result.toObject()), { role: user === null || user === void 0 ? void 0 : user.user.role }), "User Doctor retrieved successfully"));
            }
        }
        else if (role === "receptionist") {
            const result = yield receptionist_model_1.Receptionist.findById(user === null || user === void 0 ? void 0 : user.user._id)
                .lean()
                .populate([
                {
                    path: "listOfDoctors",
                    select: "_id -profile.userReceptionist -settings",
                },
            ]);
            if (!result) {
                return res
                    .status(200)
                    .json((0, apiResponse_1.default)(200, {}, "Receptionist not found"));
            }
            else {
                return res
                    .status(200)
                    .json((0, apiResponse_1.default)(200, Object.assign(Object.assign({}, result), { role: user === null || user === void 0 ? void 0 : user.user.role }), "User Receptionist retrieved successfully"));
            }
        }
        else if (role === "admin") {
            return res.status(200).json((0, apiResponse_1.default)(200, {}, "User Admin"));
        }
        else {
            return res.status(404).json((0, apiResponse_1.default)(404, {}, "No such role"));
        }
    }
    catch (error) {
        throw (0, apiError_1.default)(500, error.message);
    }
}));
exports.getUserDetails = getUserDetails;
// get Appointments
const getAppointments = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { doctorId, clinicIds, date } = req.body;
        const search = req.query.search || "";
        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.pageSize) || 10;
        // Validate input
        if (!doctorId ||
            !clinicIds ||
            !Array.isArray(clinicIds) ||
            clinicIds.length === 0) {
            return res.status(400).json((0, apiResponse_1.default)(400, {}, "Invalid input data"));
        }
        const queryDate = date ? new Date(date) : new Date();
        // Determine current time and date
        const currentDate = new Date();
        const currentTime = currentDate.getTime();
        // Ensure appointments are canceled if their date has passed
        const cancelPreviousPendingAppointment = yield appointment_model_1.Appointment.updateMany({
            userDoctor: doctorId,
            clinic: { $in: clinicIds },
            "status.appointmentStatus": appointment_model_1.AppointmentStatus.PENDING,
            dateTime: { $lt: currentDate },
        }, { $set: { "status.appointmentStatus": appointment_model_1.AppointmentStatus.CANCELLED } });
        // Find appointments based on conditions
        const appointments = yield appointment_model_1.Appointment.find({
            userDoctor: doctorId,
            clinic: { $in: clinicIds },
        })
            .lean()
            .populate([
            {
                path: "userDoctor",
                select: "_id profile.name",
            },
            {
                path: "userPatient",
                match: search ? { name: { $regex: search, $options: "i" } } : {},
            },
        ]);
        // Partition appointments into previous and upcoming
        let previousAppointments = [];
        let upcomingAppointments = [];
        appointments.forEach((appointment) => {
            const appointmentDateTime = new Date(appointment.dateTime);
            if (appointment.status.appointmentStatus === appointment_model_1.AppointmentStatus.DONE ||
                appointment.status.appointmentStatus === appointment_model_1.AppointmentStatus.CANCELLED) {
                previousAppointments.push(appointment);
            }
            else {
                const appointmentTime = appointmentDateTime.getTime();
                if (queryDate.toDateString() === currentDate.toDateString()) {
                    if (appointmentTime < currentTime) {
                        previousAppointments.push(appointment);
                    }
                    else {
                        upcomingAppointments.push(appointment);
                    }
                }
                else {
                    if (appointmentDateTime < queryDate) {
                        previousAppointments.push(appointment);
                    }
                    else {
                        upcomingAppointments.push(appointment);
                    }
                }
            }
        });
        // Filter appointments based on search query
        if (search) {
            previousAppointments = previousAppointments.filter((appointment) => appointment.userPatient !== null);
            upcomingAppointments = upcomingAppointments.filter((appointment) => appointment.userPatient !== null);
        }
        // Sort appointments based on dateTime
        previousAppointments.sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());
        upcomingAppointments.sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());
        // Pagination
        const totalPreviousAppointments = previousAppointments.length;
        const totalUpcomingAppointments = upcomingAppointments.length;
        const totalPagesPrevious = Math.ceil(totalPreviousAppointments / pageSize);
        const totalPagesUpcoming = Math.ceil(totalUpcomingAppointments / pageSize);
        const paginatedPreviousAppointments = previousAppointments.slice((page - 1) * pageSize, page * pageSize);
        const paginatedUpcomingAppointments = upcomingAppointments.slice((page - 1) * pageSize, page * pageSize);
        return res.status(200).json((0, apiResponse_1.default)(200, {
            previous: paginatedPreviousAppointments,
            upcoming: paginatedUpcomingAppointments,
            metadata: {
                totalPreviousAppointments,
                totalUpcomingAppointments,
                page,
                totalPagesPrevious,
                totalPagesUpcoming,
            },
        }, "Appointments list received successfully"));
    }
    catch (error) {
        throw (0, apiError_1.default)(500, error.message);
    }
}));
exports.getAppointments = getAppointments;
const getDateAppointments = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { doctorId, clinicIds, date } = req.body;
        const search = req.query.search || "";
        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.pageSize) || 10;
        if (!date) {
            return res.status(400).json((0, apiResponse_1.default)(400, {}, "Date not selected"));
        }
        const searchDate = new Date(date);
        searchDate.setHours(0, 0, 0, 0); // Set time to start of the day
        let appointments = yield appointment_model_1.Appointment.find({
            userDoctor: doctorId,
            clinic: { $in: clinicIds },
            dateTime: {
                $gte: searchDate,
                $lt: new Date(searchDate.getTime() + 86400000),
            }, // Add 24 hours to include the whole day
        })
            .lean()
            .populate([
            {
                path: "userDoctor",
                select: "_id profile.name",
            },
            {
                path: "userPatient",
                match: search ? { name: { $regex: search, $options: "i" } } : {},
            },
        ]);
        // Filter appointments based on search query
        if (search) {
            appointments = appointments.filter((appointment) => appointment.userPatient !== null);
        }
        // Sort appointments based on dateTime
        appointments.sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());
        // Pagination
        const totalAppointments = appointments.length;
        const totalPages = Math.ceil(totalAppointments / pageSize);
        const paginatedAppointments = appointments.slice((page - 1) * pageSize, page * pageSize);
        if (paginatedAppointments.length === 0) {
            return res.status(200).json((0, apiResponse_1.default)(200, {
                appointments: paginatedAppointments,
                metadata: {
                    totalAppointments,
                    page,
                    totalPages,
                },
            }, "No appointments found for specified date"));
        }
        return res.status(200).json((0, apiResponse_1.default)(200, {
            appointments: paginatedAppointments,
            metadata: {
                totalAppointments,
                page,
                totalPages,
            },
        }, "Appointments for the specified date retrieved successfully"));
    }
    catch (error) {
        throw (0, apiError_1.default)(500, error.message);
    }
}));
exports.getDateAppointments = getDateAppointments;
// this is the controller for updating the patient details
const editPatientDetails = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const updatedData = req.body;
        // Check if id is a valid ObjectId
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return res.status(400).json((0, apiResponse_1.default)(400, {}, "Invalid ObjectId"));
        }
        else if (updatedData.phone && updatedData.phone.phoneNumber.length < 10) {
            return res.status(400).json((0, apiResponse_1.default)(400, {}, "Invalid Phone Number"));
        }
        const updatedPatient = yield patient_model_1.Patient.findByIdAndUpdate(id, { $set: updatedData }, { new: true });
        console.log(updatedPatient);
        if (!updatedPatient) {
            return res
                .status(404)
                .json((0, apiResponse_1.default)(404, {}, "Patient details could not be updated"));
        }
        logger_1.default === null || logger_1.default === void 0 ? void 0 : logger_1.default.info("Patient details updated successfully");
        return res
            .status(200)
            .json((0, apiResponse_1.default)(200, updatedPatient, "Patient details updated successfully"));
    }
    catch (error) {
        throw (0, apiError_1.default)(500, error.message);
    }
}));
exports.editPatientDetails = editPatientDetails;
const uploadMedicineDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    // Read Excel File to Json Data
    try {
        let medicinelist = [];
        const uniqueMedicines = new Set();
        yield (0, csvtojson_1.default)()
            .fromFile((_b = req.file) === null || _b === void 0 ? void 0 : _b.path)
            .then((result) => __awaiter(void 0, void 0, void 0, function* () {
            for (var i = 0; i < result.length; i++) {
                const productname = result[i]["Product Name"];
                if (!uniqueMedicines.has(productname)) {
                    var medicinedata = {
                        productName: result[i]["Product Name"],
                        productComposition: result[i]["Product Composition"],
                        packagingDetail: result[i]["Packaging detail of Product"],
                        packagingType: result[i]["Type of Packaging"],
                        productPrice: result[i]["Product Price"],
                        productBrand: result[i]["Product Brand"],
                        usage: result[i]["How To Use"],
                        pregnancyInteraction: result[i]["Pregnancy Interaction"],
                        medicineInteraction: result[i]["Medicine Interaction"],
                        sideEffects: result[i]["Side Effects"],
                        description: result[i]["Description"],
                        manufacturerName: result[i]["Manufacturer Name"],
                    };
                    medicinelist.push(medicinedata);
                    uniqueMedicines.add(productname);
                }
            }
            // console.log(medicinelist);
            const medicineSavedData = yield medicine_model_1.default.insertMany(medicinelist);
            // Response with only 20 items
            const limitedMedicineData = medicineSavedData.slice(0, 20);
            return res
                .status(200)
                .json((0, apiResponse_1.default)(200, limitedMedicineData, "Medicine details added successfully successfully"));
        }));
    }
    catch (error) {
        throw (0, apiError_1.default)(500, error.message);
    }
});
exports.uploadMedicineDetails = uploadMedicineDetails;
// appointments
const editAppointments = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const _c = req.body, { id } = _c, fieldsToUpdate = __rest(_c, ["id"]);
        // Check if id is a valid ObjectId
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return res.status(400).json((0, apiResponse_1.default)(400, {}, "Invalid ObjectId"));
        }
        if (!id) {
            return res
                .status(404)
                .json((0, apiResponse_1.default)(404, {}, "Appointment not found"));
        }
        // Update specific fields using $set operator
        const appointment = yield appointment_model_1.Appointment.findByIdAndUpdate(id, { $set: fieldsToUpdate }, { new: true });
        if (!appointment) {
            return res
                .status(404)
                .json((0, apiResponse_1.default)(404, {}, "Appointment not updated"));
        }
        return res
            .status(200)
            .json((0, apiResponse_1.default)(200, appointment, "Appointment updated successfully"));
    }
    catch (error) {
        throw (0, apiError_1.default)(500, error.message);
    }
});
exports.editAppointments = editAppointments;
const getPatient = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { patientId } = req.body;
        // Find the patient based on the extracted patient ID
        // Check if id is a valid ObjectId
        if (!mongoose_1.default.Types.ObjectId.isValid(patientId)) {
            return res.status(400).json((0, apiResponse_1.default)(400, {}, "Invalid ObjectId"));
        }
        if (!patientId) {
            return res.status(404).json((0, apiResponse_1.default)(404, {}, "Patient id not found"));
        }
        const patient = yield patient_model_1.Patient.findById(patientId);
        if (!patient) {
            return res.status(200).json((0, apiResponse_1.default)(200, {}, "Patient not found"));
        }
        // Return the patient details
        return res
            .status(200)
            .json((0, apiResponse_1.default)(200, patient, "Patient recieved successfully"));
    }
    catch (error) {
        throw (0, apiError_1.default)(500, error.message);
    }
}));
exports.getPatient = getPatient;
const uploadImage = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const files = Object.values(req.files);
        console.log(req.files);
        if (!files || files.length === 0) {
            return res.status(404).json((0, apiResponse_1.default)(404, {}, "No files provided"));
        }
        const result = yield (0, s3Service_1.s3upload)(files);
        return res
            .status(200)
            .json((0, apiResponse_1.default)(200, result, "Image uploaded successfully"));
    }
    catch (error) {
        throw (0, apiError_1.default)(500, error.message);
    }
}));
exports.uploadImage = uploadImage;
const getClinics = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        let clinics;
        if ((user === null || user === void 0 ? void 0 : user.user.role.roleName) === "doctor") {
            console.log(user === null || user === void 0 ? void 0 : user.user._id);
            clinics = yield clinic_model_1.Clinic.find({
                userDoctor: { $elemMatch: { docID: user === null || user === void 0 ? void 0 : user.user._id } },
            });
            console.log(clinics);
            if (clinics.length === 0) {
                return res
                    .status(200)
                    .json((0, apiResponse_1.default)(200, [], "No clinics found for the specified doctor"));
            }
        }
        else if ((user === null || user === void 0 ? void 0 : user.user.role.roleName) === "receptionist") {
            console.log(user === null || user === void 0 ? void 0 : user.user._id);
            clinics = yield clinic_model_1.Clinic.find({
                $and: [
                    {
                        userReceptionist: {
                            $elemMatch: { receptionistID: user === null || user === void 0 ? void 0 : user.user._id },
                        },
                    },
                    { isActive: true },
                ],
            });
            console.log(clinics);
            if (clinics.length === 0) {
                return res
                    .status(200)
                    .json((0, apiResponse_1.default)(200, [], "No clinics found for the specified receptionist"));
            }
        }
        else {
            return res
                .status(200)
                .json((0, apiResponse_1.default)(200, [], "User is neither receptionist nor doctor"));
        }
        return res
            .status(200)
            .json((0, apiResponse_1.default)(200, clinics, "Clinics recieved successfully"));
    }
    catch (error) {
        throw (0, apiError_1.default)(500, error.message);
    }
}));
exports.getClinics = getClinics;
const sendRxToPatient = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, email, phoneNumber, countryCode, doctorName } = req.body;
        const pdfAttachment = Object.values(req.files);
        const phone = {
            phoneNumber: phoneNumber,
            countryCode: countryCode,
        };
        if (!name ||
            !email ||
            !phone ||
            !doctorName ||
            !pdfAttachment ||
            pdfAttachment.length === 0) {
            return res.status(404).json((0, apiResponse_1.default)(404, {}, "Field is required"));
        }
        const uploadedFile = pdfAttachment[0];
        if (uploadedFile.mimetype !== "application/pdf") {
            return res
                .status(400)
                .json((0, apiResponse_1.default)(400, {}, "Uploaded file is not a PDF"));
        }
        const user = { name, email, phone, doctorName };
        const result = yield (0, s3Service_1.s3uploadWithWhatsapp)(pdfAttachment);
        if (!result) {
            return res
                .status(400)
                .json((0, apiResponse_1.default)(400, {}, "Rx could not be uploaded to the s3 server"));
        }
        const file = yield (0, sendFile_1.fileSender)(user, pdfAttachment[0]);
        console.log(file);
        if (!file) {
            return res
                .status(400)
                .json((0, apiResponse_1.default)(400, {}, "Rx could not be uploaded to the s3 server"));
        }
        let whatsappService;
        if (file) {
            whatsappService = yield (0, sendFile_1.WhatsappfileService)(user, result);
            if (!whatsappService) {
                return res
                    .status(400)
                    .json((0, apiResponse_1.default)(400, {}, "Failed to send Rx via WhatsApp"));
            }
        }
        return res.status(200).json((0, apiResponse_1.default)(200, file, "Rx sent successfully"));
    }
    catch (error) {
        throw (0, apiError_1.default)(500, error.message);
    }
}));
exports.sendRxToPatient = sendRxToPatient;
const getPatientAppointments = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const page = parseInt(req.query.page) || 1; // Page number, default is 1
        const limit = parseInt(req.query.limit) || 10; // Number of items per page, default is 10
        const startIndex = (page - 1) * limit;
        const { patientId } = req.params;
        // Check if id is a valid ObjectId
        if (!mongoose_1.default.Types.ObjectId.isValid(patientId)) {
            return res.status(400).json((0, apiResponse_1.default)(400, {}, "Invalid ObjectId"));
        }
        if (!patientId) {
            return res
                .status(403)
                .json((0, apiResponse_1.default)(403, {}, "No patient id provided"));
        }
        const query = { userPatient: patientId };
        const totalPatientAppointments = yield appointment_model_1.Appointment.countDocuments(query);
        const totalPages = Math.ceil(totalPatientAppointments / limit);
        const appointments = yield appointment_model_1.Appointment.find(query)
            .lean()
            .populate([
            {
                path: "userDoctor",
                select: "_id profile.name",
            },
            {
                path: "userPatient",
            },
        ])
            .skip(startIndex)
            .limit(limit);
        if (appointments.length === 0) {
            return res
                .status(200)
                .json((0, apiResponse_1.default)(200, {}, "No appointments found"));
        }
        return res.status(200).json((0, apiResponse_1.default)(200, {
            success: true,
            currentPage: page,
            totalPages: totalPages,
            totalPatientAppointments: totalPatientAppointments,
            data: appointments,
        }, "Appointments for the patient retrieved successfully"));
    }
    catch (error) {
        throw (0, apiError_1.default)(500, error.message);
    }
}));
exports.getPatientAppointments = getPatientAppointments;
const getAppointmentRx = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        // Check if id is a valid ObjectId
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return res.status(400).json((0, apiResponse_1.default)(400, {}, "Invalid ObjectId"));
        }
        const rx = yield rx_model_1.Rx.findOne({ appointmentId: id });
        if (!rx) {
            return res
                .status(200)
                .json((0, apiResponse_1.default)(200, {}, "No such Rx created for the provided appointment"));
        }
        return res
            .status(200)
            .json((0, apiResponse_1.default)(200, rx, "Rx retrieved successfully"));
    }
    catch (error) {
        throw (0, apiError_1.default)(500, error.message);
    }
}));
exports.getAppointmentRx = getAppointmentRx;
const updateDropdown = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { medicineType, intake, amount, foodTime } = req.body;
        const updatedDropdown = yield dropdown_model_1.Dropdown.findByIdAndUpdate(id, { $set: req.body }, { new: true });
        if (!updatedDropdown) {
            return res
                .status(404)
                .json((0, apiResponse_1.default)(404, {}, "Dropdown can't be updated"));
        }
        return res.status(200).json((0, apiResponse_1.default)(200, {}, "Dropdown updated"));
    }
    catch (error) {
        throw (0, apiError_1.default)(500, error.message);
    }
}));
exports.updateDropdown = updateDropdown;
const getDropdown = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const dropdown = yield dropdown_model_1.Dropdown.find({});
        if (dropdown.length === 0) {
            return res.status(200).json((0, apiResponse_1.default)(200, {}, "No such dropdown"));
        }
        return res
            .status(200)
            .json((0, apiResponse_1.default)(200, dropdown[0], "Dropdown received successfully"));
    }
    catch (error) {
        throw (0, apiError_1.default)(500, error.message);
    }
}));
exports.getDropdown = getDropdown;
const addDropdown = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const dropdown = yield dropdown_model_1.Dropdown.create(req.body);
        if (!dropdown) {
            return res.status(200).json((0, apiResponse_1.default)(200, {}, "Dropdown not added"));
        }
        return res
            .status(200)
            .json((0, apiResponse_1.default)(200, dropdown, "Dropdown created successfully"));
    }
    catch (error) {
        throw (0, apiError_1.default)(500, error.message);
    }
}));
exports.addDropdown = addDropdown;
