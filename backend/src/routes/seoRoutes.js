import { Router } from "express";
import { getLandingPage, getLandingPages } from "../controllers/seoController.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.get("/pages", asyncHandler(getLandingPages));
router.get("/pages/:slug", asyncHandler(getLandingPage));

export default router;
