import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    label: {
      type: String,
      required: true,
      trim: true,
    },

    value: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    icon: {
      type: String,
      default: "📦",
    },

    type: {
      type: String,
      enum: ["income", "expense"],
      required: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

// 🔥 unique per user
categorySchema.index({ value: 1, user: 1 }, { unique: true });
categorySchema.set("autoIndex", true);

export default mongoose.model("Category", categorySchema);
