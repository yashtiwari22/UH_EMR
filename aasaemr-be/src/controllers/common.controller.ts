import asyncHandler from "../utils/asyncHandler";
import { Doctor } from "../models/doctor.model";
import { Request, Response } from "express";
import logger from "../logger";
import { ObjectId } from "mongodb";
import AppointmentModel, {
  Appointment,
  AppointmentStatus,
} from "../models/appointment.model";
import PatientModel, { Patient } from "../models/patient.model";
import Medicine from "../models/medicine.model";
import csvtojson from "csvtojson";
import { UserRequest } from "../middlewares/authJwt";
import { Receptionist } from "../models/receptionist.model";
import { Clinic } from "../models/clinic.model";
import { fileSender, WhatsappfileService } from "../utils/sendFile";
import { Rx } from "../models/rx.model";
import ApiError from "../utils/apiError";
import ApiResponse from "../utils/apiResponse";
import { s3upload, s3uploadWithWhatsapp } from "../utils/s3Service";
import mongoose from "mongoose";
import { Dropdown } from "../models/dropdown.model";

interface AppointmentListResponse {
  metaData: {
    count: number;
    totalPages: number;
    pageNumber: number;
  };
  data: AppointmentModel[];
}

const getUserDetails = asyncHandler(async (req: UserRequest, res: Response) => {
  try {
    const user = req.user;

    console.log(user?.user.role.roleName);

    const role = user?.user.role.roleName;

    if (role === "doctor") {
      const result = await Doctor.findById(user?.user._id);
      if (!result) {
        return res.status(200).json(ApiResponse(200, {}, "Doctor not found"));
      } else {
        if (
          result?.profile?.userReceptionist &&
          result.profile.userReceptionist.length > 0
        ) {
          await result.populate("profile.userReceptionist");
        }
        return res
          .status(200)
          .json(
            ApiResponse(
              200,
              { ...result.toObject(), role: user?.user.role },
              "User Doctor retrieved successfully"
            )
          );
      }
    } else if (role === "receptionist") {
      const result = await Receptionist.findById(user?.user._id)
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
          .json(ApiResponse(200, {}, "Receptionist not found"));
      } else {
        return res
          .status(200)
          .json(
            ApiResponse(
              200,
              { ...result, role: user?.user.role },
              "User Receptionist retrieved successfully"
            )
          );
      }
    } else if (role === "admin") {
      return res.status(200).json(ApiResponse(200, {}, "User Admin"));
    } else {
      return res.status(404).json(ApiResponse(404, {}, "No such role"));
    }
  } catch (error: any) {
    throw ApiError(500, error.message);
  }
});

// get Appointments

const getAppointments = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { doctorId, clinicIds, date } = req.body;
    const search = req.query.search || "";
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 10;

    // Validate input
    if (
      !doctorId ||
      !clinicIds ||
      !Array.isArray(clinicIds) ||
      clinicIds.length === 0
    ) {
      return res.status(400).json(ApiResponse(400, {}, "Invalid input data"));
    }

    const queryDate: Date = date ? new Date(date) : new Date();

    // Determine current time and date
    const currentDate: Date = new Date();
    const currentTime: number = currentDate.getTime();

    // Ensure appointments are canceled if their date has passed
    const cancelPreviousPendingAppointment = await Appointment.updateMany(
      {
        userDoctor: doctorId,
        clinic: { $in: clinicIds },
        "status.appointmentStatus": AppointmentStatus.PENDING,
        dateTime: { $lt: currentDate },
      },
      { $set: { "status.appointmentStatus": AppointmentStatus.CANCELLED } }
    );

    // Find appointments based on conditions
    const appointments = await Appointment.find({
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
    let previousAppointments: any[] = [];
    let upcomingAppointments: any[] = [];

    appointments.forEach((appointment) => {
      const appointmentDateTime = new Date(appointment.dateTime);

      if (
        appointment.status.appointmentStatus === AppointmentStatus.DONE ||
        appointment.status.appointmentStatus === AppointmentStatus.CANCELLED
      ) {
        previousAppointments.push(appointment);
      } else {
        const appointmentTime: number = appointmentDateTime.getTime();

        if (queryDate.toDateString() === currentDate.toDateString()) {
          if (appointmentTime < currentTime) {
            previousAppointments.push(appointment);
          } else {
            upcomingAppointments.push(appointment);
          }
        } else {
          if (appointmentDateTime < queryDate) {
            previousAppointments.push(appointment);
          } else {
            upcomingAppointments.push(appointment);
          }
        }
      }
    });

    // Filter appointments based on search query
    if (search) {
      previousAppointments = previousAppointments.filter(
        (appointment) => appointment.userPatient !== null
      );
      upcomingAppointments = upcomingAppointments.filter(
        (appointment) => appointment.userPatient !== null
      );
    }

    // Sort appointments based on dateTime
    previousAppointments.sort(
      (a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime()
    );
    upcomingAppointments.sort(
      (a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime()
    );

    // Pagination
    const totalPreviousAppointments: number = previousAppointments.length;
    const totalUpcomingAppointments: number = upcomingAppointments.length;

    const totalPagesPrevious: number = Math.ceil(
      totalPreviousAppointments / pageSize
    );
    const totalPagesUpcoming: number = Math.ceil(
      totalUpcomingAppointments / pageSize
    );

    const paginatedPreviousAppointments: any[] = previousAppointments.slice(
      (page - 1) * pageSize,
      page * pageSize
    );

    const paginatedUpcomingAppointments: any[] = upcomingAppointments.slice(
      (page - 1) * pageSize,
      page * pageSize
    );
    return res.status(200).json(
      ApiResponse(
        200,
        {
          previous: paginatedPreviousAppointments,
          upcoming: paginatedUpcomingAppointments,
          metadata: {
            totalPreviousAppointments,
            totalUpcomingAppointments,
            page,
            totalPagesPrevious,
            totalPagesUpcoming,
          },
        },
        "Appointments list received successfully"
      )
    );
  } catch (error: any) {
    throw ApiError(500, error.message);
  }
});

const getDateAppointments = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      const { doctorId, clinicIds, date } = req.body;
      const search = req.query.search || "";
      const page = parseInt(req.query.page as string) || 1;
      const pageSize = parseInt(req.query.pageSize as string) || 10;

      if (!date) {
        return res.status(400).json(ApiResponse(400, {}, "Date not selected"));
      }

      const searchDate = new Date(date);
      searchDate.setHours(0, 0, 0, 0); // Set time to start of the day

      let appointments = await Appointment.find({
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
        appointments = appointments.filter(
          (appointment) => appointment.userPatient !== null
        );
      }

      // Sort appointments based on dateTime
      appointments.sort(
        (a, b) =>
          new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime()
      );

      // Pagination
      const totalAppointments: number = appointments.length;

      const totalPages: number = Math.ceil(totalAppointments / pageSize);

      const paginatedAppointments: any[] = appointments.slice(
        (page - 1) * pageSize,
        page * pageSize
      );

      if (paginatedAppointments.length === 0) {
        return res.status(200).json(
          ApiResponse(
            200,
            {
              appointments: paginatedAppointments,
              metadata: {
                totalAppointments,
                page,
                totalPages,
              },
            },
            "No appointments found for specified date"
          )
        );
      }

      return res.status(200).json(
        ApiResponse(
          200,
          {
            appointments: paginatedAppointments,
            metadata: {
              totalAppointments,
              page,
              totalPages,
            },
          },
          "Appointments for the specified date retrieved successfully"
        )
      );
    } catch (error: any) {
      throw ApiError(500, error.message);
    }
  }
);

// this is the controller for updating the patient details

const editPatientDetails = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const updatedData = req.body;
    // Check if id is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json(ApiResponse(400, {}, "Invalid ObjectId"));
    } else if (updatedData.phone && updatedData.phone.phoneNumber.length < 10) {
      return res.status(400).json(ApiResponse(400, {}, "Invalid Phone Number"));
    }

    const updatedPatient = await Patient.findByIdAndUpdate(
      id,
      { $set: updatedData },
      { new: true }
    );

    console.log(updatedPatient);

    if (!updatedPatient) {
      return res
        .status(404)
        .json(ApiResponse(404, {}, "Patient details could not be updated"));
    }

    logger?.info("Patient details updated successfully");

    return res
      .status(200)
      .json(
        ApiResponse(200, updatedPatient, "Patient details updated successfully")
      );
  } catch (error: any) {
    throw ApiError(500, error.message);
  }
});

const uploadMedicineDetails = async (req: Request, res: Response) => {
  // Read Excel File to Json Data
  try {
    let medicinelist: any[] = [];
    const uniqueMedicines: Set<string> = new Set();
    await csvtojson()
      .fromFile(req.file?.path as string)
      .then(async (result) => {
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

        const medicineSavedData = await Medicine.insertMany(medicinelist);

        // Response with only 20 items
        const limitedMedicineData = medicineSavedData.slice(0, 20);

        return res
          .status(200)
          .json(
            ApiResponse(
              200,
              limitedMedicineData,
              "Medicine details added successfully successfully"
            )
          );
      });
  } catch (error: any) {
    throw ApiError(500, error.message);
  }
};

// appointments
const editAppointments = async (req: Request, res: Response) => {
  try {
    const { id, ...fieldsToUpdate } = req.body;
    // Check if id is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json(ApiResponse(400, {}, "Invalid ObjectId"));
    }

    if (!id) {
      return res
        .status(404)
        .json(ApiResponse(404, {}, "Appointment not found"));
    }

    // Update specific fields using $set operator
    const appointment = await Appointment.findByIdAndUpdate(
      id,
      { $set: fieldsToUpdate },
      { new: true }
    );

    if (!appointment) {
      return res
        .status(404)
        .json(ApiResponse(404, {}, "Appointment not updated"));
    }

    return res
      .status(200)
      .json(ApiResponse(200, appointment, "Appointment updated successfully"));
  } catch (error: any) {
    throw ApiError(500, error.message);
  }
};

const getPatient = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { patientId } = req.body;
    // Find the patient based on the extracted patient ID

    // Check if id is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(patientId)) {
      return res.status(400).json(ApiResponse(400, {}, "Invalid ObjectId"));
    }

    if (!patientId) {
      return res.status(404).json(ApiResponse(404, {}, "Patient id not found"));
    }
    const patient = await Patient.findById(patientId);

    if (!patient) {
      return res.status(200).json(ApiResponse(200, {}, "Patient not found"));
    }

    // Return the patient details
    return res
      .status(200)
      .json(ApiResponse(200, patient, "Patient recieved successfully"));
  } catch (error: any) {
    throw ApiError(500, error.message);
  }
});

const uploadImage = asyncHandler(async (req: Request, res: Response) => {
  try {
    const files: Express.Multer.File[] = Object.values(req.files!);
    console.log(req.files);

    if (!files || files.length === 0) {
      return res.status(404).json(ApiResponse(404, {}, "No files provided"));
    }

    const result = await s3upload(files);

    return res
      .status(200)
      .json(ApiResponse(200, result, "Image uploaded successfully"));
  } catch (error: any) {
    throw ApiError(500, error.message);
  }
});

const getClinics = asyncHandler(async (req: UserRequest, res: Response) => {
  try {
    const user = req.user;
    let clinics;
    if (user?.user.role.roleName === "doctor") {
      console.log(user?.user._id);
      clinics = await Clinic.find({
        userDoctor: { $elemMatch: { docID: user?.user._id } },
      });
      console.log(clinics);
      if (clinics.length === 0) {
        return res
          .status(200)
          .json(
            ApiResponse(200, [], "No clinics found for the specified doctor")
          );
      }
    } else if (user?.user.role.roleName === "receptionist") {
      console.log(user?.user._id);
      clinics = await Clinic.find({
        $and: [
          {
            userReceptionist: {
              $elemMatch: { receptionistID: user?.user._id },
            },
          },
          { isActive: true },
        ],
      });

      console.log(clinics);
      if (clinics.length === 0) {
        return res
          .status(200)
          .json(
            ApiResponse(
              200,
              [],
              "No clinics found for the specified receptionist"
            )
          );
      }
    } else {
      return res
        .status(200)
        .json(ApiResponse(200, [], "User is neither receptionist nor doctor"));
    }

    return res
      .status(200)
      .json(ApiResponse(200, clinics, "Clinics recieved successfully"));
  } catch (error: any) {
    throw ApiError(500, error.message);
  }
});

const sendRxToPatient = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { name, email, phoneNumber, countryCode, doctorName } = req.body;
    const pdfAttachment: Express.Multer.File[] = Object.values(req.files!);

    const phone = {
      phoneNumber: phoneNumber,
      countryCode: countryCode,
    };

    if (
      !name ||
      !email ||
      !phone ||
      !doctorName ||
      !pdfAttachment ||
      pdfAttachment.length === 0
    ) {
      return res.status(404).json(ApiResponse(404, {}, "Field is required"));
    }

    const uploadedFile = pdfAttachment[0];

    if (uploadedFile.mimetype !== "application/pdf") {
      return res
        .status(400)
        .json(ApiResponse(400, {}, "Uploaded file is not a PDF"));
    }

    const user = { name, email, phone, doctorName };

    const result = await s3uploadWithWhatsapp(pdfAttachment);

    if (!result) {
      return res
        .status(400)
        .json(
          ApiResponse(400, {}, "Rx could not be uploaded to the s3 server")
        );
    }

    const file = await fileSender(user, pdfAttachment[0]);

    console.log(file);

    if (!file) {
      return res
        .status(400)
        .json(
          ApiResponse(400, {}, "Rx could not be uploaded to the s3 server")
        );
    }

    let whatsappService: any;
    if (file) {
      whatsappService = await WhatsappfileService(user, result);

      if (!whatsappService) {
        return res
          .status(400)
          .json(ApiResponse(400, {}, "Failed to send Rx via WhatsApp"));
      }
    }

    return res.status(200).json(ApiResponse(200, file, "Rx sent successfully"));
  } catch (error: any) {
    throw ApiError(500, error.message);
  }
});

const getPatientAppointments = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      const page = parseInt(req.query.page as string) || 1; // Page number, default is 1
      const limit = parseInt(req.query.limit as string) || 10; // Number of items per page, default is 10

      const startIndex = (page - 1) * limit;
      const { patientId } = req.params;

      // Check if id is a valid ObjectId
      if (!mongoose.Types.ObjectId.isValid(patientId)) {
        return res.status(400).json(ApiResponse(400, {}, "Invalid ObjectId"));
      }

      if (!patientId) {
        return res
          .status(403)
          .json(ApiResponse(403, {}, "No patient id provided"));
      }

      const query = { userPatient: patientId };

      const totalPatientAppointments = await Appointment.countDocuments(query);
      const totalPages = Math.ceil(totalPatientAppointments / limit);

      const appointments = await Appointment.find(query)
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
          .json(ApiResponse(200, {}, "No appointments found"));
      }
      return res.status(200).json(
        ApiResponse(
          200,
          {
            success: true,
            currentPage: page,
            totalPages: totalPages,
            totalPatientAppointments: totalPatientAppointments,
            data: appointments,
          },
          "Appointments for the patient retrieved successfully"
        )
      );
    } catch (error: any) {
      throw ApiError(500, error.message);
    }
  }
);
const getAppointmentRx = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check if id is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json(ApiResponse(400, {}, "Invalid ObjectId"));
    }

    const rx = await Rx.findOne({ appointmentId: id });

    if (!rx) {
      return res
        .status(200)
        .json(
          ApiResponse(
            200,
            {},
            "No such Rx created for the provided appointment"
          )
        );
    }

    return res
      .status(200)
      .json(ApiResponse(200, rx, "Rx retrieved successfully"));
  } catch (error: any) {
    throw ApiError(500, error.message);
  }
});

const updateDropdown = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { medicineType, intake, amount, foodTime } = req.body;

    const updatedDropdown = await Dropdown.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true }
    );

    if (!updatedDropdown) {
      return res
        .status(404)
        .json(ApiResponse(404, {}, "Dropdown can't be updated"));
    }

    return res.status(200).json(ApiResponse(200, {}, "Dropdown updated"));
  } catch (error: any) {
    throw ApiError(500, error.message);
  }
});

const getDropdown = asyncHandler(async (req: Request, res: Response) => {
  try {
    const dropdown = await Dropdown.find({});

    if (dropdown.length === 0) {
      return res.status(200).json(ApiResponse(200, {}, "No such dropdown"));
    }

    return res
      .status(200)
      .json(ApiResponse(200, dropdown[0], "Dropdown received successfully"));
  } catch (error: any) {
    throw ApiError(500, error.message);
  }
});

const addDropdown = asyncHandler(async (req: Request, res: Response) => {
  try {
    const dropdown = await Dropdown.create(req.body);

    if (!dropdown) {
      return res.status(200).json(ApiResponse(200, {}, "Dropdown not added"));
    }

    return res
      .status(200)
      .json(ApiResponse(200, dropdown, "Dropdown created successfully"));
  } catch (error: any) {
    throw ApiError(500, error.message);
  }
});

export {
  getAppointments,
  getDateAppointments,
  getUserDetails,
  editPatientDetails,
  uploadMedicineDetails,
  editAppointments,
  getPatient,
  getClinics,
  uploadImage,
  sendRxToPatient,
  getPatientAppointments,
  getAppointmentRx,
  updateDropdown,
  getDropdown,
  addDropdown,
};
