import { Document, Schema, model, Types } from "mongoose";

export default interface ReceptionistModel extends Document {
  _id: Types.ObjectId;
  profile: {
    name: string;
    email: string;
    phone: {
      phoneNumber: string;
      countryCode: string;
    };
  };
  listOfDoctors: Types.ObjectId[];
}

const receptionistSchema = new Schema<ReceptionistModel>({
  _id: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  profile: {
    name: {
      type: Schema.Types.String,
    },
    email: {
      type: Schema.Types.String,
    },
    phone: {
      phoneNumber: {
        type: Schema.Types.String,
        validate: {
          validator: function (v: string) {
            return v.length >= 10;
          },
          message: (props: any) =>
            `${props.value} is not a valid phone number!`,
        },
      },
      countryCode: {
        type: Schema.Types.String,
      },
    },
  },
  listOfDoctors: {
    type: [Schema.Types.ObjectId],
    ref: "Doctor",
    required: true,
  },
});

export const Receptionist = model<ReceptionistModel>(
  "Receptionist",
  receptionistSchema
);
