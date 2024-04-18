const config = require("../config/auth.config");
const db = require("../models");
const { user: User, role: Role } = db;
const jwt = require("jsonwebtoken");
const ApiResponse = require("../utils/ApiResponse.js");
const ApiError = require("../utils/ApiError.js");
const asyncHandler = require("../utils/asyncHandler.js");
const { generateOtp, isOtpValid } = require("../constants/auth.constants.js");
const mongoose = require("mongoose");

const { TokenExpiredError } = jwt;

const catchError = (err, res) => {
  if (err instanceof TokenExpiredError) {
    return res
      .status(403)
      .json(
        new ApiResponse(
          403,
          {},
          "Refresh token was expired. Please make a new signin request"
        )
      );
  }

  return res.status(401).json(new ApiResponse(401, {}, "Unauthorized!"));
};

//sign up
exports.signup = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, phone, role } = req.body;

  try {
    //check if user already present
    const user = new User({
      firstName: firstName,
      email: email,
      phone: phone,
      lastName: lastName,
      emailVerified: false,
      phoneVerified: false,
      role: role,
    });

    const role_access = new Role({
      roleName: role.roleName,
      moduleAccess: role.moduleAccess,
    });

    const role_access_saved = await role_access.save();
    if (!role_access_saved) {
      return res
        .status(401)
        .json(new ApiResponse(401, user, "Problem in saving role to database"));
    }
    const user_saved = await user.save();
    if (!user_saved) {
      return res
        .status(401)
        .json(new ApiResponse(401, user, "Problem in User signup"));
    }

    return res
      .status(200)
      .json(new ApiResponse(200, user, "User was registered successfully"));
  } catch (error) {
    throw new ApiError(500, error);
  }
});

exports.deleteUser = asyncHandler(async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json(ApiResponse(400, {}, "Invalid ObjectId"));
    }

    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      return res
        .status(404)
        .json(new ApiResponse(404, {}, "User could not be deleted"));
    }
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "User deleted successfully"));
  } catch (error) {
    throw new ApiError(500, error);
  }
});

//sign in
exports.signin = asyncHandler(async (req, res) => {
  let query = {};

  req.body.email
    ? (query = {
        "email.emailAddress": req.body.email,
      })
    : (query = {
        "phone.phoneNumber": req.body.phone.phoneNumber,
      });

  try {
    const user = await User.findOne(query);
    if (!user) {
      return res.status(404).json(new ApiResponse(404, user, "User not found"));
    }

    //check verification of email and phone number
    if (query["email.emailAddress"] && !user.email.verified) {
      return res
        .status(403)
        .json(new ApiResponse(403, {}, "Email is not verified!"));
    }
    //  else if (query["phone.phoneNumber"] && !user.phone.verified) {
    //   return res.json(
    //     new ApiResponse(403, {}, "Phone Number is not verified!")
    //   );
    // }
    else {
      const otpIsValid = await isOtpValid(user, req.body.otp, query);

      if (otpIsValid == "invalid") {
        res.status(401).json(
          new ApiResponse(
            401,
            {
              accessToken: null,
            },
            "Invalid OTP!"
          )
        );
      } else {
        let token = jwt.sign({ user }, config.access_secret, {
          expiresIn: config.jwtExpiration,
        });

        let refreshToken = jwt.sign({ user }, config.refresh_secret, {
          expiresIn: config.jwtRefreshExpiration,
        });

        return res.status(200).json(
          new ApiResponse(
            200,
            {
              firstName: user.firstName,
              lastName: user.lastName,
              email: user.email,
              phone: user.phone,
              role: user.role,
              accessToken: token,
              refreshToken: refreshToken,
            },
            "User Signed In"
          )
        );
      }
    }
  } catch (error) {
    throw new ApiError(500, error);
  }
});

//refresh token
exports.refreshToken = asyncHandler(async (req, res) => {
  const { token: refreshToken } = req.body;
  if (refreshToken == null) {
    return res
      .status(403)
      .json(new ApiResponse(403, {}, "Refresh token is required"));
  }

  try {
    jwt.verify(refreshToken, config.refresh_secret, (err, decoded) => {
      const user = decoded.user;
      if (err) {
        return catchError(err, res);
      }
      let newAccessToken = jwt.sign({ user }, config.access_secret, {
        expiresIn: config.jwtExpiration,
      });

      return res.status(200).json(
        new ApiResponse(
          200,
          {
            accessToken: newAccessToken,
          },
          "Refreshed token"
        )
      );
    });
  } catch (err) {
    throw new ApiError(500, err);
  }
});

//otp
exports.sendOtp = asyncHandler(async (req, res) => {
  var query = {};

  req.body.email
    ? (query = {
        "email.emailAddress": req.body.email.emailAddress,
      })
    : (query = {
        "phone.phoneNumber": req.body.phone.phoneNumber,
      });

  console.log(query);

  try {
    const user = await User.findOne(query);
    if (!user) {
      return res.status(404).json(new ApiResponse(404, user, "User not found"));
    }

    console.log("user found", user);
    //check verification of email and phone number
    if (query["email.emailAddress"] && !user.email.verified) {
      return res
        .status(403)
        .json(new ApiResponse(403, {}, "Email is not verified!"));
    }

    generateOtp(user, res, query);
  } catch (error) {
    throw new ApiError(500, error);
  }
});

//verify email
exports.verifyEmail = asyncHandler(async (req, res) => {
  var { otp } = req.body;

  try {
    const user = await User.findOne({
      "email.emailAddress": req.body.email.emailAddress,
    });
    console.log(user);
    var otpResponse = await isOtpValid(user, otp, res);
    if (otpResponse === "valid") {
      user.email.verified = true;
      user.save();
      return res
        .status(200)
        .json(new ApiResponse(200, {}, "Email verified successfully!"));
    } else {
      throw new ApiError(401, "Invalid OTP! " + JSON.stringify(otpResponse));
    }
  } catch (error) {
    throw new ApiError(500, error);
  }
});

//verify phone
exports.verifyPhone = asyncHandler(async (req, res) => {
  var { phone, otp } = req.body;

  console.log(phone);

  try {
    const user = await User.findOne({
      "phone.phoneNumber": req.body.phone.phoneNumber,
    });
    console.log(user);
    var otpResponse = await isOtpValid(user, otp, res);
    if (otpResponse == "valid") {
      user.phone.verified = true;
      user.save();
      return res
        .status(200)
        .json(new ApiResponse(200, {}, "Phone verified successfully!"));
    } else {
      throw new ApiError(401, "Invalid Otp");
    }
  } catch (error) {
    throw new ApiError(500, error);
  }
});

//send verification otp
exports.verifyOtp = asyncHandler(async (req, res) => {
  const { otp } = req.body;
  try {
    const otpDb = await Otp.findOne({ otp: otp });
    console.log(otpDb);

    if (!otpDb) {
      res.status(404).json(new ApiResponse(404, {}, "Otp not found"));
    }
    //check otp is expired or not
    if (isDateBeforeNow(otpDb.expiry)) {
      await Otp.deleteMany({ userId: user._id });
      res.status(404).json(new ApiResponse(404, {}, "Otp expired"));
    }

    if (otpDb.otp === otp) {
      await Otp.deleteMany({ userId: user._id });

      return res.status(200).json(new ApiResponse(200, {}, "Otp is Valid"));
    } else {
      return res.status(404).json(new ApiResponse(404, {}, "Otp is Invalid"));
    }
  } catch (err) {
    throw new ApiError(500, err);
  }
});

//update user profile
exports.updateUserProfile = asyncHandler(async (req, res) => {
  const userId = req.params.id;
  console.log(userId);
  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json(new ApiResponse(404, user, "User not found"));
    }

    // Update user fields
    user.firstName = req.body.firstName || user.firstName;
    user.lastName = req.body.lastName || user.lastName;

    if (req.body.email) {
      user.email.emailAddress =
        req.body.email.emailAddress || user.email.emailAddress;
    }

    if (req.body.phone) {
      user.phone.phoneNumber =
        req.body.phone.phoneNumber || user.phone.phoneNumber;
      user.phone.countryCode =
        req.body.phone.countryCode || user.phone.countryCode;
    }

    if (req.body.role) {
      user.role.roleName = req.body.role.roleName || user.role.roleName;
      user.role.moduleAccess =
        req.body.role.moduleAccess || user.role.moduleAccess;
    }

    // Save the updated user
    const updatedUser = await user.save();

    return res
      .status(200)
      .json(new ApiResponse(200, updatedUser, "Updated Profile Successfully"));
  } catch (error) {
    throw new ApiError(500, error);
  }
});

exports.checkIfUserAlreadyExists = asyncHandler(async (req, res) => {
  req.body.email
    ? (query = {
        "email.emailAddress": req.body.email,
      })
    : (query = {
        "phone.phoneNumber": req.body.phone.phoneNumber,
      });

  try {
    const user = await User.findOne(query);

    if (user) {
      const profile = {
        name: `${user.firstName}`,
        email: user.email.emailAddress,
        phone: {
          phoneNumber: user.phone.phoneNumber,
          countryCode: user.phone.countryCode,
        },
      };

      const responseData = {
        _id: user._id,
        profile: profile,
      };
      if (user.role.roleName === "receptionist") {
        return res
          .status(200)
          .json(
            new ApiResponse(200, responseData, "Receptionist already exists")
          );
      } else if (user.role.roleName !== "receptionist") {
        return res
          .status(200)
          .json(
            new ApiResponse(
              200,
              responseData,
              "User exists but not receptionist"
            )
          );
      }
    }

    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Receptionist not created"));
  } catch (error) {
    throw new ApiError(500, error);
  }
});
