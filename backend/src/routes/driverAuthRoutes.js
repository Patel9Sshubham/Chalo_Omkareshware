import { Router } from "express";
import { getDriverBookings, getDriverDashboard, loginDriver, respondToBooking } from "../controllers/driverController.js";
import { protectDriver } from "../middleware/driverAuth.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.post("/login", asyncHandler(loginDriver));
router.get("/dashboard", protectDriver, asyncHandler(getDriverDashboard));
router.get("/bookings", protectDriver, asyncHandler(getDriverBookings));
router.patch("/bookings/:id/respond", protectDriver, asyncHandler(respondToBooking));

export default router;
