import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

function buildToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
}

function safeUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    address: user.address,
    language: user.language,
    role: user.role,
    favorites: user.favorites || []
  };
}

export async function register(req, res) {
  const { name, email, phone, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "Name, email and password are required." });
  }

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    return res.status(409).json({ message: "User already exists with this email." });
  }

  const hashed = await bcrypt.hash(password, 10);
  const user = await User.create({
    name,
    email: email.toLowerCase(),
    phone: phone || "",
    address: "",
    language: "en",
    password: hashed,
    role: "user"
  });

  const token = buildToken(user._id);
  res.status(201).json({ token, user: safeUser(user) });
}

export async function login(req, res) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required." });
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
  if (!user) {
    return res.status(401).json({ message: "Invalid credentials." });
  }

  const matched = await bcrypt.compare(password, user.password);
  if (!matched) {
    return res.status(401).json({ message: "Invalid credentials." });
  }

  const token = buildToken(user._id);
  res.json({ token, user: safeUser(user) });
}

export async function me(req, res) {
  res.json({ user: safeUser(req.user) });
}

export async function updateProfile(req, res) {
  const { name, phone, address, language } = req.body;
  const updates = {};

  if (name) updates.name = name;
  if (phone) updates.phone = phone;
  if (address !== undefined) updates.address = address;
  if (language !== undefined) updates.language = language;

  const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true }).select("-password");
  res.json({ user: safeUser(user) });
}

export async function getUserDashboard(req, res) {
  const [bookingCount, paymentCount, notifications] = await Promise.all([
    req.user ? User.countDocuments({ _id: req.user._id }) : 0,
    req.user ? User.countDocuments({ _id: req.user._id }) : 0,
    []
  ]);

  res.json({
    user: safeUser(req.user),
    stats: {
      bookingCount,
      paymentCount
    },
    notifications
  });
}
