import { Router } from "express";
import { login, me, register } from "../controllers/authController.js";
import { protect } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { applyDriver } from "../controllers/driverController.js";

const router = Router();

router.post("/register", asyncHandler(register));
router.post("/login", asyncHandler(login));
router.get("/me", protect, asyncHandler(me));
router.post("/driver-apply", asyncHandler(applyDriver));

export default router;
