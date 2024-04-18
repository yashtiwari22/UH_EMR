import { DateTime } from "aws-sdk/clients/glacier";
import mongoose, { Schema, Document, Types } from "mongoose";

// Define interfaces as before

interface PatientBasicDetail {
  name: string;
  visit: string;
  age: string;
  height: string;
  weight: string;
}

interface Diagnosis {
  condition: {
    id: Types.ObjectId;
    conditionName: string;
  };
  grade: {
    id: Types.ObjectId;
    gradeName: string;
  };
}

interface Medication {
  id: Types.ObjectId;
  medicine: string;
  days: string;
  foodTime: string;
  frequency: string;
  notes: string;
}

interface Test {
  id: Types.ObjectId;
  testName: string;
  note: string;
}

interface RxModel extends Document {
  doctorId: Types.ObjectId;
  patientId: Types.ObjectId;
  appointmentId: Types.ObjectId;
  patientBasicDetail: PatientBasicDetail;
  diagnosis: Diagnosis[];
  medication: Medication[];
  test: Test[];
  symptoms: string[];
  additionalNotes: string;
  nextVisit: Date;
}

// Create Mongoose Schema
const RxSchema: Schema = new Schema<RxModel>({
  doctorId: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  patientId: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  appointmentId: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  patientBasicDetail: {
    name: {
      type: Schema.Types.String,
    },
    visit: {
      type: Schema.Types.String,
    },
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
  diagnosis: [
    new Schema(
      {
        condition: {
          id: {
            type: Schema.Types.ObjectId,
          },
          conditionName: {
            type: Schema.Types.String,
          },
        },
        grade: {
          id: {
            type: Schema.Types.ObjectId,
          },
          gradeName: {
            type: Schema.Types.String,
          },
        },
      },
      {
        _id: false,
      }
    ),
  ],

  medication: [
    new Schema(
      {
        id: {
          type: Schema.Types.ObjectId,
        },
        medicine: {
          type: Schema.Types.String,
        },
        medicineType: {
          type: Schema.Types.String,
          enum: ["Tablet", "Capsule", "Syrup", "Injection", "Powder"],
          default: "Tablet",
        },
        intake: {
          type: [Schema.Types.String],
          enum: ["morning", "noon", "night"],
          default: [],
        },
        days: {
          type: Schema.Types.String,
        },
        foodTime: {
          type: Schema.Types.String,
        },
        frequency: {
          type: Schema.Types.String,
        },
        note: {
          type: Schema.Types.String,
        },
      },
      {
        _id: false,
      }
    ),
  ],

  test: [
    new Schema(
      {
        id: {
          type: Schema.Types.ObjectId,
        },
        testName: {
          type: Schema.Types.String,
        },
        note: {
          type: Schema.Types.String,
        },
      },
      {
        _id: false,
      }
    ),
  ],
  symptoms: {
    type: [Schema.Types.String],
  },
  additionalNotes: {
    type: Schema.Types.String,
    default: "",
  },
  nextVisit: {
    type: Schema.Types.Date,
  },
});

// Create Mongoose Model
export const Rx = mongoose.model<RxModel>("Rx", RxSchema);
