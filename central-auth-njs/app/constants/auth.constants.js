const Otp = require("../models/otp.model.js");
const ApiResponse = require("../utils/ApiResponse.js");
const ApiError = require("../utils/ApiError.js");
const { mailSender } = require("../utils/mailSender.js");

//generate otp
exports.generateOtp = async (user, res, query) => {
  const otp = Math.floor(100000 + Math.random() * 900000);
  console.log(Otp);

  try {
    //delete all previous otp of user signing in

    if (Otp) {
      await Otp.findOneAndDelete({ userId: user._id });
    }

    if (query["email.emailAddress"]) {
      //send email
      const otpNew = new Otp({
        userId: user._id,
        otp: otp.toString(),
        expiry: new Date(Date.now() + 5 * 60 * 1000),
      });

      otpNew.save();

      await mailSender(user, otp);
      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            {},
            `OTP sent successfully! to ${query["email.emailAddress"]}`
          )
        );
    } else if (query["phone.phoneNumber"]) {
      const otpNew = new Otp({
        userId: user._id,
        otp: otp.toString(),
        expiry: new Date(Date.now() + 5 * 60 * 1000),
      });

      otpNew.save();

      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            {},
            `OTP sent successfully! to ${query["phone.phoneNumber"]}`
          )
        );
    } else {
    }
  } catch (err) {
    throw new ApiError(500, err);
  }
};

//checking expiry
const isDateBeforeNow = (mongoDate) => {
  // Assuming mongoDate is a Date object. If it's a string, convert it to a Date object first.
  // If mongoDate is a string, use: const dateFromMongo = new Date(mongoDate);
  const dateFromMongo = mongoDate;

  // Get the current date and time
  const now = new Date();

  // Compare the MongoDB date with the current date and time
  return dateFromMongo < now;
};

// checking is otp valid
exports.isOtpValid = async (user, otp, res) => {
  //OTP is matched here, get it from otp list

  try {
    const otpDb = await Otp.findOne({ userId: user._id });
    console.log(otpDb);

    if (!otpDb) {
      res.status(404).json(new ApiResponse(404, {}, "Otp not found"));
    }
    //check otp is expired or not
    if (isDateBeforeNow(otpDb.expiry)) {
      await Otp.deleteMany({ userId: user._id });
      res.status(404).json(new ApiResponse(404, {}, "Otp expired"));
    }

    console.log(otpDb.otp, otp);

    if (otpDb.otp === otp) {
      await Otp.deleteMany({ userId: user._id });

      return "valid";
    } else {
      return "invalid";
    }
  } catch (err) {
    throw new ApiError(500, err);
  }
};

//roles
exports.roles = {
  doctor: "DOCTOR",
  receptionist: "RECEPTIONIST",
};
