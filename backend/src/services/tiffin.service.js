const DailyTiffin = require('../models/dailyTiffin.model');
const Customer = require('../models/customer.model');
const AppError = require('../utils/appError');

const createSingleTiffin = async (data) => {
  let customerId = data.customerId || null;

  // If saveAsRegular flag is set and customerId is not provided, check or create customer
  if (data.saveAsRegular && !customerId) {
    let existingCustomer = await Customer.findOne({ name: data.customerName });
    if (!existingCustomer) {
      existingCustomer = await Customer.create({
        name: data.customerName,
        area: data.area || 'General',
        defaultQuantity: data.quantity || 1,
        defaultPrice: data.unitPrice || 60,
      });
    }
    customerId = existingCustomer._id;
  }

  const totalAmount = data.status === 'skipped' ? 0 : (data.totalAmount !== undefined ? data.totalAmount : (data.quantity || 1) * (data.unitPrice || 0));

  let paidAmount = 0;
  if (data.paymentStatus === 'PAID') {
    paidAmount = totalAmount;
  } else if (data.paymentStatus === 'PARTIAL') {
    paidAmount = data.paidAmount || 0;
  }

  const tiffin = await DailyTiffin.create({
    date: data.date,
    customerId,
    customerName: data.customerName,
    area: data.area || 'General',
    quantity: data.status === 'skipped' ? 0 : data.quantity,
    unitPrice: data.unitPrice,
    totalAmount,
    status: data.status || 'delivered',
    mealType: data.mealType || 'lunch',
    skipReason: data.skipReason || '',
    paymentStatus: data.paymentStatus || 'PENDING',
    paidAmount,
    notes: data.notes || '',
  });

  return tiffin;
};

const createBulkTiffins = async (date, entries, deletedIds = []) => {
  // 1. Delete entries in deletedIds
  if (deletedIds && deletedIds.length > 0) {
    await DailyTiffin.deleteMany({ _id: { $in: deletedIds } });
  }

  const tiffinsToCreate = [];
  const updatedTiffins = [];

  for (const entry of entries) {
    const totalAmount = entry.status === 'skipped' ? 0 : (entry.totalAmount !== undefined ? entry.totalAmount : (entry.quantity || 1) * (entry.unitPrice || 0));
    let paidAmount = 0;
    if (entry.paymentStatus === 'PAID') {
      paidAmount = totalAmount;
    } else if (entry.paymentStatus === 'PARTIAL') {
      paidAmount = entry.paidAmount || 0;
    }

    const tiffinData = {
      date,
      customerId: entry.customerId || null,
      customerName: entry.customerName,
      area: entry.area || 'General',
      quantity: entry.status === 'skipped' ? 0 : (entry.quantity || 1),
      unitPrice: entry.unitPrice,
      totalAmount,
      status: entry.status || 'delivered',
      mealType: entry.mealType || 'lunch',
      skipReason: entry.skipReason || '',
      paymentStatus: entry.paymentStatus || 'PENDING',
      paidAmount,
      notes: entry.notes || '',
    };

    if (entry._id) {
      const updated = await DailyTiffin.findByIdAndUpdate(entry._id, tiffinData, {
        new: true,
        runValidators: true,
      });
      if (updated) {
        updatedTiffins.push(updated);
      }
    } else {
      tiffinsToCreate.push(tiffinData);
    }
  }

  // 2. Insert new entries
  let createdTiffins = [];
  if (tiffinsToCreate.length > 0) {
    createdTiffins = await DailyTiffin.insertMany(tiffinsToCreate);
  }

  const currentTiffins = [...updatedTiffins, ...createdTiffins];

  // Compute bulk summary
  let totalTiffins = 0;
  let totalIncome = 0;
  let paidAmountSum = 0;

  currentTiffins.forEach((t) => {
    if (t.status === 'delivered') {
      totalTiffins += t.quantity;
      totalIncome += t.totalAmount;
      paidAmountSum += t.paidAmount;
    }
  });

  const pendingAmountSum = Math.max(0, totalIncome - paidAmountSum);

  return {
    date,
    count: currentTiffins.length,
    summary: {
      totalTiffins,
      totalIncome,
      paidAmount: paidAmountSum,
      pendingAmount: pendingAmountSum,
    },
    entries: currentTiffins,
  };
};

const mongoose = require('mongoose');

const getTiffins = async (query = {}) => {
  const filter = {};

  if (query.date) {
    filter.date = query.date;
  }
  if (
    query.customerId &&
    query.customerId !== 'null' &&
    query.customerId !== 'undefined' &&
    mongoose.Types.ObjectId.isValid(query.customerId)
  ) {
    filter.customerId = query.customerId;
  }
  if (query.paymentStatus) {
    filter.paymentStatus = query.paymentStatus;
  }
  if (query.status) {
    filter.status = query.status;
  }
  if (query.area) {
    filter.area = new RegExp(query.area, 'i');
  }
  if (query.search) {
    const searchRegex = new RegExp(query.search, 'i');
    filter.$or = [{ customerName: searchRegex }, { area: searchRegex }, { notes: searchRegex }];
  }

  const tiffins = await DailyTiffin.find(filter).sort({ date: -1, createdAt: -1 });
  return tiffins;
};

const getTiffinById = async (id) => {
  const tiffin = await DailyTiffin.findById(id);
  if (!tiffin) {
    throw new AppError('Daily tiffin entry not found', 404);
  }
  return tiffin;
};

const updateTiffin = async (id, updateData) => {
  if (updateData.quantity !== undefined || updateData.unitPrice !== undefined || updateData.status !== undefined) {
    const existing = await DailyTiffin.findById(id);
    if (!existing) {
      throw new AppError('Daily tiffin entry not found', 404);
    }
    const status = updateData.status !== undefined ? updateData.status : existing.status;
    const quantity = updateData.quantity !== undefined ? updateData.quantity : existing.quantity;
    const unitPrice = updateData.unitPrice !== undefined ? updateData.unitPrice : existing.unitPrice;

    if (status === 'skipped') {
      updateData.totalAmount = 0;
      updateData.quantity = 0;
    } else {
      updateData.totalAmount = quantity * unitPrice;
    }

    if (updateData.paymentStatus === 'PAID') {
      updateData.paidAmount = updateData.totalAmount;
    }
  }

  const tiffin = await DailyTiffin.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });

  if (!tiffin) {
    throw new AppError('Daily tiffin entry not found', 404);
  }
  return tiffin;
};

const deleteTiffin = async (id) => {
  const tiffin = await DailyTiffin.findByIdAndDelete(id);
  if (!tiffin) {
    throw new AppError('Daily tiffin entry not found', 404);
  }
  return tiffin;
};

module.exports = {
  createSingleTiffin,
  createBulkTiffins,
  getTiffins,
  getTiffinById,
  updateTiffin,
  deleteTiffin,
};
