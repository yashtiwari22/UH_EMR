import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
const dotenv = require("dotenv");
import { Types } from "mongoose";
import ApiError from "../utils/apiError";
import ApiResponse from "../utils/apiResponse";

dotenv.config();
const { TokenExpiredError } = jwt;

export interface UserListResponse {
  user: {
    _id: Types.ObjectId;
    firstName: string; // Required
    lastName: string; // Required
    email: {
      emailAddress: string; // Optional
      verified: boolean; // Default: false
    };
    phone: {
      phoneNumber: string; // Required (minLength: 10)
      countryCode: string; // Required
      verified: boolean; // Default: false
    };
    role: {
      roleId: string; // MongoDB ObjectId string
      roleName: string; // Enum: 'doctor' | 'receptionist' (Required)
      moduleAccess: string[]; // Default: []
    };
  };
}

export interface UserRequest extends Request {
  user?: UserListResponse;
}

const catchError = (err: any, res: Response) => {
  if (err instanceof TokenExpiredError) {
    return res.status(400).json(ApiResponse(400, {}, "Token has expired"));
  }

  return res.status(400).json(ApiResponse(400, {}, "Token is not valid"));
};

const verification = async (
  req: UserRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res
        .status(401)
        .json(ApiResponse(401, {}, "No token, authorization denied"));
    }

    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET as string
      ) as UserListResponse;
      console.log(decoded,"hello");

      req.user = decoded;
      next();
    } catch (err) {
      catchError(err, res);
    }
  } catch (error: any) {
    throw ApiError(500, error.message);
  }
};

export { verification };
