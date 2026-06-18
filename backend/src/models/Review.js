import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    listing: { type: mongoose.Schema.Types.ObjectId, ref: "Listing", required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    authorName: { type: String, required: true, trim: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    adminReply: { type: String, default: "" },
    source: { type: String, default: "user" }
  },
  { timestamps: true }
);

export default mongoose.models.Review || mongoose.model("Review", reviewSchema);
