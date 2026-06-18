import User from "../models/User.js";
import Listing from "../models/Listing.js";
import SupportTicket from "../models/SupportTicket.js";

export async function getProfile(req, res) {
  const user = await User.findById(req.user._id).select("-password").populate("favorites");
  res.json({ user });
}

export async function updateProfile(req, res) {
  const { name, phone, address, language } = req.body;
  const updates = {};
  if (name !== undefined) updates.name = name;
  if (phone !== undefined) updates.phone = phone;
  if (address !== undefined) updates.address = address;
  if (language !== undefined) updates.language = language;

  const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true }).select("-password").populate("favorites");
  res.json({ user });
}

export async function toggleFavorite(req, res) {
  const listing = await Listing.findById(req.params.id);
  if (!listing) {
    return res.status(404).json({ message: "Listing not found." });
  }

  const user = await User.findById(req.user._id);
  const exists = user.favorites.some((id) => String(id) === String(listing._id));
  user.favorites = exists ? user.favorites.filter((id) => String(id) !== String(listing._id)) : [...user.favorites, listing._id];
  await user.save();

  const populated = await User.findById(req.user._id).select("-password").populate("favorites");
  res.json({ user: populated });
}

export async function getSupportTickets(req, res) {
  const tickets = await SupportTicket.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json({ tickets });
}

export async function createSupportTicket(req, res) {
  const { subject, category, message } = req.body;
  if (!subject || !message) {
    return res.status(400).json({ message: "Subject and message are required." });
  }

  const ticket = await SupportTicket.create({
    user: req.user._id,
    subject,
    category: category || "general",
    message
  });

  res.status(201).json({ ticket });
}
