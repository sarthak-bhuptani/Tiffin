const Customer = require('../models/customer.model');
const DailyTiffin = require('../models/dailyTiffin.model');
const Payment = require('../models/payment.model');
const AppError = require('../utils/appError');

const createCustomer = async (customerData) => {
  const customer = await Customer.create(customerData);
  return customer;
};

const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const getCustomers = async (query = {}) => {
  const filter = {};
  if (query.active !== undefined) {
    filter.active = query.active === 'true' || query.active === true;
  }
  if (query.area) {
    const safeArea = escapeRegex(query.area);
    filter.area = new RegExp(safeArea, 'i');
  }
  if (query.search) {
    const safeSearch = escapeRegex(query.search);
    const searchRegex = new RegExp(safeSearch, 'i');
    filter.$or = [{ name: searchRegex }, { area: searchRegex }, { phone: searchRegex }];
  }

  const customers = await Customer.find(filter).sort({ name: 1 });
  return customers;
};

const getCustomerById = async (id) => {
  const customer = await Customer.findById(id);
  if (!customer) {
    throw new AppError('Customer not found', 404);
  }

  // Fetch history for customer
  const tiffins = await DailyTiffin.find({ customerId: id }).sort({ date: -1 });
  const payments = await Payment.find({ customerId: id }).sort({ paymentDate: -1 });

  let totalBilled = 0;
  let totalPaid = 0;
  let deliveredCount = 0;
  let skippedCount = 0;

  tiffins.forEach((t) => {
    if (t.status === 'delivered') {
      deliveredCount += 1;
      totalBilled += t.totalAmount;
      if (t.paymentStatus === 'PAID') {
        totalPaid += t.totalAmount;
      } else if (t.paymentStatus === 'PARTIAL') {
        totalPaid += t.paidAmount || 0;
      }
    } else if (t.status === 'skipped') {
      skippedCount += 1;
    }
  });

  // Calculate external direct payments
  payments.forEach((p) => {
    // Check if not already attached to a tiffin marked as paid to avoid double count
    if (!p.tiffinId) {
      totalPaid += p.amount;
    }
  });

  const totalPending = Math.max(0, totalBilled - totalPaid);
  const advanceBalance = Math.max(0, totalPaid - totalBilled);

  return {
    customer,
    stats: {
      totalTiffins: tiffins.length,
      deliveredCount,
      skippedCount,
      totalBilled,
      totalPaid,
      totalPending,
      advanceBalance,
    },
    tiffins,
    payments,
  };
};

const updateCustomer = async (id, updateData) => {
  const customer = await Customer.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });
  if (!customer) {
    throw new AppError('Customer not found', 404);
  }
  return customer;
};

const deleteCustomer = async (id) => {
  const customer = await Customer.findByIdAndDelete(id);
  if (!customer) {
    throw new AppError('Customer not found', 404);
  }
  return customer;
};

module.exports = {
  createCustomer,
  getCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
};
