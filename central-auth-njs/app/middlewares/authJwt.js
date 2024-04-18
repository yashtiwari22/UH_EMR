const jwt = require("jsonwebtoken");
const config = require("../config/auth.config");
const db = require("../models");
const User = db.user;
const Role = db.role;
const ApiError = require("../utils/ApiError.js");
const asyncHandler = require("../utils/asyncHandler.js");
const ApiResponse = require("../utils/ApiResponse.js");

const { TokenExpiredError } = jwt;

const catchError = (err, res) => {
  if (err instanceof TokenExpiredError) {
    return res
      .status(403)
      .json(new ApiResponse(403, {}, "Access Token was expired!"));
  }

  return res.status(401).json(new ApiResponse(401, {}, "Unauthorized!"));
};

const verifyToken = asyncHandler(async (req, res, next) => {
  const token =
    req.cookies?.accessToken ||
    req.header("Authorization")?.replace("Bearer ", "");

  try {
    if (!token) {
      return res
        .status(403)
        .json(new ApiResponse(403, {}, "No token provided!"));
    }

    console.log(token, config.secret);

    jwt.verify(token, config.access_secret, (err, decoded) => {
      if (err) {
        return catchError(err, res);
      }
      console.log(decoded);
      req.userId = decoded.user._id;
      next();
    });
  } catch (err) {
    throw new ApiError(500, err);
  }
});

const isDoctor = asyncHandler(async (req, res, next) => {
  try {
    console.log(req.userId);
    const user = await User.findById(req.userId);
    console.log(user);

    if (user.role.roleName === "doctor") {
      next();
    } else {
      return res
        .status(403)
        .json(new ApiResponse(403, {}, "Require Doctor Role!"));
    }
  } catch (err) {
    throw new ApiError(500, err);
  }
});

const isAdmin = asyncHandler(async (req, res, next) => {
  try {
    console.log(req.userId);
    const user = await User.findById(req.userId);
    console.log(user);

    if (user.role.roleName === "admin") {
      next();
    } else {
      return res
        .status(403)
        .json(new ApiResponse(403, {}, "Require Admin Role!"));
    }
  } catch (err) {
    throw new ApiError(500, err);
  }
});

const isModerator = asyncHandler(async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);

    Role.find(
      {
        _id: { $in: user.roles },
      },
      (err, roles) => {
        if (err) {
          throw new ApiError(500, err);
        }

        for (let i = 0; i < roles.length; i++) {
          if (roles[i].name === "moderator") {
            next();
            return;
          }
        }
        return res
          .status(403)
          .json(new ApiResponse(403, {}, "Require Moderator Role!"));
      }
    );
  } catch (err) {
    throw new ApiError(500, err);
  }
});

const authJwt = {
  verifyToken,
  isDoctor,
  isAdmin,
  isModerator,
};
module.exports = authJwt;
