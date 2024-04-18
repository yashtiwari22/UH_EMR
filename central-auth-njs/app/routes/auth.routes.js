const { verifySignUp, authJwt } = require("../middlewares");
const controller = require("../controllers/auth.controller");
const { verifyToken } = require("../middlewares/authJwt");

module.exports = function (app) {
  // Middleware to set Access-Control-Allow-Headers
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  /**
   * @swagger
   * /:
   *   get:
   *     summary: Welcome message
   *     description: Welcome message for the authentication service.
   *     tags: [Authentication]
   *     responses:
   *       200:
   *         description: Welcome message displayed successfully
   */
  app.get("/", (req, res) => {
    res.send("Welcome to AASA Central Authentication Service");
  });

  // -------------------------------------------

  /**
   * @swagger
   * /api/v1/auth/signUp:
   *   post:
   *     summary: Sign up a new user
   *     description: Registers a new user in the system.
   *     security:
   *       - bearerAuth: []
   *     tags: [Authentication]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               firstName:
   *                 type: string
   *                 description: The first name of the user.
   *                 example: Ashish
   *               lastName:
   *                 type: string
   *                 description: The last name of the user.
   *                 example: Dogra
   *               email:
   *                 type: object
   *                 properties:
   *                   emailAddress:
   *                     type: string
   *                     description: The email address of the user.
   *                     example: ashish@umeed.health
   *               phone:
   *                 type: object
   *                 properties:
   *                   phoneNumber:
   *                     type: string
   *                     minLength: 10
   *                     description: The phone number of the user.
   *                     example: 7042142330
   *                   countryCode:
   *                     type: string
   *                     description: The country code of the phone number.
   *                     example: "+91"
   *               role:
   *                 type: object
   *                 properties:
   *                   roleName:
   *                     type: string
   *                     enum:
   *                       - doctor
   *                       - receptionist
   *                     description: The name of the role.
   *                   moduleAccess:
   *                     type: array
   *                     items:
   *                       type: string
   *                       enum:
   *                         - appointment
   *                     description: List of module access granted to the user.
   *     responses:
   *       200:
   *         description: User signed up successfully
   *       400:
   *         description: Bad request, missing or invalid parameters
   *       401:
   *         description: Unauthorized, access token is missing or invalid
   *       403:
   *         description: Forbidden, user does not have permission
   *       409:
   *         description: Conflict, phone number or email already exists
   *       500:
   *         description: Internal server error
   */

  // Signup route
  app.post(
    "/api/v1/auth/signUp",
    [authJwt.verifyToken, verifySignUp.checkDuplicatePhoneOrEmail],
    controller.signup
  );

  // Delete User route
  app.delete(
    "/api/v1/auth/deleteUser/:userId",
    [authJwt.verifyToken, authJwt.isDoctor],
    controller.deleteUser
  );

  // ---------------------------------------------------------

  // signin

  /**
   * @swagger
   * /api/v1/auth/signIn:
   *   post:
   *     summary: Sign in a user
   *     description: Logs in a user with valid credentials.
   *     tags: [Authentication]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               email:
   *                 type: string
   *                 description: The email address of the user.
   *                 example: parth.ratra@umeed.health
   *               otp:
   *                 type: string
   *                 description: The One-Time Password sent to the registered email address.
   *                 example: 123456
   *     responses:
   *       200:
   *         description: User signed in successfully
   *       400:
   *         description: Bad request, missing or invalid parameters
   *       401:
   *         description: Unauthorized, invalid credentials
   *       500:
   *         description: Internal server error
   */
  app.post("/api/v1/auth/signIn", controller.signin);

  //  -------------------------------------------------------

  /**
   * @swagger
   * /api/v1/auth/sendOtp:
   *   post:
   *     summary: Send One-Time Password (OTP)
   *     description: Sends a one-time password to the user's registered email address for verification.
   *     tags: [Authentication]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               email:
   *                 type: object
   *                 properties:
   *                   emailAddress:
   *                     type: string
   *                     description: The email address of the user.
   *                     example: parth.ratra@umeed.health
   *     responses:
   *       200:
   *         description: OTP has been sent successfully
   *       400:
   *         description: Bad request, missing or invalid parameters
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: Invalid email address
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: Internal server error occurred
   */

  app.post("/api/v1/auth/sendOtp", controller.sendOtp);

  // --------------------------------------------------------------------
  /**
   * @swagger
   * /api/v1/auth/verifyEmail:
   *   post:
   *     summary: Verify Email
   *     description: Verifies the user's email address using the received OTP.
   *     tags: [Authentication]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               email:
   *                 type: object
   *                 properties:
   *                   emailAddress:
   *                     type: string
   *                     description: The email address of the user.
   *                     example: parth.ratra@umeed.health
   *               otp:
   *                 type: string
   *                 description: The email OTP sent to the user's email address.
   *                 example: 874017
   *     responses:
   *       200:
   *         description: Email has been verified successfully
   *       400:
   *         description: Bad request, missing or invalid parameters
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: Invalid email or OTP
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: Internal server error occurred
   */

  app.post("/api/v1/auth/verifyEmail", controller.verifyEmail);

  // verifyPhone

  /**
   * @swagger
   * /api/v1/auth/verifyPhone:
   *   post:
   *     summary: Verify Phone Number
   *     description: Verifies the user's phone number using the received OTP.
   *     tags: [Authentication]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               phone:
   *                 type: object
   *                 properties:
   *                   phoneNumber:
   *                     type: string
   *                     description: The phone number of the user.
   *                     example: "7042142330"
   *                   countryCode:
   *                     type: string
   *                     description: The country code of the phone number.
   *                     example: "+91"
   *               otp:
   *                 type: string
   *                 description: The OTP received on the user's phone number.
   *                 example: "829516"
   *     responses:
   *       200:
   *         description: Phone number has been verified successfully
   *       400:
   *         description: Bad request, missing or invalid parameters
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: Invalid phone number or OTP
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: Internal server error occurred
   */

  app.post("/api/v1/auth/verifyPhone", controller.verifyPhone);

  /**
   * @swagger
   * /api/v1/auth/refreshToken:
   *   post:
   *     summary: Refresh Token
   *     description: Generates a new access token using the refresh token for the current user.
   *     tags: [Authentication]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               token:
   *                 type: string
   *                 description: The refresh token of the user.
   *                 example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImVtYWlsIjp7ImVtYWlsQWRkcmVzcyI6InBhcnRoLnJhdHJhQHVtZWVkLmhlYWx0aCIsInZlcmlmaWVkIjp0cnVlfSwicGhvbmUiOnsicGhvbmVOdW1iZXIiOiI0NjA0MDMzMTQyIiwiY291bnRyeUNvZGUiOiIrOTEiLCJ2ZXJpZmllZCI6dHJ1ZX0sInJvbGUiOnsicm9sZU5hbWUiOiJkb2N0b3IiLCJtb2R1bGVBY2Nlc3MiOlsiYXBwb2ludG1lbnRzIiwibWVkaWNhbF9yZWNvcmRzIl19LCJfaWQiOiI2NWM5ZDYwNjUyMWQwOTIxZWU1MmFmMTQiLCJmaXJzdE5hbWUiOiJQYXJ0aCIsImxhc3ROYW1lIjoiUmF0cmEiLCJfX3YiOjB9LCJpYXQiOjE3MTAzMzIwOTIsImV4cCI6MTcxMDQxODQ5Mn0.hj2jVwoOw8VMPmWB6lCoEH0gIwZjgnKND7V3HEo3Dbg"
   *     responses:
   *       200:
   *         description: Access token refreshed successfully
   *       400:
   *         description: Bad request, missing or invalid parameters
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: Invalid refresh token
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: Internal server error occurred
   */

  app.post("/api/v1/auth/refreshToken", controller.refreshToken);

  //healthcheck route
  app.get("/healthCheck", (req, res) => {
    res.send({
      msg: "working great Thanks bhaiyaji!",
    });
  });

  //user update

  /**
   * @swagger
   * /api/v1/auth/profile/{id}:
   *   put:
   *     summary: Update User Profile
   *     description: Update the user profile with the specified ID.
   *     tags: [Profile]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         description: ID of the user profile to update.
   *         schema:
   *           type: string
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             oneOf:
   *               - required:
   *                   - firstName
   *                 properties:
   *                   firstName:
   *                     type: string
   *                     description: The first name of the user.
   *                     example: Ashish
   *               - required:
   *                   - lastName
   *                 properties:
   *                   lastName:
   *                     type: string
   *                     description: The last name of the user.
   *                     example: Dogra
   *               - required:
   *                   - email
   *                 properties:
   *                   email:
   *                     type: object
   *                     properties:
   *                       emailAddress:
   *                         type: string
   *                         description: The email address of the user.
   *                         example: ashish@umeed.health
   *               - required:
   *                   - phone
   *                 properties:
   *                   phone:
   *                     type: object
   *                     properties:
   *                       phoneNumber:
   *                         type: string
   *                         minLength: 10
   *                         description: The phone number of the user.
   *                         example: 7042142330
   *                       countryCode:
   *                         type: string
   *                         description: The country code of the phone number.
   *                         example: "+91"
   *               - required:
   *                   - role
   *                 properties:
   *                   role:
   *                     type: object
   *                     properties:
   *                       roleName:
   *                         type: string
   *                         enum:
   *                           - doctor
   *                           - receptionist
   *                         description: The name of the role.
   *                       moduleAccess:
   *                         type: array
   *                         items:
   *                           type: string
   *                           enum:
   *                             - appointment
   *                         description: List of module access granted to the user.
   *     responses:
   *       200:
   *         description: User profile updated successfully
   *       400:
   *         description: Bad request, missing or invalid parameters
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: Invalid parameters provided for profile update
   *       404:
   *         description: User profile not found
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: User profile with the specified ID not found
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: Internal server error occurred
   */

  app.put("/api/v1/auth/profile/:id", controller.updateUserProfile);

  app.post(
    "/api/v1/auth/checkIfUserAlreadyExists",
    [authJwt.verifyToken],
    controller.checkIfUserAlreadyExists
  );
};
