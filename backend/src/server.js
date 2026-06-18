import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";
import authRoutes from "./routes/authRoutes.js";
import listingRoutes from "./routes/listingRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import driverRoutes from "./routes/driverRoutes.js";
import driverAuthRoutes from "./routes/driverAuthRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import blogRoutes from "./routes/blogRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import seoRoutes from "./routes/seoRoutes.js";
import path from "path";
import { fileURLToPath } from "url";
import { connectDB } from "./config/db.js";
import { seedInitialData } from "./utils/seed.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;
const uploadsDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../uploads");

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(morgan("dev"));
app.use("/uploads", express.static(uploadsDir));

app.get("/api/health", (_req, res) => res.json({ ok: true, service: "backend" }));
app.use("/api/auth", authRoutes);
app.use("/api/listings", listingRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/drivers", driverRoutes);
app.use("/api/drivers/auth", driverAuthRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/seo", seoRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.statusCode || 500).json({
    message: err.message || "Something went wrong."
  });
});

async function start() {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is missing in backend/.env");
  }

  await connectDB(
    process.env.MONGO_URI,
    "mongodb://127.0.0.1:27017/chalo_omkareshwar"
  );
  await seedInitialData();
  app.listen(port, () => {
    console.log(`Backend running on port ${port}`);
  });
}

start().catch((error) => {
  console.error("Failed to start backend:", error);
  process.exit(1);
});

process.on("unhandledRejection", (error) => {
  console.error("Unhandled rejection:", error);
});
