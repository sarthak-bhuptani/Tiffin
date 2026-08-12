const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema(
  {
    date: {
      type: String, // Format: YYYY-MM-DD
      required: [true, 'Expense date is required'],
      index: true,
    },
    category: {
      type: String,
      enum: ['vegetables', 'grocery', 'gas', 'packaging', 'delivery', 'electricity', 'rent', 'other'],
      default: 'vegetables',
      required: [true, 'Expense category is required'],
      index: true,
    },
    amount: {
      type: Number,
      required: [true, 'Expense amount is required'],
      min: [0, 'Amount cannot be negative'],
    },
    note: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

expenseSchema.index({ date: 1, category: 1 });

const Expense = mongoose.model('Expense', expenseSchema);
module.exports = Expense;
