import { faker } from "@faker-js/faker";
import PatientModel, { Patient } from "../models/patient.model";
import ClinicModel, { Clinic } from "../models/clinic.model";
import AppointmentModel, { Appointment } from "../models/appointment.model";
import ConditionsModel, { Condition } from "../models/conditions.model";

import { Types } from "mongoose";

const generateRandomObjectId = () =>
  new Types.ObjectId(faker.database.mongodbObjectId());

const seedPatientData = async () => {
  try {
    // make a bunch of time series data
    let patientData = [];

    for (let i = 0; i < 20; i++) {
      const name = faker.person.fullName();
      const email = faker.internet.email({ firstName: name });
      const phone = { phoneNumber: "9876543210", countryCode: "+91" };
      const dob = faker.date.birthdate();
      const patientVitals = [{ name: "bloodPressure", value: "100/70" }];
      const symptoms = ["fever"];
      const address = faker.location.streetAddress();
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
    const seededData: PatientModel[] = await Patient.insertMany(patientData);
    console.log("Database seeded! :)", seededData);
  } catch (err) {
    console.log(err);
  }
};

// doctor data

const seedClinicData = async () => {
  try {
    // make a bunch of time series data
    let clinicData = [];

    for (let i = 0; i < 10; i++) {
      const userDoctor = Array.from({ length: 15 }, () => ({
        docID: new Types.ObjectId(faker.database.mongodbObjectId()),
        name: faker.person.fullName(),
      }));

      const address = faker.location.streetAddress();
      const logo = faker.image.avatar();
      const name = faker.company.name();

      const receptionistID = new Types.ObjectId(
        faker.database.mongodbObjectId()
      );

      clinicData.push({ userDoctor, address, receptionistID, logo, name });
    }

    const seededData: ClinicModel[] = await Clinic.insertMany(clinicData);
    console.log("Database seeded! :)", seededData);
  } catch (err) {
    console.error("Error seeding clinic data:", err);
  }
};

const seedAppointmentData = async () => {
  try {
    // make a bunch of time series data
    let appointmentData = [];

    for (let i = 0; i < 10; i++) {
      const userDoctor = generateRandomObjectId();
      const userPatient = generateRandomObjectId();
      const schedule = {
        date: faker.date.future(),
        time: "12:34:07 AM",
      };
      const clinicIDs = Array.from({ length: 3 }, generateRandomObjectId);
      const status = faker.helpers.arrayElement([
        "done",
        "pending",
        "cancelled",
      ]);
      const messages = Array.from({ length: 3 }, () => ({
        text: faker.lorem.sentence(),
        date: faker.date.past(),
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

    const seededData = await Appointment.insertMany(appointmentData);
    console.log("Appointment data seeded! :)", seededData);
  } catch (err) {
    console.error("Error seeding appointment data:", err);
  }
};

// const seedConditionData = async () => {
//   try {
//     let conditionData: ConditionsModel[] = [];
//     const categories = ["Eye", "Nose", "Throat", "Heart"]; // Add more categories as needed

//     for (let i = 0; i < 20; i++) {
//       const name = faker.lorem.words(2); // Generate a single-word condition name
//       const numCategories = Math.floor(Math.random() * 5) + 1;
//       const selectedCategories = Array.from({ length: numCategories }, () =>
//         faker.helpers.arrayElement(categories)
//       );
//       conditionData.push({ name, categories: selectedCategories});
//     }

//     const seededData = await Condition.insertMany(conditionData);
//     console.log("Condition data seeded! :)", seededData);
//   } catch (err) {
//     console.error("Error seeding condition data:", err);
//   }
// };

export { seedPatientData, seedClinicData, seedAppointmentData };
