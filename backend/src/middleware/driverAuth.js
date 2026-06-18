import jwt from "jsonwebtoken";
import Driver from "../models/Driver.js";

export async function protectDriver(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) {
      return res.status(401).json({ message: "Authorization token is required." });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (payload.role !== "driver") {
      return res.status(403).json({ message: "Driver access required." });
    }

    const driver = await Driver.findById(payload.id);
    if (!driver) {
      return res.status(401).json({ message: "Driver not found." });
    }

    req.driver = driver;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token." });
  }
}
