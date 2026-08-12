const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customer.controller');
const validate = require('../middleware/validate.middleware');
const { createCustomerSchema, updateCustomerSchema } = require('../validators/customer.validator');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);

router.post('/', validate(createCustomerSchema), customerController.createCustomer);
router.get('/', customerController.getCustomers);
router.get('/:id', customerController.getCustomerById);
router.patch('/:id', validate(updateCustomerSchema), customerController.updateCustomer);
router.delete('/:id', customerController.deleteCustomer);

module.exports = router;
