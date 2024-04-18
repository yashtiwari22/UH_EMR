import { Document, model, Schema, Types } from "mongoose";

export default interface SymptomModel extends Document {}

const symptomSchema = new Schema<SymptomModel>({});

export const Symptom = model<SymptomModel>("Symptom", symptomSchema);
