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
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedAppointmentData = exports.seedClinicData = exports.seedPatientData = void 0;
const faker_1 = require("@faker-js/faker");
const patient_model_1 = require("../models/patient.model");
const clinic_model_1 = require("../models/clinic.model");
const appointment_model_1 = require("../models/appointment.model");
const mongoose_1 = require("mongoose");
const generateRandomObjectId = () => new mongoose_1.Types.ObjectId(faker_1.faker.database.mongodbObjectId());
const seedPatientData = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // make a bunch of time series data
        let patientData = [];
        for (let i = 0; i < 20; i++) {
            const name = faker_1.faker.person.fullName();
            const email = faker_1.faker.internet.email({ firstName: name });
            const phone = { phoneNumber: "9876543210", countryCode: "+91" };
            const dob = faker_1.faker.date.birthdate();
            const patientVitals = [{ name: "bloodPressure", value: "100/70" }];
            const symptoms = ["fever"];
            const address = faker_1.faker.location.streetAddress();
            const doctorIDs = Array.from({ length: 5 }, generateRandomObjectId);
            patientData.push({
                name,
                email,
                phone,
                dob,
                patientVitals,
                symptoms,
                address,
                doctorIDs,
            });
        }
        console.log(patientData);
        const seededData = yield patient_model_1.Patient.insertMany(patientData);
        console.log("Database seeded! :)", seededData);
    }
    catch (err) {
        console.log(err);
    }
});
exports.seedPatientData = seedPatientData;
// doctor data
const seedClinicData = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // make a bunch of time series data
        let clinicData = [];
        for (let i = 0; i < 10; i++) {
            const userDoctor = Array.from({ length: 15 }, () => ({
                docID: new mongoose_1.Types.ObjectId(faker_1.faker.database.mongodbObjectId()),
                name: faker_1.faker.person.fullName(),
            }));
            const address = faker_1.faker.location.streetAddress();
            const logo = faker_1.faker.image.avatar();
            const name = faker_1.faker.company.name();
            const receptionistID = new mongoose_1.Types.ObjectId(faker_1.faker.database.mongodbObjectId());
            clinicData.push({ userDoctor, address, receptionistID, logo, name });
        }
        const seededData = yield clinic_model_1.Clinic.insertMany(clinicData);
        console.log("Database seeded! :)", seededData);
    }
    catch (err) {
        console.error("Error seeding clinic data:", err);
    }
});
exports.seedClinicData = seedClinicData;
const seedAppointmentData = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // make a bunch of time series data
        let appointmentData = [];
        for (let i = 0; i < 10; i++) {
            const userDoctor = generateRandomObjectId();
            const userPatient = generateRandomObjectId();
            const schedule = {
                date: faker_1.faker.date.future(),
                time: "12:34:07 AM",
            };
            const clinicIDs = Array.from({ length: 3 }, generateRandomObjectId);
            const status = faker_1.faker.helpers.arrayElement([
                "done",
                "pending",
                "cancelled",
            ]);
            const messages = Array.from({ length: 3 }, () => ({
                text: faker_1.faker.lorem.sentence(),
                date: faker_1.faker.date.past(),
            }));
            appointmentData.push({
                userDoctor,
                userPatient,
                schedule: schedule,
                clinic: clinicIDs,
                status,
                messages: messages,
            });
        }
        const seededData = yield appointment_model_1.Appointment.insertMany(appointmentData);
        console.log("Appointment data seeded! :)", seededData);
    }
    catch (err) {
        console.error("Error seeding appointment data:", err);
    }
});
exports.seedAppointmentData = seedAppointmentData;
