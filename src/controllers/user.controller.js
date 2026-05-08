import User from "../models/User.js";
import bcrypt from "bcryptjs";

// =========================
// GET PROFILE
// =========================
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =========================
// UPDATE PROFILE
// =========================
export const updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;

    const user = await User.findById(req.user._id);

    user.name = name || user.name;
    user.email = email || user.email;

    // 🔥 IMPORTANT FIX
    await user.save({ validateBeforeSave: false });

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =========================
// UPDATE PREFERENCES
// =========================
export const updatePreferences = async (req, res) => {
  try {
    const { currency, notifications } = req.body;

    const user = await User.findById(req.user._id);

    if (currency) user.preferences.currency = currency;
    if (notifications !== undefined)
      user.preferences.notifications = notifications;

    await user.save({ validateBeforeSave: false });

    res.json({
      success: true,
      data: user.preferences,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =========================
// 🔥 CHANGE PASSWORD (IMPORTANT)
// =========================
export const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    // 🔍 validation
    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "All fields required",
      });
    }

    const user = await User.findById(req.user._id);

    // 🔐 check old password
    const isMatch = await bcrypt.compare(oldPassword, user.password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Old password is incorrect",
      });
    }

    // 🔥 set new password
    user.password = newPassword;

    await user.save(); // pre hook hash karega

    res.json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
