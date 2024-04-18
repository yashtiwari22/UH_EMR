"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const winston_1 = require("winston");
const { combine, timestamp, label, printf } = winston_1.format;
const myFormat = printf(({ level, message, timestamp }) => {
    return `${level} ${timestamp} ${message}`;
});
const productionLogger = () => {
    return (0, winston_1.createLogger)({
        level: "info",
        format: combine(timestamp(), myFormat),
        transports: [
            new winston_1.transports.File({ filename: "productionInfo.log", level: "info" }),
            new winston_1.transports.File({ filename: "productionError.log", level: "error" }),
        ],
    });
};
exports.default = productionLogger;
