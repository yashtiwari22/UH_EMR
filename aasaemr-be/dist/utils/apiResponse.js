"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ApiResponse = (statusCode, data, message = "Success") => {
    return {
        statusCode,
        data,
        message,
        success: statusCode < 400,
    };
};
exports.default = ApiResponse;
