import { Router } from "express";
import { createRazorpayOrder, getMyPayments, verifyRazorpayPayment } from "../controllers/paymentController.js";
import { protect } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.post("/razorpay-order", protect, asyncHandler(createRazorpayOrder));
router.post("/razorpay-verify", protect, asyncHandler(verifyRazorpayPayment));
router.get("/mine", protect, asyncHandler(getMyPayments));

export default router;
