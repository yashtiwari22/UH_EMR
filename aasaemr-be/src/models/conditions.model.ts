import { Schema, model, Document, Types } from "mongoose";

export default interface ConditionsModel extends Document {
  doctorId: Types.ObjectId;
  condition: {
    conditionNames: string;
  }[];
}

const conditionsSchema = new Schema<ConditionsModel>({
  doctorId: {
    type: Schema.Types.ObjectId,
    ref: "Doctor",
  },
  condition: [
    new Schema(
      {
        conditionNames: {
          type: Schema.Types.String,
        },
      },
      {
        _id: false,
      }
    ),
  ],
});

export const Condition = model<ConditionsModel>("Conditions", conditionsSchema);
