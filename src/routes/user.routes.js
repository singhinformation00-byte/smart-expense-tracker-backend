import express from "express";
import {
  getProfile,
  updateProfile,
  updatePreferences,
  changePassword,
} from "../controllers/user.controller.js";
import protect from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);
router.put("/preferences", protect, updatePreferences);
router.put("/change-password", protect, changePassword);

export default router;
