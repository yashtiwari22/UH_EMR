import productionLogger from "./productionLogger";
import devLogger from "./devLogger";
import { Logger } from "winston";

let logger: Logger | null = null;

if (process.env.NODE_ENV === "production") {
  logger = productionLogger();
}

if (process.env.NODE_ENV === "dev") {
  logger = devLogger();
}

export default logger;
