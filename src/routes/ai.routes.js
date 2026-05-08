// src/routes/ai.routes.js

import express from "express";
import { getAIInsights } from "../controllers/ai.controller.js";
import protect from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/insights", protect, getAIInsights);

export default router;
