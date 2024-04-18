import { Document, Schema, model, Types } from "mongoose";

interface PatientVitals {
  name: string;
  value: string;
}
interface Phone {
  phoneNumber: string;
  countryCode: string;
}

export default interface PatientModel extends Document {
  name: string;
  email: string;
  phone: Phone;
  dob: Date;
  patientVitals?: PatientVitals[];
  symptoms: string[];
  address: string;
  doctorIDs: Types.ObjectId[];
}

const patientSchema = new Schema<PatientModel>({
  name: {
    type: Schema.Types.String,
    required: true,
  },
  email: {
    type: Schema.Types.String,
    required: true,
    unique: true,
  },
  phone: {
    phoneNumber: {
      type: Schema.Types.String,
      validate: {
        validator: function (v: string) {
          return v.length >= 10;
        },
        message: (props) => `${props.value} is not a valid phone number!`,
      },
    },
    countryCode: {
      type: Schema.Types.String,
    },
  },
  dob: {
    type: Schema.Types.Date,
    required: true,
  },
  patientVitals: {
    height: {
      type: Schema.Types.String,
    },
    weight: {
      type: Schema.Types.String,
    },
    age: {
      type: Schema.Types.String,
    },
    bodyTemperature: {
      type: Schema.Types.String,
    },
    bloodPressure: {
      type: Schema.Types.String,
    },
    respirationRate: {
      type: Schema.Types.String,
    },
    pulseRate: {
      type: Schema.Types.String,
    },
  },
  symptoms: {
    type: [Schema.Types.String],
  },
  address: {
    type: Schema.Types.String,
  },
  doctorIDs: {
    type: [Schema.Types.ObjectId],
    ref: "Doctor",
    required: true,
  },
});

export const Patient = model<PatientModel>("Patient", patientSchema);
