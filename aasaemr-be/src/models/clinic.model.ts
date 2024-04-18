import { Schema, model, Document, Types } from "mongoose";

interface Doctor {
  docID: Types.ObjectId;
  name: string;
}
interface Receptionist {
  docID: Types.ObjectId;
  name: string;
}

export default interface ClinicModel extends Document {
  userDoctor: Doctor[];
  userReceptionist: Receptionist[];
  address: string;
  logo: string;
  name: string;
  isActive: boolean;
}

const clinicSchema = new Schema<ClinicModel>({
  userDoctor: [
    new Schema(
      {
        docID: {
          type: Schema.Types.ObjectId,
        },
        name: {
          type: Schema.Types.String,
        },
      },
      {
        _id: false,
      }
    ),
  ],

  userReceptionist: [
    new Schema(
      {
        receptionistID: {
          type: Schema.Types.ObjectId,
        },
        name: {
          type: Schema.Types.String,
        },
      },
      {
        _id: false,
      }
    ),
  ],

  address: {
    type: Schema.Types.String,
  },

  logo: {
    type: Schema.Types.String,
  },
  name: {
    type: Schema.Types.String,
  },
  isActive: {
    type: Schema.Types.Boolean,
    required: true,
    default: false,
  },
});

export const Clinic = model<ClinicModel>("Clinic", clinicSchema);
