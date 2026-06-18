import { Router } from "express";
import { createBlog, deleteBlog, getBlogs, updateBlog } from "../controllers/blogController.js";
import { protectAdmin } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.get("/", protectAdmin, asyncHandler(getBlogs));
router.post("/", protectAdmin, asyncHandler(createBlog));
router.put("/:id", protectAdmin, asyncHandler(updateBlog));
router.delete("/:id", protectAdmin, asyncHandler(deleteBlog));

export default router;
