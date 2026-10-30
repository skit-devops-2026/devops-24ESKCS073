
const mongoose = require("mongoose");

const sharedExpenseSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    paidBy: [
      {
        name: String,
        amount: Number,
      },
    ],
    participants: [
      {
        name: String,
        share: Number,
      },
    ],
    splitType: {
      type: String,
      default: "Equal",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SharedExpense", sharedExpenseSchema);
