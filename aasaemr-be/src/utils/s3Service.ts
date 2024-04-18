import { S3 } from "aws-sdk";
import { v4 as uuid } from "uuid";

const s3upload = async (files: Express.Multer.File[]) => {
  const s3 = new S3();
  // Ensure that process.env.AWS_BUCKET_NAME is defined
  if (!process.env.AWS_BUCKET_NAME) {
    throw new Error(
      "AWS_BUCKET_NAME is not defined in the environment variables."
    );
  }

  try {
    const uploadPromises = files.map((file) => {
      const params: S3.Types.PutObjectRequest = {
        Bucket: process.env.AWS_BUCKET_NAME!,
        Key: `imageUpload/${uuid()}-${file.originalname}`,
        Body: file.buffer,
      };
      return s3.upload(params).promise();
    });
    const results = await Promise.all(uploadPromises);

    return results;
  } catch (error) {
    console.error("Error uploading to S3:", error);
    throw error;
  }
};

const s3uploadWithWhatsapp = async (files: Express.Multer.File[]) => {
  const s3 = new S3();
  // Ensure that process.env.AWS_BUCKET_NAME is defined
  if (!process.env.AWS_BUCKET_NAME) {
    throw new Error(
      "AWS_BUCKET_NAME is not defined in the environment variables."
    );
  }

  try {
    const uploadPromises = files.map((file) => {
      const params: S3.Types.PutObjectRequest = {
        Bucket: process.env.AWS_BUCKET_NAME!,
        Key: `imageUpload/${uuid()}-${file.originalname}`,
        Body: file.buffer,
        ContentType: "application/pdf",
      };
      return s3.upload(params).promise();
    });
    const results = await Promise.all(uploadPromises);

    return results;
  } catch (error) {
    console.error("Error uploading to S3:", error);
    throw error;
  }
};

export { s3upload, s3uploadWithWhatsapp };
