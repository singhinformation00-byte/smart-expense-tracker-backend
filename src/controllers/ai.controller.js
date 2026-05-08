import Transaction from "../models/Transaction.js";
import mongoose from "mongoose";

export const getAIInsights = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user._id);

    // 🔥 Get all transactions
    const transactions = await Transaction.find({ user: userId }).populate(
      "category",
    );

    let insights = [];

    let income = 0;
    let expense = 0;

    let categoryTotals = {};
    let weekendExpense = 0;
    let weekdayExpense = 0;

    // =========================
    // 🔍 PROCESS DATA
    // =========================
    transactions.forEach((tx) => {
      const day = new Date(tx.date).getDay(); // 0 = Sunday, 6 = Saturday

      if (tx.type === "income") {
        income += tx.amount;
      } else {
        expense += tx.amount;

        // category total
        const cat = tx.category?.label || "Other";
        categoryTotals[cat] = (categoryTotals[cat] || 0) + tx.amount;

        // 🔥 weekend logic
        if (day === 0 || day === 6) {
          weekendExpense += tx.amount;
        } else {
          weekdayExpense += tx.amount;
        }
      }
    });

    // =========================
    // 🔥 1️⃣ TOP CATEGORY %
    // =========================
    let topCategory = "";
    let topValue = 0;

    for (let cat in categoryTotals) {
      if (categoryTotals[cat] > topValue) {
        topValue = categoryTotals[cat];
        topCategory = cat;
      }
    }

    if (topCategory && expense > 0) {
      const percent = ((topValue / expense) * 100).toFixed(1);

      insights.push({
        title: "Top Spending",
        message: `You spent ${percent}% on ${topCategory}`,
        type: percent > 40 ? "danger" : "warning",
      });
    }

    // =========================
    // 🔥 2️⃣ OVERSPENDING
    // =========================
    const balance = income - expense;

    if (balance < 0) {
      insights.push({
        title: "Overspending Alert",
        message: `You overspent ₹${Math.abs(balance)}`,
        type: "danger",
      });
    }

    // =========================
    // 🔥 3️⃣ SAVINGS
    // =========================
    if (income > 0 && balance > 0) {
      const savingRate = ((balance / income) * 100).toFixed(1);

      insights.push({
        title: "Savings Insight",
        message: `You saved ${savingRate}% of your income`,
        type: "success",
      });
    }

    // =========================
    // 🔥 4️⃣ SMART TIP
    // =========================
    if (topCategory && topValue > expense * 0.4) {
      insights.push({
        title: "Smart Tip",
        message: `Try reducing ${topCategory} expenses to save more`,
        type: "warning",
      });
    }

    // =========================
    // 🔥 5️⃣ WEEKEND INSIGHT
    // =========================
    const totalExpense = weekendExpense + weekdayExpense;

    if (totalExpense > 0) {
      const weekendPercent = ((weekendExpense / totalExpense) * 100).toFixed(1);

      if (weekendPercent > 40) {
        insights.push({
          title: "Weekend Spending",
          message: `You spend ${weekendPercent}% on weekends`,
          type: "warning",
        });
      }
    }

    // =========================
    // 📤 LIMIT TO 3 CARDS
    // =========================
    const finalInsights = insights.slice(0, 3);

    res.json({
      success: true,
      data: finalInsights,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
