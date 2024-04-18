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
exports.WhatsappfileService = exports.fileSender = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const handlebars_1 = __importDefault(require("handlebars"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const axios_1 = __importDefault(require("axios"));
const fileSender = (user, pdfAttachment) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    const fromEmailAddress = process.env.FROM_EMAIL;
    const smtpHost = (_a = process.env.SMTP_HOST) !== null && _a !== void 0 ? _a : "";
    const smtpPort = parseInt((_b = process.env.SMTP_PORT) !== null && _b !== void 0 ? _b : "587", 10);
    const smtpUser = (_c = process.env.SMTP_USER) !== null && _c !== void 0 ? _c : "";
    const smtpPassword = (_d = process.env.SMTP_PASSWORD) !== null && _d !== void 0 ? _d : "";
    console.log(fromEmailAddress, smtpHost, smtpPort, smtpUser, smtpPassword);
    try {
        const smtpTransport = nodemailer_1.default.createTransport({
            host: smtpHost,
            port: smtpPort,
            auth: {
                user: smtpUser,
                pass: smtpPassword,
            },
        });
        const name = user.name;
        const email = user.email;
        const templateData = {
            email,
            name,
            unsubscribeLink: ``, // Include the email parameter
        };
        const templatePath = path_1.default.join(__dirname, "../constants/sendMailTemplate.html");
        const source = fs_1.default.readFileSync(templatePath, { encoding: "utf-8" });
        const template = handlebars_1.default.compile(source);
        const html = template(templateData);
        const updatedData = {
            to: email,
            html,
            from: `AASA APP ${fromEmailAddress}`,
            subject: "Patient Rx Information",
            headers: {
                "List-Unsubscribe": `<${templateData.unsubscribeLink}>`,
            },
            attachments: [
                {
                    filename: pdfAttachment.originalname,
                    content: pdfAttachment.buffer.toString("base64"),
                    encoding: "base64",
                },
            ],
        };
        const rxMail = yield smtpTransport.sendMail(updatedData);
        if (!rxMail) {
            console.log(rxMail);
            throw new Error("Rx could not be sent");
        }
        return rxMail;
    }
    catch (error) {
        // Assuming ApiError is a custom error class
        throw new Error(error.message);
    }
});
exports.fileSender = fileSender;
const WhatsappfileService = (user, s3File) => __awaiter(void 0, void 0, void 0, function* () {
    var _e;
    try {
        console.log(s3File);
        const campaignData = {
            apiKey: process.env.SENSY_API_KEY,
            campaignName: "test campaign",
            destination: `${user.phone.countryCode}${user.phone.phoneNumber}`,
            userName: "Umeed Health",
            templateParams: [
                `${user.name}`, // patient Name
                `${user.doctorName}`, // doctor Name
            ],
            source: "new-landing-page form",
            media: {
                url: `${s3File[0].Location}`, // Location
                filename: `${user.name}'s Prescription.pdf`,
            },
            buttons: [],
            carouselCards: [],
            location: {},
        };
        console.log((_e = campaignData.media) === null || _e === void 0 ? void 0 : _e.url);
        const response = yield axios_1.default.post("https://backend.aisensy.com/campaign/t1/api/v2", campaignData);
        console.log(response.data);
        return response.data;
    }
    catch (error) {
        throw new Error(error.message);
    }
});
exports.WhatsappfileService = WhatsappfileService;
