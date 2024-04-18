"use strict";
require("dotenv").config();
module.exports = {
    secret: process.env.JWT_SECRET,
    // for testing purposes
    jwtExpiration: process.env.JWT_EXPIRATION
};
