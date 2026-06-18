import mongoose from "mongoose";

const supportTicketSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    subject: { type: String, required: true },
    category: { type: String, default: "general" },
    message: { type: String, required: true },
    status: { type: String, enum: ["open", "in_progress", "resolved", "closed"], default: "open" },
    adminNote: { type: String, default: "" },
    notesHistory: [
      {
        note: { type: String, required: true },
        status: { type: String, default: "" },
        createdAt: { type: Date, default: Date.now }
      }
    ]
  },
  { timestamps: true }
);

export default mongoose.models.SupportTicket || mongoose.model("SupportTicket", supportTicketSchema);
