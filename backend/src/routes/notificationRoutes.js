import { Router } from "express";
import { getMyNotifications, markNotificationRead } from "../controllers/notificationController.js";
import { protect } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.get("/mine", protect, asyncHandler(getMyNotifications));
router.patch("/:id/read", protect, asyncHandler(markNotificationRead));

export default router;
