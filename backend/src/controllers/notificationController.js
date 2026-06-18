import Notification from "../models/Notification.js";

export async function getMyNotifications(req, res) {
  const notifications = await Notification.find({ user: req.user._id, audience: "user" })
    .sort({ createdAt: -1 })
    .limit(50);

  res.json({ notifications });
}

export async function markNotificationRead(req, res) {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    { read: true },
    { new: true }
  );

  if (!notification) {
    return res.status(404).json({ message: "Notification not found." });
  }

  res.json({ notification });
}
