import mongoose from "mongoose";

const driverSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    mobile: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    address: { type: String, default: "" },
    vehicleType: { type: String, required: true },
    vehicleNumber: { type: String, required: true },
    licenseNumber: { type: String, required: true },
    aadharNumber: { type: String, required: true },
    experienceYears: { type: Number, default: 0 },
    documents: {
      driverPhoto: { type: String, default: "" },
      licenseCopy: { type: String, default: "" },
      rcBook: { type: String, default: "" },
      aadharCard: { type: String, default: "" },
      vehiclePhoto: { type: String, default: "" },
      insuranceCopy: { type: String, default: "" }
    },
    status: {
      type: String,
      enum: ["pending", "under_review", "approved", "rejected", "active"],
      default: "pending"
    },
    rating: { type: Number, default: 0 },
    totalRides: { type: Number, default: 0 },
    earnings: { type: Number, default: 0 },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null }
  },
  { timestamps: true }
);

export default mongoose.models.Driver || mongoose.model("Driver", driverSchema);
