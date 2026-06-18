import { Router } from "express";
import { deleteReview, getReviews, updateReview } from "../controllers/reviewController.js";
import { protectAdmin } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.get("/", protectAdmin, asyncHandler(getReviews));
router.patch("/:id", protectAdmin, asyncHandler(updateReview));
router.delete("/:id", protectAdmin, asyncHandler(deleteReview));

export default router;
