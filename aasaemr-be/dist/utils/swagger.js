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
const swaggerAutogen = require("swagger-autogen"); // Assuming correct installation
const fs = require("fs");
const swaggerOptions = {
    info: {
        title: "AASA Umeed Backend API",
        version: "1.0.0",
        description: "API documentation for Umeed Backend",
    },
    servers: [
        {
            url: "http://localhost:3000/api/v1/aasa",
        },
        {
            url: "https://dev.be.aasa.ai/api/v1/aasa",
        },
    ],
    security: [
        {
            bearerAuth: [],
        },
    ],
    components: {
        securitySchemes: {
            bearerAuth: {
                type: "http",
                scheme: "bearer",
                bearerFormat: "JWT",
            },
        },
    },
};
const outputFile = "./routes/swagger-output.json";
// Assuming your endpoints are defined in multiple TypeScript files:
const endpointsFiles = [
    "./routes/doctorRoutes.ts",
    "./routes/receptionistRoutes.ts",
    "./routes/commonRoutes.ts",
];
const options = {
    openapi: "3.0.0", // Enable OpenAPI v3
};
const generateDocs = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Call swaggerAutogen with options as the first argument
        yield swaggerAutogen(options)(outputFile, endpointsFiles, swaggerOptions);
        console.log("Swagger documentation generated successfully!");
    }
    catch (error) {
        console.error("Error generating Swagger documentation:", error);
    }
});
// Optionally, export generateDocs for use in your application
exports.default = generateDocs;
