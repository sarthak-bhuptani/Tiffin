const mongoose = require('mongoose');

const dailyTiffinSchema = new mongoose.Schema(
  {
    date: {
      type: String, // Format: YYYY-MM-DD
      required: [true, 'Date is required'],
      index: true,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      default: null,
      index: true,
    },
    customerName: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true,
    },
    area: {
      type: String,
      trim: true,
      default: 'General',
      index: true,
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      default: 1,
      min: [0, 'Quantity cannot be negative'],
    },
    unitPrice: {
      type: Number,
      required: [true, 'Unit price is required'],
      min: [0, 'Unit price cannot be negative'],
    },
    totalAmount: {
      type: Number,
      required: [true, 'Total amount is required'],
      min: [0, 'Total amount cannot be negative'],
    },
    status: {
      type: String,
      enum: ['delivered', 'skipped', 'cancelled'],
      default: 'delivered',
    },
    skipReason: {
      type: String,
      trim: true,
    },
    paymentStatus: {
      type: String,
      enum: ['PAID', 'PENDING', 'PARTIAL'],
      default: 'PENDING',
      index: true,
    },
    paidAmount: {
      type: Number,
      default: 0,
      min: [0, 'Paid amount cannot be negative'],
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

dailyTiffinSchema.index({ date: 1, customerId: 1 });
dailyTiffinSchema.index({ date: 1, paymentStatus: 1 });

const DailyTiffin = mongoose.model('DailyTiffin', dailyTiffinSchema);
module.exports = DailyTiffin;
