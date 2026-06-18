import { Router } from "express";
import { uploadImage } from "../controllers/uploadController.js";
import { protectAdmin } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.post("/image", protectAdmin, asyncHandler(uploadImage));

export default router;
