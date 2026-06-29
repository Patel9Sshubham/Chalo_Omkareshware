import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";
import authRoutes from "./routes/authRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import listingRoutes from "./routes/listingRoutes.js";
import pricingRoutes from "./routes/pricingRoutes.js";
import blogRoutes from "./routes/blogRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import settingsRoutes from "./routes/settingsRoutes.js";
import { connectDB, resolveMongoUri } from "./config/db.js";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
const port = process.env.PORT || 4001;
const uploadsDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../uploads");

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(morgan("dev"));
app.use("/uploads", express.static(uploadsDir));
app.get("/images/:fileName", (req, res) => {
  const label = String(req.params.fileName || "image")
    .replace(/\.[^.]+$/, "")
    .replace(/[-_]+/g, " ")
    .trim()
    .slice(0, 30) || "image";

  res.type("image/svg+xml").send(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" role="img" aria-label="${label}">
      <defs>
        <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#f97316"/>
          <stop offset="55%" stop-color="#1d4ed8"/>
          <stop offset="100%" stop-color="#0f172a"/>
        </linearGradient>
      </defs>
      <rect width="1200" height="800" fill="url(#g)"/>
      <circle cx="970" cy="145" r="130" fill="rgba(255,255,255,0.12)"/>
      <circle cx="220" cy="610" r="180" fill="rgba(255,255,255,0.08)"/>
      <text x="70" y="680" fill="white" font-size="74" font-family="Poppins, Arial, sans-serif" font-weight="700">${label}</text>
      <text x="70" y="740" fill="rgba(255,255,255,0.85)" font-size="30" font-family="Poppins, Arial, sans-serif">Chalo Omkareshwar</text>
    </svg>
  `);
});

app.get("/api/health", (_req, res) => res.json({ ok: true, service: "admin-backend" }));
app.use("/api/admin/auth", authRoutes);
app.use("/api/admin/dashboard", dashboardRoutes);
app.use("/api/admin/listings", listingRoutes);
app.use("/api/admin/pricing", pricingRoutes);
app.use("/api/admin/blogs", blogRoutes);
app.use("/api/admin/reviews", reviewRoutes);
app.use("/api/admin/uploads", uploadRoutes);
app.use("/api/admin/settings", settingsRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.statusCode || 500).json({
    message: err.message || "Something went wrong."
  });
});

async function start() {
  const mongoUri = resolveMongoUri();
  await connectDB(mongoUri);
  app.listen(port, () => {
    console.log(`Admin backend running on port ${port}`);
  });
}

start().catch((error) => {
  console.error("Failed to start admin backend:", error);
  process.exit(1);
});

process.on("unhandledRejection", (error) => {
  console.error("Unhandled rejection:", error);
});
