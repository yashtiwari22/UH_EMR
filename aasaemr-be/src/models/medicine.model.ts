import mongoose, { Schema, Document, model, Types } from "mongoose";

interface MedicineModel extends Document {
  productName: string;
  productComposition: string;
  packagingDetail?: string;
  typeOfPackaging?: string;
  productPrice: number;
  productBrand?: string;
  usage?: string;
  pregnancyInteraction?: string;
  medicineInteraction?: string;
  sideEffects?: string;
  description?: string;
  manufacturerName?: string;
}

const medicineSchema: Schema = new Schema<MedicineModel>({
  productName: {
    type: String,
  },
  productComposition: {
    type: String,
  },

  packagingDetail: {
    type: String,
  },
  typeOfPackaging: {
    type: String,
  },
  productPrice: {
    type: Number,
  },

  productBrand: {
    type: String,
  },

  usage: {
    type: String,
  },
  pregnancyInteraction: {
    type: String,
  },

  medicineInteraction: {
    type: String,
  },

  sideEffects: {
    type: String,
  },

  description: {
    type: String,
  },

  manufacturerName: {
    type: String,
  },
});

const Medicine = model<MedicineModel>("Medicine", medicineSchema);

export default Medicine;
