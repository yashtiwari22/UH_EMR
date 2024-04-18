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
exports.verification = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv = require("dotenv");
const apiError_1 = __importDefault(require("../utils/apiError"));
const apiResponse_1 = __importDefault(require("../utils/apiResponse"));
dotenv.config();
const { TokenExpiredError } = jsonwebtoken_1.default;
const catchError = (err, res) => {
    if (err instanceof TokenExpiredError) {
        return res.status(400).json((0, apiResponse_1.default)(400, {}, "Token has expired"));
    }
    return res.status(400).json((0, apiResponse_1.default)(400, {}, "Token is not valid"));
};
const verification = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const token = (_a = req.header("Authorization")) === null || _a === void 0 ? void 0 : _a.replace("Bearer ", "");
        if (!token) {
            return res
                .status(401)
                .json((0, apiResponse_1.default)(401, {}, "No token, authorization denied"));
        }
        try {
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
            console.log(decoded, "hello");
            req.user = decoded;
            next();
        }
        catch (err) {
            catchError(err, res);
        }
    }
    catch (error) {
        throw (0, apiError_1.default)(500, error.message);
    }
});
exports.verification = verification;
