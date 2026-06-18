import { Router } from "express";
import { createReview, getListingReviews } from "../controllers/reviewController.js";
import { protect } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.get("/:slug", asyncHandler(getListingReviews));
router.post("/:slug", protect, asyncHandler(createReview));

export default router;
