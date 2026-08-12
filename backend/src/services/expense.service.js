const Expense = require('../models/expense.model');
const AppError = require('../utils/appError');

const createExpense = async (data) => {
  const expense = await Expense.create(data);
  return expense;
};

const getExpenses = async (query = {}) => {
  const filter = {};
  if (query.date) {
    filter.date = query.date;
  }
  if (query.category) {
    filter.category = query.category;
  }
  if (query.startDate && query.endDate) {
    filter.date = { $gte: query.startDate, $lte: query.endDate };
  }

  const expenses = await Expense.find(filter).sort({ date: -1, createdAt: -1 });
  return expenses;
};

const updateExpense = async (id, data) => {
  const expense = await Expense.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
  if (!expense) {
    throw new AppError('Expense record not found', 404);
  }
  return expense;
};

const deleteExpense = async (id) => {
  const expense = await Expense.findByIdAndDelete(id);
  if (!expense) {
    throw new AppError('Expense record not found', 404);
  }
  return expense;
};

module.exports = {
  createExpense,
  getExpenses,
  updateExpense,
  deleteExpense,
};
