const paymentService = require('../services/payment.service');
const { sendSuccess } = require('../utils/apiResponse');

const recordPayment = async (req, res, next) => {
  try {
    const payment = await paymentService.recordPayment(req.body);
    return sendSuccess(res, 201, 'Payment recorded successfully', { payment });
  } catch (error) {
    next(error);
  }
};

const getPayments = async (req, res, next) => {
  try {
    const payments = await paymentService.getPayments(req.query);
    return sendSuccess(res, 200, 'Payments fetched successfully', { payments });
  } catch (error) {
    next(error);
  }
};

const getCustomerPayments = async (req, res, next) => {
  try {
    const payments = await paymentService.getCustomerPayments(req.params.customerId);
    return sendSuccess(res, 200, 'Customer payment logs fetched', { payments });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  recordPayment,
  getPayments,
  getCustomerPayments,
};
