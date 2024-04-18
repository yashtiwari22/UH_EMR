import asyncHandler from "../utils/asyncHandler";
import { Request, Response } from "express";
import ClinicModel, { Clinic } from "../models/clinic.model";
import logger from "../logger";
import { ObjectId } from "mongodb";
import ApiError from "../utils/apiError";
import ApiResponse from "../utils/apiResponse";

interface DoctorListResponse {
  metaData: {
    count: number;
    totalPages: number;
    pageNumber: number;
  };
  data: ClinicModel[];
}

const getDoctorList = asyncHandler(async (req: Request, res: Response) => {
  try {
    const receptionistObjectId = new ObjectId(req.params.id);
    const page = Number(req.query.page) || 1;
    const pageSize = Number(req.query.pageSize) || 10;

    const pipeline = [
      {
        $match: {
          receptionistID: { $in: [receptionistObjectId] },
        },
      },
      {
        $project: {
          _id: 0,
          userDoctor: 1,
        },
      },
      {
        $unwind: "$userDoctor",
      },
      {
        $facet: {
          metaData: [
            {
              $group: {
                _id: null,
                count: { $sum: 1 },
              },
            },
            {
              $project: {
                _id: 0,
                count: 1,
                totalPages: { $ceil: { $divide: ["$count", pageSize] } },
                pageNumber: page,
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
    const doctorList = await Clinic.aggregate(pipeline);

    // Check if the result array is empty
    if (!doctorList || doctorList.length === 0 || !doctorList[0]) {
      return res
        .status(200)
        .json(
          ApiResponse(
            200,
            {},
            "No doctors found with the given receptionist IDs."
          )
        );
    }

    let typedDoctorList: DoctorListResponse = {
      metaData: doctorList[0].metaData,
      data: doctorList[0].data as ClinicModel[],
    };

    typedDoctorList.metaData = {
      ...typedDoctorList.metaData,
      count: typedDoctorList.data.length,
    };

    if (typedDoctorList.metaData.count === 0) {
      return res
        .status(200)
        .json(ApiResponse(200, {}, "No such patient list found"));
    }

    logger?.info(
      "DoctorList with the required parameters received successfully"
    );

    return res
      .status(200)
      .json(
        ApiResponse(
          200,
          typedDoctorList,
          "DoctorList with the required parameters received successfully"
        )
      );
  } catch (error: any) {
    throw ApiError(500, error.message);
  }
});

export { getDoctorList };
