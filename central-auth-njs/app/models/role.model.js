const mongoose = require("mongoose");
const roles = require("../constants/auth.constants.js");

const Role = mongoose.model(
  "Role",
  new mongoose.Schema({
    roleName: {
      type: String,
      enum: [roles.doctor, roles.receptionist],
      required: true,
    },
    moduleAccess: {
      type: [String],
      default: [],
    },
  })
);

module.exports = Role;
