const expenseService = require('../services/expense.service');
const { sendSuccess } = require('../utils/apiResponse');

const createExpense = async (req, res, next) => {
  try {
    const expense = await expenseService.createExpense(req.body);
    return sendSuccess(res, 201, 'Expense recorded successfully', { expense });
  } catch (error) {
    next(error);
  }
};

const getExpenses = async (req, res, next) => {
  try {
    const expenses = await expenseService.getExpenses(req.query);
    return sendSuccess(res, 200, 'Expenses fetched successfully', { expenses });
  } catch (error) {
    next(error);
  }
};

const updateExpense = async (req, res, next) => {
  try {
    const expense = await expenseService.updateExpense(req.params.id, req.body);
    return sendSuccess(res, 200, 'Expense updated successfully', { expense });
  } catch (error) {
    next(error);
  }
};

const deleteExpense = async (req, res, next) => {
  try {
    await expenseService.deleteExpense(req.params.id);
    return sendSuccess(res, 200, 'Expense record deleted successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createExpense,
  getExpenses,
  updateExpense,
  deleteExpense,
};
