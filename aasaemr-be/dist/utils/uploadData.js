"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = exports.excelUploads = void 0;
const multer_1 = __importDefault(require("multer"));
const excelStorage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./public"); // file added to the public folder of the root directory
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    },
});
const storage = multer_1.default.memoryStorage();
const fileFilter = (req, file, cb) => {
    const allowedMimeTypes = ["image", "application"];
    const fileType = file.mimetype.split("/")[0];
    if (allowedMimeTypes.includes(fileType)) {
        cb(null, true);
    }
    else {
        cb(new multer_1.default.MulterError("LIMIT_UNEXPECTED_FILE"), false);
    }
};
const upload = (0, multer_1.default)({
    storage,
    fileFilter,
});
exports.upload = upload;
const excelUploads = (0, multer_1.default)({ storage: excelStorage });
exports.excelUploads = excelUploads;
