import { Router } from "express";
import { applyDriver, getMyDriverProfile } from "../controllers/driverController.js";
import { protect } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.get("/me", protect, asyncHandler(getMyDriverProfile));
router.post("/apply", protect, asyncHandler(applyDriver));

export default router;
