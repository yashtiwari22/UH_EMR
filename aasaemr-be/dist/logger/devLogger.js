"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const winston_1 = require("winston");
const { combine, timestamp, printf, colorize } = winston_1.format;
const myFormat = printf(({ level, message, timestamp }) => {
    return `${level} ${timestamp} ${message}`;
});
const devLogger = () => {
    return (0, winston_1.createLogger)({
        level: "info",
        format: combine(colorize(), timestamp(), myFormat),
        transports: [
            new winston_1.transports.Console(),
            new winston_1.transports.File({
                filename: "devInfo.log",
                dirname: "./src/logs",
                level: "info",
            }),
            new winston_1.transports.File({
                filename: "devError.log",
                dirname: "./src/logs",
                level: "error",
            }),
        ],
    });
};
exports.default = devLogger;
