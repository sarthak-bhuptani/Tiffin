const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const validate = require('../middleware/validate.middleware');
const { createPaymentSchema } = require('../validators/payment.validator');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);

router.post('/', validate(createPaymentSchema), paymentController.recordPayment);
router.get('/', paymentController.getPayments);
router.get('/customer/:customerId', paymentController.getCustomerPayments);

module.exports = router;
