const nodemailer = require("nodemailer");
const handlebars = require("handlebars");
const path = require("path");
const fs = require("fs");

//send confirmation mail

exports.mailSender = async (user, otp) => {
  const fromEmailAddress = process.env.FROM_EMAIL;
  const smtpHost = process.env.STMP_HOST ?? "";
  const smtpPort = parseInt(process.env.STMP_PORT ?? "587", 10);
  const smtpUser = process.env.STMP_USER ?? "";
  const smtpPassword = process.env.STMP_PASSWORD ?? "";
  try {
    const smtpTransport = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      auth: {
        user: smtpUser,
        pass: smtpPassword,
      },
    });

    const name = user.firstName;
    const email = user.email.emailAddress;

    const templateData = {
      email,
      name,
      otp,
      unsubscribeLink: ``, // Include the email parameter
    };

    const templatePath = path.join(
      __dirname,
      "../templates/mailTemplate/otp_confirmation.html"
    );
    const source = fs.readFileSync(templatePath, { encoding: "utf-8" });
    const template = handlebars.compile(source);
    const html = template(templateData);

   

    const updatedData = {
      to: email,
      html,
      from: `AASA APP ${fromEmailAddress}`,
      subject: "Otp confirmation",
      headers: {
        "List-Unsubscribe": `<${templateData.unsubscribeLink}>`,
      },
    };
    smtpTransport.sendMail(updatedData).then((result) => {
      console.info(result);
    });
  } catch (error) {
    throw new ApiError(500, error);
  }
};
