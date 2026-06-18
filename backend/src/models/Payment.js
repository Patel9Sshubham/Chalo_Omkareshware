import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    booking: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", required: true },
    bookingId: { type: String, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true },
    paymentMethod: { type: String, enum: ["upi", "gpay", "phonepe", "paytm", "card", "netbanking", "cash", "razorpay"], required: true },
    transactionId: { type: String, default: "" },
    provider: { type: String, default: "razorpay" },
    status: { type: String, enum: ["pending", "paid", "failed", "refunded", "partially_refunded"], default: "pending" },
    currency: { type: String, default: "inr" },
    razorpayOrderId: { type: String, default: "" },
    razorpayPaymentId: { type: String, default: "" },
    razorpaySignature: { type: String, default: "" }
  },
  { timestamps: true }
);

export default mongoose.models.Payment || mongoose.model("Payment", paymentSchema);
