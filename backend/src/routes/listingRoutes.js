import { Router } from "express";
import { getAttractions, getHomeData, getListingBySlug, getListings, getTravelGuide } from "../controllers/listingController.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.get("/home", asyncHandler(getHomeData));
router.get("/guide", asyncHandler(getTravelGuide));
router.get("/attractions", asyncHandler(getAttractions));
router.get("/", asyncHandler(getListings));
router.get("/:slug", asyncHandler(getListingBySlug));

export default router;
