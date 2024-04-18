import { Logger, createLogger, format, transports } from "winston";

const { combine, timestamp, label, printf } = format;

const myFormat = printf(({ level, message, timestamp }) => {
  return `${level} ${timestamp} ${message}`;
});

const productionLogger = (): Logger => {
  return createLogger({
    level: "info",
    format: combine(timestamp(), myFormat),
    transports: [
      new transports.File({ filename: "productionInfo.log", level: "info" }),
      new transports.File({ filename: "productionError.log", level: "error" }),
    ],
  });
};

export default productionLogger;
