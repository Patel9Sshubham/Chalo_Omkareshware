import { Router } from "express";
import { createListing, deleteListing, getListings, updateListing } from "../controllers/listingController.js";
import { protectAdmin } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.get("/", protectAdmin, asyncHandler(getListings));
router.post("/", protectAdmin, asyncHandler(createListing));
router.put("/:id", protectAdmin, asyncHandler(updateListing));
router.delete("/:id", protectAdmin, asyncHandler(deleteListing));

export default router;
