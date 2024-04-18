import { Schema, model, Document, Types } from "mongoose";
export enum AppointmentStatus {
  DONE = "done",
  PENDING = "pending",
  CANCELLED = "cancelled",
}
enum DeliveryStatus {
  NOTSOLD = "notsold",
  INTRANSIT = "intransit",
  DELIVERED = "delivered",
}
interface message {
  text: string;
  date: Date;
}
export default interface AppointmentModel extends Document {
  userDoctor: Types.ObjectId;
  userPatient: Types.ObjectId;
  dateTime: Date;
  clinic: Types.ObjectId;
  isSold: boolean;
  status: {
    appointmentStatus: AppointmentStatus;
    deliveryStatus: DeliveryStatus;
  };
  visit: string;
}
const AppointmentSchema = new Schema<AppointmentModel>({
  userDoctor: {
    type: Schema.Types.ObjectId,
    ref: "Doctor",
    required: true,
  },
  userPatient: {
    type: Schema.Types.ObjectId,
    ref: "Patient",
    required: true,
  },
  dateTime: {
    type: Schema.Types.Date,
    required: true,
  },
  clinic: {
    type: Schema.Types.ObjectId,
    ref: "Clinic",
    required: true,
  },
  isSold: {
    type: Schema.Types.Boolean,
    default: false,
  },
  status: {
    appointmentStatus: {
      type: Schema.Types.String,
      enum: [
        AppointmentStatus.DONE,
        AppointmentStatus.PENDING,
        AppointmentStatus.CANCELLED,
      ],
      default: AppointmentStatus.PENDING,
    },
    deliveryStatus: {
      type: Schema.Types.String,
      enum: [
        DeliveryStatus.NOTSOLD,
        DeliveryStatus.INTRANSIT,
        DeliveryStatus.DELIVERED,
      ],
      default: DeliveryStatus.NOTSOLD,
    },
  },
  visit: {
    type: Schema.Types.String,
    default: "0",
  },
});

AppointmentSchema.pre("save", function (next) {
  const currentDate = new Date();
  if (
    this.status.appointmentStatus === AppointmentStatus.PENDING &&
    this.dateTime < currentDate
  ) {
    this.status.appointmentStatus = AppointmentStatus.CANCELLED;
  }
  next();
});

export const Appointment = model<AppointmentModel>(
  "Appointment",
  AppointmentSchema
);
