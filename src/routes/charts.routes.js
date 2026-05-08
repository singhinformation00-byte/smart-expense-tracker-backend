import express from "express";
import {
  getPieChartData,
  getLineChartData,
} from "../controllers/chart.Controller.js";
import protect from "../middleware/auth.middleware.js";

const router = express.Router();

// 📊 Pie Chart (Amount + Percentage)
router.get("/pie", protect, getPieChartData);

// 📈 Line Chart (Date-wise)
router.get("/line", protect, getLineChartData);

export default router;
