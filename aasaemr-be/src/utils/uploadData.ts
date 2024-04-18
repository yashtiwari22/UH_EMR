import { Request } from "express";
import multer, { Multer, StorageEngine, FileFilterCallback } from "multer";

interface File {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  destination: string;
  filename: string;
  path: string;
  size: number;
}

const excelStorage: StorageEngine = multer.diskStorage({
  destination: (
    req: Request,
    file: File,
    cb: (error: Error | null, destination: string) => void
  ) => {
    cb(null, "./public"); // file added to the public folder of the root directory
  },
  filename: (
    req: Request,
    file: File,
    cb: (error: Error | null, filename: string) => void
  ) => {
    cb(null, file.originalname);
  },
});

const storage = multer.memoryStorage();

const fileFilter = (req: Request, file: File, cb: FileFilterCallback) => {
  const allowedMimeTypes = ["image", "application"];
  const fileType = file.mimetype.split("/")[0];
  if (allowedMimeTypes.includes(fileType)) {
    cb(null, true);
  } else {
    cb(new multer.MulterError("LIMIT_UNEXPECTED_FILE") as any, false);
  }
};

const upload = multer({
  storage,
  fileFilter,
});
const excelUploads: Multer = multer({ storage: excelStorage });

export { excelUploads, upload };
