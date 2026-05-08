import mongoose from "mongoose";
import Transaction from "../models/Transaction.js";
const getPieChartData = async (req, res) => {
  try {
    const userId = req.user.id;

    const data = await Transaction.aggregate([
      // 1️⃣ Filter
      {
        $match: {
          user: new mongoose.Types.ObjectId(req.user.id),
          type: "expense", // optional but recommended
        },
      },

      // 2️⃣ 🔥 JOIN CATEGORY (YAHAN USE KARNA HAI)
      {
        $lookup: {
          from: "categories",
          localField: "category",
          foreignField: "_id",
          as: "categoryData",
        },
      },
      {
        $unwind: "$categoryData",
      },

      // 3️⃣ GROUP BY CATEGORY LABEL
      {
        $group: {
          _id: "$categoryData.label", // 👈 yahi important hai
          amount: { $sum: "$amount" },
        },
      },

      // 4️⃣ TOTAL CALCULATION
      {
        $group: {
          _id: null,
          categories: {
            $push: {
              category: "$_id",
              amount: "$amount",
            },
          },
          totalAmount: { $sum: "$amount" },
        },
      },

      // 5️⃣ UNWIND
      { $unwind: "$categories" },

      // 6️⃣ FINAL OUTPUT
      {
        $project: {
          _id: 0,
          category: "$categories.category",
          amount: "$categories.amount",
          percentage: {
            $cond: [
              { $eq: ["$totalAmount", 0] },
              0,
              {
                $round: [
                  {
                    $multiply: [
                      { $divide: ["$categories.amount", "$totalAmount"] },
                      100,
                    ],
                  },
                  2,
                ],
              },
            ],
          },
        },
      },

      // 7️⃣ SORT
      { $sort: { amount: -1 } },
    ]);

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

const getLineChartData = async (req, res) => {
  try {
    const userId = req.user.id;

    const data = await Transaction.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(userId),
        },
      },

      // 📅 Month extract
      {
        $group: {
          _id: {
            month: { $month: "$date" },
            year: { $year: "$date" },
            type: "$type",
          },
          total: { $sum: "$amount" },
        },
      },

      // 🔄 reshape data
      {
        $group: {
          _id: {
            month: "$_id.month",
            year: "$_id.year",
          },
          income: {
            $sum: {
              $cond: [{ $eq: ["$_id.type", "income"] }, "$total", 0],
            },
          },
          expense: {
            $sum: {
              $cond: [{ $eq: ["$_id.type", "expense"] }, "$total", 0],
            },
          },
        },
      },

      // 📤 format output
      {
        $project: {
          _id: 0,
          month: "$_id.month",
          year: "$_id.year",
          income: 1,
          expense: 1,
        },
      },

      // 📊 sort
      {
        $sort: { year: 1, month: 1 },
      },
    ]);

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

export { getPieChartData, getLineChartData };
