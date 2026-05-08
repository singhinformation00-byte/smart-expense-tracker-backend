import express from "express";
import {
  getSummaryReport,
  exportCSV,
  exportPDF,
} from "../controllers/report.controller.js";
import protect from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/summary", protect, getSummaryReport);
router.get("/export/csv", protect, exportCSV);
router.get("/export/pdf", protect, exportPDF);

export default router;
