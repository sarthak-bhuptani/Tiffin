const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);

router.get('/today', dashboardController.getTodayDashboard);
router.get('/monthly', dashboardController.getMonthlyDashboard);

module.exports = router;
