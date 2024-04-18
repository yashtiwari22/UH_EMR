import { Document, Schema, model } from "mongoose";

interface DropdownItem {
  value: string;
}

export default interface DropdownModel extends Document {
  medicineType: DropdownItem[];
  intake: DropdownItem[];
  days: DropdownItem[];
  amount: DropdownItem[];
  foodTime: DropdownItem[];
}

const dropdownItemSchema = new Schema<DropdownItem>({
  value: String,
});

const dropdownSchema = new Schema<DropdownModel>({
  medicineType: {
    type: [dropdownItemSchema],
    default: [
      { value: "Tablet" },
      { value: "Capsule" },
      { value: "Syrup" },
      { value: "Injection" },
      { value: "Powder" },
    ],
  },
  intake: {
    type: [dropdownItemSchema],
    default: [
      { value: "morning" },
      { value: "noon" },
      { value: "night" },
    ],
  },
  amount: {
    type: [dropdownItemSchema],
    default: [
      { value: "Every day" },
      { value: "Alternate days" },
      { value: "Once a week" },
      { value: "Once in 15 days" },
      { value: "Once a Month" },
      { value: "None" },
    ],
  },
  foodTime: {
    type: [dropdownItemSchema],
    default: [
      { value: "Before Food" },
      { value: "After Food" },
    ],
  },
});

export const Dropdown = model<DropdownModel>("Dropdown", dropdownSchema);
