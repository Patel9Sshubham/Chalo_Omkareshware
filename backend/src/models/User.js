import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, default: "" },
    address: { type: String, default: "" },
    language: { type: String, default: "en" },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ["user", "admin", "driver"], default: "user" },
    favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: "Listing" }]
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", userSchema);
