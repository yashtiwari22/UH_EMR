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
exports.deleteClinic = exports.updateClinic = exports.createClinic = exports.getMedicines = exports.getAllReceptionist = exports.getReceptionist = exports.deleteReceptionist = exports.updateReceptionist = exports.createReceptionist = exports.createRx = exports.getMedicationDetails = exports.getConditions = exports.createDoctor = exports.editSettings = exports.createAppointment = exports.createPatient = exports.getPatientList = void 0;
const asyncHandler_1 = __importDefault(require("../utils/asyncHandler"));
const mongoose_1 = require("mongoose");
const patient_model_1 = require("../models/patient.model");
const appointment_model_1 = require("../models/appointment.model");
const doctor_model_1 = require("../models/doctor.model");
const receptionist_model_1 = require("../models/receptionist.model");
const rx_model_1 = require("../models/rx.model");
const medicine_model_1 = __importDefault(require("../models/medicine.model"));
const apiError_1 = __importDefault(require("../utils/apiError"));
const apiResponse_1 = __importDefault(require("../utils/apiResponse"));
const logger_1 = __importDefault(require("../logger"));
const moment_1 = __importDefault(require("moment"));
const clinic_model_1 = require("../models/clinic.model");
const mongoose_2 = __importDefault(require("mongoose"));
const getPatientList = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const doctorIds = req.query.uids
            ? req.query.uids.split(",")
            : [];
        const searchQuery = req.query.search || "";
        const page = Number(req.query.page) || 1;
        const pageSize = Number(req.query.pageSize) || 10;
        // Check if doctorIds are provided
        if (doctorIds.length === 0) {
            return res
                .status(400)
                .json((0, apiResponse_1.default)(400, {}, "Doctor IDs are required"));
        }
        //pipeline
        const pipeline = [
            {
                $match: {
                    doctorIDs: { $in: doctorIds.map((id) => new mongoose_1.Types.ObjectId(id)) },
                    $or: [
                        { name: { $regex: new RegExp(searchQuery, "i") } },
                        { "phone.phoneNumber": { $regex: new RegExp(searchQuery, "i") } },
                    ],
                },
            },
            {
                $facet: {
                    metaData: [
                        {
                            $count: "totalPatient",
                        },
                        {
                            $addFields: {
                                pageNumber: page,
                                totalPages: { $ceil: { $divide: ["$totalPatient", pageSize] } },
                            },
                        },
                    ],
                    data: [
                        {
                            $skip: (page - 1) * pageSize,
                        },
                        {
                            $limit: pageSize,
                        },
                    ],
                },
            },
        ];
        const patientList = yield patient_model_1.Patient.aggregate(pipeline);
        if (!patientList || patientList.length === 0) {
            return res.status(200).json((0, apiResponse_1.default)(200, {}, "No such patients"));
        }
        let typedPatientList = {
            metaData: patientList[0].metaData,
            data: patientList[0].data,
        };
        typedPatientList.metaData = Object.assign(Object.assign({}, typedPatientList.metaData), { count: typedPatientList.data.length });
        logger_1.default === null || logger_1.default === void 0 ? void 0 : logger_1.default.info("PatientList with the required parameters recieved successfully");
        return res
            .status(200)
            .json((0, apiResponse_1.default)(200, typedPatientList, "Patient list successfully retrieved"));
    }
    catch (error) {
        throw (0, apiError_1.default)(500, error.message);
    }
}));
exports.getPatientList = getPatientList;
const createPatient = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, email, phone, dob, doctorIDs } = req.body;
        const ids = doctorIDs;
        if (!name) {
            return res.status(400).json((0, apiResponse_1.default)(400, {}, "Name not provided"));
        }
        else if (!email) {
            return res.status(400).json((0, apiResponse_1.default)(400, {}, "Email not provided"));
        }
        else if (!dob || !(0, moment_1.default)(dob, moment_1.default.ISO_8601, true).isValid()) {
            return res
                .status(400)
                .json((0, apiResponse_1.default)(400, {}, "Invalid Date of Birth format. Please provide date in YYYY-MM-DD format."));
        }
        else if (phone && phone.phoneNumber.length < 10) {
            return res.status(400).json((0, apiResponse_1.default)(400, {}, "Invalid Phone Number"));
        }
        else if (doctorIDs.length === 0) {
            return res
                .status(400)
                .json((0, apiResponse_1.default)(400, {}, "Doctor Ids not provided"));
        }
        // Check if the patient with the given email or doctorIDs already exists
        const existingPatient = yield patient_model_1.Patient.findOne({
            $and: [{ email }, { doctorIDs: { $in: ids } }],
        });
        if (existingPatient) {
            return res
                .status(409)
                .json((0, apiResponse_1.default)(409, {}, "Patient with the provided email and doctorIDs already exists."));
        }
        const existingPatientWithEmail = yield patient_model_1.Patient.findOne({
            email,
        });
        if (existingPatientWithEmail) {
            existingPatientWithEmail.doctorIDs.push(doctorIDs);
            yield existingPatientWithEmail.save();
            return res
                .status(200)
                .json((0, apiResponse_1.default)(200, existingPatientWithEmail, "Doctor IDs added to existing patient successfully."));
        }
        const newPatient = new patient_model_1.Patient(req.body);
        const savedPatient = yield newPatient.save();
        console.log(savedPatient);
        logger_1.default === null || logger_1.default === void 0 ? void 0 : logger_1.default.info("Patient created successfully");
        return res
            .status(200)
            .json((0, apiResponse_1.default)(200, savedPatient, "Patient created successfully"));
    }
    catch (error) {
        throw (0, apiError_1.default)(500, error.message);
    }
}));
exports.createPatient = createPatient;
const createAppointment = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userDoctor, userPatient, dateTime, clinic, messages, isSold, status, visit, } = req.body;
        if (!userDoctor) {
            return res.status(400).json((0, apiResponse_1.default)(400, {}, "Doctor not provided"));
        }
        else if (!userPatient) {
            return res.status(400).json((0, apiResponse_1.default)(400, {}, "Patient not provided"));
        }
        else if (!dateTime || new Date(dateTime) < new Date()) {
            return res
                .status(400)
                .json((0, apiResponse_1.default)(400, {}, "Please provide a valid dateTime for the appointment."));
        }
        else if (!clinic) {
            return res.status(400).json((0, apiResponse_1.default)(400, {}, "Clinic not provided"));
        }
        const doctor = yield doctor_model_1.Doctor.findOne({ _id: userDoctor });
        if (!doctor) {
            return res
                .status(404)
                .json((0, apiResponse_1.default)(404, {}, "No such doctor found for which the appointment can be created."));
        }
        const patient = yield patient_model_1.Patient.findOne({ _id: userPatient });
        if (!patient) {
            return res
                .status(404)
                .json((0, apiResponse_1.default)(404, {}, "No such patient found for which the appointment can be created."));
        }
        const clinicForAppointment = yield clinic_model_1.Clinic.findOne({ _id: clinic });
        if (!clinicForAppointment) {
            return res
                .status(404)
                .json((0, apiResponse_1.default)(404, {}, "No such clinic found for which the appointment can be created."));
        }
        // Creating a new appointment instance
        const newAppointment = new appointment_model_1.Appointment({
            userDoctor,
            userPatient,
            dateTime,
            clinic,
            messages,
            isSold,
            status,
            visit,
        });
        // Saving the new appointment to the database
        const savedAppointment = yield newAppointment.save();
        if (!savedAppointment) {
            return res
                .status(404)
                .json((0, apiResponse_1.default)(404, {}, "Appointment not created"));
        }
        console.log(savedAppointment);
        const populatedUserDoctorAppointment = yield savedAppointment.populate({
            path: "userDoctor",
            select: "_id profile.name",
        });
        if (!populatedUserDoctorAppointment) {
            return res.status(400).json((0, apiResponse_1.default)(400, {}, "No doctor provided"));
        }
        const populatedUserPatientAppointment = yield savedAppointment.populate("userPatient");
        if (!populatedUserPatientAppointment) {
            return res.status(400).json((0, apiResponse_1.default)(400, {}, "No patient provided"));
        }
        logger_1.default === null || logger_1.default === void 0 ? void 0 : logger_1.default.info("Appointment created successfully");
        return res
            .status(200)
            .json((0, apiResponse_1.default)(200, populatedUserPatientAppointment, "Appointment created successfully"));
    }
    catch (error) {
        throw (0, apiError_1.default)(500, error.message);
    }
}));
exports.createAppointment = createAppointment;
const editSettings = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const updateFields = req.body;
        // Check if id is a valid ObjectId
        if (!mongoose_2.default.Types.ObjectId.isValid(id)) {
            return res.status(400).json((0, apiResponse_1.default)(400, {}, "Invalid ObjectId"));
        }
        // Validate if settings are provided
        if (!updateFields) {
            return res
                .status(400)
                .json((0, apiResponse_1.default)(400, {}, "Settings are required for updating."));
        }
        const updatedSettings = yield doctor_model_1.Doctor.findByIdAndUpdate(req.params.id, {
            $set: updateFields,
        }, { new: true });
        // Check if the doctor with the provided ID was not found
        if (!updatedSettings) {
            return res.status(200).json((0, apiResponse_1.default)(200, {}, "Doctor not found."));
        }
        logger_1.default === null || logger_1.default === void 0 ? void 0 : logger_1.default.info("Settings updated successfully");
        return res
            .status(200)
            .json((0, apiResponse_1.default)(200, updatedSettings, "Settings updated successfully"));
    }
    catch (error) {
        throw (0, apiError_1.default)(500, error.message);
    }
}));
exports.editSettings = editSettings;
const createDoctor = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const doctorData = req.body;
        if (doctorData.profile &&
            doctorData.profile.phone &&
            doctorData.profile.phone.phoneNumber.length < 10) {
            return res.status(400).json((0, apiResponse_1.default)(400, {}, "Invalid Phone Number"));
        }
        // Create a new instance of the Doctor model with the provided data
        const newDoctor = new doctor_model_1.Doctor(doctorData);
        // Save the new doctor to the database
        const savedDoctor = yield newDoctor.save();
        if (!savedDoctor) {
            return res.status(404).json((0, apiResponse_1.default)(404, {}, "Doctor not created"));
        }
        else {
            return res
                .status(200)
                .json((0, apiResponse_1.default)(200, savedDoctor, "Doctor created successfully"));
        }
    }
    catch (error) {
        throw (0, apiError_1.default)(500, error.message);
    }
}));
exports.createDoctor = createDoctor;
const getConditions = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Fetch the doctor by ID or any other criteria
        const doctorId = req.params.id; // Assuming you pass the doctorId as a parameter
        // Find the doctor by ID
        const doctor = yield doctor_model_1.Doctor.findById(doctorId);
        if (!doctor) {
            return res.status(200).json((0, apiResponse_1.default)(200, {}, "Doctor not found"));
        }
        // Extract condition names from rxTemplates
        const conditions = doctor.settings.rxTemplates.map((template) => template.condition);
        return res
            .status(200)
            .json((0, apiResponse_1.default)(200, conditions, "Conditions recieved successfully"));
    }
    catch (error) {
        throw (0, apiError_1.default)(500, error.message);
    }
}));
exports.getConditions = getConditions;
const getMedicationDetails = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Assuming you are passing an array of conditions in the request body
        const selectedConditions = req.body.conditions;
        // Fetch the doctor by ID or any other criteria
        const doctorId = req.params.id; // Assuming you pass the doctorId as a parameter
        // Find the doctor by ID
        const doctor = yield doctor_model_1.Doctor.findById(doctorId);
        if (!doctor) {
            return res.status(404).json((0, apiResponse_1.default)(404, {}, "Doctor not found"));
        }
        // Initialize an array to store the resulting medication details
        const medicationDetails = [];
        // Iterate over each selected condition and grade
        for (const selectedCondition of selectedConditions) {
            // Find the template that matches the selected condition
            const selectedTemplate = doctor.settings.rxTemplates.find((template) => template.condition.conditionName === selectedCondition.condition);
            if (!selectedTemplate) {
                return res
                    .status(200)
                    .json((0, apiResponse_1.default)(200, {}, `Template not found for the selected condition: ${selectedCondition.condition}`));
            }
            // Find the medication for the selected grade within the template
            const selectedMedication = selectedTemplate.medication.find((medication) => medication.grade === selectedCondition.grade);
            if (!selectedMedication) {
                return res
                    .status(200)
                    .json((0, apiResponse_1.default)(200, {}, `Medication not found for the selected grade: ${selectedCondition.grade}`));
            }
            // Concatenate the medicine details to the result array
            medicationDetails.push(...selectedMedication.medicineDetails);
        }
        return res
            .status(200)
            .json((0, apiResponse_1.default)(200, medicationDetails, "Medicine details recieved successfully"));
    }
    catch (error) {
        throw (0, apiError_1.default)(500, error.message);
    }
}));
exports.getMedicationDetails = getMedicationDetails;
const createRx = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { doctorId, patientId, appointmentId, patientBasicDetail, diagnosis, medication, test, symptoms, additionalNotes, nextVisit, } = req.body;
        if (!doctorId) {
            res.status(400).json((0, apiResponse_1.default)(400, {}, "Doctor Id is required"));
        }
        else if (!patientId) {
            res.status(400).json((0, apiResponse_1.default)(400, {}, "Patient Id is required"));
        }
        else if (!appointmentId) {
            res.status(400).json((0, apiResponse_1.default)(400, {}, "Appointment Id is required"));
        }
        // Create a new instance of the Prescription model
        const newRx = new rx_model_1.Rx({
            doctorId,
            patientId,
            appointmentId,
            patientBasicDetail,
            diagnosis,
            medication,
            test,
            symptoms,
            additionalNotes,
            nextVisit,
        });
        // Save the prescription to the database
        const savedRx = yield newRx.save();
        if (!savedRx) {
            return res.status(404).json((0, apiResponse_1.default)(404, {}, "Rx not created"));
        }
        return res
            .status(201)
            .json((0, apiResponse_1.default)(201, savedRx, "Rx successfully created"));
    }
    catch (error) {
        throw (0, apiError_1.default)(500, error.message);
    }
}));
exports.createRx = createRx;
const createReceptionist = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { _id, profile, listOfDoctors } = req.body;
        if (!_id) {
            res.status(400).json((0, apiResponse_1.default)(400, {}, "Id is required"));
        }
        else if (!listOfDoctors || listOfDoctors.length === 0) {
            res
                .status(400)
                .json((0, apiResponse_1.default)(400, {}, "Receptionist should be associated with doctor"));
        }
        else if (!profile.name) {
            res.status(400).json((0, apiResponse_1.default)(400, {}, "Name is required"));
        }
        else if (!profile.phone) {
            res.status(400).json((0, apiResponse_1.default)(400, {}, "Phone is required"));
        }
        else if (profile.phone && profile.phone.phoneNumber.length < 10) {
            return res.status(400).json((0, apiResponse_1.default)(400, {}, "Invalid Phone Number"));
        }
        // Check if a receptionist with the same name, phone, and doctorId already exists
        const existingReceptionist = yield receptionist_model_1.Receptionist.findOne({
            _id,
            profile,
            listOfDoctors: {
                $in: listOfDoctors,
            },
        });
        if (existingReceptionist) {
            return res
                .status(409)
                .json((0, apiResponse_1.default)(409, {}, "Receptionist already exists"));
        }
        let newReceptionist, savedReceptionist, responseData, receptionistId;
        // Check if a receptionist with the same id already exists
        const existingReceptionistWithId = yield receptionist_model_1.Receptionist.findOne({
            _id,
        });
        if (!existingReceptionistWithId) {
            newReceptionist = yield receptionist_model_1.Receptionist.create({
                _id,
                profile,
                listOfDoctors,
            });
            savedReceptionist = yield newReceptionist.save();
            responseData = savedReceptionist;
            // Add receptionist ID to all associated doctors
            receptionistId = responseData._id;
            if (!savedReceptionist) {
                return res
                    .status(404)
                    .json((0, apiResponse_1.default)(404, {}, "Receptionist could not be created"));
            }
        }
        else {
            newReceptionist = yield receptionist_model_1.Receptionist.updateOne({ _id: _id }, {
                $push: {
                    listOfDoctors: listOfDoctors,
                },
            });
            responseData = yield receptionist_model_1.Receptionist.findOne({
                _id,
            });
            receptionistId = _id;
        }
        for (const doctorId of listOfDoctors) {
            const updatedDoctor = yield doctor_model_1.Doctor.findByIdAndUpdate(doctorId, { $push: { "profile.userReceptionist": receptionistId } }, { new: true });
            if (!updatedDoctor) {
                return res
                    .status(404)
                    .json((0, apiResponse_1.default)(404, {}, "Doctor could not be linked to receptionist"));
            }
            // Find all clinics associated with this doctor and add receptionist ID to their userReceptionist array
            const associatedClinics = yield clinic_model_1.Clinic.find({
                "userDoctor.docID": doctorId,
            });
            console.log(associatedClinics);
            for (const clinic of associatedClinics) {
                const updatedClinic = yield clinic_model_1.Clinic.findByIdAndUpdate(clinic._id, {
                    $push: {
                        userReceptionist: {
                            receptionistID: receptionistId,
                            name: profile.name,
                        },
                    },
                }, { new: true });
                if (!updatedClinic) {
                    return res
                        .status(404)
                        .json((0, apiResponse_1.default)(404, {}, "Clinic could not be linked to receptionist"));
                }
            }
        }
        return res
            .status(201)
            .json((0, apiResponse_1.default)(201, responseData, "Receptionist successfully created"));
    }
    catch (error) {
        throw (0, apiError_1.default)(500, error.message);
    }
}));
exports.createReceptionist = createReceptionist;
const updateReceptionist = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { receptionistId } = req.params;
        const updateData = req.body;
        // Check if id is a valid ObjectId
        if (!mongoose_2.default.Types.ObjectId.isValid(receptionistId)) {
            return res.status(400).json((0, apiResponse_1.default)(400, {}, "Invalid ObjectId"));
        }
        else if (updateData.profile.phone &&
            updateData.profile.phone.phoneNumber.length < 10) {
            return res.status(400).json((0, apiResponse_1.default)(400, {}, "Invalid Phone Number"));
        }
        const updatedReceptionist = yield receptionist_model_1.Receptionist.findByIdAndUpdate(receptionistId, {
            $set: updateData,
        }, {
            new: true,
        });
        if (!updatedReceptionist) {
            return res
                .status(200)
                .json((0, apiResponse_1.default)(200, {}, "Receptionist could not be updated"));
        }
        return res
            .status(200)
            .json((0, apiResponse_1.default)(200, updatedReceptionist, "Receptionist updated successfully"));
    }
    catch (error) {
        throw (0, apiError_1.default)(500, error.message);
    }
}));
exports.updateReceptionist = updateReceptionist;
const deleteReceptionist = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { receptionistId, doctorId } = req.body;
        if (!receptionistId || !doctorId) {
            return res
                .status(404)
                .json((0, apiResponse_1.default)(404, {}, "Please provide all the ids"));
        }
        // Check if id is a valid ObjectId
        if (!mongoose_2.default.Types.ObjectId.isValid(receptionistId) ||
            !mongoose_2.default.Types.ObjectId.isValid(doctorId)) {
            return res.status(400).json((0, apiResponse_1.default)(400, {}, "Invalid ObjectId"));
        }
        // Find the doctor by the receptionist's ID and remove the receptionist from the userReceptionist array
        const updatedDoctor = yield doctor_model_1.Doctor.updateOne({ _id: doctorId }, {
            $pull: {
                "profile.userReceptionist": receptionistId,
            },
        });
        console.log(updatedDoctor);
        if (updatedDoctor.modifiedCount === 0) {
            return res
                .status(404)
                .json((0, apiResponse_1.default)(404, {}, "Receptionist linked to doctor could not be deleted"));
        }
        const updatedReceptionist = yield receptionist_model_1.Receptionist.updateOne({ _id: receptionistId }, {
            $pull: {
                listOfDoctors: doctorId,
            },
        });
        console.log(updatedReceptionist);
        if (updatedReceptionist.modifiedCount === 0) {
            return res
                .status(404)
                .json((0, apiResponse_1.default)(404, {}, "Doctor linked to receptionist could not be deleted"));
        }
        return res
            .status(200)
            .json((0, apiResponse_1.default)(200, {}, "Receptionist deleted successfully"));
    }
    catch (error) {
        throw (0, apiError_1.default)(500, error.message);
    }
}));
exports.deleteReceptionist = deleteReceptionist;
const getAllReceptionist = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        console.log(req.user);
        // Extract userReceptionist IDs from the doctor document
        const id = (_a = req.user) === null || _a === void 0 ? void 0 : _a.user._id;
        const receptionists = yield receptionist_model_1.Receptionist.find({
            listOfDoctors: { $in: [id] },
        });
        if (receptionists.length === 0) {
            return res
                .status(200)
                .json((0, apiResponse_1.default)(200, {}, "No receptionist found "));
        }
        return res
            .status(200)
            .json((0, apiResponse_1.default)(200, receptionists, "Receptionists retrieved successfully"));
    }
    catch (error) {
        throw (0, apiError_1.default)(500, error.message);
    }
}));
exports.getAllReceptionist = getAllReceptionist;
const getReceptionist = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { receptionistId } = req.params;
        // Check if id is a valid ObjectId
        if (!mongoose_2.default.Types.ObjectId.isValid(receptionistId)) {
            return res.status(400).json((0, apiResponse_1.default)(400, {}, "Invalid ObjectId"));
        }
        if (!receptionistId) {
            return res
                .status(404)
                .json((0, apiResponse_1.default)(404, {}, "Receptionist id not provided"));
        }
        // Find receptionist by ID
        const receptionist = yield receptionist_model_1.Receptionist.findById(receptionistId);
        if (!receptionist) {
            return res
                .status(200)
                .json((0, apiResponse_1.default)(200, {}, "Receptionist not found"));
        }
        return res
            .status(200)
            .json((0, apiResponse_1.default)(200, receptionist, "Receptionist retrieved successfully"));
    }
    catch (error) {
        throw (0, apiError_1.default)(500, error.message);
    }
}));
exports.getReceptionist = getReceptionist;
const getMedicines = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const page = parseInt(req.query.page) || 1; // Page number, default is 1
        const limit = parseInt(req.query.limit) || 10; // Number of items per page, default is 10
        const startIndex = (page - 1) * limit;
        let query = {};
        if (req.query.search) {
            const searchKeyword = req.query.search;
            query = {
                $or: [{ productName: { $regex: searchKeyword, $options: "i" } }],
            };
        }
        const totalMedicines = yield medicine_model_1.default.countDocuments(query);
        const totalPages = Math.ceil(totalMedicines / limit);
        const medicines = yield medicine_model_1.default.find(query).skip(startIndex).limit(limit);
        return res.status(200).json((0, apiResponse_1.default)(200, {
            success: true,
            count: medicines.length,
            currentPage: page,
            totalPages: totalPages,
            totalMedicines: totalMedicines,
            data: medicines,
        }, "Medicines successfully retrieved"));
    }
    catch (error) {
        throw (0, apiError_1.default)(500, error.message);
    }
}));
exports.getMedicines = getMedicines;
const createClinic = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const _b = req.body, { doctorID } = _b, clinicData = __rest(_b, ["doctorID"]);
        if (!clinicData) {
            return res
                .status(404)
                .json((0, apiResponse_1.default)(404, {}, "Clinic data not provided"));
        }
        // Create the clinic
        const newClinic = yield clinic_model_1.Clinic.create(clinicData);
        if (!newClinic) {
            return res
                .status(404)
                .json((0, apiResponse_1.default)(404, {}, "Clinic could not be created"));
        }
        // Update the doctor with the newly created clinic's ID
        const updatedDoctor = yield doctor_model_1.Doctor.findByIdAndUpdate(doctorID, { $push: { "profile.clinics": newClinic._id } }, { new: true });
        if (!updatedDoctor) {
            return res
                .status(404)
                .json((0, apiResponse_1.default)(404, {}, "Clinic could not be linked to the doctor"));
        }
        return res
            .status(201)
            .json((0, apiResponse_1.default)(201, newClinic, "Clinic created successfully"));
    }
    catch (error) {
        throw (0, apiError_1.default)(500, error.message);
    }
}));
exports.createClinic = createClinic;
const updateClinic = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        // Check if id is a valid ObjectId
        if (!mongoose_2.default.Types.ObjectId.isValid(id)) {
            return res.status(400).json((0, apiResponse_1.default)(400, {}, "Invalid ObjectId"));
        }
        const updateData = req.body;
        const updatedClinic = yield clinic_model_1.Clinic.findByIdAndUpdate(id, {
            $set: updateData,
        }, {
            new: true,
        });
        if (!updatedClinic) {
            return res
                .status(200)
                .json((0, apiResponse_1.default)(200, {}, "Clinic could not be updated"));
        }
        return res
            .status(200)
            .json((0, apiResponse_1.default)(200, updatedClinic, "Clinic updated successfully"));
    }
    catch (error) {
        throw (0, apiError_1.default)(500, error.message);
    }
}));
exports.updateClinic = updateClinic;
const deleteClinic = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { clinicId, doctorId } = req.body;
        if (!doctorId || !clinicId) {
            return res
                .status(400)
                .json((0, apiResponse_1.default)(400, {}, "Please provide all the ids"));
        }
        // Check if id is a valid ObjectId
        if (!mongoose_2.default.Types.ObjectId.isValid(clinicId) ||
            !mongoose_2.default.Types.ObjectId.isValid(doctorId)) {
            return res.status(400).json((0, apiResponse_1.default)(400, {}, "Invalid ObjectId"));
        }
        // Update all doctors by removing the clinicId from their clinics array
        const updatedDoctor = yield doctor_model_1.Doctor.updateOne({ _id: doctorId }, { $pull: { "profile.clinics": clinicId } });
        if (updatedDoctor.modifiedCount === 0) {
            return res
                .status(404)
                .json((0, apiResponse_1.default)(404, {}, "Clinic linked to doctor could not be deleted"));
        }
        const updatedClinic = yield clinic_model_1.Clinic.updateOne({
            _id: clinicId,
        }, { $pull: { userDoctor: { docID: doctorId } } });
        if (updatedClinic.modifiedCount === 0) {
            return res
                .status(404)
                .json((0, apiResponse_1.default)(404, {}, "Doctor linked to clinic could not be deleted"));
        }
        // Fetch updated clinic
        const clinic = yield clinic_model_1.Clinic.findById(clinicId);
        if (!clinic) {
            return res.status(404).json((0, apiResponse_1.default)(404, {}, "Clinic not found"));
        }
        // If userDoctor length is zero, set isActive to false
        if (clinic.userDoctor.length === 0) {
            const updateClinic = yield clinic_model_1.Clinic.updateOne({ _id: clinicId }, { isActive: false });
            if (!updateClinic) {
                return res
                    .status(404)
                    .json((0, apiResponse_1.default)(404, {}, "Clinic cannot be made inactive"));
            }
        }
        return res
            .status(200)
            .json((0, apiResponse_1.default)(200, {}, "Clinic deleted successfully"));
    }
    catch (error) {
        throw (0, apiError_1.default)(500, error.message);
    }
}));
exports.deleteClinic = deleteClinic;
