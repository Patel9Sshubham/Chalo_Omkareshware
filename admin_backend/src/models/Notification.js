import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    audience: { type: String, enum: ["user", "driver", "admin"], required: true },
    type: { type: String, required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    booking: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", default: null },
    driver: { type: mongoose.Schema.Types.ObjectId, ref: "Driver", default: null }
  },
  { timestamps: true }
);

export default mongoose.models.Notification || mongoose.model("Notification", notificationSchema);
