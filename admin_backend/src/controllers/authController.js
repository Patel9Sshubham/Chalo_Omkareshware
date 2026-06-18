import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

function buildToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
}

function safeUser(user) {
  return { id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role };
}

export async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required." });
  }

  const user = await User.findOne({ email: email.toLowerCase(), role: "admin" }).select("+password");
  if (!user) {
    return res.status(401).json({ message: "Invalid admin credentials." });
  }

  const matched = await bcrypt.compare(password, user.password);
  if (!matched) {
    return res.status(401).json({ message: "Invalid admin credentials." });
  }

  const token = buildToken(user._id);
  res.json({ token, user: safeUser(user) });
}

export async function me(req, res) {
  res.json({ user: safeUser(req.user) });
}
