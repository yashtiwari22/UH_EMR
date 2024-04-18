"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ApiError = (statusCode, message = "Something went wrong", errors = [], stack = "") => {
    return {
        statusCode,
        message,
        errors,
        stack: stack || new Error().stack || "",
        data: null,
        success: false,
    };
};
exports.default = ApiError;
