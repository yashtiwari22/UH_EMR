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
exports.s3uploadWithWhatsapp = exports.s3upload = void 0;
const aws_sdk_1 = require("aws-sdk");
const uuid_1 = require("uuid");
const s3upload = (files) => __awaiter(void 0, void 0, void 0, function* () {
    const s3 = new aws_sdk_1.S3();
    // Ensure that process.env.AWS_BUCKET_NAME is defined
    if (!process.env.AWS_BUCKET_NAME) {
        throw new Error("AWS_BUCKET_NAME is not defined in the environment variables.");
    }
    try {
        const uploadPromises = files.map((file) => {
            const params = {
                Bucket: process.env.AWS_BUCKET_NAME,
                Key: `imageUpload/${(0, uuid_1.v4)()}-${file.originalname}`,
                Body: file.buffer,
            };
            return s3.upload(params).promise();
        });
        const results = yield Promise.all(uploadPromises);
        return results;
    }
    catch (error) {
        console.error("Error uploading to S3:", error);
        throw error;
    }
});
exports.s3upload = s3upload;
const s3uploadWithWhatsapp = (files) => __awaiter(void 0, void 0, void 0, function* () {
    const s3 = new aws_sdk_1.S3();
    // Ensure that process.env.AWS_BUCKET_NAME is defined
    if (!process.env.AWS_BUCKET_NAME) {
        throw new Error("AWS_BUCKET_NAME is not defined in the environment variables.");
    }
    try {
        const uploadPromises = files.map((file) => {
            const params = {
                Bucket: process.env.AWS_BUCKET_NAME,
                Key: `imageUpload/${(0, uuid_1.v4)()}-${file.originalname}`,
                Body: file.buffer,
                ContentType: "application/pdf",
            };
            return s3.upload(params).promise();
        });
        const results = yield Promise.all(uploadPromises);
        return results;
    }
    catch (error) {
        console.error("Error uploading to S3:", error);
        throw error;
    }
});
exports.s3uploadWithWhatsapp = s3uploadWithWhatsapp;
