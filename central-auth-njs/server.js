const swaggerUi = require("swagger-ui-express");
const swaggerJSDoc = require("swagger-jsdoc");

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
require("dotenv").config();

const app = express();

// Set up CORS
let corsOptions = {
  origin: ["http://localhost:3001", "https://dev.auth.aasa.ai"],
};
app.use(cors(corsOptions));

// Parse requests
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware for error handling
app.use(morgan("dev"));

// Connect to MongoDB
const db = require("./app/models");
db.mongoose
  .connect(`${process.env.MONGO_URI}`, {})
  .then(() => {
    console.log("Successfully connected to MongoDB.");
  })
  .catch((err) => {
    console.error("Connection error", err);
  });

// Swagger API configuration
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "AASA UMEED HEALTH",
      version: "1.0.0",
      description: "Central authentication for AASA UMEED HEALTH",
    },
    servers: [
      { url: "http://localhost:3001" },
      { url: "https://dev.auth.aasa.ai" },
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
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  // Specify the path to your API routes
  apis: ["./app/routes/*.js"],
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

// Include routes
require("./app/routes/auth.routes")(app);

// Serve Swagger UI
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Set port and start server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
