import { Router } from "express";
import { createSupportTicket, getProfile, getSupportTickets, toggleFavorite, updateProfile } from "../controllers/profileController.js";
import { protect } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.get("/", protect, asyncHandler(getProfile));
router.put("/", protect, asyncHandler(updateProfile));
router.patch("/favorites/:id", protect, asyncHandler(toggleFavorite));
router.get("/tickets", protect, asyncHandler(getSupportTickets));
router.post("/tickets", protect, asyncHandler(createSupportTicket));

export default router;
