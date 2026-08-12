const express = require('express');
const router = express.Router();
const reportController = require('../controllers/report.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);

router.get('/daily', reportController.getDailyReport);
router.get('/monthly', reportController.getMonthlyReport);
router.get('/custom', reportController.getCustomReport);
router.delete('/reset-all', reportController.resetAllData);

module.exports = router;
