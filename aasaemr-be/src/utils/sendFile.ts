import nodemailer from "nodemailer";
import handlebars from "handlebars";
import path from "path";
import fs from "fs";
import axios from "axios";

interface User {
  name: string;
  email: string;
  phone: {
    phoneNumber: string;
    countryCode: string;
  };
  doctorName: string;
}

interface Result {
  Location: string;
}
interface TemplateData {
  email: string;
  name: string;
  unsubscribeLink: string;
}

interface CampaignData {
  apiKey?: string;
  campaignName?: string;
  destination?: string;
  userName?: string;
  templateParams?: string[];
  source?: string;
  media?: {
    url?: string;
    filename?: string;
  };
  buttons?: any[]; // Adjust the type accordingly
  carouselCards?: any[]; // Adjust the type accordingly
  location?: any; // Adjust the type accordingly
}

export const fileSender = async (
  user: User,
  pdfAttachment: Express.Multer.File
) => {
  const fromEmailAddress: string | undefined = process.env.FROM_EMAIL;
  const smtpHost: string | undefined = process.env.SMTP_HOST ?? "";
  const smtpPort = parseInt(process.env.SMTP_PORT ?? "587", 10);
  const smtpUser = process.env.SMTP_USER ?? "";
  const smtpPassword = process.env.SMTP_PASSWORD ?? "";

  console.log(fromEmailAddress, smtpHost, smtpPort, smtpUser, smtpPassword);

  try {
    const smtpTransport = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      auth: {
        user: smtpUser,
        pass: smtpPassword,
      },
    });
    const name = user.name;
    const email = user.email;

    const templateData = {
      email,
      name,
      unsubscribeLink: ``, // Include the email parameter
    };

    const templatePath: string = path.join(
      __dirname,
      "../constants/sendMailTemplate.html"
    );

    const source: string = fs.readFileSync(templatePath, { encoding: "utf-8" });
    const template: handlebars.TemplateDelegate<TemplateData> =
      handlebars.compile<TemplateData>(source);
    const html: string = template(templateData);

    const updatedData = {
      to: email,
      html,
      from: `AASA APP ${fromEmailAddress}`,
      subject: "Patient Rx Information",
      headers: {
        "List-Unsubscribe": `<${templateData.unsubscribeLink}>`,
      },
      attachments: [
        {
          filename: pdfAttachment.originalname,
          content: pdfAttachment.buffer.toString("base64"),
          encoding: "base64",
        },
      ],
    };

    const rxMail = await smtpTransport.sendMail(updatedData);

    if (!rxMail) {
      console.log(rxMail);
      throw new Error("Rx could not be sent");
    }

    return rxMail;
  } catch (error: any) {
    // Assuming ApiError is a custom error class
    throw new Error(error.message);
  }
};

export const WhatsappfileService = async (user: User, s3File: any) => {
  try {
    console.log(s3File);
    const campaignData: CampaignData = {
      apiKey: process.env.SENSY_API_KEY,
      campaignName: "test campaign",
      destination: `${user.phone.countryCode}${user.phone.phoneNumber}`,
      userName: "Umeed Health",
      templateParams: [
        `${user.name}`, // patient Name
        `${user.doctorName}`, // doctor Name
      ],
      source: "new-landing-page form",
      media: {
        url: `${s3File[0].Location}`, // Location
        filename: `${user.name}'s Prescription.pdf`,
      },
      buttons: [],
      carouselCards: [],
      location: {},
    };

    console.log(campaignData.media?.url);

    const response = await axios.post(
      "https://backend.aisensy.com/campaign/t1/api/v2",
      campaignData
    );

    console.log(response.data);

    return response.data;
  } catch (error: any) {
    throw new Error(error.message);
  }
};
