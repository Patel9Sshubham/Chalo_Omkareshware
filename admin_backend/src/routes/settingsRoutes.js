import { Router } from "express";
import { protectAdmin } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { updateAdminPassword } from "../controllers/settingsController.js";

const router = Router();

router.put("/password", protectAdmin, asyncHandler(updateAdminPassword));

export default router;
