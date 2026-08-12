const express = require('express');
const router = express.Router();
const expenseController = require('../controllers/expense.controller');
const validate = require('../middleware/validate.middleware');
const { createExpenseSchema } = require('../validators/expense.validator');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);

router.post('/', validate(createExpenseSchema), expenseController.createExpense);
router.get('/', expenseController.getExpenses);
router.patch('/:id', expenseController.updateExpense);
router.delete('/:id', expenseController.deleteExpense);

module.exports = router;
