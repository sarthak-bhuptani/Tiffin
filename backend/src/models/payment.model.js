const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      default: null,
      index: true,
    },
    customerName: {
      type: String,
      trim: true,
    },
    tiffinId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DailyTiffin',
      default: null,
    },
    amount: {
      type: Number,
      required: [true, 'Payment amount is required'],
      min: [0, 'Amount cannot be negative'],
    },
    paymentDate: {
      type: String, // Format: YYYY-MM-DD
      required: [true, 'Payment date is required'],
      index: true,
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'upi', 'bank_transfer', 'other'],
      default: 'cash',
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

paymentSchema.index({ customerId: 1, paymentDate: 1 });

const Payment = mongoose.model('Payment', paymentSchema);
module.exports = Payment;
