import { Logger, createLogger, format, transports } from "winston";

const { combine, timestamp, printf, colorize } = format;

const myFormat = printf(({ level, message, timestamp }) => {
  return `${level} ${timestamp} ${message}`;
});

const devLogger = (): Logger => {
  return createLogger({
    level: "info",
    format: combine(colorize(), timestamp(), myFormat),
    transports: [
      new transports.Console(),
      new transports.File({
        filename: "devInfo.log",
        dirname: "./src/logs",
        level: "info",
      }),
      new transports.File({
        filename: "devError.log",
        dirname: "./src/logs",
        level: "error",
      }),
    ],
  });
};

export default devLogger;
