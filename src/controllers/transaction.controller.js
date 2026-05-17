import Transaction from "../models/Transaction.js";
import mongoose from "mongoose";

// ===============================
// CREATE TRANSACTION
// ===============================
export const createTransaction = async (req, res) => {
  try {
    const { type, amount, category, paymentType, date, notes } = req.body;

    if (!type || !amount || !category || !date) {
      return res.status(400).json({
        success: false,
        message: "Required fields missing",
      });
    }

    const transaction = await Transaction.create({
      type,
      amount,
      category,
      paymentType,
      date,
      notes,
      user: req.user._id,
    });

    res.status(201).json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ===============================
// GET TRANSACTIONS
// ===============================
export const getTransactions = async (req, res) => {
  try {
    const { type, category, search } = req.query;

    const filter = {
      user: req.user._id,
    };

    // 🔥 type filter
    if (type) {
      filter.type = type;
    }

    // 🔥 category filter
    if (category && category !== "all") {
      filter.category = category;
    }

    // 🔥 notes search
    if (search) {
      filter.$or = [
        {
          notes: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    const transactions = await Transaction.find(filter)
      .populate({
        path: "category",
        match: search
          ? {
              label: {
                $regex: search,
                $options: "i",
              },
            }
          : {},
      })
      .sort({ date: -1 });

    // 🔥 remove null categories after populate search
    const filteredTransactions = transactions.filter(
      (tx) => tx.category || !search,
    );

    res.json({
      success: true,
      data: filteredTransactions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ===============================
// UPDATE TRANSACTION
// ===============================
export const updateTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    Object.assign(transaction, req.body);

    await transaction.save();

    res.json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ===============================
// DELETE TRANSACTION
// ===============================
export const deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    await transaction.deleteOne();

    res.json({
      success: true,
      message: "Transaction deleted",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ===============================
// RECENT EXPENSES
// ===============================
export const getRecentExpenses = async (req, res) => {
  try {
    const data = await Transaction.find({
      user: new mongoose.Types.ObjectId(req.user._id),
    })
      .populate("category")
      .sort({ date: -1 })
      .limit(5);

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getCategoryTotals = async (req, res) => {
  try {
    const totals = await Transaction.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(req.user._id),
        },
      },

      {
        $lookup: {
          from: "categories",
          localField: "category",
          foreignField: "_id",
          as: "category",
        },
      },

      {
        $unwind: "$category",
      },

      {
        $group: {
          _id: "$category.label",

          total: {
            $sum: "$amount",
          },
        },
      },

      {
        $project: {
          _id: 0,
          category: "$_id",
          total: 1,
        },
      },

      {
        $sort: {
          total: -1,
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: totals,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
