import { Router } from "express";
import { createBooking, getMyBookings, cancelBooking, getBookingDetails, getBookingFeed, estimateBooking } from "../controllers/bookingController.js";
import { protect } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.get("/mine", protect, asyncHandler(getMyBookings));
router.get("/feed", protect, asyncHandler(getBookingFeed));
router.post("/estimate", asyncHandler(estimateBooking));
router.get("/:bookingId", protect, asyncHandler(getBookingDetails));
router.post("/", protect, asyncHandler(createBooking));
router.patch("/:id/cancel", protect, asyncHandler(cancelBooking));

export default router;
