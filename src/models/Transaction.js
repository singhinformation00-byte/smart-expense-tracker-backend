import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["income", "expense"],
      required: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 1,
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },

    paymentType: {
      type: String,
      enum: ["cash", "online", "card", "other"],
      default: "cash",
    },

    date: {
      type: Date,
      required: true,
    },

    notes: {
      type: String,
      trim: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);
transactionSchema.index({ user: 1, date: -1 });
export default mongoose.model("Transaction", transactionSchema);
