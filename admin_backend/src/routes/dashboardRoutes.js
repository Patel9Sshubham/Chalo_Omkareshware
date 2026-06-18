import { Router } from "express";
import { getBookings, getDrivers, getNotifications, getPayments, getSupportTickets, getUsers, summary, updateBookingStatus, updateDriverStatus, updateSupportTicket } from "../controllers/dashboardController.js";
import { protectAdmin } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.get("/summary", protectAdmin, asyncHandler(summary));
router.get("/users", protectAdmin, asyncHandler(getUsers));
router.get("/drivers", protectAdmin, asyncHandler(getDrivers));
router.get("/bookings", protectAdmin, asyncHandler(getBookings));
router.get("/payments", protectAdmin, asyncHandler(getPayments));
router.get("/notifications", protectAdmin, asyncHandler(getNotifications));
router.get("/tickets", protectAdmin, asyncHandler(getSupportTickets));
router.patch("/bookings/:id", protectAdmin, asyncHandler(updateBookingStatus));
router.patch("/drivers/:id", protectAdmin, asyncHandler(updateDriverStatus));
router.patch("/tickets/:id", protectAdmin, asyncHandler(updateSupportTicket));

export default router;
