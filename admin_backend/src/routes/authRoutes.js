import { Router } from "express";
import { login, me } from "../controllers/authController.js";
import { protectAdmin } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.post("/login", asyncHandler(login));
router.get("/me", protectAdmin, asyncHandler(me));

export default router;
