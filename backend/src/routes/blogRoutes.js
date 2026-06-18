import { Router } from "express";
import { getBlogBySlug, getBlogs } from "../controllers/blogController.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.get("/", asyncHandler(getBlogs));
router.get("/:slug", asyncHandler(getBlogBySlug));

export default router;
