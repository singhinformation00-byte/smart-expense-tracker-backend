import PDFDocument from "pdfkit";
import Transaction from "../models/Transaction.js";
import mongoose from "mongoose";

export const getSummaryReport = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user._id);
    const { range } = req.query;

    const now = new Date();

    let startDate = null;

    // 🔥 RANGE LOGIC
    if (range === "week") {
      startDate = new Date();
      startDate.setDate(now.getDate() - 7);
    } else if (range === "month") {
      startDate = new Date();
      startDate.setMonth(now.getMonth() - 1);
    } else if (range === "3months") {
      startDate = new Date();
      startDate.setMonth(now.getMonth() - 3);
    } else if (range === "6months") {
      startDate = new Date();
      startDate.setMonth(now.getMonth() - 6);
    } else if (range === "year") {
      startDate = new Date();
      startDate.setFullYear(now.getFullYear() - 1);
    }

    // =========================
    // 🔥 CURRENT FILTER
    // =========================
    const match = { user: userId };
    if (startDate) {
      match.date = { $gte: startDate };
    }

    // =========================
    // 🔥 CURRENT TOTALS
    // =========================
    const currentTotals = await Transaction.aggregate([
      { $match: match },
      {
        $group: {
          _id: "$type",
          total: { $sum: "$amount" },
        },
      },
    ]);

    let totalIncome = 0;
    let totalExpense = 0;

    currentTotals.forEach((item) => {
      if (item._id === "income") totalIncome = item.total;
      if (item._id === "expense") totalExpense = item.total;
    });

    const balance = totalIncome - totalExpense;

    // =========================
    // 🔥 GROWTH CALCULATION
    // =========================
    let incomeGrowth = 0;
    let expenseGrowth = 0;

    if (startDate) {
      const diff = now - startDate;

      const prevStart = new Date(startDate.getTime() - diff);
      const prevEnd = startDate;

      const prevTotals = await Transaction.aggregate([
        {
          $match: {
            user: userId,
            date: { $gte: prevStart, $lt: prevEnd },
          },
        },
        {
          $group: {
            _id: "$type",
            total: { $sum: "$amount" },
          },
        },
      ]);

      let prevIncome = 0;
      let prevExpense = 0;

      prevTotals.forEach((item) => {
        if (item._id === "income") prevIncome = item.total;
        if (item._id === "expense") prevExpense = item.total;
      });

      // 🔥 growth formula
      const calcGrowth = (curr, prev) => {
        if (prev === 0) {
          if (curr === 0) return 0;
          return "New"; // 🔥 best UX
        }

        return (((curr - prev) / prev) * 100).toFixed(1);
      };

      incomeGrowth = calcGrowth(totalIncome, prevIncome);
      expenseGrowth = calcGrowth(totalExpense, prevExpense);
    }

    // =========================
    // 📤 FINAL RESPONSE
    // =========================
    res.json({
      success: true,
      data: {
        totalIncome,
        totalExpense,
        balance,
        incomeGrowth,
        expenseGrowth,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const exportCSV = async (req, res) => {
  try {
    const userId = req.user._id;

    const transactions = await Transaction.find({ user: userId }).populate(
      "category",
    );

    // =========================
    // 🔥 CALCULATE TOTALS
    // =========================
    let totalIncome = 0;
    let totalExpense = 0;

    transactions.forEach((t) => {
      if (t.type === "income") totalIncome += t.amount;
      if (t.type === "expense") totalExpense += t.amount;
    });

    const balance = totalIncome - totalExpense;

    // =========================
    // 🧾 CSV BUILD
    // =========================
    let csv = "";

    // 🔥 Summary section
    csv += "Summary\n";
    csv += `Total Income,${totalIncome}\n`;
    csv += `Total Expense,${totalExpense}\n`;
    csv += `Balance,${balance}\n\n`;

    // 🔥 Table header
    csv += "Type,Amount,Category,Date\n";

    // 🔥 Transactions
    transactions.forEach((t) => {
      const formattedDate = new Date(t.date).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });

      csv += `${t.type},${t.amount},${
        t.category?.label || "N/A"
      },${formattedDate}\n`;
    });

    // =========================
    // 📤 RESPONSE
    // =========================
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=report.csv");

    res.status(200).send(csv);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const exportPDF = async (req, res) => {
  try {
    const userId = req.user._id;

    const transactions = await Transaction.find({ user: userId }).populate(
      "category",
    );

    // =========================
    // 🔥 CALCULATE TOTALS
    // =========================
    let totalIncome = 0;
    let totalExpense = 0;

    transactions.forEach((t) => {
      if (t.type === "income") totalIncome += t.amount;
      if (t.type === "expense") totalExpense += t.amount;
    });

    const balance = totalIncome - totalExpense;

    // =========================
    // 📄 CREATE PDF
    // =========================
    const doc = new PDFDocument();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=report.pdf");

    doc.pipe(res);

    // =========================
    // 🧾 TITLE
    // =========================
    doc.fontSize(20).text("Finance Report", { align: "center" });
    doc.moveDown();

    // =========================
    // 📊 SUMMARY
    // =========================
    doc.fontSize(14).text("Summary:");
    doc.moveDown(0.5);

    doc.text(`Total Income: ₹${totalIncome}`);
    doc.text(`Total Expense: ₹${totalExpense}`);
    doc.text(`Balance: ₹${balance}`);
    doc.moveDown();

    // =========================
    // 📋 TABLE HEADER
    // =========================
    doc.fontSize(14).text("Transactions:");
    doc.moveDown(0.5);

    doc.fontSize(12);
    doc.text("Type | Amount | Category | Date");
    doc.moveDown(0.5);

    // =========================
    // 📄 TRANSACTIONS
    // =========================
    transactions.forEach((t) => {
      const formattedDate = new Date(t.date).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });

      doc.text(
        `${t.type} | ₹${t.amount} | ${
          t.category?.label || "N/A"
        } | ${formattedDate}`,
      );
    });

    // =========================
    // 📤 END
    // =========================
    doc.end();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
