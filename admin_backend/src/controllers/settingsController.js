import bcrypt from "bcryptjs";
import User from "../models/User.js";

export async function updateAdminPassword(req, res) {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: "Current and new password are required." });
  }

  if (String(newPassword).length < 6) {
    return res.status(400).json({ message: "New password must be at least 6 characters." });
  }

  const admin = await User.findById(req.user._id).select("+password");
  if (!admin || admin.role !== "admin") {
    return res.status(403).json({ message: "Admin access required." });
  }

  const matched = await bcrypt.compare(currentPassword, admin.password);
  if (!matched) {
    return res.status(400).json({ message: "Current password is incorrect." });
  }

  admin.password = await bcrypt.hash(newPassword, 10);
  await admin.save();

  res.json({ success: true, message: "Password updated successfully." });
}
