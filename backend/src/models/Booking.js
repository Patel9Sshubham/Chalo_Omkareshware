import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    bookingId: { type: String, required: true, unique: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    driver: { type: mongoose.Schema.Types.ObjectId, ref: "Driver", default: null },
    pickup: { type: String, required: true },
    destination: { type: String, required: true },
    vehicleType: { type: String, required: true },
    routeName: { type: String, default: "" },
    distanceKm: { type: Number, default: 0 },
    estimatedTimeMinutes: { type: Number, default: 0 },
    bookingDate: { type: String, default: "" },
    bookingTime: { type: String, default: "" },
    notes: { type: String, default: "" },
    baseFare: { type: Number, default: 0 },
    distanceFare: { type: Number, default: 0 },
    convenienceFee: { type: Number, default: 0 },
    taxes: { type: Number, default: 0 },
    totalAmount: { type: Number, default: 0 },
    paymentMethod: { type: String, enum: ["razorpay", "upi", "gpay", "phonepe", "paytm", "card", "netbanking", "cash"], default: "cash" },
    paymentStatus: { type: String, enum: ["pending", "paid", "failed", "refunded", "partially_refunded"], default: "pending" },
    status: {
      type: String,
      enum: ["pending", "driver_assigned", "driver_reached", "ride_started", "ride_completed", "payment_settled", "cancelled"],
      default: "pending"
    },
    cancellationReason: { type: String, default: "" },
    cancellationFee: { type: Number, default: 0 },
    driverContact: { type: String, default: "" },
    driverName: { type: String, default: "" },
    driverVehicleNumber: { type: String, default: "" }
  },
  { timestamps: true }
);

export default mongoose.models.Booking || mongoose.model("Booking", bookingSchema);
