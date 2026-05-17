import express from "express";
import {
  createTransaction,
  getTransactions,
  updateTransaction,
  deleteTransaction,
  getRecentExpenses,
  getCategoryTotals,
} from "../controllers/transaction.controller.js";
import protect from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", protect, createTransaction);
router.get("/", protect, getTransactions);
router.put("/:id", protect, updateTransaction);
router.delete("/:id", protect, deleteTransaction);
router.get("/recent", protect, getRecentExpenses);
router.get("/category-totals", protect, getCategoryTotals);

export default router;
