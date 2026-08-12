const Payment = require('../models/payment.model');
const DailyTiffin = require('../models/dailyTiffin.model');
const Customer = require('../models/customer.model');
const AppError = require('../utils/appError');

const recordPayment = async (data) => {
  let customerName = data.customerName || '';
  if (data.customerId && !customerName) {
    const customer = await Customer.findById(data.customerId);
    if (customer) {
      customerName = customer.name;
    }
  }

  const payment = await Payment.create({
    customerId: data.customerId || null,
    customerName,
    tiffinId: data.tiffinId || null,
    amount: data.amount,
    paymentDate: data.paymentDate,
    paymentMethod: data.paymentMethod || 'cash',
    notes: data.notes || '',
  });

  // If payment is linked to a specific tiffin entry, update tiffin payment status
  if (data.tiffinId) {
    const tiffin = await DailyTiffin.findById(data.tiffinId);
    if (tiffin) {
      const newPaidAmount = (tiffin.paidAmount || 0) + data.amount;
      let newPaymentStatus = 'PARTIAL';
      if (newPaidAmount >= tiffin.totalAmount) {
        newPaymentStatus = 'PAID';
      }
      await DailyTiffin.findByIdAndUpdate(data.tiffinId, {
        paidAmount: newPaidAmount,
        paymentStatus: newPaymentStatus,
      });
    }
  }

  return payment;
};

const getPayments = async (query = {}) => {
  const filter = {};
  if (query.customerId) {
    filter.customerId = query.customerId;
  }
  if (query.startDate && query.endDate) {
    filter.paymentDate = { $gte: query.startDate, $lte: query.endDate };
  } else if (query.paymentDate) {
    filter.paymentDate = query.paymentDate;
  }

  const payments = await Payment.find(filter).sort({ paymentDate: -1, createdAt: -1 });
  return payments;
};

const getCustomerPayments = async (customerId) => {
  const payments = await Payment.find({ customerId }).sort({ paymentDate: -1 });
  return payments;
};

const deletePayment = async (id) => {
  const payment = await Payment.findByIdAndDelete(id);
  if (!payment) {
    throw new AppError('Payment record not found', 404);
  }
  return payment;
};

module.exports = {
  recordPayment,
  getPayments,
  getCustomerPayments,
  deletePayment,
};
