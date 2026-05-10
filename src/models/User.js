import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please use a valid email"],
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    preferences: {
      currency: { type: String, default: "INR" },
      notifications: { type: Boolean, default: true },
    },
    resetPasswordToken: {
      type: String,
    },

    resetPasswordExpire: {
      type: Date,
    },
  },
  { timestamps: true },
);

// 🔥 FIXED PRE HOOK
userSchema.pre("save", async function () {
  try {
    if (!this.isModified("password")) return;

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  } catch (err) {
    throw err; // ✅ next की जरूरत नहीं
  }
});

// 🔐 compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model("User", userSchema);
