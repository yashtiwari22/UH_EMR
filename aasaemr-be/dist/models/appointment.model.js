"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Appointment = exports.AppointmentStatus = void 0;
const mongoose_1 = require("mongoose");
var AppointmentStatus;
(function (AppointmentStatus) {
    AppointmentStatus["DONE"] = "done";
    AppointmentStatus["PENDING"] = "pending";
    AppointmentStatus["CANCELLED"] = "cancelled";
})(AppointmentStatus || (exports.AppointmentStatus = AppointmentStatus = {}));
var DeliveryStatus;
(function (DeliveryStatus) {
    DeliveryStatus["NOTSOLD"] = "notsold";
    DeliveryStatus["INTRANSIT"] = "intransit";
    DeliveryStatus["DELIVERED"] = "delivered";
})(DeliveryStatus || (DeliveryStatus = {}));
const AppointmentSchema = new mongoose_1.Schema({
    userDoctor: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Doctor",
        required: true,
    },
    userPatient: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Patient",
        required: true,
    },
    dateTime: {
        type: mongoose_1.Schema.Types.Date,
        required: true,
    },
    clinic: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Clinic",
        required: true,
    },
    isSold: {
        type: mongoose_1.Schema.Types.Boolean,
        default: false,
    },
    status: {
        appointmentStatus: {
            type: mongoose_1.Schema.Types.String,
            enum: [
                AppointmentStatus.DONE,
                AppointmentStatus.PENDING,
                AppointmentStatus.CANCELLED,
            ],
            default: AppointmentStatus.PENDING,
        },
        deliveryStatus: {
            type: mongoose_1.Schema.Types.String,
            enum: [
                DeliveryStatus.NOTSOLD,
                DeliveryStatus.INTRANSIT,
                DeliveryStatus.DELIVERED,
            ],
            default: DeliveryStatus.NOTSOLD,
        },
    },
    visit: {
        type: mongoose_1.Schema.Types.String,
        default: "0",
    },
});
AppointmentSchema.pre("save", function (next) {
    const currentDate = new Date();
    if (this.status.appointmentStatus === AppointmentStatus.PENDING &&
        this.dateTime < currentDate) {
        this.status.appointmentStatus = AppointmentStatus.CANCELLED;
    }
    next();
});
exports.Appointment = (0, mongoose_1.model)("Appointment", AppointmentSchema);
