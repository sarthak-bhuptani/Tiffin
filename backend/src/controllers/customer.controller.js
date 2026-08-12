const customerService = require('../services/customer.service');
const { sendSuccess } = require('../utils/apiResponse');

const createCustomer = async (req, res, next) => {
  try {
    const customer = await customerService.createCustomer(req.body);
    return sendSuccess(res, 201, 'Customer created successfully', { customer });
  } catch (error) {
    next(error);
  }
};

const getCustomers = async (req, res, next) => {
  try {
    const customers = await customerService.getCustomers(req.query);
    return sendSuccess(res, 200, 'Customers fetched successfully', { customers });
  } catch (error) {
    next(error);
  }
};

const getCustomerById = async (req, res, next) => {
  try {
    const result = await customerService.getCustomerById(req.params.id);
    return sendSuccess(res, 200, 'Customer details fetched successfully', result);
  } catch (error) {
    next(error);
  }
};

const updateCustomer = async (req, res, next) => {
  try {
    const customer = await customerService.updateCustomer(req.params.id, req.body);
    return sendSuccess(res, 200, 'Customer updated successfully', { customer });
  } catch (error) {
    next(error);
  }
};

const deleteCustomer = async (req, res, next) => {
  try {
    const customer = await customerService.deleteCustomer(req.params.id);
    return sendSuccess(res, 200, 'Customer deactivated successfully', { customer });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createCustomer,
  getCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
};
