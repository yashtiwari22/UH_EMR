const mongoose = require("mongoose");

const Otp = mongoose.model(
  "Otp",
  new mongoose.Schema({
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    otp: {
      type: String,
      required: true,
    },
    expiry: {
      type: Date,
      required: true,
    },
  })
);

module.exports = Otp;
