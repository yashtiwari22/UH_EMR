import asyncHandler from "../utils/asyncHandler";
import { Request, Response } from "express";
import { Types } from "mongoose";
import PatientModel, { Patient } from "../models/patient.model";
import AppointmentModel, { Appointment } from "../models/appointment.model";
import { Doctor } from "../models/doctor.model";
import { Receptionist } from "../models/receptionist.model";
import { Rx } from "../models/rx.model";
import Medicine from "../models/medicine.model";
import ApiError from "../utils/apiError";
import ApiResponse from "../utils/apiResponse";
import logger from "../logger";
import moment from "moment";
import { Clinic } from "../models/clinic.model";
import { UserRequest } from "../middlewares/authJwt";
import mongoose from "mongoose";

interface PatientListResponse {
  metaData: {
    count: number;
    totalPages: number;
    pageNumber: number;
  };
  data: PatientModel[];
}

const getPatientList = asyncHandler(async (req: Request, res: Response) => {
  try {
    const doctorIds = req.query.uids
      ? (req.query.uids as string).split(",")
      : [];
    const searchQuery = (req.query.search as string) || "";
    const page = Number(req.query.page) || 1;
    const pageSize = Number(req.query.pageSize) || 10;

    // Check if doctorIds are provided
    if (doctorIds.length === 0) {
      return res
        .status(400)
        .json(ApiResponse(400, {}, "Doctor IDs are required"));
    }
    //pipeline
    const pipeline = [
      {
        $match: {
          doctorIDs: { $in: doctorIds.map((id) => new Types.ObjectId(id)) },
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
    const patientList = await Patient.aggregate(pipeline);

    if (!patientList || patientList.length === 0) {
      return res.status(200).json(ApiResponse(200, {}, "No such patients"));
    }

    let typedPatientList: PatientListResponse = {
      metaData: patientList[0].metaData,
      data: patientList[0].data as PatientModel[],
    };

    typedPatientList.metaData = {
      ...typedPatientList.metaData,
      count: typedPatientList.data.length,
    };
    logger?.info(
      "PatientList with the required parameters recieved successfully"
    );
    return res
      .status(200)
      .json(
        ApiResponse(
          200,
          typedPatientList,
          "Patient list successfully retrieved"
        )
      );
  } catch (error: any) {
    throw ApiError(500, error.message);
  }
});

const createPatient = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { name, email, phone, dob, doctorIDs } = req.body;

    const ids = doctorIDs;

    if (!name) {
      return res.status(400).json(ApiResponse(400, {}, "Name not provided"));
    } else if (!email) {
      return res.status(400).json(ApiResponse(400, {}, "Email not provided"));
    } else if (!dob || !moment(dob, moment.ISO_8601, true).isValid()) {
      return res
        .status(400)
        .json(
          ApiResponse(
            400,
            {},
            "Invalid Date of Birth format. Please provide date in YYYY-MM-DD format."
          )
        );
    } else if (phone && phone.phoneNumber.length < 10) {
      return res.status(400).json(ApiResponse(400, {}, "Invalid Phone Number"));
    } else if (doctorIDs.length === 0) {
      return res
        .status(400)
        .json(ApiResponse(400, {}, "Doctor Ids not provided"));
    }
    // Check if the patient with the given email or doctorIDs already exists
    const existingPatient = await Patient.findOne({
      $and: [{ email }, { doctorIDs: { $in: ids } }],
    });

    if (existingPatient) {
      return res
        .status(409)
        .json(
          ApiResponse(
            409,
            {},
            "Patient with the provided email and doctorIDs already exists."
          )
        );
    }

    const existingPatientWithEmail = await Patient.findOne({
      email,
    });

    if (existingPatientWithEmail) {
      existingPatientWithEmail.doctorIDs.push(doctorIDs);
      await existingPatientWithEmail.save();
      return res
        .status(200)
        .json(
          ApiResponse(
            200,
            existingPatientWithEmail,
            "Doctor IDs added to existing patient successfully."
          )
        );
    }

    const newPatient: PatientModel = new Patient(req.body);

    const savedPatient = await newPatient.save();
    console.log(savedPatient);
    logger?.info("Patient created successfully");
    return res
      .status(200)
      .json(ApiResponse(200, savedPatient, "Patient created successfully"));
  } catch (error: any) {
    throw ApiError(500, error.message);
  }
});

const createAppointment = asyncHandler(async (req: Request, res: Response) => {
  try {
    const {
      userDoctor,
      userPatient,
      dateTime,
      clinic,
      messages,
      isSold,
      status,
      visit,
    } = req.body;

    if (!userDoctor) {
      return res.status(400).json(ApiResponse(400, {}, "Doctor not provided"));
    } else if (!userPatient) {
      return res.status(400).json(ApiResponse(400, {}, "Patient not provided"));
    } else if (!dateTime || new Date(dateTime) < new Date()) {
      return res
        .status(400)
        .json(
          ApiResponse(
            400,
            {},
            "Please provide a valid dateTime for the appointment."
          )
        );
    } else if (!clinic) {
      return res.status(400).json(ApiResponse(400, {}, "Clinic not provided"));
    }

    const doctor = await Doctor.findOne({ _id: userDoctor });

    if (!doctor) {
      return res
        .status(404)
        .json(
          ApiResponse(
            404,
            {},
            "No such doctor found for which the appointment can be created."
          )
        );
    }

    const patient = await Patient.findOne({ _id: userPatient });

    if (!patient) {
      return res
        .status(404)
        .json(
          ApiResponse(
            404,
            {},
            "No such patient found for which the appointment can be created."
          )
        );
    }

    const clinicForAppointment = await Clinic.findOne({ _id: clinic });

    if (!clinicForAppointment) {
      return res
        .status(404)
        .json(
          ApiResponse(
            404,
            {},
            "No such clinic found for which the appointment can be created."
          )
        );
    }

    // Creating a new appointment instance
    const newAppointment: AppointmentModel = new Appointment({
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
    const savedAppointment = await newAppointment.save();

    if (!savedAppointment) {
      return res
        .status(404)
        .json(ApiResponse(404, {}, "Appointment not created"));
    }

    console.log(savedAppointment);

    const populatedUserDoctorAppointment = await savedAppointment.populate({
      path: "userDoctor",
      select: "_id profile.name",
    });
    if (!populatedUserDoctorAppointment) {
      return res.status(400).json(ApiResponse(400, {}, "No doctor provided"));
    }
    const populatedUserPatientAppointment = await savedAppointment.populate(
      "userPatient"
    );
    if (!populatedUserPatientAppointment) {
      return res.status(400).json(ApiResponse(400, {}, "No patient provided"));
    }
    logger?.info("Appointment created successfully");

    return res
      .status(200)
      .json(
        ApiResponse(
          200,
          populatedUserPatientAppointment,
          "Appointment created successfully"
        )
      );
  } catch (error: any) {
    throw ApiError(500, error.message);
  }
});

const editSettings = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateFields = req.body;

    // Check if id is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json(ApiResponse(400, {}, "Invalid ObjectId"));
    }

    // Validate if settings are provided
    if (!updateFields) {
      return res
        .status(400)
        .json(ApiResponse(400, {}, "Settings are required for updating."));
    }

    const updatedSettings = await Doctor.findByIdAndUpdate(
      req.params.id,
      {
        $set: updateFields,
      },
      { new: true }
    );

    // Check if the doctor with the provided ID was not found
    if (!updatedSettings) {
      return res.status(200).json(ApiResponse(200, {}, "Doctor not found."));
    }

    logger?.info("Settings updated successfully");
    return res
      .status(200)
      .json(ApiResponse(200, updatedSettings, "Settings updated successfully"));
  } catch (error: any) {
    throw ApiError(500, error.message);
  }
});

const createDoctor = asyncHandler(async (req: Request, res: Response) => {
  try {
    const doctorData = req.body;

    if (
      doctorData.profile &&
      doctorData.profile.phone &&
      doctorData.profile.phone.phoneNumber.length < 10
    ) {
      return res.status(400).json(ApiResponse(400, {}, "Invalid Phone Number"));
    }
    // Create a new instance of the Doctor model with the provided data
    const newDoctor = new Doctor(doctorData);

    // Save the new doctor to the database
    const savedDoctor = await newDoctor.save();

    if (!savedDoctor) {
      return res.status(404).json(ApiResponse(404, {}, "Doctor not created"));
    } else {
      return res
        .status(200)
        .json(ApiResponse(200, savedDoctor, "Doctor created successfully"));
    }
  } catch (error: any) {
    throw ApiError(500, error.message);
  }
});

const getConditions = asyncHandler(async (req: Request, res: Response) => {
  try {
    // Fetch the doctor by ID or any other criteria
    const doctorId = req.params.id; // Assuming you pass the doctorId as a parameter

    // Find the doctor by ID
    const doctor = await Doctor.findById(doctorId);

    if (!doctor) {
      return res.status(200).json(ApiResponse(200, {}, "Doctor not found"));
    }

    // Extract condition names from rxTemplates
    const conditions = doctor.settings.rxTemplates.map(
      (template) => template.condition
    );
    return res
      .status(200)
      .json(ApiResponse(200, conditions, "Conditions recieved successfully"));
  } catch (error: any) {
    throw ApiError(500, error.message);
  }
});

const getMedicationDetails = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      // Assuming you are passing an array of conditions in the request body
      const selectedConditions: { condition: string; grade: string }[] =
        req.body.conditions;

      // Fetch the doctor by ID or any other criteria
      const doctorId = req.params.id; // Assuming you pass the doctorId as a parameter

      // Find the doctor by ID
      const doctor = await Doctor.findById(doctorId);

      if (!doctor) {
        return res.status(404).json(ApiResponse(404, {}, "Doctor not found"));
      }

      // Initialize an array to store the resulting medication details

      const medicationDetails: any[] = [];

      // Iterate over each selected condition and grade
      for (const selectedCondition of selectedConditions) {
        // Find the template that matches the selected condition
        const selectedTemplate = doctor.settings.rxTemplates.find(
          (template) =>
            template.condition.conditionName === selectedCondition.condition
        );

        if (!selectedTemplate) {
          return res
            .status(200)
            .json(
              ApiResponse(
                200,
                {},
                `Template not found for the selected condition: ${selectedCondition.condition}`
              )
            );
        }

        // Find the medication for the selected grade within the template
        const selectedMedication = selectedTemplate.medication.find(
          (medication) => medication.grade === selectedCondition.grade
        );

        if (!selectedMedication) {
          return res
            .status(200)
            .json(
              ApiResponse(
                200,
                {},
                `Medication not found for the selected grade: ${selectedCondition.grade}`
              )
            );
        }

        // Concatenate the medicine details to the result array
        medicationDetails.push(...selectedMedication.medicineDetails);
      }
      return res
        .status(200)
        .json(
          ApiResponse(
            200,
            medicationDetails,
            "Medicine details recieved successfully"
          )
        );
    } catch (error: any) {
      throw ApiError(500, error.message);
    }
  }
);

const createRx = asyncHandler(async (req: Request, res: Response) => {
  try {
    const {
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
    } = req.body;

    if (!doctorId) {
      res.status(400).json(ApiResponse(400, {}, "Doctor Id is required"));
    } else if (!patientId) {
      res.status(400).json(ApiResponse(400, {}, "Patient Id is required"));
    } else if (!appointmentId) {
      res.status(400).json(ApiResponse(400, {}, "Appointment Id is required"));
    }

    // Create a new instance of the Prescription model
    const newRx = new Rx({
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
    const savedRx = await newRx.save();

    if (!savedRx) {
      return res.status(404).json(ApiResponse(404, {}, "Rx not created"));
    }
    return res
      .status(201)
      .json(ApiResponse(201, savedRx, "Rx successfully created"));
  } catch (error: any) {
    throw ApiError(500, error.message);
  }
});

const createReceptionist = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { _id, profile, listOfDoctors } = req.body;

    if (!_id) {
      res.status(400).json(ApiResponse(400, {}, "Id is required"));
    } else if (!listOfDoctors || listOfDoctors.length === 0) {
      res
        .status(400)
        .json(
          ApiResponse(400, {}, "Receptionist should be associated with doctor")
        );
    } else if (!profile.name) {
      res.status(400).json(ApiResponse(400, {}, "Name is required"));
    } else if (!profile.phone) {
      res.status(400).json(ApiResponse(400, {}, "Phone is required"));
    } else if (profile.phone && profile.phone.phoneNumber.length < 10) {
      return res.status(400).json(ApiResponse(400, {}, "Invalid Phone Number"));
    }

    // Check if a receptionist with the same name, phone, and doctorId already exists
    const existingReceptionist = await Receptionist.findOne({
      _id,
      profile,
      listOfDoctors: {
        $in: listOfDoctors,
      },
    });

    if (existingReceptionist) {
      return res
        .status(409)
        .json(ApiResponse(409, {}, "Receptionist already exists"));
    }

    let newReceptionist, savedReceptionist, responseData, receptionistId;

    // Check if a receptionist with the same id already exists
    const existingReceptionistWithId = await Receptionist.findOne({
      _id,
    });

    if (!existingReceptionistWithId) {
      newReceptionist = await Receptionist.create({
        _id,
        profile,
        listOfDoctors,
      });

      savedReceptionist = await newReceptionist.save();

      responseData = savedReceptionist;
      // Add receptionist ID to all associated doctors
      receptionistId = responseData._id;

      if (!savedReceptionist) {
        return res
          .status(404)
          .json(ApiResponse(404, {}, "Receptionist could not be created"));
      }
    } else {
      newReceptionist = await Receptionist.updateOne(
        { _id: _id },
        {
          $push: {
            listOfDoctors: listOfDoctors,
          },
        }
      );

      responseData = await Receptionist.findOne({
        _id,
      });

      receptionistId = _id;
    }

    for (const doctorId of listOfDoctors) {
      const updatedDoctor = await Doctor.findByIdAndUpdate(
        doctorId,
        { $push: { "profile.userReceptionist": receptionistId } },
        { new: true }
      );

      if (!updatedDoctor) {
        return res
          .status(404)
          .json(
            ApiResponse(404, {}, "Doctor could not be linked to receptionist")
          );
      }
      // Find all clinics associated with this doctor and add receptionist ID to their userReceptionist array
      const associatedClinics = await Clinic.find({
        "userDoctor.docID": doctorId,
      });

      console.log(associatedClinics);
      for (const clinic of associatedClinics) {
        const updatedClinic = await Clinic.findByIdAndUpdate(
          clinic._id,
          {
            $push: {
              userReceptionist: {
                receptionistID: receptionistId,
                name: profile.name,
              },
            },
          },
          { new: true }
        );

        if (!updatedClinic) {
          return res
            .status(404)
            .json(
              ApiResponse(404, {}, "Clinic could not be linked to receptionist")
            );
        }
      }
    }
    return res
      .status(201)
      .json(
        ApiResponse(201, responseData, "Receptionist successfully created")
      );
  } catch (error: any) {
    throw ApiError(500, error.message);
  }
});

const updateReceptionist = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { receptionistId } = req.params;
    const updateData = req.body;
    // Check if id is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(receptionistId)) {
      return res.status(400).json(ApiResponse(400, {}, "Invalid ObjectId"));
    } else if (
      updateData.profile.phone &&
      updateData.profile.phone.phoneNumber.length < 10
    ) {
      return res.status(400).json(ApiResponse(400, {}, "Invalid Phone Number"));
    }

    const updatedReceptionist = await Receptionist.findByIdAndUpdate(
      receptionistId,
      {
        $set: updateData,
      },
      {
        new: true,
      }
    );
    if (!updatedReceptionist) {
      return res
        .status(200)
        .json(ApiResponse(200, {}, "Receptionist could not be updated"));
    }

    return res
      .status(200)
      .json(
        ApiResponse(
          200,
          updatedReceptionist,
          "Receptionist updated successfully"
        )
      );
  } catch (error: any) {
    throw ApiError(500, error.message);
  }
});

const deleteReceptionist = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { receptionistId, doctorId } = req.body;

    if (!receptionistId || !doctorId) {
      return res
        .status(404)
        .json(ApiResponse(404, {}, "Please provide all the ids"));
    }

    // Check if id is a valid ObjectId
    if (
      !mongoose.Types.ObjectId.isValid(receptionistId) ||
      !mongoose.Types.ObjectId.isValid(doctorId)
    ) {
      return res.status(400).json(ApiResponse(400, {}, "Invalid ObjectId"));
    }

    // Find the doctor by the receptionist's ID and remove the receptionist from the userReceptionist array
    const updatedDoctor = await Doctor.updateOne(
      { _id: doctorId },
      {
        $pull: {
          "profile.userReceptionist": receptionistId,
        },
      }
    );
    console.log(updatedDoctor);
    if (updatedDoctor.modifiedCount === 0) {
      return res
        .status(404)
        .json(
          ApiResponse(
            404,
            {},
            "Receptionist linked to doctor could not be deleted"
          )
        );
    }

    const updatedReceptionist = await Receptionist.updateOne(
      { _id: receptionistId },
      {
        $pull: {
          listOfDoctors: doctorId,
        },
      }
    );

    console.log(updatedReceptionist);
    if (updatedReceptionist.modifiedCount === 0) {
      return res
        .status(404)
        .json(
          ApiResponse(
            404,
            {},
            "Doctor linked to receptionist could not be deleted"
          )
        );
    }
    return res
      .status(200)
      .json(ApiResponse(200, {}, "Receptionist deleted successfully"));
  } catch (error: any) {
    throw ApiError(500, error.message);
  }
});

const getAllReceptionist = asyncHandler(
  async (req: UserRequest, res: Response) => {
    try {
      console.log(req.user);

      // Extract userReceptionist IDs from the doctor document
      const id = req.user?.user._id;

      const receptionists = await Receptionist.find({
        listOfDoctors: { $in: [id] },
      });

      if (receptionists.length === 0) {
        return res
          .status(200)
          .json(ApiResponse(200, {}, "No receptionist found "));
      }

      return res
        .status(200)
        .json(
          ApiResponse(
            200,
            receptionists,
            "Receptionists retrieved successfully"
          )
        );
    } catch (error: any) {
      throw ApiError(500, error.message);
    }
  }
);

const getReceptionist = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { receptionistId } = req.params;

    // Check if id is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(receptionistId)) {
      return res.status(400).json(ApiResponse(400, {}, "Invalid ObjectId"));
    }

    if (!receptionistId) {
      return res
        .status(404)
        .json(ApiResponse(404, {}, "Receptionist id not provided"));
    }

    // Find receptionist by ID
    const receptionist = await Receptionist.findById(receptionistId);

    if (!receptionist) {
      return res
        .status(200)
        .json(ApiResponse(200, {}, "Receptionist not found"));
    }

    return res
      .status(200)
      .json(
        ApiResponse(200, receptionist, "Receptionist retrieved successfully")
      );
  } catch (error: any) {
    throw ApiError(500, error.message);
  }
});

const getMedicines = asyncHandler(async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1; // Page number, default is 1
    const limit = parseInt(req.query.limit as string) || 10; // Number of items per page, default is 10

    const startIndex = (page - 1) * limit;

    let query = {};

    if (req.query.search) {
      const searchKeyword = req.query.search as string;

      query = {
        $or: [{ productName: { $regex: searchKeyword, $options: "i" } }],
      };
    }

    const totalMedicines = await Medicine.countDocuments(query);
    const totalPages = Math.ceil(totalMedicines / limit);

    const medicines = await Medicine.find(query).skip(startIndex).limit(limit);
    return res.status(200).json(
      ApiResponse(
        200,
        {
          success: true,
          count: medicines.length,
          currentPage: page,
          totalPages: totalPages,
          totalMedicines: totalMedicines,
          data: medicines,
        },
        "Medicines successfully retrieved"
      )
    );
  } catch (error: any) {
    throw ApiError(500, error.message);
  }
});

const createClinic = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { doctorID, ...clinicData } = req.body;

    if (!clinicData) {
      return res
        .status(404)
        .json(ApiResponse(404, {}, "Clinic data not provided"));
    }

    // Create the clinic
    const newClinic = await Clinic.create(clinicData);

    if (!newClinic) {
      return res
        .status(404)
        .json(ApiResponse(404, {}, "Clinic could not be created"));
    }

    // Update the doctor with the newly created clinic's ID
    const updatedDoctor = await Doctor.findByIdAndUpdate(
      doctorID,
      { $push: { "profile.clinics": newClinic._id } },
      { new: true }
    );

    if (!updatedDoctor) {
      return res
        .status(404)
        .json(ApiResponse(404, {}, "Clinic could not be linked to the doctor"));
    }

    return res
      .status(201)
      .json(ApiResponse(201, newClinic, "Clinic created successfully"));
  } catch (error: any) {
    throw ApiError(500, error.message);
  }
});

const updateClinic = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    // Check if id is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json(ApiResponse(400, {}, "Invalid ObjectId"));
    }
    const updateData = req.body;
    const updatedClinic = await Clinic.findByIdAndUpdate(
      id,
      {
        $set: updateData,
      },
      {
        new: true,
      }
    );
    if (!updatedClinic) {
      return res
        .status(200)
        .json(ApiResponse(200, {}, "Clinic could not be updated"));
    }

    return res
      .status(200)
      .json(ApiResponse(200, updatedClinic, "Clinic updated successfully"));
  } catch (error: any) {
    throw ApiError(500, error.message);
  }
});

const deleteClinic = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { clinicId, doctorId } = req.body;

    if (!doctorId || !clinicId) {
      return res
        .status(400)
        .json(ApiResponse(400, {}, "Please provide all the ids"));
    }

    // Check if id is a valid ObjectId
    if (
      !mongoose.Types.ObjectId.isValid(clinicId) ||
      !mongoose.Types.ObjectId.isValid(doctorId)
    ) {
      return res.status(400).json(ApiResponse(400, {}, "Invalid ObjectId"));
    }

    // Update all doctors by removing the clinicId from their clinics array
    const updatedDoctor = await Doctor.updateOne(
      { _id: doctorId },
      { $pull: { "profile.clinics": clinicId } }
    );

    if (updatedDoctor.modifiedCount === 0) {
      return res
        .status(404)
        .json(
          ApiResponse(404, {}, "Clinic linked to doctor could not be deleted")
        );
    }

    const updatedClinic = await Clinic.updateOne(
      {
        _id: clinicId,
      },
      { $pull: { userDoctor: { docID: doctorId } } }
    );

    if (updatedClinic.modifiedCount === 0) {
      return res
        .status(404)
        .json(
          ApiResponse(404, {}, "Doctor linked to clinic could not be deleted")
        );
    }

    // Fetch updated clinic
    const clinic = await Clinic.findById(clinicId);

    if (!clinic) {
      return res.status(404).json(ApiResponse(404, {}, "Clinic not found"));
    }

    // If userDoctor length is zero, set isActive to false
    if (clinic.userDoctor.length === 0) {
      const updateClinic = await Clinic.updateOne(
        { _id: clinicId },
        { isActive: false }
      );

      if (!updateClinic) {
        return res
          .status(404)
          .json(ApiResponse(404, {}, "Clinic cannot be made inactive"));
      }
    }

    return res
      .status(200)
      .json(ApiResponse(200, {}, "Clinic deleted successfully"));
  } catch (error: any) {
    throw ApiError(500, error.message);
  }
});

export {
  getPatientList,
  createPatient,
  createAppointment,
  editSettings,
  createDoctor,
  getConditions,
  getMedicationDetails,
  createRx,
  createReceptionist,
  updateReceptionist,
  deleteReceptionist,
  getReceptionist,
  getAllReceptionist,
  getMedicines,
  createClinic,
  updateClinic,
  deleteClinic,
};
