import { Router } from "express";
import { getPricing, updatePricing } from "../controllers/pricingController.js";
import { protectAdmin } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.get("/", protectAdmin, asyncHandler(getPricing));
router.put("/", protectAdmin, asyncHandler(updatePricing));

export default router;
