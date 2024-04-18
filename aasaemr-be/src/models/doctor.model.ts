import { Document, Schema, model, Types } from "mongoose";

interface MedicineDetails {
  id: Types.ObjectId;
  medicineName: string;
  medicineType: "Tablet" | "Capsule" | "Syrup" | "Injection" | "Powder";
  intakeDetails: {
    intake: string[];
    days: string;
    amount: string;
  };
  message: string;
}

interface Degree {
  degreeName: string;
  collegeName: string;
  passingYear: string;
}

interface Receptionist {
  docID: Types.ObjectId;
  name: string;
}

interface RxTemplate {
  condition: {
    id: Types.ObjectId;
    conditionName: string;
  };
  medication: {
    id: Types.ObjectId;
    grade: "Grade 1" | "Grade 2" | "Grade 3";
    medicineDetails: MedicineDetails[];
  }[];
}

interface PatientVitals {
  bodyTemperature: boolean;
  bloodPressure: boolean;
  respirationRate: boolean;
  pulseRate: boolean;
  height: boolean;
  weight: boolean;
  age: boolean;
}

interface RxHeaderInfo {
  clinicAddress: boolean;
  contactNo: boolean;
  emailId: boolean;
  logo: boolean;
}

interface RxInfo {
  symptoms: boolean;
  diagnosis: boolean;
  types: boolean;
  medicines: boolean;
}

interface FooterInfo {
  message: string;
  signatureColor: "Black" | "Blue";
}

interface RxFormat {
  patientVitals: PatientVitals;
  rxHeaderInfo: RxHeaderInfo;
  rxInfo: RxInfo;
  footerInfo: FooterInfo;
}
interface DoctorProfile {
  name: string;
  Specialization: string;
  MRN: string;
  MedicalId: string;
  DOB: string;
  Council: string;
  degrees: Degree[];
  clinics: Types.ObjectId[];
  userReceptionist: Receptionist[];
  docPhoto: string;
  docSign: string;
}

interface DoctorSettings {
  rxTemplates: RxTemplate[];
  rxFormat: RxFormat;
}
export default interface DoctorModel extends Document {
  _id: Types.ObjectId;
  profile: DoctorProfile;
  settings: DoctorSettings;
}

const doctorSchema = new Schema<DoctorModel>({
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
    address: {
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
    Specialization: {
      type: Schema.Types.String,
    },
    MRN: {
      type: Schema.Types.String,
    },
    MedicalId: {
      type: Schema.Types.String,
    },
    DOB: {
      type: Schema.Types.Date,
    },
    Council: {
      type: Schema.Types.String,
    },
    degrees: [
      new Schema(
        {
          degreeName: {
            type: Schema.Types.String,
            required: true,
          },
          collegeName: {
            type: Schema.Types.String,
            required: true,
          },
          passingYear: {
            type: Schema.Types.String,
            required: true,
          },
        },
        {
          _id: false,
        }
      ),
    ],
    clinics: {
      type: [Schema.Types.ObjectId],
      ref: "Clinic",
    },
    userReceptionist: {
      type: [Schema.Types.ObjectId],
      ref: "Receptionist",
    },
    docPhoto: {
      type: Schema.Types.String,
      required: true,
    },
    docSign: {
      type: Schema.Types.String,
      required: true,
    },
  },
  settings: {
    rxTemplates: [
      new Schema(
        {
          condition: {
            id: {
              type: Schema.Types.ObjectId,
              ref: "Condition",
            },
            conditionName: {
              type: Schema.Types.String,
            },
          },
          medication: [
            new Schema(
              {
                id: {
                  type: Schema.Types.ObjectId,
                },
                grade: {
                  type: Schema.Types.String,
                  enum: ["Grade 1", "Grade 2", "Grade 3"],
                  default: "Grade 1",
                },
                medicineDetails: [
                  new Schema(
                    {
                      id: {
                        type: Schema.Types.ObjectId,
                        ref: "Medicine",
                      },
                      medicineName: {
                        type: Schema.Types.String,
                      },
                      medicineType: {
                        type: Schema.Types.String,
                        enum: [
                          "Tablet",
                          "Capsule",
                          "Syrup",
                          "Injection",
                          "Powder",
                        ],
                        default: "Tablet",
                      },
                      intakeDetails: {
                        intake: {
                          type: [Schema.Types.String],
                          enum: ["morning", "noon", "night"],
                          default: ["morning", "noon", "night"],
                        },
                        days: {
                          type: Schema.Types.String,
                          enum: ["1 Day", "7 Days", "14 Days", "21 Days"],
                          default: "1 Day",
                        },
                        amount: {
                          type: Schema.Types.String,
                          enum: [
                            "Once per Week",
                            "Twice per Week",
                            "Thrice per Week",
                          ],
                          default: "Once per Week",
                        },
                        foodTime: {
                          type: Schema.Types.String,
                          enum: ["Before Food", "After Food"],
                          default: "After Food",
                        },
                      },
                      message: {
                        type: Schema.Types.String,
                      },
                    },
                    {
                      _id: false,
                    }
                  ),
                ],
              },
              {
                _id: false,
              }
            ),
          ],
        },
        {
          _id: false,
        }
      ),
    ],
    rxFormat: {
      patientVitals: {
        bodyTemperature: {
          type: Schema.Types.Boolean,
          default: false,
        },
        bloodPressure: {
          type: Schema.Types.Boolean,
          default: false,
        },
        respirationRate: {
          type: Schema.Types.Boolean,
          default: false,
        },
        pulseRate: {
          type: Schema.Types.Boolean,
          default: false,
        },
        height: {
          type: Schema.Types.Boolean,
          default: false,
        },
        weight: {
          type: Schema.Types.Boolean,
          default: false,
        },
        age: {
          type: Schema.Types.Boolean,
          default: false,
        },
      },
      rxHeaderInfo: {
        clinicAddress: {
          type: Schema.Types.Boolean,
          default: false,
        },
        contactNo: {
          type: Schema.Types.Boolean,
          default: false,
        },
        emailId: {
          type: Schema.Types.Boolean,
          default: false,
        },
        logo: {
          type: Schema.Types.Boolean,
          default: false,
        },
      },
      rxInfo: {
        symptoms: {
          type: Schema.Types.Boolean,
          default: false,
        },
        diagnosis: {
          type: Schema.Types.Boolean,
          default: false,
        },
        types: {
          type: Schema.Types.Boolean,
          default: false,
        },
        medicines: {
          type: Schema.Types.Boolean,
          default: false,
        },
      },
      footerInfo: {
        message: {
          type: Schema.Types.String,
          default: "Get Well Soon 😇",
        },
        signatureColor: {
          type: Schema.Types.String,
          enum: ["Black", "Blue"],
          default: "Black",
        },
      },
    },
  },
});

export const Doctor = model<DoctorModel>("Doctor", doctorSchema);
