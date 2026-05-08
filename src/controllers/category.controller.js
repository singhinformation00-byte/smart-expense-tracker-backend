import Category from "../models/Category.js";
import Transaction from "../models/Transaction.js";

//CREATE CATEGORY
export const createCategory = async (req, res) => {
  try {
    const { label, value, icon, type } = req.body;

    if (!label || !value || !type) {
      return res.status(400).json({
        success: false,
        message: "Label, value and type are required",
      });
    }

    const exists = await Category.findOne({
      value,
      user: req.user?._id,
    });
    if (exists) {
      return res.status(400).json({
        success: false,
        message: "Category already exists",
      });
    }

    const category = await Category.create({
      label,
      value,
      icon,
      type,
      user: req.user._id,
    });

    res.status(201).json({
      success: true,
      data: category,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET ALL CATEGORIES
export const getCategories = async (req, res) => {
  try {
    const { type } = req.query;

    const matchStage = {
      $or: [{ user: req.user?._id }, { user: null }],
    };

    if (type) {
      matchStage.type = type;
    }

    const categories = await Category.aggregate([
      {
        $match: matchStage,
      },

      // 🔥 join with transactions
      {
        $lookup: {
          from: "transactions",
          localField: "_id",
          foreignField: "category",
          as: "transactions",
        },
      },

      // 🔥 count transactions
      {
        $addFields: {
          transactionCount: { $size: "$transactions" },
        },
      },

      // 🔥 clean response
      {
        $project: {
          _id: 1,
          label: 1,
          value: 1,
          icon: 1,
          type: 1,
          transactionCount: 1,
        },
      },
    ]);

    res.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// UPDATE CATEGORY
export const updateCategory = async (req, res) => {
  try {
    const category = await Category.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    category.label = req.body?.label || category.label;
    category.icon = req.body?.icon || category.icon;
    category.type = req.body?.type || category.type;

    await category.save();

    res.json({
      success: true,
      data: category,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

//  DELETE CATEGORY
export const deleteCategory = async (req, res) => {
  try {
    // deleteCategory
    const transactions = await Transaction.findOne({
      category: req.params.id,
      user: req.user._id,
    });

    if (transactions) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete category with transactions",
      });
    }

    const category = await Category.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    await category.deleteOne();

    res.json({
      success: true,
      message: "Category deleted",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
