"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dbConnect = void 0;
const mongoose = require("mongoose");
require("dotenv").config();
const dbConnect = () => {
    mongoose
        .connect(process.env.MONGODB_URI, {})
        .then(() => {
        console.log("Database connected successfully");
    })
        .catch((err) => {
        console.log("db connection issue");
        console.log(err);
        process.exit(1);
    });
};
exports.dbConnect = dbConnect;
