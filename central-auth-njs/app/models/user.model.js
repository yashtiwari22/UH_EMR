const mongoose = require("mongoose");
const roles = require("../constants/auth.constants.js");

const User = mongoose.model(
  "User",
  new mongoose.Schema({
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
    },
    email: {
      emailAddress: {
        type: String,
      },
      verified: {
        type: Boolean,
        default: false,
      },
    },
    phone: {
      phoneNumber: {
        type: String,
        required: true,
        minLength: 10,
      },
      countryCode: {
        type: String,
        required: true,
      },
      verified: {
        type: Boolean,
        default: false,
      },
    },
    role: {
      roleId: {
        type: mongoose.Schema.Types.ObjectId,
      },
      roleName: {
        type: String,
        enum: [roles.doctor, roles.receptionist],
        required: true,
      },
      moduleAccess: {
        type: [String],
        default: [],
      },
    },
  })
);

module.exports = User;
