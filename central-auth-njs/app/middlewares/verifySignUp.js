const db = require("../models");
const ROLES = db.ROLES;
const User = db.user;
const ApiResponse = require("../utils/ApiResponse.js");
const ApiError = require("../utils/ApiError.js");
const asyncHandler = require("../utils/asyncHandler.js");

checkDuplicatePhoneOrEmail = asyncHandler(async (req, res, next) => {
  try {
    // phoneNumber
    const userByPhone = await User.findOne({
      "phone.phoneNumber": req.body.phone.phoneNumber,
    });
    if (userByPhone) {
      return res.status(400).json(
        new ApiResponse(400, {}, "Failed! Phone Number is already in use!")
      );
    }

    // Email
    const userByEmail = await User.findOne({
      "email.emailAddress": req.body.email.emailAddress,
    });
    if (userByEmail) {
      return res.status(400).json(
        new ApiResponse(400, {}, "Failed! Email is already in use!")
      );
    }
    next();
  } catch (err) {
    throw new ApiError(500, err);
  }
});

checkRolesExisted = asyncHandler(async (req, res, next) => {
  try {
    if (req.body.roles) {
      for (let i = 0; i < req.body.roles.length; i++) {
        if (!ROLES.includes(req.body.roles[i])) {
          return res.status(400).json(
            new ApiResponse(
              400,
              {},
              `Failed! Role ${req.body.roles[i]} does not exist!`
            )
          );
        }
      }
    }
    next();
  } catch (error) {
    throw new ApiError(500, error);
  }
});

const verifySignUp = {
  checkDuplicatePhoneOrEmail,
  checkRolesExisted,
};

module.exports = verifySignUp;
