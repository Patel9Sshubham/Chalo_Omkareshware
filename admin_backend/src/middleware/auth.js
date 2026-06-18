import jwt from "jsonwebtoken";
import User from "../models/User.js";

export async function protectAdmin(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) {
      return res.status(401).json({ message: "Authorization token is required." });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.id).select("-password");

    if (!user || user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required." });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token." });
  }
}
