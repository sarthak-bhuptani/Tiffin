const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true,
      index: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    area: {
      type: String,
      trim: true,
      default: 'General',
      index: true,
    },
    defaultQuantity: {
      type: Number,
      default: 1,
      min: [1, 'Default quantity must be at least 1'],
    },
    defaultPrice: {
      type: Number,
      default: 60,
      min: [0, 'Default price cannot be negative'],
    },
    defaultLunchPrice: {
      type: Number,
      default: 60,
      min: [0, 'Default price cannot be negative'],
    },
    defaultDinnerPrice: {
      type: Number,
      default: 80,
      min: [0, 'Default price cannot be negative'],
    },
    planType: {
      type: String,
      enum: ['daily', 'monthly'],
      default: 'daily',
    },
    active: {
      type: Boolean,
      default: true,
      index: true,
    },
    startDate: {
      type: Date,
      default: Date.now,
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

customerSchema.index({ name: 'text', area: 'text', phone: 'text' });

const Customer = mongoose.model('Customer', customerSchema);
module.exports = Customer;
