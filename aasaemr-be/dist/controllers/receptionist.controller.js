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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDoctorList = void 0;
const asyncHandler_1 = __importDefault(require("../utils/asyncHandler"));
const clinic_model_1 = require("../models/clinic.model");
const logger_1 = __importDefault(require("../logger"));
const mongodb_1 = require("mongodb");
const apiError_1 = __importDefault(require("../utils/apiError"));
const apiResponse_1 = __importDefault(require("../utils/apiResponse"));
const getDoctorList = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const receptionistObjectId = new mongodb_1.ObjectId(req.params.id);
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
        const doctorList = yield clinic_model_1.Clinic.aggregate(pipeline);
        // Check if the result array is empty
        if (!doctorList || doctorList.length === 0 || !doctorList[0]) {
            return res
                .status(200)
                .json((0, apiResponse_1.default)(200, {}, "No doctors found with the given receptionist IDs."));
        }
        let typedDoctorList = {
            metaData: doctorList[0].metaData,
            data: doctorList[0].data,
        };
        typedDoctorList.metaData = Object.assign(Object.assign({}, typedDoctorList.metaData), { count: typedDoctorList.data.length });
        if (typedDoctorList.metaData.count === 0) {
            return res
                .status(200)
                .json((0, apiResponse_1.default)(200, {}, "No such patient list found"));
        }
        logger_1.default === null || logger_1.default === void 0 ? void 0 : logger_1.default.info("DoctorList with the required parameters received successfully");
        return res
            .status(200)
            .json((0, apiResponse_1.default)(200, typedDoctorList, "DoctorList with the required parameters received successfully"));
    }
    catch (error) {
        throw (0, apiError_1.default)(500, error.message);
    }
}));
exports.getDoctorList = getDoctorList;
